import { test, expect, beforeAll, afterAll } from "bun:test";
import { prepareFixture, startServer } from "../helpers.js";

let server;

beforeAll(async () => {
	prepareFixture();
	server = await startServer();
});

afterAll(() => server.stop());

const get = (path, init) => fetch(server.url + path, init);
const post = (path, body, type = "application/json") =>
	fetch(server.url + path, { method: "POST", headers: { "content-type": type }, body });


test("v1 template route GET /welcome -> 200 JSON", async () => {
	const r = await get("/welcome");
	expect(r.status).toBe(200);
	expect(r.headers.get("content-type")).toContain("application/json");
	expect(await r.json()).toEqual({ message: "Welcome to maxserver 😉" });
});

test("v1 template route POST /hello uses body", async () => {
	const r = await post("/hello", JSON.stringify({ name: "Max" }));
	expect(await r.json()).toEqual({ message: "Hello Max again 🙋‍♂️" });
});

test("returned data -> 200 JSON, shared code imported normally", async () => {
	const r = await get("/items/7");
	expect(r.status).toBe(200);
	expect((await r.json()).label).toBe("item-7");
});

test("res.status and res.header change status and headers", async () => {
	const r = await post("/items", JSON.stringify({ name: "a" }));
	expect(r.status).toBe(201);
	expect(r.headers.get("x-created")).toBe("1");
});

test("returned Response passes through unchanged", async () => {
	const r = await get("/raw");
	expect(r.status).toBe(202);
	expect(r.headers.get("x-raw")).toBe("1");
	expect(await r.text()).toBe("raw");
});

test("returning nothing -> 204", async () => {
	const r = await get("/empty", { method: "DELETE" });
	expect(r.status).toBe(204);
});

test("params, query and body are filled", async () => {
	expect((await (await get("/items/3")).json()).id).toBe(3);
	expect((await (await get("/items?q=x")).json()).q).toBe("x");
	expect(await (await post("/text", "hello", "text/plain")).json()).toEqual({ body: "hello", query: {} });
});

test("query without schema: parsed on use, repeated keys -> array", async () => {
	expect((await (await post("/text?a=1&a=2&b=x", "hi", "text/plain")).json()).query).toEqual({ a: ["1", "2"], b: "x" });
});

test("invalid JSON -> 400", async () => {
	const r = await post("/items", "{bad");
	expect(r.status).toBe(400);
	expect((await r.json()).message).toBe("Body is not valid JSON");
});

test("empty JSON body -> 400", async () => {
	const r = await post("/items", "");
	expect(r.status).toBe(400);
});

test("unknown route -> 404 in v1 shape", async () => {
	const r = await get("/nope");
	expect(r.status).toBe(404);
	expect(await r.json()).toEqual({ statusCode: 404, error: "Not Found", message: "Route GET:/nope not found" });
});

test("wrong method on existing path -> 404", async () => {
	const r = await get("/welcome", { method: "PUT" });
	expect(r.status).toBe(404);
});

test("createError -> right status and { statusCode, error, message }", async () => {
	const r = await get("/error");
	expect(r.status).toBe(409);
	expect(await r.json()).toEqual({ statusCode: 409, error: "Conflict", message: "Conflict here" });
});

test("unknown error in development -> 500 with message, logged once with request, file:line and stack", async () => {
	const r = await get("/crash");
	expect(r.status).toBe(500);
	expect((await r.json()).message).toBe("secret detail");
	await Bun.sleep(20);
	expect(server.logs()).toContain("❌ 500 GET /crash  secret detail  (src/Misc/crash.js:4)");
	expect(server.logs().split("secret detail").length - 1).toBe(1);
	expect(server.logs()).toContain("at ");
});

test("createError in development -> one line pointing at the handler, no stack", async () => {
	await get("/error");
	await Bun.sleep(20);
	expect(server.logs()).toContain("❌ 409 GET /error  Conflict here  (src/Misc/error.js:4)");
});

test("validation error in development -> one line without maxserver internals", async () => {
	await get("/items/abc");
	await Bun.sleep(20);
	expect(server.logs()).toContain("❌ 400 GET /items/abc  params/id must be integer\n");
});

test("dev: response mismatch is logged, response still sent unchanged", async () => {
	const r = await get("/mismatch");
	expect(r.status).toBe(200);
	expect(await r.json()).toEqual({ count: "5", extra: true });
	await Bun.sleep(20);
	expect(server.logs()).toContain("Response mismatch GET /mismatch 200 (src/Misc/mismatch.js): response/count must be integer");
});

test("dev: matching response is not logged", async () => {
	await post("/items", JSON.stringify({ name: "ok" }));
	await Bun.sleep(20);
	expect(server.logs()).not.toContain("Response mismatch POST /items");
});

test("prototype poisoning in JSON body -> 400", async () => {
	for (const body of ['{"name":"a","__proto__":{"isAdmin":true}}', '{"name":"a","constructor":{"prototype":{"isAdmin":true}}}']) {
		const r = await post("/items", body);
		expect(r.status).toBe(400);
		expect((await r.json()).message).toBe("Object contains forbidden prototype property");
	}
});

test("normal constructor key in JSON body is allowed", async () => {
	const r = await post("/text", '{"constructor":"x"}');
	expect(r.status).toBe(200);
});

test("query keys like __proto__ and toString are plain values", async () => {
	const q = await (await get("/items?q=x&toString=a&__proto__=b")).json();
	expect(q.toString).toBe("a");
	expect(q.__proto__).toBe("b");
});

test("multiple set-cookie headers are all sent, own content-type kept", async () => {
	const r = await get("/cookies");
	expect(r.headers.getSetCookie()).toEqual(["a=1", "b=2"]);
	expect(r.headers.get("content-type")).toBe("application/vnd.test+json");
});
