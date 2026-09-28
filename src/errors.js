import { STATUS_CODES } from "node:http";


/**
 * Creates an Error with an HTTP status code.
 * Throw it from handlers to stop with a clean HTTP error.
 */
export function createError(code, message) {
	const err = new Error(message);
	err.statusCode = code;
	return err;
}


/**
 * Turns any thrown error into a JSON response.
 * Shape as in v1 (Fastify): { statusCode, error, message }
 */
export function errorResponse(err, production) {

	// 1. Status: only valid HTTP error codes, everything else is 500
	let code = Number(err?.statusCode || err?.status);
	if (!(code >= 400 && code <= 599)) code = 500;

	// 2. Unknown errors: always log, hide message in production
	let message = err?.message || STATUS_CODES[code];
	if (code >= 500) {
		console.error(err);
		if (production) message = STATUS_CODES[code];
	}

	return Response.json(
		{ statusCode: code, error: STATUS_CODES[code] || "Error", message },
		{ status: code }
	);
}


/**
 * Development: prints file and line where the error was thrown.
 */
export function logDevError(err) {
	console.log("\n\x1b[1;31mERROR\x1b[0m");

	const stackLine = String(err?.stack || "").split("\n")[1] || "";
	const match = stackLine.match(/([^\s()]+):(\d+):\d+/);
	const file = match?.[1].replace("file://", "").replace(process.cwd(), "");

	if (file) console.log(`${file} -> line ${match[2]}`);
	console.log(err?.message);
}
