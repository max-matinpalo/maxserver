import { authenticate } from "./jwt.js";
import { corsHeaders, preflight } from "./cors.js";
import { errorResponse, logDevError } from "./errors.js";
import { SECURITY_HEADERS, setHeaders } from "./headers.js";
import { compileRoute, validatePart, checkResponse } from "./validate.js";
import { serveStatic } from "./static.js";


/**
 * Common end of every response: CORS + security headers.
 */
export function finish(req, response, ctx) {
	return setHeaders(response, { ...corsHeaders(req, ctx.cors), ...SECURITY_HEADERS });
}


/**
 * Query string as object, repeated keys become arrays (like Fastify).
 */
function parseQuery(url) {
	const query = {};
	for (const [k, v] of new URL(url).searchParams) {
		if (!(k in query)) query[k] = v;
		else if (Array.isArray(query[k])) query[k].push(v);
		else query[k] = [query[k], v];
	}
	return query;
}


function badRequest(message) {
	return Object.assign(new Error(message), { statusCode: 400 });
}


/**
 * Parses the body: JSON and text, else left unread.
 */
async function parseBody(req) {
	if (req.method === "GET" || req.method === "HEAD") return undefined;

	const type = (req.headers.get("content-type") || "").toLowerCase();
	if (type.includes("application/json")) {
		const text = await req.text();
		if (!text) throw badRequest("Body cannot be empty when content-type is set to 'application/json'");
		try {
			return JSON.parse(text);
		} catch {
			throw badRequest("Body is not valid JSON");
		}
	}
	if (type.startsWith("text/")) return await req.text();
	return undefined;
}


function setProp(obj, key, value) {
	Object.defineProperty(obj, key, { value, writable: true, configurable: true, enumerable: true });
}


/**
 * Handler response object: collects status and headers.
 */
function createRes() {
	const res = {
		statusCode: 200,
		headers: new Headers(),
		status(code) { res.statusCode = code; return res; },
		header(name, value) { res.headers.set(name, value); return res; },
	};
	return res;
}


function toResponse(data, res) {
	if (data instanceof Response) return data;

	if (data === undefined) {
		const status = res.statusCode === 200 ? 204 : res.statusCode;
		return new Response(null, { status, headers: res.headers });
	}

	const response = Response.json(data, { status: res.statusCode });
	for (const [k, v] of res.headers) response.headers.set(k, v);
	return response;
}


/**
 * Wraps a route handler: auth, parsing, validation, handler, response.
 */
function wrap(route, ctx) {
	const schema = route.schema || {};
	const v = compileRoute(schema, ctx.ajvs, ctx.dev);
	const name = `${route.method} ${route.path}`;

	return async function (req) {
		let response;
		try {

			// 1. Auth
			if (schema.auth) authenticate(req, ctx.secret);

			// 2. Parse
			const params = { ...req.params };
			const query = parseQuery(req.url);
			const body = await parseBody(req);

			// 3. Validate (may coerce, add defaults, remove extras)
			if (v.request.params) validatePart(v.request.params, "params", params);
			if (v.request.querystring) validatePart(v.request.querystring, "querystring", query);
			if (v.request.headers) validatePart(v.request.headers, "headers", Object.fromEntries(req.headers));
			if (v.request.body) validatePart(v.request.body, "body", body);

			setProp(req, "params", params);
			setProp(req, "query", query);
			setProp(req, "body", body);

			// 4. Handler
			const res = createRes();
			const data = await route.handler(req, res);
			response = toResponse(data, res);

			// 5. Development: check response against schema
			if (ctx.dev && !(data instanceof Response)) {
				const problem = checkResponse(v.response, response.status, data);
				if (problem) console.warn(`⚠️  Response mismatch ${name} ${response.status} (${route.file}): ${problem}`);
			}

		} catch (err) {
			if (ctx.dev) logDevError(err);
			response = errorResponse(err, !ctx.dev);
		}

		return finish(req, response, ctx);
	};
}


/**
 * Registered routes -> Bun.serve routes object.
 */
export function buildRoutes(routes, ctx) {
	const out = {};
	for (const r of routes) {
		out[r.path] ||= {};
		try {
			out[r.path][r.method] = wrap(r, ctx);
		} catch (err) {
			throw new Error(`Invalid schema for ${r.method} ${r.path} (${r.file}): ${err.message}`);
		}
	}
	return out;
}


/**
 * Everything not matched by a route: preflight, static files, 404.
 */
export function fallback(ctx) {
	return async function (req) {
		if (req.method === "OPTIONS") return finish(req, preflight(req, ctx.cors), ctx);

		const file = await serveStatic(req, ctx.static);
		if (file) return finish(req, file, ctx);

		const { pathname } = new URL(req.url);
		const err = Object.assign(new Error(`Route ${req.method}:${pathname} not found`), { statusCode: 404 });
		return finish(req, errorResponse(err, !ctx.dev), ctx);
	};
}
