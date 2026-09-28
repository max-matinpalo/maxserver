import { test, expect, beforeAll, afterAll } from "bun:test";
import { prepareFixture, startServer } from "./helpers.js";

let server, doc;

beforeAll(async () => {
	prepareFixture();
	server = await startServer();
	doc = await (await fetch(server.url + "/docs/openapi.json")).json();
});

afterAll(() => server.stop());


test("/docs page loads the bundled Scalar file", async () => {
	const html = await (await fetch(server.url + "/docs")).text();
	expect(html).toContain('<script src="/docs/scalar.js">');
	expect(html).toContain("/docs/openapi.json");

	const js = await fetch(server.url + "/docs/scalar.js");
	expect(js.status).toBe(200);
	expect(js.headers.get("content-type")).toContain("javascript");
	expect((await js.text()).length).toBeGreaterThan(1_000_000);
});

test("OpenAPI 3.1 with configured info", () => {
	expect(doc.openapi).toBe("3.1.0");
	expect(doc.info).toEqual({ title: "Fixture API", version: "1.2.3" });
});

test("path params become {id} and are listed with schema type", () => {
	const op = doc.paths["/items/{id}"].get;
	expect(op.parameters).toEqual([
		{ name: "id", in: "path", required: true, schema: { type: "integer", description: "Item id" }, description: "Item id" },
	]);
});

test("query params listed with required flags and rewritten refs", () => {
	const params = doc.paths["/items"].get.parameters;
	expect(params.find(p => p.name === "q").required).toBe(true);
	expect(params.find(p => p.name === "limit").required).toBe(false);
	expect(params.find(p => p.name === "owner").schema).toEqual({ $ref: "#/components/schemas/User/properties/email" });
});

test("body and responses", () => {
	const op = doc.paths["/items"].post;
	expect(op.requestBody.content["application/json"].schema.required).toEqual(["name"]);
	expect(op.responses["201"].content["application/json"].schema.properties.name).toEqual({ type: "string" });
});

test("models in components, $ref rewritten", () => {
	expect(doc.components.schemas.User.required).toEqual(["email"]);
	expect(doc.components.schemas.User.$id).toBeUndefined();
	expect(doc.paths["/users"].post.requestBody.content["application/json"].schema).toEqual({ $ref: "#/components/schemas/User" });
});

test("auth routes have security", () => {
	expect(doc.paths["/me"].get.security).toEqual([{ bearerAuth: [] }, { cookieAuth: [] }]);
	expect(doc.paths["/welcome"].get.security).toBeUndefined();
});

test("only routes with a schema", () => {
	expect(doc.paths["/raw"]).toBeUndefined();
	expect(doc.paths["/login"]).toBeUndefined();
	expect(doc.paths["/welcome"]).toBeDefined();
});

test("sorted by order within a folder", () => {
	const items = Object.keys(doc.paths).filter(p => p.startsWith("/items"));
	expect(items[0]).toBe("/items");
	expect(items[1]).toBe("/items/{id}");
});

test("docs: false disables docs", async () => {
	const off = await startServer({ env: { DOCS: "false" } });
	expect((await fetch(off.url + "/docs")).status).toBe(404);
	expect((await fetch(off.url + "/docs/openapi.json")).status).toBe(404);
	await off.stop();
});
