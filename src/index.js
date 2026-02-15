import Fastify from "fastify";

import {
	setupCors,
	setupHelmet,
	setupJwt,
	setupMongo,
	setupStatic,
	setupCookie,
} from "./setup.js";


import { getAddress } from "./getAddress.js";
import { setupDocs } from "./setupDocs.js";
import { setupRoutes } from "./setupRoutes.js";
import { setupDevSounds } from "./devSounds.js";

export default async function maxserver(config = {}) {

	console.log("local one running 3");

	const {

		// maxserver options
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

		// everything else goes straight to Fastify
		...fastifyOpts

	} = config;

	const maxserverConfig = {
		port, secret, mongodb, docs, cors, env, openapiInfo, routesDir, scalar, sounds,
		static: isStatic,
		public: isPublic
	};

	if (!secret)
		throw new Error("secret is must have");


	let app;
	try {
		app = Fastify({
			trustProxy: true,
			// Required to allow adding doc fields on schema
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
		const host = this.maxserver.public ? '0.0.0.0' : '127.0.0.1';
		await this.listen({ port, host });
		console.log('Server running at ', getAddress(this));
	});

	await setupDevSounds(app);
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