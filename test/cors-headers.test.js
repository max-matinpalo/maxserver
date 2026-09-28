import { test, expect, beforeAll, afterAll, describe } from "bun:test";
import { prepareFixture, startServer } from "./helpers.js";

const SECURITY = {
	"cross-origin-opener-policy": "same-origin",
	"cross-origin-resource-policy": "cross-origin",
	"referrer-policy": "no-referrer",
	"strict-transport-security": "max-age=31536000; includeSubDomains",
	"x-content-type-options": "nosniff",
	"x-xss-protection": "0",
};

beforeAll(() => prepareFixture());


describe("dev, cors *", () => {
	let server;
	beforeAll(async () => { server = await startServer(); });
	afterAll(() => server.stop());

	test("reflects request origin with credentials", async () => {
		const r = await fetch(server.url + "/welcome", { headers: { origin: "http://a.com" } });
		expect(r.headers.get("access-control-allow-origin")).toBe("http://a.com");
		expect(r.headers.get("access-control-allow-credentials")).toBe("true");
		expect(r.headers.get("vary")).toContain("Origin");
	});

	test("preflight answered with methods and requested headers", async () => {
		const r = await fetch(server.url + "/items", {
			method: "OPTIONS",
			headers: {
				origin: "http://a.com",
				"access-control-request-method": "POST",
				"access-control-request-headers": "content-type,authorization",
			},
		});
		expect(r.status).toBe(204);
		expect(r.headers.get("access-control-allow-origin")).toBe("http://a.com");
		expect(r.headers.get("access-control-allow-methods")).toContain("POST");
		expect(r.headers.get("access-control-allow-headers")).toBe("content-type,authorization");
	});

	test("security headers on every response: route, 404, error, static, docs", async () => {
		for (const path of ["/welcome", "/nope", "/error", "/style.css", "/docs", "/docs/openapi.json"]) {
			const r = await fetch(server.url + path);
			for (const [k, v] of Object.entries(SECURITY)) expect(`${path} ${k}: ${r.headers.get(k)}`).toBe(`${path} ${k}: ${v}`);
		}
	});

	test("security headers also on returned Response", async () => {
		const r = await fetch(server.url + "/raw");
		expect(r.headers.get("x-content-type-options")).toBe("nosniff");
	});
});


describe("production, cors *", () => {
	let server;
	beforeAll(async () => { server = await startServer({ env: { NODE_ENV: "production" } }); });
	afterAll(() => server.stop());

	test("allows * and logs a warning", async () => {
		const r = await fetch(server.url + "/welcome", { headers: { origin: "http://a.com" } });
		expect(r.headers.get("access-control-allow-origin")).toBe("*");
		expect(server.logs()).toContain("CORS: allowing all origins in production");
	});
});


describe("configured origin list", () => {
	let server;
	beforeAll(async () => { server = await startServer({ env: { CORS: "http://a.com, http://b.com" } }); });
	afterAll(() => server.stop());

	test("allowed origin reflected", async () => {
		const r = await fetch(server.url + "/welcome", { headers: { origin: "http://b.com" } });
		expect(r.headers.get("access-control-allow-origin")).toBe("http://b.com");
	});

	test("other origin gets no allow-origin header", async () => {
		const r = await fetch(server.url + "/welcome", { headers: { origin: "http://evil.com" } });
		expect(r.headers.get("access-control-allow-origin")).toBeNull();
	});
});
