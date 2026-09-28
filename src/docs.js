import path from "node:path";

const SECURITY = [{ bearerAuth: [] }, { cookieAuth: [] }];
const NOT_SCHEMA = ["$id", "auth", "order", "tags", "summary"];


/**
 * Rewrites model refs: "User" -> "#/components/schemas/User",
 * "User#/properties/name" -> "#/components/schemas/User/properties/name"
 */
function fixRefs(value) {
	if (Array.isArray(value)) return value.map(fixRefs);
	if (!value || typeof value !== "object") return value;

	const out = {};
	for (const [k, v] of Object.entries(value)) {
		if (k === "$ref" && typeof v === "string" && !v.startsWith("#")) {
			const [name, pointer = ""] = v.split("#");
			out[k] = `#/components/schemas/${name}${pointer}`;
		} else out[k] = fixRefs(v);
	}
	return out;
}


function clean(schema) {
	const out = { ...schema };
	for (const k of NOT_SCHEMA) delete out[k];
	return fixRefs(out);
}


/**
 * Params, querystring and headers become OpenAPI parameters.
 * Every path param is listed, typed from schema.params if given.
 */
function parameters(route, schema) {
	const list = [];
	const add = (where, s = {}, names) => {
		const props = s.properties || (s.type ? {} : s);
		for (const name of names || Object.keys(props))
			list.push({
				name, in: where,
				required: where === "path" || (s.required || []).includes(name),
				schema: fixRefs(props[name] || { type: "string" }),
				...(props[name]?.description && { description: props[name].description }),
			});
	};

	add("path", schema.params, [...route.path.matchAll(/:(\w+)/g)].map(m => m[1]));
	if (schema.querystring || schema.query) add("query", schema.querystring || schema.query);
	if (schema.headers) add("header", schema.headers);
	return list;
}


function operation(route) {
	const s = route.schema;
	const op = {};

	if (s.tags) op.tags = s.tags;
	if (s.summary) op.summary = s.summary;
	if (s.description) op.description = s.description;

	const params = parameters(route, s);
	if (params.length) op.parameters = params;

	if (s.body) op.requestBody = { required: true, content: { "application/json": { schema: fixRefs(s.body) } } };

	op.responses = {};
	for (const [status, r] of Object.entries(s.response || { 200: null }))
		op.responses[status] = r
			? { description: r.description || "Default Response", content: { "application/json": { schema: fixRefs(r) } } }
			: { description: "Default Response" };

	if (s.auth) op.security = SECURITY;
	return op;
}


/**
 * Routes sorted like v1: folder order kept, inside a folder by schema.order.
 */
function sortRoutes(routes) {
	const dirs = [];
	for (const r of routes) {
		const dir = path.dirname(r.file || "");
		if (!dirs.includes(dir)) dirs.push(dir);
	}

	const key = r => dirs.indexOf(path.dirname(r.file || ""));
	return [...routes].sort((a, b) => key(a) - key(b) || (a.schema.order ?? 999) - (b.schema.order ?? 999));
}


/**
 * OpenAPI 3.1 document from routes with a schema and all models.
 */
export function buildOpenApi(routes, models, info) {
	const doc = {
		openapi: "3.1.0",
		info: info || { title: "API", version: "1.0.0" },
		components: {
			securitySchemes: {
				bearerAuth: { type: "http", scheme: "bearer" },
				cookieAuth: { type: "apiKey", in: "cookie", name: "token" },
			},
			schemas: {},
		},
		paths: {},
	};

	for (const m of models) doc.components.schemas[m.$id] = clean(m);

	for (const r of sortRoutes(routes.filter(r => r.schema && Object.keys(r.schema).length))) {
		const p = r.path.replace(/:(\w+)/g, "{$1}");
		doc.paths[p] ||= {};
		doc.paths[p][r.method.toLowerCase()] = operation(r);
	}

	return doc;
}


// Dev GUI files (built in the maxserver-docs repo). Read from disk, never
// imported, so production bundles stay free of them.
const UI_DIR = path.resolve(import.meta.dir, "../devdocs");
const UI_FILES = { "maxserver-docs.js": "text/javascript; charset=utf-8", "maxserver-docs.css": "text/css; charset=utf-8" };


function escapeHtml(text) {
	return String(text).replace(/[&<>"']/g, c => `&#${c.charCodeAt(0)};`);
}


/**
 * Bun routes: /docs/openapi.json always; in development also the /docs
 * dev GUI with its two files, when they exist.
 */
export async function docsRoutes(openapi, dev) {
	const json = JSON.stringify(openapi);
	const routes = {
		"/docs/openapi.json": () => new Response(json, { headers: { "Content-Type": "application/json" } }),
	};

	// 1. Production, or bundled app without the files: spec only
	if (!dev || !(await Bun.file(path.join(UI_DIR, "maxserver-docs.js")).exists())) return routes;

	// 2. Development: page + UI files
	const html = `<!doctype html>
<html lang="en">
<head>
	<meta charset="utf-8">
	<meta name="viewport" content="width=device-width, initial-scale=1">
	<title>${escapeHtml(openapi.info?.title || "API")}</title>
	<link rel="stylesheet" href="/docs/maxserver-docs.css">
</head>
<body>
	<div id="app" data-spec="/docs/openapi.json"></div>
	<script type="module" src="/docs/maxserver-docs.js"></script>
</body>
</html>`;

	routes["/docs"] = () => new Response(html, { headers: { "Content-Type": "text/html; charset=utf-8" } });
	for (const [name, type] of Object.entries(UI_FILES))
		routes[`/docs/${name}`] = () => new Response(Bun.file(path.join(UI_DIR, name)), { headers: { "Content-Type": type } });

	return routes;
}
