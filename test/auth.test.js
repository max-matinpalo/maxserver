import { test, expect, beforeAll, afterAll } from "bun:test";
import { createHmac } from "node:crypto";
import { prepareFixture, startServer } from "./helpers.js";

let server;

beforeAll(async () => {
	prepareFixture();
	server = await startServer();
});

afterAll(() => server.stop());

const b64 = obj => Buffer.from(JSON.stringify(obj)).toString("base64url");

function token(header, payload, secret = "test_secret", algo = "sha256") {
	const data = `${b64(header)}.${b64(payload)}`;
	return `${data}.${createHmac(algo, secret).update(data).digest("base64url")}`;
}

async function login(body = { userId: "u1" }) {
	const r = await fetch(server.url + "/login", {
		method: "POST",
		headers: { "content-type": "application/json" },
		body: JSON.stringify(body),
	});
	return { token: (await r.json()).token, cookie: r.headers.get("set-cookie") };
}

const me = headers => fetch(server.url + "/me", { headers });


test("valid token in header -> req.userId set", async () => {
	const { token } = await login();
	const r = await me({ authorization: `Bearer ${token}` });
	expect(r.status).toBe(200);
	expect(await r.json()).toEqual({ userId: "u1", sub: "u1" });
});

test("valid token in cookie -> req.userId set", async () => {
	const { cookie } = await login();
	expect(cookie).toContain("token=");
	const r = await me({ cookie: cookie.split(";")[0] });
	expect(r.status).toBe(200);
	expect((await r.json()).userId).toBe("u1");
});

test("missing token -> 401", async () => {
	const r = await me({});
	expect(r.status).toBe(401);
	expect((await r.json()).statusCode).toBe(401);
});

test("bad signature -> 401", async () => {
	const t = token({ alg: "HS256", typ: "JWT" }, { sub: "u1" }, "other_secret");
	expect((await me({ authorization: `Bearer ${t}` })).status).toBe(401);
});

test("tampered payload -> 401", async () => {
	const { token: t } = await login();
	const [h, , s] = t.split(".");
	const forged = `${h}.${b64({ sub: "admin" })}.${s}`;
	expect((await me({ authorization: `Bearer ${forged}` })).status).toBe(401);
});

test("expired token -> 401", async () => {
	const { token: t } = await login({ userId: "u1", expiresIn: -10 });
	const r = await me({ authorization: `Bearer ${t}` });
	expect(r.status).toBe(401);
	expect((await r.json()).message).toBe("Authorization token expired");
});

test("alg none -> 401", async () => {
	const t = `${b64({ alg: "none", typ: "JWT" })}.${b64({ sub: "u1" })}.`;
	expect((await me({ authorization: `Bearer ${t}` })).status).toBe(401);
});

test("alg other than HS256 -> 401, even when correctly signed", async () => {
	const t = token({ alg: "HS512", typ: "JWT" }, { sub: "u1" }, "test_secret", "sha512");
	expect((await me({ authorization: `Bearer ${t}` })).status).toBe(401);
});

test("garbage token -> 401", async () => {
	expect((await me({ authorization: "Bearer abc" })).status).toBe(401);
	expect((await me({ authorization: "Bearer a.b.c" })).status).toBe(401);
});
