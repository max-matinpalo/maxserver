import Fastify from "fastify";

import {
	setupCors,
	setupHelmet,
	setupJwt,
	setupMongo,
	setupStatic,
	setupRoutes,
	setupDocs,
	setupCookie,
	getHttpsOptions,
} from "./setup.js";

import { setupGetAddress } from "./getAddress.js";


export default async function maxserver(config = {}) {

	const {

		// maxserver options
		secret = process.env.SECRET,
		cookieSecret = process.env.COOKIE_SECRET,
		mongodbUri = process.env.MONGODB_URI,
		docs = process.env.DOCS !== "false",
		staticDir = process.env.STATIC_DIR,
		corsOrigin = process.env.CORS_ORIGIN || "*",

		// everything else goes straight to Fastify
		...fastifyOpts

	} = config;

	if (process.env.NODE_ENV == "development") {
		console.error("Please define secret in env !");

	}

	let maxserverConfig = {
		secret, mongodbUri, docs, staticDir, corsOrigin
	};

	process.env.NODE_ENV;




	const app = Fastify({

		https: getHttpsOptions() || undefined,
		trustProxy: true,

		// To allow writing example value fields to schemas for doucumentation 
		ajv: { customOptions: { strictSchema: false } },
		...fastifyOpts,
	});

	app.decorate("maxserver", maxserverConfig);



	setupGetAddress(app);
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