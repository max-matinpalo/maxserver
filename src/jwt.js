import { createHmac, timingSafeEqual } from "node:crypto";
import { createError } from "./errors.js";

const HEADER = b64(JSON.stringify({ alg: "HS256", typ: "JWT" }));
const UNITS = { s: 1, m: 60, h: 3600, d: 86400, w: 604800 };

let configuredSecret;


export function configureJwt(secret) {
	configuredSecret = secret;
}


function getSecret() {
	const secret = configuredSecret || process.env.SECRET;
	if (!secret) throw new Error("signJwt: no secret, set secret in maxserver() or SECRET in .env");
	return secret;
}


function b64(str) {
	return Buffer.from(str).toString("base64url");
}


function sign(data, secret) {
	return createHmac("sha256", secret).update(data).digest("base64url");
}


/**
 * Parses expiresIn: seconds as number or "60s", "30m", "12h", "7d", "2w".
 */
function toSeconds(value) {
	if (typeof value === "number") return value;
	const m = String(value).match(/^(\d+)\s*([smhdw])$/);
	if (!m) throw new Error(`signJwt: invalid expiresIn "${value}"`);
	return Number(m[1]) * UNITS[m[2]];
}


/**
 * Creates a HS256 JWT signed with the server secret.
 */
export function signJwt(payload, { expiresIn } = {}) {
	const now = Math.floor(Date.now() / 1000);
	const claims = { iat: now, ...payload };
	if (expiresIn !== undefined) claims.exp = now + toSeconds(expiresIn);

	const data = `${HEADER}.${b64(JSON.stringify(claims))}`;
	return `${data}.${sign(data, getSecret())}`;
}


/**
 * Verifies a HS256 JWT and returns its payload.
 * Only HS256 is accepted, signature compared in constant time.
 */
export function verifyJwt(token, secret = getSecret()) {
	const invalid = createError(401, "Authorization token is invalid");

	// 1. Structure
	const parts = String(token).split(".");
	if (parts.length !== 3) throw invalid;
	const [head, body, signature] = parts;

	// 2. Algorithm
	let header, payload;
	try {
		header = JSON.parse(Buffer.from(head, "base64url"));
		payload = JSON.parse(Buffer.from(body, "base64url"));
	} catch {
		throw invalid;
	}
	if (header?.alg !== "HS256") throw invalid;
	if (!payload || typeof payload !== "object") throw invalid;

	// 3. Signature
	const expected = Buffer.from(sign(`${head}.${body}`, secret));
	const given = Buffer.from(signature);
	if (given.length !== expected.length || !timingSafeEqual(given, expected)) throw invalid;

	// 4. Time claims
	const now = Math.floor(Date.now() / 1000);
	if (typeof payload.exp === "number" && now >= payload.exp)
		throw createError(401, "Authorization token expired");
	if (typeof payload.nbf === "number" && now < payload.nbf) throw invalid;

	return payload;
}


/**
 * Auth for routes with auth: true.
 * Token from "Authorization: Bearer <token>" header or "token" cookie.
 */
export function authenticate(req, secret) {
	const auth = req.headers.get("authorization") || "";
	const token = auth.startsWith("Bearer ") ? auth.slice(7).trim() : req.cookies?.get("token");

	if (!token) throw createError(401, "No Authorization was found in request");

	const user = verifyJwt(token, secret);
	req.user = user;
	req.userId = user.sub || user.userId || user.userid || user.id || null;
}
