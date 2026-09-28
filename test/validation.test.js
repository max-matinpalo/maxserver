import { test, expect, beforeAll, afterAll } from "bun:test";
import { prepareFixture, startServer } from "./helpers.js";

let server;

beforeAll(async () => {
	prepareFixture();
	server = await startServer();
});

afterAll(() => server.stop());

const get = path => fetch(server.url + path);
const post = (path, body) =>
	fetch(server.url + path, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body) });


test("bad params -> 400 with readable message", async () => {
	const r = await get("/items/abc");
	expect(r.status).toBe(400);
	expect(await r.json()).toEqual({ statusCode: 400, error: "Bad Request", message: "params/id must be integer" });
});

test("missing required query -> 400", async () => {
	const r = await get("/items");
	expect(r.status).toBe(400);
	expect((await r.json()).message).toBe("querystring must have required property 'q'");
});

test("bad body -> 400", async () => {
	const r = await post("/items", { name: { a: 1 } });
	expect(r.status).toBe(400);
	expect((await r.json()).message).toBe("body/name must be string");
});

test("coerceTypes: params and query \"5\" -> 5, single value -> array", async () => {
	expect((await (await get("/items/5")).json()).type).toBe("number");

	const q = await (await get("/items?q=x&limit=5&tags=a")).json();
	expect(q.limit).toBe(5);
	expect(q.tags).toEqual(["a"]);
});

test("repeated query keys -> array", async () => {
	const q = await (await get("/items?q=x&tags=a&tags=b")).json();
	expect(q.tags).toEqual(["a", "b"]);
});

test("useDefaults fills missing values", async () => {
	const q = await (await get("/items?q=x")).json();
	expect(q.limit).toBe(10);
});

test("removeAdditional drops extra body fields", async () => {
	const r = await post("/items", { name: "a", extra: 1 });
	expect(await r.json()).toEqual({ name: "a" });
});

test("format email is checked", async () => {
	const r = await post("/items", { name: "a", email: "nope" });
	expect(r.status).toBe(400);
	expect((await r.json()).message).toBe('body/email must match format "email"');
});

test("format date-time is checked", async () => {
	expect((await post("/items", { name: "a", when: "yesterday" })).status).toBe(400);
	expect((await post("/items", { name: "a", when: "2026-09-28T10:00:00Z" })).status).toBe(201);
});

test("model $ref validates body", async () => {
	const bad = await post("/users", { id: "1" });
	expect(bad.status).toBe(400);
	expect((await bad.json()).message).toBe("body must have required property 'email'");

	const ok = await post("/users", { email: "a@b.co" });
	expect(ok.status).toBe(200);
});

test("model property $ref validates query", async () => {
	expect((await get("/items?q=x&owner=nope")).status).toBe(400);
	expect((await get("/items?q=x&owner=a@b.co")).status).toBe(200);
});
