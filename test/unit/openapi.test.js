import { test, expect } from "bun:test";
import { buildOpenApi } from "../../src/docs.js";

const models = [{ $id: "User", auth: true, tags: ["User"], summary: "x", type: "object", properties: { name: { type: "string" } } }];

const routes = [
	{ method: "GET", path: "/b/:id", file: "src/B/get.js", schema: { order: 2, response: { 200: { $ref: "User" } } } },
	{ method: "GET", path: "/b", file: "src/B/list.js", schema: { order: 1, querystring: { name: { $ref: "User#/properties/name" } } } },
	{ method: "GET", path: "/a", file: "src/A/a.js", schema: { summary: "A" } },
	{ method: "GET", path: "/none", file: "src/A/none.js" },
];


test("model refs rewritten, full and property", () => {
	const doc = buildOpenApi(routes, models);
	expect(doc.paths["/b/{id}"].get.responses["200"].content["application/json"].schema).toEqual({ $ref: "#/components/schemas/User" });
	expect(doc.paths["/b"].get.parameters[0].schema).toEqual({ $ref: "#/components/schemas/User/properties/name" });
});

test("model keeps only schema keys", () => {
	const doc = buildOpenApi(routes, models);
	expect(doc.components.schemas.User).toEqual({ type: "object", properties: { name: { type: "string" } } });
});

test("querystring shorthand becomes parameters", () => {
	const doc = buildOpenApi(routes, models);
	expect(doc.paths["/b"].get.parameters[0]).toMatchObject({ name: "name", in: "query", required: false });
});

test("path params listed even without params schema", () => {
	const doc = buildOpenApi(routes, models);
	expect(doc.paths["/b/{id}"].get.parameters).toEqual([{ name: "id", in: "path", required: true, schema: { type: "string" } }]);
});

test("folder order kept, sorted by order inside, routes without schema skipped", () => {
	const doc = buildOpenApi(routes, models);
	expect(Object.keys(doc.paths)).toEqual(["/b", "/b/{id}", "/a"]);
});

test("default response when none defined", () => {
	const doc = buildOpenApi(routes, models);
	expect(doc.paths["/a"].get.responses).toEqual({ 200: { description: "Default Response" } });
});
