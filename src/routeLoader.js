// Scans src/** for files whose first line looks like:
// POST /teams/create
// Imports handler + schema and registers them with Fastify.

import fs from "fs";
import path from "path";

const ROUTE_OPTION_KEYS = new Set([
	"config",
	"preHandler",
	"onRequest",
	"preValidation",
	"preSerialization",
	"errorHandler",
	"logLevel",
	"bodyLimit",
	"attachValidation",
	"exposeHeadRoute",
	"constraints",
	"timeout",
	"websocket",
	"prefixTrailingSlash",
]);

function walk(dir, out = []) {
	if (!fs.existsSync(dir)) return out;
	const entries = fs.readdirSync(dir, { withFileTypes: true });

	for (const entry of entries) {
		if (entry.name === "node_modules") continue;
		if (entry.name.startsWith(".")) continue;
		const full = path.join(dir, entry.name);

		if (entry.isDirectory()) {
			walk(full, out);
		} else if (entry.name.endsWith(".js")) {
			out.push(full);
		}
	}
	return out;
}

function getFirstLine(file) {
	const text = fs.readFileSync(file, "utf8");
	const lines = text.split("\n");
	const firstContent = lines.find((line) => line.trim().length > 0);

	return (firstContent || "").trim().replace(/^\uFEFF/, "");
}

const ROUTE_REGEX = /^\/\/\s*(GET|POST|PUT|PATCH|DELETE)\s+(.+)$/;

function parseRouteComment(file) {
	const line = getFirstLine(file);
	const m = line.match(ROUTE_REGEX);
	if (!m) return null;

	return { method: m[1].toLowerCase(), url: m[2] };
}

function splitSchemaExport(raw) {
	const routeOptions = {};
	const schema = {};

	for (const [key, value] of Object.entries(raw || {})) {
		if (ROUTE_OPTION_KEYS.has(key)) {
			routeOptions[key] = value;
			continue;
		}
		schema[key] = value;
	}

	return { routeOptions, schema };
}

export async function loadRoutes(fastify) {
	const ROOT = path.join(process.cwd(), "src");
	const files = walk(ROOT);
	const seen = new Map();

	for (const file of files) {
		if (file.endsWith(".schema.js")) continue;

		const info = parseRouteComment(file);
		if (!info) continue;

		const key = info.method + " " + info.url;
		if (seen.has(key)) {
			throw new Error(
				`Duplicate route "${key}" detected:\n` +
				`1. ${seen.get(key)}\n` +
				`2. ${file}`
			);
		}
		seen.set(key, file);

		const handlerMod = await import("file://" + file);
		const handler = handlerMod.default;

		const schemaFile = file.replace(/\.js$/, ".schema.js");
		let raw = null;

		if (fs.existsSync(schemaFile)) {
			const schemaMod = await import("file://" + schemaFile);
			raw = schemaMod.default || {};
		} else {
			fastify.log.warn(
				`Route schema missing: ` +
				`${info.method.toUpperCase()} ${info.url}`
			);
			raw = {};
		}

		const parts = splitSchemaExport(raw);

		fastify[info.method](
			info.url,
			{ ...parts.routeOptions, schema: parts.schema },
			handler
		);
	}
}
