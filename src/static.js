import fs from "node:fs";
import path from "node:path";


/**
 * Resolves the static directory, null if not set or missing (as in v1).
 */
export function setupStatic(dir) {
	if (!dir) return null;

	if (typeof dir !== "string") {
		console.error("❌ maxserver.static must be a string path");
		return null;
	}

	const root = path.resolve(dir);
	if (!fs.existsSync(root)) {
		console.error(`❌ maxserver.static not found: ${root}`);
		return null;
	}

	return root;
}


/**
 * Serves a file from root, null if not found.
 * Blocks paths outside root and dotfiles (.env, .git).
 */
export async function serveStatic(req, root) {
	if (!root || (req.method !== "GET" && req.method !== "HEAD")) return null;

	// 1. Decode path
	let pathname;
	try {
		pathname = decodeURIComponent(new URL(req.url).pathname);
	} catch {
		return null;
	}
	if (pathname.includes("\0")) return null;

	// 2. Stay inside root, no dotfiles
	let file = path.resolve(root, "." + pathname);
	const rel = path.relative(root, file);
	if (rel.startsWith("..") || path.isAbsolute(rel)) return null;
	if (rel.split(path.sep).some(p => p.startsWith("."))) return null;

	// 3. Directory -> index.html
	let stat;
	try {
		stat = fs.statSync(file, { throwIfNoEntry: false });
	} catch {
		return null;
	}
	if (stat?.isDirectory()) file = path.join(file, "index.html");

	const bunFile = Bun.file(file);
	if (!(await bunFile.exists())) return null;
	return new Response(bunFile);
}
