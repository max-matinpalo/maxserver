/**
 * 🚀 AUTO-LOADER
 * Scans src/ for files with "// METHOD /url" comments.
 * Automatically registers them as Fastify routes.
 * Also registers lonely .schema.js files as global shared schemas.
 */

import fs from "fs";
import path from "path";
import { pathToFileURL } from "url";

// Matches lines like: // GET /api/v1/users
const ROUTE_REGEX = /^\/\/\s*(GET|POST|PUT|PATCH|DELETE)\s+(.+)$/gm;

/**
 * Recursively finds all .js files in a directory.
 */
function walk(dir, out = []) {
	if (!fs.existsSync(dir)) return out;

	for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
		if (e.name === "node_modules" || e.name.startsWith(".")) continue;

		const full = path.join(dir, e.name);
		if (e.isDirectory()) {
			walk(full, out);
			continue;
		}

		if (e.name.endsWith(".js")) out.push(full);
	}

	return out;
}

/**
 * Extracts method and URL from the file's "magic comment".
 */
function getRoute(file) {
	const text = fs.readFileSync(file, "utf8");
	const matches = [...text.matchAll(ROUTE_REGEX)];

	if (matches.length === 0) return null;

	if (matches.length > 1) {
		console.warn(`⚠️ Ignored "${file}": Only 1 route allowed per file.`);
		return null;
	}

	const m = matches[0];
	return {
		method: m[1].toLowerCase(),
		url: "/" + m[2].trim().replace(/^\/+/, "")
	};
}

/**
 * Safe dynamic import for ESM.
 */
async function importDefault(file) {
	return (await import(pathToFileURL(file).href)).default;
}

export async function setupRoutes(app) {
	const root = path.resolve(app.maxserver.routesDir || "src");
	const files = walk(root);

	/*
	// Old one which only graps default exports

	// 1. Pass One: Register Global Schemas (Lonely .schema.js files)
	for (const file of files) {
		if (file.endsWith(".schema.js")) {
			const hasHandler = fs.existsSync(file.replace(".schema.js", ".js"));

			if (!hasHandler) {
				const schema = await importDefault(file);
				if (schema?.$id) app.addSchema(schema);
			}
		}
	}
	*/


	// 1. Pass One: Register Global Schemas (Lonely .schema.js files)
	for (const file of files) {
		// Only process if no matching handler file exists
		if (file.endsWith(".schema.js") && !fs.existsSync(file.replace(".schema.js", ".js"))) {
			const mod = await import(pathToFileURL(file).href);

			// Register default export + all named exports if they have an $id
			for (const schema of Object.values(mod))
				if (schema?.$id) app.addSchema(schema);
		}
	}

	// 2. Pass Two: Register Routes
	const seen = new Map();
	for (const file of files) {
		if (file.endsWith(".schema.js")) continue;

		const info = getRoute(file);
		if (!info) continue;

		const key = `${info.method} ${info.url}`;
		if (seen.has(key)) throw new Error(`Duplicate route "${key}" detected.`);
		seen.set(key, file);

		const handler = await importDefault(file);
		if (typeof handler !== "function") {
			throw new Error(`Route "${key}" in "${file}" must export a default function.`);
		}

		const schemaFile = file.replace(/\.js$/, ".schema.js");
		let raw = {};

		if (fs.existsSync(schemaFile)) {
			const loaded = await importDefault(schemaFile);
			if (loaded && typeof loaded === "object") raw = loaded;
		}

		let { auth, routeOptions = {}, ...schema } = raw;

		// Inject 'auth' config for the global authentication hook
		if (auth !== undefined) {
			routeOptions = {
				...routeOptions,
				config: { ...(routeOptions.config || {}), auth: !!auth },
			};
		}

		app[info.method](info.url, { ...routeOptions, schema }, handler);
	}
}