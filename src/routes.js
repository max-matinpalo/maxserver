import { authenticate } from "./jwt.js";
import { corsHeaders, fixedCorsHeaders, originHeaders, preflight } from "./cors.js";
import { errorResponse, logError } from "./errors.js";
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
 * Headers of every handler response, built once: Bun copies a Headers
 * object much faster than it sets headers one by one.
 */
export function defaultHeaders(cors) {
	return new Headers({ ...fixedCorsHeaders(cors), ...SECURITY_HEADERS });
}


/**
 * Query string as object, repeated keys become arrays (like Fastify).
 */
function parseQuery(url) {
	const query = {};
	const i = url.indexOf("?");
	if (i < 0) return query;
	for (const [k, v] of new URLSearchParams(url.slice(i + 1))) {
		if (!Object.hasOwn(query, k)) setProp(query, k, v);
		else if (Array.isArray(query[k])) query[k].push(v);
		else query[k] = [query[k], v];
	}
	return query;
}


/**
 * req.query parsed on first use, because reading req.url is slow in Bun.
 */
function lazyQuery(req) {
	let query;
	Object.defineProperty(req, "query", {
		get: () => query ??= parseQuery(req.url),
		set: value => { query = value; },
		configurable: true,
		enumerable: true,
	});
}


function badRequest(message) {
	return Object.assign(new Error(message), { statusCode: 400 });
}


/**
 * Blocks prototype poisoning like Fastify: __proto__ and constructor.prototype keys -> 400.
 */
function safeParse(text) {
	const risky = text.includes("__proto__") || text.includes("constructor");
	return JSON.parse(text, risky ? (key, value) => {
		if (key === "__proto__" || (key === "constructor" && value && typeof value === "object" && "prototype" in value))
			throw badRequest("Object contains forbidden prototype property");
		return value;
	} : undefined);
}


/**
 * Parses the body: JSON and text, else left unread.
 */
async function parseBody(req) {
	const type = (req.headers.get("content-type") || "").toLowerCase();
	if (type.includes("application/json")) {
		const text = await req.text();
		if (!text) throw badRequest("Body cannot be empty when content-type is set to 'application/json'");
		try {
			return safeParse(text);
		} catch (err) {
			throw err.statusCode ? err : badRequest("Body is not valid JSON");
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
 * Headers are a copy of the defaults, made only when a handler sets one.
 */
function createRes(ctx) {
	const res = {
		statusCode: 200,
		headers: null,
		status(code) { res.statusCode = code; return res; },
		header(name, value) {
			res.headers ||= new Headers(ctx.headers);
			if (name.toLowerCase() === "set-cookie") res.headers.append(name, value);
			else res.headers.set(name, value);
			return res;
		},
	};
	return res;
}


/**
 * Handler result -> Response with default, handler and CORS origin headers.
 */
function toResponse(data, res, req, ctx) {
	if (data instanceof Response) return finish(req, data, ctx);

	// 1. Headers: the prebuilt defaults unless something is added
	let headers = res.headers || ctx.headers;
	const origin = originHeaders(req, ctx.cors);
	if (origin) {
		if (headers === ctx.headers) headers = new Headers(headers);
		for (const [k, v] of Object.entries(origin)) headers.set(k, v);
	}

	// 2. Body
	if (data === undefined) {
		const status = res.statusCode === 200 ? 204 : res.statusCode;
		return new Response(null, { status, headers });
	}

	return Response.json(data, { status: res.statusCode, headers });
}


/**
 * Wraps a route handler: auth, parsing, validation, handler, response.
 */
function wrap(route, ctx) {
	const schema = route.schema || {};
	const v = compileRoute(schema, ctx.ajvs, ctx.dev);
	const name = `${route.method} ${route.path}`;

	return async function (req) {
		try {

			// 1. Auth
			if (schema.auth) authenticate(req, ctx.secret);

			// 2. Parse (Bun's req.params is kept and validated in place)
			const body = req.method === "GET" || req.method === "HEAD" ? undefined : await parseBody(req);

			// 3. Validate (may coerce, add defaults, remove extras)
			if (v.request.params) validatePart(v.request.params, "params", req.params);
			if (v.request.querystring) {
				const query = parseQuery(req.url);
				validatePart(v.request.querystring, "querystring", query);
				setProp(req, "query", query);
			} else lazyQuery(req);
			if (v.request.headers) validatePart(v.request.headers, "headers", Object.fromEntries(req.headers));
			if (v.request.body) validatePart(v.request.body, "body", body);

			setProp(req, "body", body);

			// 4. Handler
			const res = createRes(ctx);
			const data = await route.handler(req, res);
			const response = toResponse(data, res, req, ctx);

			// 5. Development: check response against schema
			if (ctx.dev && !(data instanceof Response)) {
				const problem = checkResponse(v.response, response.status, data);
				if (problem) console.warn(`⚠️  Response mismatch ${name} ${response.status} (${route.file}): ${problem}`);
			}
			return response;

		} catch (err) {
			logError(err, req, ctx.dev);
			return finish(req, errorResponse(err, !ctx.dev), ctx);
		}
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
