import { test, expect } from "bun:test";
import { createHmac } from "node:crypto";
import { signJwt, verifyJwt, configureJwt } from "../../src/jwt.js";

configureJwt("unit_secret");

const b64 = obj => Buffer.from(JSON.stringify(obj)).toString("base64url");

function token(header, payload, secret = "unit_secret") {
	const data = `${b64(header)}.${b64(payload)}`;
	return `${data}.${createHmac("sha256", secret).update(data).digest("base64url")}`;
}

function rejects(t, message = "Authorization token is invalid") {
	let err;
	try { verifyJwt(t); } catch (e) { err = e; }
	expect(err?.statusCode).toBe(401);
	expect(err?.message).toBe(message);
}


test("sign + verify roundtrip with iat and exp", () => {
	const payload = verifyJwt(signJwt({ sub: "u1" }, { expiresIn: "7d" }));
	expect(payload.sub).toBe("u1");
	expect(payload.exp - payload.iat).toBe(7 * 86400);
});

test("expiresIn units and numbers", () => {
	for (const [v, s] of [["60s", 60], ["30m", 1800], ["12h", 43200], ["2w", 1209600], [90, 90]]) {
		const p = verifyJwt(signJwt({}, { expiresIn: v }));
		expect(p.exp - p.iat).toBe(s);
	}
	expect(() => signJwt({}, { expiresIn: "soon" })).toThrow('invalid expiresIn "soon"');
});

test("without expiresIn no exp", () => {
	expect(verifyJwt(signJwt({ sub: "u1" })).exp).toBeUndefined();
});

test("expired -> 401 expired", () => {
	rejects(signJwt({}, { expiresIn: -1 }), "Authorization token expired");
});

test("nbf in future -> 401", () => {
	rejects(token({ alg: "HS256" }, { nbf: Math.floor(Date.now() / 1000) + 60 }));
});

test("only HS256: none, HS512, missing alg rejected", () => {
	rejects(`${b64({ alg: "none" })}.${b64({ sub: "u1" })}.`);
	rejects(token({ alg: "HS512" }, { sub: "u1" }));
	rejects(token({}, { sub: "u1" }));
});

test("wrong secret, tampered, malformed -> 401", () => {
	rejects(token({ alg: "HS256" }, { sub: "u1" }, "other"));

	const [h, , s] = signJwt({ sub: "u1" }).split(".");
	rejects(`${h}.${b64({ sub: "admin" })}.${s}`);

	for (const t of ["", "abc", "a.b", "a.b.c", "a.b.c.d", `${b64({ alg: "HS256" })}.bm90anNvbg.x`]) rejects(t);
});

test("payload must be an object", () => {
	rejects(token({ alg: "HS256" }, "text"));
});
