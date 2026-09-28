const METHODS = "GET,POST,PUT,PATCH,DELETE,OPTIONS";


/**
 * Normalizes the cors option: "*" or "https://a.com,https://b.com"
 */
export function setupCors(cors = "*", production) {
	const list = String(cors).split(",").map(s => s.trim()).filter(Boolean);

	if (list.includes("*")) {
		if (production)
			console.warn("⚠️  CORS: allowing all origins in production with credentials is risky");
		return { any: true, reflect: !production };
	}

	return { any: false, list };
}


/**
 * CORS headers for a request, as in v1 (@fastify/cors with credentials).
 */
export function corsHeaders(req, cors) {
	return { ...fixedCorsHeaders(cors), ...originHeaders(req, cors) };
}


/**
 * CORS headers that are the same for every request.
 */
export function fixedCorsHeaders(cors) {
	const headers = { "Access-Control-Allow-Credentials": "true" };
	if (cors.any && !cors.reflect) headers["Access-Control-Allow-Origin"] = "*";
	return headers;
}


/**
 * CORS headers for the request's origin (reflected or listed), null if none.
 */
export function originHeaders(req, cors) {
	if (cors.any && !cors.reflect) return null;
	const origin = req.headers.get("origin");
	if (!origin || !(cors.any || cors.list.includes(origin))) return null;
	return { "Access-Control-Allow-Origin": origin, "Vary": "Origin" };
}


/**
 * Answers OPTIONS preflight requests.
 */
export function preflight(req, cors) {
	const headers = corsHeaders(req, cors);
	headers["Access-Control-Allow-Methods"] = METHODS;

	const requested = req.headers.get("access-control-request-headers");
	if (requested) {
		headers["Access-Control-Allow-Headers"] = requested;
		headers["Vary"] = headers["Vary"] ? "Origin, Access-Control-Request-Headers" : "Access-Control-Request-Headers";
	}

	return new Response(null, { status: 204, headers });
}
