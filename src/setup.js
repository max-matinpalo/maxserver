import fs from "node:fs";
import path from "node:path";

import cors from "@fastify/cors";
import jwt from "@fastify/jwt";
import cookie from "@fastify/cookie";
import mongodb from "@fastify/mongodb";
import fastifyStatic from "@fastify/static";
import helmet from "@fastify/helmet";
import swagger from "@fastify/swagger";
import apiReference from "@scalar/fastify-api-reference";

import { loadRoutes } from "./routeLoader.js";


export async function setupCookie(app) {
	// Use COOKIE_SECRET or fall back to JWT_SECRET so you don't need a new env var immediately
	const secret = process.env.COOKIE_SECRET || process.env.JWT_SECRET || "change-me-in-prod";

	await app.register(cookie, {
		secret,
		hook: "onRequest", // Crucial: Ensures cookies are parsed before your route handlers run
		parseOptions: {}
	});
}



export async function setupHelmet(app) {
	await app.register(helmet, {
		contentSecurityPolicy: false,
		crossOriginResourcePolicy: {
			policy: "cross-origin"
		}
	});
}

export async function setupCors(app) {
	const isProd = process.env.NODE_ENV === "production";
	const origin = process.env.CORS_ORIGIN || true;

	if (isProd && !process.env.CORS_ORIGIN) app.log.warn("CORS_ORIGIN not set, allowing all origins");

	await app.register(cors, { origin });
}



export async function setupRoutes(app) {
	await loadRoutes(app);
}

export function getHttpsOptions() {
	const { TLS_KEY, TLS_CERT } = process.env;
	if (!TLS_KEY || !TLS_CERT) return null;

	try {
		return {
			key: fs.readFileSync(TLS_KEY),
			cert: fs.readFileSync(TLS_CERT),
		};
	} catch (err) {
		throw new Error(`TLS read failed: ${err.message || err}`);
	}
}





function isAuthSkippableUrl(url) {
	if (!url) return false;
	if (url.startsWith("/openapi.json")) return true;
	if (url.startsWith("/docs")) return true;
	if (url.startsWith("/static/")) return true;
	return false;
}

export async function setupJwt(app) {
	const secret = process.env.JWT_SECRET;
	if (!secret) return;

	// because we added own cookie setup function above
	//await app.register(cookie);

	await app.register(jwt, { secret, cookie: { cookieName: "token" } });

	app.addHook("onRequest", async function (req) {
		if (req.method === "OPTIONS") return;

		const url = req.raw?.url || req.url;
		if (isAuthSkippableUrl(url)) return;
		if (req.routeOptions?.config?.public) return;

		await req.jwtVerify();

		const u = req.user;
		req.userId = u?.sub || u?.userId || u?.userid || u?.id || null;
	});
}

export async function setupMongo(app) {

	const url = process.env.MONGODB_URI;
	if (!url) return;

	await app.register(mongodb, { url });

	// ObjectId is available on app.mongo after registration
	const { ObjectId, db } = app.mongo;

	global.oid = id => new ObjectId(id ? String(id) : undefined);
	global.db = db;
}

export async function setupStatic(app) {
	const dir = process.env.STATIC_DIR;
	if (!dir) return;

	await app.register(fastifyStatic, {
		root: path.resolve(dir),
		prefix: "/static/",
	});
}

export async function setupDocs(app) {
	const defaultSecurity = [{ bearerAuth: [] }, { cookieAuth: [] }];

	await app.register(swagger, {
		openapi: {
			components: {
				securitySchemes: {
					bearerAuth: { type: "http", scheme: "bearer" },
					cookieAuth: { type: "apiKey", in: "cookie", name: "token" },
				},
			},
		},
	});

	app.get("/openapi.json", { config: { public: true } }, () => app.swagger());

	await app.register(apiReference, { routePrefix: "/docs", openapi: true });

	app.addHook("onRoute", (route) => {
		if (route.config?.public) return;
		route.schema ||= {};
		route.schema.security = defaultSecurity;
	});
}