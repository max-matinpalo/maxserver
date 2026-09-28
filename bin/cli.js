#!/usr/bin/env node

/**
 * maxserver CLI: new <name>, dev, build
 * Runs on Node and Bun, starts Bun itself for dev and build.
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { spawn, spawnSync, execSync } from "node:child_process";
import { generate } from "./generate.js";

const PKG_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

const USAGE = `
maxserver new <name>   create a new project
maxserver dev          generate setup.js, watch src/, run bun --hot
maxserver build        generate setup.js, bundle to dist/setup.js
`;


function fail(message) {
	console.error(`❌ ${message}`);
	process.exit(1);
}


function hasBun() {
	return spawnSync("bun", ["--version"], { stdio: "ignore" }).status === 0;
}


function requireBun() {
	if (!hasBun()) fail("Bun is not installed. maxserver runs on Bun: https://bun.sh");
}


function loadEnv() {
	try {
		if (fs.existsSync(".env")) process.loadEnvFile?.(".env");
	} catch { }
}


// ---------- new ----------

function cmdNew(name, args) {
	if (!name) fail("Project name missing: maxserver new <name>");

	const target = path.resolve(process.cwd(), name);
	if (fs.existsSync(target)) fail(`Directory "${name}" already exists.`);

	// 1. Copy template
	console.log(`🚀 Setting up "${name}"`);
	fs.cpSync(path.join(PKG_DIR, "templates"), target, { recursive: true });

	// 2. Dotfiles
	for (const f of ["env", "gitignore"]) {
		const src = path.join(target, f);
		if (fs.existsSync(src)) fs.renameSync(src, path.join(target, "." + f));
	}

	const vscode = path.join(target, "vscode");
	if (fs.existsSync(vscode)) {
		fs.mkdirSync(path.join(target, "src"), { recursive: true });
		fs.cpSync(vscode, path.join(target, "src", ".vscode"), { recursive: true });
		fs.renameSync(vscode, path.join(target, ".vscode"));
	}

	// 3. Project name
	const pkgPath = path.join(target, "package.json");
	fs.writeFileSync(pkgPath, fs.readFileSync(pkgPath, "utf8").replace(/__NAME__/g, path.basename(name)));

	// 4. AI setup: skill as AGENTS.md, CLAUDE.md imports it
	fs.copyFileSync(path.join(PKG_DIR, "SKILL.md"), path.join(target, "AGENTS.md"));
	fs.writeFileSync(path.join(target, "CLAUDE.md"), "@AGENTS.md\n");

	// 5. Install
	if (!args.includes("--no-install")) {
		console.log("📦 Installing maxserver");
		execSync("npm install maxserver@latest && npm install -D @types/bun", { cwd: target, stdio: "inherit" });
	}

	if (!hasBun()) console.warn("⚠️  Bun is not installed, install it before running: https://bun.sh");
	console.log(`\n✅ Install complete\n\n->\n\tcd ${name}\n\tnpm run dev\n`);
}


// ---------- dev ----------

function tryGenerate() {
	try {
		generate();
		return true;
	} catch (err) {
		console.error(`❌ ${err.message}`);
		return false;
	}
}


function cmdDev() {
	requireBun();
	loadEnv();
	const dir = process.env.ROUTESDIR || "src";
	let child = null;

	// 1. Start bun --hot once setup.js is valid
	const start = () => {
		if (child || !tryGenerate()) return;
		child = spawn("bun", ["--hot", "setup.js"], { stdio: "inherit" });
		child.on("exit", code => {
			child = null;
			if (code) console.error(`❌ server exited with code ${code}, waiting for changes`);
		});
	};

	// 2. Regenerate on src changes, bun --hot reloads setup.js
	let timer;
	fs.watch(dir, { recursive: true }, (event, file) => {
		if (!file || !String(file).endsWith(".js")) return;
		clearTimeout(timer);
		timer = setTimeout(() => (child ? tryGenerate() : start()), 50);
	});

	process.on("SIGINT", () => { child?.kill("SIGINT"); process.exit(0); });
	process.on("SIGTERM", () => { child?.kill("SIGTERM"); process.exit(0); });

	start();
}


// ---------- build ----------

function cmdBuild() {
	requireBun();
	loadEnv();
	if (!tryGenerate()) process.exit(1);

	// NODE_ENV stays a runtime value, bun build would otherwise inline "development"
	const result = spawnSync("bun", [
		"build", "setup.js",
		"--target=bun",
		"--outdir=dist",
		"--sourcemap=linked",
		"--define", "process.env.NODE_ENV=globalThis.process.env.NODE_ENV",
	], { stdio: "inherit" });

	if (result.status !== 0) process.exit(result.status || 1);
	console.log("✅ Built dist/setup.js, run: bun dist/setup.js");
}


// ---------- main ----------

const [cmd, ...args] = process.argv.slice(2);

if (cmd === "new") cmdNew(args[0], args.slice(1));
else if (cmd === "dev") cmdDev();
else if (cmd === "build") cmdBuild();
else {
	console.log(USAGE);
	if (cmd && cmd !== "help" && cmd !== "--help") process.exit(1);
}
