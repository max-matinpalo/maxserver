import os from "node:os";

import { createError } from "./errors.js";
import { configureJwt } from "./jwt.js";
import { setupCors } from "./cors.js";
import { setupStatic } from "./static.js";
import { createValidators } from "./validate.js";
import { buildOpenApi, docsRoutes } from "./docs.js";
import { buildRoutes, fallback, finish } from "./routes.js";
import { soundsEnabled } from "./devSounds.js";
import { startWorkers, isWorker } from "./workers.js";

export { createError } from "./errors.js";
export { signJwt, verifyJwt } from "./jwt.js";


// Framework globals, typed in index.d.ts
globalThis.createError = createError;
globalThis.ENV = {
	...process.env,
	development: process.env.NODE_ENV !== "production",
	production: process.env.NODE_ENV === "production",
};


// Filled by generated setup.js before server.js runs
const registry = { routes: null, models: [] };


/**
 * Called by setup.js with all routes and models.
 */
export function register({ routes = [], models = [] } = {}) {
	registry.routes = routes;
	registry.models = models;
}


function lanIp() {
	for (const list of Object.values(os.networkInterfaces()))
		for (const net of list || [])
			if (net.family === "IPv4" && !net.internal) return net.address;
	return null;
}


export default async function maxserver(config = {}) {

	// 1. Config: maxserver() > .env > default
	const {
		port = Number(process.env.PORT || 3000),
		secret = process.env.SECRET,
		docs = process.env.DOCS !== "false",
		cors = process.env.CORS || "*",
		env = process.env.NODE_ENV || "development",
		static: staticDir = process.env.STATIC,
		public: isPublic = process.env.PUBLIC === "true",
		workers = Number(process.env.WORKERS || 1),
		bodyLimit = Number(process.env.BODYLIMIT || 1048576),
		openapiInfo,
		scalar = {},
		sounds = true,
	} = config;

	if (!secret)
		throw new Error("maxserver: secret is required, set secret in maxserver() or SECRET in .env");
	if (!registry.routes)
		throw new Error("maxserver: no routes registered. Start with `maxserver dev`, or `maxserver build` and `bun dist/setup.js` (running server.js directly skips the generated setup.js)");

	// 2. Models need an $id to be referenced
	for (const m of registry.models)
		if (!m.schema?.$id) throw new Error(`maxserver: model schema needs an $id (${m.file})`);
	const models = registry.models.map(m => m.schema);

	// 3. Shared context for all requests
	const dev = env !== "production";
	configureJwt(secret);

	const ctx = {
		dev,
		secret,
		cors: setupCors(cors, !dev),
		static: setupStatic(staticDir),
		sounds: soundsEnabled({ sounds, dev }),
		ajvs: createValidators(models),
	};

	// 4. Routes: user routes + docs
	const routes = buildRoutes(registry.routes, ctx);
	if (docs) {
		const openapi = buildOpenApi(registry.routes, models, openapiInfo);
		for (const [path, handler] of Object.entries(docsRoutes(openapi, scalar)))
			routes[path] = { GET: req => finish(req, handler(), ctx) };
	}

	// 5. Server object
	const server = {
		config: { port, docs, cors, env, static: staticDir, public: isPublic, workers, bodyLimit },
		bun: null,
		url: null,

		async start() {
			if (startWorkers(workers, dev)) return server;

			server.bun = Bun.serve({
				port,
				hostname: isPublic ? "0.0.0.0" : "127.0.0.1",
				reusePort: isWorker(),
				maxRequestBodySize: bodyLimit,
				routes,
				fetch: fallback(ctx),
			});

			server.url = server.bun.url.href.replace(/\/$/, "");
			console.log("🟢 ", server.url);

			const ip = isPublic && lanIp();
			if (ip) console.log("🌐 ", `http://${ip}:${server.bun.port}`);
			return server;
		},

		async stop() {
			await server.bun?.stop(true);
		},
	};

	return server;
}
