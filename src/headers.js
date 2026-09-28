/**
 * Security headers for JSON (handler data, errors): the only helmet headers
 * that matter for JSON. Each header costs Bun time on every response.
 */
export const API_HEADERS = {
	"Strict-Transport-Security": "max-age=31536000; includeSubDomains",
	"X-Content-Type-Options": "nosniff",
};


/**
 * Security headers for everything else (static files, /docs, returned Responses),
 * same as v1 helmet config: helmet defaults without CSP and frameguard, CORP cross-origin.
 */
export const SECURITY_HEADERS = {
	...API_HEADERS,
	"Cross-Origin-Opener-Policy": "same-origin",
	"Cross-Origin-Resource-Policy": "cross-origin",
	"Origin-Agent-Cluster": "?1",
	"Referrer-Policy": "no-referrer",
	"X-DNS-Prefetch-Control": "off",
	"X-Download-Options": "noopen",
	"X-Permitted-Cross-Domain-Policies": "none",
	"X-XSS-Protection": "0",
};


/**
 * Sets headers on a response. Responses with immutable headers
 * (e.g. from fetch) are copied first.
 */
export function setHeaders(response, headers) {
	try {
		for (const [k, v] of Object.entries(headers)) response.headers.set(k, v);
		return response;
	} catch {
		const copy = new Response(response.body, response);
		for (const [k, v] of Object.entries(headers)) copy.headers.set(k, v);
		return copy;
	}
}
