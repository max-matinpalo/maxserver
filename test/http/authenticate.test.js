import { test, expect, beforeAll, afterAll } from "bun:test";
import { prepareFixture, startServer } from "../helpers.js";

let server;

beforeAll(async () => {
	prepareFixture();
	server = await startServer({ env: { TEST_AUTHENTICATE: "1", TEST_NO_SECRET: "1", SECRET: "" } });
});

afterAll(() => server.stop());

const me = auth => fetch(server.url + "/me", { headers: auth ? { authorization: auth } : {} });


test("app authenticate: its result is req.auth", async () => {
	const r = await me("Bearer good");
	expect(r.status).toBe(200);
	expect(await r.json()).toEqual({ auth: { userId: "custom" } });
});


test("app authenticate: a falsy result -> 401", async () => {
	expect((await me()).status).toBe(401);
	expect((await me("Bearer bad")).status).toBe(401);
});


test("app authenticate: a thrown error keeps its status", async () => {
	const r = await me("Bearer forbidden");
	expect(r.status).toBe(403);
	expect((await r.json()).message).toBe("Forbidden here");
});


test("app authenticate: starts without a secret; routes without auth stay open", async () => {
	expect((await fetch(server.url + "/welcome")).status).toBe(200);
});


test("app authenticate: docs show Bearer security only", async () => {
	const doc = await (await fetch(server.url + "/docs/openapi.json")).json();
	expect(doc.paths["/me"].get.security).toEqual([{ bearerAuth: [] }]);
	expect(Object.keys(doc.components.securitySchemes)).toEqual(["bearerAuth"]);
});
