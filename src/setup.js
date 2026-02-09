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

export async function setupRoutes(app) {
	await loadRoutes(app);
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
	const origin = app.maxserver.corsOrigin ?? true;

	if (isProd && origin === true) {
		app.log.warn("CORS origin not set, allowing all origins");
	}

	await app.register(cors, { origin });
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




export async function setupCookie(app) {
	await app.register(cookie, {
		secret: app.maxserver.secret || "supersecret",
		hook: "onRequest"
	});
}


export async function setupJwt(app) {

	await app.register(jwt, {
		secret: app.maxserver.secret || "supersecret",
		cookie: { cookieName: "token" }
	});

	app.addHook("preHandler", async function (req) {

		// Let preflight requests pass
		if (req.method === "OPTIONS") return;

		const auth =
			req.routeOptions?.config?.auth ??
			req.routeOptions?.schema?.auth;

		if (!auth) return;

		await req.jwtVerify();
		const u = req.user;
		req.userId = u?.sub || u?.userId || u?.userid || u?.id || null;
	});

}


export async function setupMongo(app) {
	const url = app.maxserver.mongodbUri;
	if (!url) return;
	await app.register(mongodb, { url });

	const { ObjectId, db } = app.mongo;
	global.oid = id => new ObjectId(id ? String(id) : undefined);
	global.db = db;
}


export async function setupDocs(app) {

	const info = app.maxserver.openapiInfo || {
		title: "API",
		version: "1.0.0",
	};

	await app.register(swagger, {
		openapi: {
			info,
			// OpenAPI 3.x: securitySchemes must be defined globally here not per route
			// Routes only add `security: [...]` that references these scheme names
			components: {
				securitySchemes: {
					bearerAuth: { type: "http", scheme: "bearer" },
					cookieAuth: { type: "apiKey", in: "cookie", name: "token" },
				},
			},
		},
	});


	app.get("/openapi.json", {}, () => app.swagger());

	if (app.maxserver.docs != false)
		await app.register(apiReference, { routePrefix: "/docs", openapi: true });

	app.addHook("onRoute", (route) => {
		const auth = route.config?.auth ?? route.schema?.auth;
		if (!auth) return;
		route.schema ||= {};
		route.schema.security ||= [{ bearerAuth: [] }, { cookieAuth: [] }];
	});
}



export async function setupStatic(app) {
	const dir = app.maxserver.staticDir;
	if (!dir) return;

	await app.register(fastifyStatic, {
		root: path.resolve(dir),
		prefix: "/static/",
	});
}

