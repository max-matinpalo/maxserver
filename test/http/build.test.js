import { test, expect, beforeAll, afterAll } from "bun:test";
import fs from "node:fs";
import path from "node:path";
import { FIXTURE, ROOT, prepareFixture, startServer } from "../helpers.js";

let server;

beforeAll(async () => {
	prepareFixture();
	fs.rmSync(path.join(FIXTURE, "dist"), { recursive: true, force: true });

	const build = Bun.spawnSync(["node", path.join(ROOT, "bin/cli.js"), "build"], { cwd: FIXTURE });
	if (build.exitCode !== 0) throw new Error(build.stderr.toString() + build.stdout.toString());

	server = await startServer({ entry: "dist/bundle.js", env: { NODE_ENV: "production" } });
}, 30000);

afterAll(() => server?.stop());


test("maxserver build bundles into one file with no route imports left", () => {
	const code = fs.readFileSync(path.join(FIXTURE, "dist/bundle.js"), "utf8");
	expect(code).not.toMatch(/from "\.\.?\/src\//);
	expect(fs.existsSync(path.join(FIXTURE, "dist/bundle.js.map"))).toBe(true);
});

test("bundle answers requests", async () => {
	expect(await (await fetch(server.url + "/welcome")).json()).toEqual({ message: "Weclome to maxserver 😉 - Updated" });
});

test("bundle keeps NODE_ENV as runtime value", async () => {
	expect(await (await fetch(server.url + "/env")).json()).toEqual({ nodeEnv: "production", production: true });
	expect((await (await fetch(server.url + "/crash")).json()).message).toBe("Internal Server Error");
});

test("bundle serves docs with the embedded UI, dist has only bundle and map", async () => {
	expect((await fetch(server.url + "/docs")).status).toBe(200);
	expect((await fetch(server.url + "/docs/maxdoc-apidocs.js")).status).toBe(200);
	expect(fs.readdirSync(path.join(FIXTURE, "dist")).sort()).toEqual(["bundle.js", "bundle.js.map"]);
});
