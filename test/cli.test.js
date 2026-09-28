import { test, expect, beforeAll, afterAll } from "bun:test";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { ROOT, prepareFixture, startServer } from "./helpers.js";

const CLI = path.join(ROOT, "bin/cli.js");
let tmp, app;

beforeAll(() => {
	tmp = fs.mkdtempSync(path.join(os.tmpdir(), "maxserver-cli-"));
	app = path.join(tmp, "myapp");
	const r = Bun.spawnSync(["node", CLI, "new", "myapp", "--no-install"], { cwd: tmp });
	if (r.exitCode !== 0) throw new Error(r.stderr.toString());
});

afterAll(() => fs.rmSync(tmp, { recursive: true, force: true }));


test("new copies template and renames dotfiles", () => {
	for (const f of [".env", ".gitignore", ".vscode/tasks.json", "src/.vscode/tasks.json", "jsconfig.json", "server.js",
		"src/Test/hello.js", "src/Test/hello.schema.js", "src/Test/welcome.js", "src/Test/welcome.schema.js", "src/Models/user.schema.js"])
		expect(`${f} ${fs.existsSync(path.join(app, f))}`).toBe(`${f} true`);

	for (const f of ["env", "gitignore", "vscode"]) expect(fs.existsSync(path.join(app, f))).toBe(false);
});

test("new fills project name and v2 scripts", () => {
	const pkg = JSON.parse(fs.readFileSync(path.join(app, "package.json"), "utf8"));
	expect(pkg.name).toBe("myapp");
	expect(pkg.main).toBe("setup.js");
	expect(pkg.scripts).toEqual({ dev: "maxserver dev", build: "maxserver build", start: "bun dist/setup.js" });
});

test("new adds AI setup: SKILL.md as AGENTS.md, CLAUDE.md imports it", () => {
	expect(fs.readFileSync(path.join(app, "AGENTS.md"), "utf8")).toBe(fs.readFileSync(path.join(ROOT, "SKILL.md"), "utf8"));
	expect(fs.readFileSync(path.join(app, "CLAUDE.md"), "utf8")).toBe("@AGENTS.md\n");
});

test("new refuses an existing directory", () => {
	const r = Bun.spawnSync(["node", CLI, "new", "myapp", "--no-install"], { cwd: tmp });
	expect(r.exitCode).toBe(1);
	expect(r.stderr.toString()).toContain("already exists");
});

test("fresh project builds, runs and serves /docs", async () => {
	// Template server.js uses port 3000, tests need a free port
	const serverJs = path.join(app, "server.js");
	fs.writeFileSync(serverJs, fs.readFileSync(serverJs, "utf8").replace("port: 3000,", "port: Number(process.env.PORT),"));

	prepareFixture(app);
	const build = Bun.spawnSync(["node", CLI, "build"], { cwd: app });
	expect(build.exitCode).toBe(0);

	const server = await startServer({ cwd: app, entry: "dist/setup.js" });
	expect((await fetch(server.url + "/welcome")).status).toBe(200);
	expect((await fetch(server.url + "/docs")).status).toBe(200);
	await server.stop();
}, 30000);

test("unknown command prints usage and fails", () => {
	const r = Bun.spawnSync(["node", CLI, "nope"]);
	expect(r.exitCode).toBe(1);
	expect(r.stdout.toString()).toContain("maxserver new <name>");
});
