import path from "node:path";
import scalarFile from "../vendor/scalar.js" with { type: "file" };

// Bundled apps: asset path is relative to the bundle
const SCALAR_PATH = path.resolve(import.meta.dir, scalarFile);

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


/**
 * Bun routes for /docs, /docs/openapi.json and the bundled Scalar file.
 */
export function docsRoutes(openapi, scalar = {}) {
	const config = {
		url: "/docs/openapi.json",
		hideSearch: true,
		hiddenClients: true,
		hideClientButton: true,
		telemetry: false,
		persistAuth: true,
		showDeveloperTools: "never",
		orderSchemaPropertiesBy: "preserve",
		metaData: { title: "Server" },
		authentication: { preferredSecurityScheme: "bearerAuth" },
		customCss: `.darklight-reference a[href*="scalar.com"] { display: none !important; }`,
		...scalar,
	};

	const html = `<!doctype html>
<html>
<head>
	<meta charset="utf-8">
	<meta name="viewport" content="width=device-width, initial-scale=1">
	<title>${openapi.info?.title || "API"}</title>
</head>
<body>
	<div id="app"></div>
	<script src="/docs/scalar.js"></script>
	<script>Scalar.createApiReference("#app", ${JSON.stringify(config).replace(/</g, "\\u003c")});</script>
</body>
</html>`;

	const json = JSON.stringify(openapi);
	const scalarJs = Bun.file(SCALAR_PATH);

	return {
		"/docs": () => new Response(html, { headers: { "Content-Type": "text/html; charset=utf-8" } }),
		"/docs/openapi.json": () => new Response(json, { headers: { "Content-Type": "application/json" } }),
		"/docs/scalar.js": () => new Response(scalarJs, {
			headers: { "Content-Type": "text/javascript; charset=utf-8", "Cache-Control": "public, max-age=86400" },
		}),
	};
}
