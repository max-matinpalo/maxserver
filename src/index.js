import Fastify from "fastify";

import {
	setupCors,
	setupHelmet,
	setupJwt,
	setupMongo,
	setupStatic,
	setupCookie,
	setupErrorLogger,
} from "./setup.js";

import { getAddress } from "./getAddress.js";
import { setupDocs } from "./setupDocs.js";
import { setupRoutes } from "./setupRoutes.js";
import { setupDevSounds } from "./devSounds.js";

import fastifyWebsocket from "@fastify/websocket";

export default async function maxserver(config = {}) {
	const {
		port = Number(process.env.PORT || 3000),
		secret = process.env.SECRET,
		mongodb = process.env.MONGODB,
		docs = process.env.DOCS !== "false",
		cors = process.env.CORS || "*",
		env = process.env.NODE_ENV || "development",
		routesDir = process.env.ROUTESDIR || "src",
		scalar = {},
		openapiInfo,
		sounds,
		static: isStatic = process.env.STATIC,
		public: isPublic = process.env.PUBLIC === "true",
		errorLogger = process.env.ERROR_LOGGER === "true",

		...fastifyOpts
	} = config;

	globalThis.ENV = {
		...process.env,
		development: process.env.NODE_ENV !== "production",
		production: process.env.NODE_ENV === "production"
	};

	const maxserverConfig = {
		port, secret, mongodb, docs, cors, env, openapiInfo, routesDir, scalar, sounds,
		static: isStatic,
		public: isPublic,
		errorLogger
	};

	if (!secret) throw new Error("secret is must have");

	let app;
	try {
		app = Fastify({
			trustProxy: true,
			ajv: { customOptions: { strictSchema: false } },
			...fastifyOpts
		});
	} catch (err) {
		console.error("❌ Fastify initialization failed:", err);
		throw err;
	}

	app.decorate("maxserver", maxserverConfig);

	app.decorate("start", async function () {
		const port = this.maxserver.port ?? 3000;
		const host = this.maxserver.public ? "0.0.0.0" : "127.0.0.1";
		await this.listen({ port, host });
		console.log("🟢 ", getAddress(this));
	});

	app.register(fastifyWebsocket);

	await setupDevSounds(app);
	await setupErrorLogger(app);
	await setupCookie(app);
	await setupHelmet(app);
	await setupCors(app);
	await setupJwt(app);
	await setupMongo(app);
	await setupStatic(app);
	await setupDocs(app);
	await setupRoutes(app);

	global.createError = function (code, message) {
		const err = new Error(message);
		err.statusCode = code;
		return err;
	};

	return app;
}