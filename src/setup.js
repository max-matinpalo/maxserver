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


export async function setupHelmet(app) {
	await app.register(helmet, {
		contentSecurityPolicy: false,
		crossOriginResourcePolicy: {
			policy: "cross-origin"
		}
	});
}


export async function setupCors(app) {
	const isProd = app.maxserver.env === "production";
	const origin = app.maxserver.cors ?? "*";
	if (isProd && origin === "*") {
		app.log.warn("CORS: allowing all origins (*) in production");
	}
	await app.register(cors, { origin });
}


export async function setupCookie(app) {
	await app.register(cookie, {
		secret: app.maxserver.secret,
		hook: "onRequest"
	});
}




export async function setupMongo(app) {
	const url = app.maxserver.mongodb;
	if (!url) return;
	await app.register(mongodb, { url });

	const { ObjectId, db } = app.mongo;
	global.oid = id => new ObjectId(id);
	global.db = db;
}



export async function setupJwt(app) {
	await app.register(jwt, {
		secret: app.maxserver.secret,
		cookie: { cookieName: "token" }
	});

	app.addHook("preHandler", async function (req) {

		// Let preflight requests pass
		if (req.method === "OPTIONS") return;

		const auth = req.routeOptions?.config?.auth;

		if (!auth) return;

		await req.jwtVerify();
		const u = req.user;
		req.userId = u?.sub || u?.userId || u?.userid || u?.id || null;
	});

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

	if (app.maxserver.docs !== false)
		await app.register(apiReference, { routePrefix: "/docs", openapi: true });

	app.addHook("onRoute", (route) => {
		const auth = route.config?.auth;
		if (!auth) return;
		route.schema ||= {};
		route.schema.security ||= [{ bearerAuth: [] }, { cookieAuth: [] }];
	});
}



export async function setupStatic(app) {
	const dir = app.maxserver.static;
	if (!dir) return;

	if (typeof dir !== "string") {
		console.error("❌ maxserver.static must be a string path");
		return;
	}

	const abs = path.resolve(dir);
	if (!fs.existsSync(abs)) {
		console.error(`❌ maxserver.static not found: ${abs}`);
		return;
	}

	await app.register(fastifyStatic, { root: abs });
}



