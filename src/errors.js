import { STATUS_CODES } from "node:http";


/**
 * Creates an Error with an HTTP status code.
 * Throw it from handlers to stop with a clean HTTP error.
 */
export function createError(code, message) {
	const err = new Error(message);
	err.statusCode = code;
	Error.captureStackTrace?.(err, createError);
	return err;
}


/**
 * Only valid HTTP error codes, everything else is 500.
 */
function statusOf(err) {
	const code = Number(err?.statusCode || err?.status);
	return code >= 400 && code <= 599 ? code : 500;
}


/**
 * Turns any thrown error into a JSON response.
 * Shape as in v1 (Fastify): { statusCode, error, message }
 */
export function errorResponse(err, production) {
	const code = statusOf(err);

	let message = err?.message || STATUS_CODES[code];
	if (code >= 500 && production) message = STATUS_CODES[code];

	return Response.json(
		{ statusCode: code, error: STATUS_CODES[code] || "Error", message },
		{ status: code }
	);
}


/**
 * First stack frame in the app (inside cwd, not node_modules), as "src/file.js:4".
 */
function appLocation(err) {
	const cwd = process.cwd() + "/";
	for (const line of String(err?.stack || "").split("\n").slice(1)) {
		const match = line.match(/(?:file:\/\/)?(\/[^()]+):(\d+):\d+\)?$/);
		if (match && match[1].startsWith(cwd) && !match[1].includes("/node_modules/"))
			return `${match[1].slice(cwd.length)}:${match[2]}`;
	}
	return null;
}


/**
 * One log entry per error: status, request, message, app file:line, stack for 5xx.
 * Development logs all errors, production only 5xx.
 */
export function logError(err, req, dev) {
	const code = statusOf(err);
	if (!dev && code < 500) return;

	const { pathname } = new URL(req.url);
	const where = appLocation(err);
	console.error(`❌ ${code} ${req.method} ${pathname}  ${err?.message}${where ? `  (${where})` : ""}`);

	const stack = String(err?.stack || "").split("\n").slice(1).join("\n");
	if (code >= 500 && stack) console.error(stack);
}
