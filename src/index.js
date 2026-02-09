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



export default async function maxserver(options = {}) {

	const app = Fastify({
		trustProxy: true,
		https: getHttpsOptions() || undefined,

		// To allow writing example value fields to schemas for doucumentation 
		ajv: { customOptions: { strictSchema: false } },
		...options,
	});

	global.createError = function (code, message) {
		const err = new Error(message);
		err.statusCode = code;
		return err;
	};

	setupGetAddress(app);
	await setupCookie(app);
	await setupHelmet(app);
	await setupCors(app);
	await setupJwt(app);
	await setupMongo(app);
	await setupStatic(app);
	await setupDocs(app);
	await setupRoutes(app);


	return app;
}