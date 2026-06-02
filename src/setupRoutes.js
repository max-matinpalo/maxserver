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

export async function setupRoutes(app) {
	const root = path.resolve(app.maxserver.routesDir || "src");
	const files = walk(root);

	// 1. Pass One: Register Named Exports Globally
	const globals = new Map();
	for (const file of files) {
		if (file.endsWith(".schema.js")) continue;

		const mod = await import(pathToFileURL(file).href);
		for (const [key, val] of Object.entries(mod)) {
			if (key === "default" || key.startsWith("autoregister_")) continue;

			if (globals.has(key)) {
				console.error("\n❌ Global Identifier Conflict!");
				console.error(`The export "${key}" is defined in multiple files:`);
				console.error(`  -> ${globals.get(key)}`);
				console.error(`  -> ${file}\n`);
				throw new Error(`Duplicate global identifier "${key}"`);
			}

			globals.set(key, file);
			global[key] = val;
		}
	}

	// 2. Pass Two: Register Global Schemas (Lonely .schema.js files)
	for (const file of files) {
		const isLonely = file.endsWith(".schema.js") &&
			!fs.existsSync(file.replace(".schema.js", ".js"));

		if (!isLonely) continue;

		const mod = await import(pathToFileURL(file).href);
		for (const schema of Object.values(mod))
			if (schema?.$id) app.addSchema(schema);
	}

	// 3. Pass Three: Auto-register hooks
	for (const file of files) {
		if (file.endsWith(".schema.js")) continue;

		const mod = await import(pathToFileURL(file).href);
		for (const [key, fn] of Object.entries(mod))
			if (key.startsWith("autoregister_") && typeof fn === "function") await fn(app);
	}

	// 4. Pass Four: Collect and Group Routes by Directory
	const groups = new Map();
	for (const file of files) {
		if (file.endsWith(".schema.js")) continue;

		const info = getRoute(file);
		if (!info) continue;

		const mod = await import(pathToFileURL(file).href);
		const handler = mod.default;
		if (typeof handler !== "function") {
			throw new Error(`Route in "${file}" must export a default function.`);
		}

		const schemaFile = file.replace(/\.js$/, ".schema.js");
		let raw = {};

		if (fs.existsSync(schemaFile)) {
			const loaded = (await import(pathToFileURL(schemaFile).href)).default;
			if (loaded && typeof loaded === "object") raw = loaded;
		}

		let { auth, order = 999, routeOptions = {}, ...schema } = raw;

		if (auth !== undefined) {
			routeOptions = {
				...routeOptions,
				config: { ...(routeOptions.config || {}), auth: !!auth },
			};
		}

		const dir = path.dirname(file);
		if (!groups.has(dir)) groups.set(dir, []);

		groups.get(dir).push({
			method: info.method,
			url: info.url,
			options: { ...routeOptions, schema },
			handler,
			order,
			file
		});
	}

	// Sort routes locally within each directory
	const routes = [];
	for (const list of groups.values()) {
		list.sort((a, b) => a.order - b.order);
		routes.push(...list);
	}

	// 5. Pass Five: Register Sorted Routes
	const seen = new Map();
	for (const r of routes) {
		const key = `${r.method} ${r.url}`;
		if (seen.has(key)) throw new Error(`Duplicate route "${key}" detected.`);
		seen.set(key, r.file);

		app[r.method](r.url, r.options, r.handler);
	}
}