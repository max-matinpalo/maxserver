#!/usr/bin/env node
import { spawn } from "node:child_process";
import fs from "node:fs";


/**
 * maxserver-watcher
 *
 * A zero-config minimal development server watcher.
 * - Watches the current project root recursively.
 * - Restarts the node process on .js/.json changes.
 * - Automatically loads .env if present via --env-file.
 * - Ignores node_modules and hidden files.
 */


// Get entry file from args or default to server.js
const entry = process.argv[2] || "server.js";
let child;

function start() {
	const args = [];
	if (fs.existsSync(".env")) args.push("--env-file=.env");
	args.push(entry);

	// Spawn the node process and share the console
	child = spawn("node", args, { stdio: "inherit" });
}

function restart() {
	console.clear();
	console.log(`devserver restart`);
	if (child) child.kill();
	start();
}


fs.watch(".", { recursive: true }, (event, file) => {
	if (!file) return;
	if (file.includes("node_modules")) return;
	if (file.startsWith(".")) return;
	if (!file.endsWith(".js") && !file.endsWith(".json")) return;

	console.log("\nupdated: ", file);
	restart();
});

restart();