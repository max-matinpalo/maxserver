
/**
 * 🚀 AUTO-LOADER
 * Scans src/ for files with "// METHOD /url" comments.
 * Automatically registers them as Fastify routes.
 */


import fs from "fs";
import path from "path";
import { pathToFileURL } from "url";


// Matches lines like: // GET /api/v1/users
const ROUTE_REGEX = /^\/\/\s*(GET|POST|PUT|PATCH|DELETE)\s+(.+)$/gm;


/**
 * Recursively finds all .js files in a directory.
 * Skips node_modules and dotfiles.
 */
function walk(dir, out = []) {
	if (!fs.existsSync(dir)) return out;

	for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
		if (e.name === "node_modules") continue;
		if (e.name.startsWith(".")) continue;

		const full = path.join(dir, e.name);
		if (e.isDirectory()) {
			walk(full, out);
			continue;
		}

		if (!e.name.endsWith(".js")) continue;
		out.push(full);
	}

	return out;
}


/**
 * Extracts method and URL from the file's "magic comment".
 * Enforces strict "One Route Per File" policy.
 */
function getRoute(file) {
	const text = fs.readFileSync(file, "utf8");
	const matches = [...text.matchAll(ROUTE_REGEX)];

	if (matches.length === 0) return null;

	// Warn if user accidentally defines multiple routes in one file
	if (matches.length > 1) {
		console.warn(
			`⚠️ Ignored "${file}": Found ${matches.length} route comments. ` +
			`Only 1 allowed per file.`
		);
		return null;
	}

	const m = matches[0];
	const method = m[1].toLowerCase();
	// Normalize URL: Remove all leading slashes, then add exactly one
	const url = "/" + m[2].trim().replace(/^\/+/, "");

	return { method, url };
}


/**
 * Safe dynamic import that handles Windows paths correctly.
 */
async function importDefault(file) {
	return (await import(pathToFileURL(file).href)).default;
}


export async function setupRoutes(app) {
	const seen = new Map();
	const root = path.resolve(app.maxserver.routesDir || "src");

	for (const file of walk(root)) {
		// Skip schema files; they are loaded alongside their route file
		if (file.endsWith(".schema.js")) continue;

		const info = getRoute(file);
		if (!info) continue;

		// 🛡️ Collision Detection: Ensure no two files claim the same route
		const key = info.method + " " + info.url;
		if (seen.has(key)) {
			throw new Error(
				`Duplicate route "${key}" detected:\n` +
				`1. ${seen.get(key)}\n` +
				`2. ${file}`
			);
		}
		seen.set(key, file);

		// Import the route handler
		const handler = await importDefault(file);
		if (typeof handler !== "function") {
			throw new Error(
				`Route "${key}" in "${file}" must export a default function.`
			);
		}

		// 🤝 Schema Loading: Look for sibling .schema.js file
		const schemaFile = file.replace(/\.js$/, ".schema.js");
		let raw = {};

		if (fs.existsSync(schemaFile)) {
			const loaded = await importDefault(schemaFile);
			// 🛡️ Guard: Ensure export is a valid object before using it
			if (loaded && typeof loaded === "object") raw = loaded;
		}

		// ✨ Magic: Extract 'auth' and 'routeOptions' specifically
		let { auth, routeOptions = {}, ...schema } = raw;

		// Inject 'auth' into config if present (Syntactic Sugar)
		if (auth !== undefined) {
			routeOptions = {
				...routeOptions,
				config: { ...(routeOptions.config || {}), auth: !!auth },
			};
		}

		app[info.method](info.url, { ...routeOptions, schema }, handler);
	}
}