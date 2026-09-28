/**
 * Security headers, same as v1 helmet config:
 * helmet defaults without CSP and frameguard, CORP cross-origin.
 */
export const SECURITY_HEADERS = {
	"Cross-Origin-Opener-Policy": "same-origin",
	"Cross-Origin-Resource-Policy": "cross-origin",
	"Origin-Agent-Cluster": "?1",
	"Referrer-Policy": "no-referrer",
	"Strict-Transport-Security": "max-age=31536000; includeSubDomains",
	"X-Content-Type-Options": "nosniff",
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
