import fs from "node:fs";
import path from "node:path";

import cors from "@fastify/cors";
import jwt from "@fastify/jwt";
import cookie from "@fastify/cookie";
import mongodb from "@fastify/mongodb";
import fastifyStatic from "@fastify/static";
import helmet from "@fastify/helmet";



export async function setupHelmet(app) {
	await app.register(helmet, {
		contentSecurityPolicy: false,
		frameguard: false,
		crossOriginResourcePolicy: {
			policy: "cross-origin"
		}
	});
}



export async function setupCors(app) {
	const isProd = app.maxserver.env === "production";
	let origin = app.maxserver.cors ?? "*";

	// Fix: Credentials + "*" = Browser Error
	// If no origin is defined in dev, we should allow the specific requester
	if (origin === "*" && !isProd)
		origin = true; // Fastify-cors treats 'true' as "reflect the request origin"

	if (isProd && (origin === "*" || origin === true))
		app.log.warn("CORS: allowing all origins in production with credentials is risky");

	await app.register(cors, {
		origin,
		credentials: true,
		methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS']
	});
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



