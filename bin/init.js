#!/usr/bin/env node

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { execSync } from "child_process";


function main() {
	const { projectName, targetDir, templateDir } = resolveArgs();

	if (fs.existsSync(targetDir)) {
		console.error(`❌ Error: Directory "${projectName}" already exists.`);
		process.exit(1);
	}

	try {
		console.log(`🚀 Setting up "${projectName}"`);
		fs.cpSync(templateDir, targetDir, { recursive: true });

		fixDotfiles(targetDir);
		patchPackageJson(targetDir, projectName);

		process.chdir(targetDir);
		console.log("📦 Installing maxserver");
		execSync("npm install maxserver@latest", { stdio: "inherit" });

		console.log(`\n✅ Install complete\n\n->\n\tcd ${projectName}\n\tnpm run dev\n`);
	} catch (err) {
		console.error("❌ Init failed:", err.message);
		process.exit(1);
	}
}


function resolveArgs() {
	const base = path.dirname(fileURLToPath(import.meta.url));
	const name = process.argv[2] || "maxserver";

	return {
		projectName: name,
		targetDir: path.resolve(process.cwd(), name),
		templateDir: path.resolve(base, "../templates")
	};
}


function fixDotfiles(dir) {
	for (const f of ["env", "gitignore", "vscode"]) {
		const src = path.join(dir, f);
		if (fs.existsSync(src)) fs.renameSync(src, path.join(dir, "." + f));
	}
}


function patchPackageJson(dir, name) {
	const pkgPath = path.join(dir, "package.json");
	if (!fs.existsSync(pkgPath)) return;

	let content = fs.readFileSync(pkgPath, "utf8");
	content = content.replace(/__NAME__/g, name);
	fs.writeFileSync(pkgPath, content);
}


main();