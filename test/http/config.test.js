import { test, expect, beforeAll, afterAll, describe } from "bun:test";
import { prepareFixture, startServer } from "../helpers.js";

beforeAll(() => prepareFixture());


describe("production", () => {
	let server;
	beforeAll(async () => { server = await startServer({ env: { NODE_ENV: "production" } }); });
	afterAll(() => server.stop());

	test("unknown error -> 500, message hidden, still logged", async () => {
		const r = await fetch(server.url + "/crash");
		expect(r.status).toBe(500);
		expect(await r.json()).toEqual({ statusCode: 500, error: "Internal Server Error", message: "Internal Server Error" });
		await Bun.sleep(20);
		expect(server.logs()).toContain("secret detail");
	});

	test("createError message still shown", async () => {
		expect((await (await fetch(server.url + "/error")).json()).message).toBe("Conflict here");
	});

	test("no response validation", async () => {
		const r = await fetch(server.url + "/mismatch");
		expect(await r.json()).toEqual({ count: "5", extra: true });
		await Bun.sleep(20);
		expect(server.logs()).not.toContain("Response mismatch");
	});

	test("ENV global flags", async () => {
		expect(await (await fetch(server.url + "/env")).json()).toEqual({ nodeEnv: "production", production: true });
	});
});


test("env overrides defaults: PORT", async () => {
	const probe = Bun.serve({ port: 0, fetch: () => new Response() });
	const port = probe.port;
	probe.stop(true);

	const server = await startServer({ env: { PORT: String(port) } });
	expect(new URL(server.url).port).toBe(String(port));
	await server.stop();
});

test("public binds 0.0.0.0", async () => {
	const server = await startServer({ env: { PUBLIC: "true" } });
	expect(new URL(server.url).hostname).toBe("0.0.0.0");
	await server.stop();
});

test("default binds 127.0.0.1", async () => {
	const server = await startServer();
	expect(new URL(server.url).hostname).toBe("127.0.0.1");
	await server.stop();
});

test("missing secret -> clear error", async () => {
	const env = { TEST_NO_SECRET: "1", SECRET: "" };
	const server = await startServer({ env, expectUrl: false });
	expect(server.proc.exitCode).not.toBe(0);
	expect(server.logs()).toContain("maxserver: secret is required");
});

test("no routes registered (bun server.js) -> clear error", async () => {
	const server = await startServer({ entry: "server.js", expectUrl: false });
	expect(server.proc.exitCode).not.toBe(0);
	expect(server.logs()).toContain("maxserver: no routes registered");
});

test("Bun.serve options are passed through: reusePort lets two servers share a port", async () => {
	const env = { TEST_REUSEPORT: "1" };
	const a = await startServer({ env });
	const b = await startServer({ env: { ...env, PORT: new URL(a.url).port } });
	expect(b.url).toBe(a.url);
	await a.stop();
	await b.stop();
});

test("without reusePort a second server on the same port fails", async () => {
	const a = await startServer();
	const b = await startServer({ env: { PORT: new URL(a.url).port }, expectUrl: false });
	expect(b.proc.exitCode).not.toBe(0);
	await a.stop();
});

test("body larger than 1 MiB -> 413", async () => {
	const server = await startServer();
	const r = await fetch(server.url + "/text", { method: "POST", headers: { "content-type": "text/plain" }, body: "x".repeat(1048577) });
	expect(r.status).toBe(413);
	await server.stop();
});
