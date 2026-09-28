import { test, expect, beforeAll, afterAll } from "bun:test";
import { prepareFixture, startServer, rawGet } from "../helpers.js";

let server;

beforeAll(async () => {
	prepareFixture();
	server = await startServer();
});

afterAll(() => server.stop());


test("serves file with right content type", async () => {
	const r = await fetch(server.url + "/style.css");
	expect(r.status).toBe(200);
	expect(r.headers.get("content-type")).toContain("text/css");
	expect(await r.text()).toContain("color: red");
});

test("directory -> index.html", async () => {
	expect(await (await fetch(server.url + "/")).text()).toContain("index");
	expect(await (await fetch(server.url + "/sub/")).text()).toContain("sub");
});

test("routes win over static files", async () => {
	expect((await fetch(server.url + "/welcome")).headers.get("content-type")).toContain("json");
});

test("missing file -> 404", async () => {
	expect((await fetch(server.url + "/missing.css")).status).toBe(404);
});

test("dotfiles are not served", async () => {
	const raw = await rawGet(server.url, "/.env");
	expect(raw).toStartWith("HTTP/1.1 404");
	expect(raw).not.toContain("leak");
});

test("paths outside the static dir are blocked: ../, %2e%2e, ..%2f", async () => {
	for (const p of ["/../outside.txt", "/%2e%2e/outside.txt", "/..%2foutside.txt", "/sub/..%2f..%2foutside.txt", "/%2e%2e%2foutside.txt"]) {
		const raw = await rawGet(server.url, p);
		expect(`${p} ${raw.includes("outside secret")}`).toBe(`${p} false`);
	}
});
