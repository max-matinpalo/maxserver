import { test, expect, beforeAll, afterAll } from "bun:test";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { serveStatic } from "./static.js";

let base, root;

beforeAll(() => {
	base = fs.mkdtempSync(path.join(os.tmpdir(), "maxserver-static-"));
	root = path.join(base, "public");
	fs.mkdirSync(path.join(root, ".git"), { recursive: true });
	fs.writeFileSync(path.join(root, "a.txt"), "a");
	fs.writeFileSync(path.join(root, ".git", "config"), "git");
	fs.writeFileSync(path.join(base, "secret.txt"), "secret");
	fs.writeFileSync(path.join(base, "public-evil.txt"), "evil");
});

afterAll(() => fs.rmSync(base, { recursive: true, force: true }));

const serve = (url, method = "GET") => serveStatic({ url: "http://x" + url, method }, root);


test("serves files inside root", async () => {
	expect(await (await serve("/a.txt")).text()).toBe("a");
	expect(await serve("/a.txt", "HEAD")).not.toBeNull();
});

test("only GET and HEAD", async () => {
	expect(await serve("/a.txt", "POST")).toBeNull();
});

test("blocks encoded traversal and sibling prefix dirs", async () => {
	for (const p of ["/..%2fsecret.txt", "/%2e%2e%2fsecret.txt", "/..%2fpublic-evil.txt", "/..%5csecret.txt"])
		expect(`${p} ${await serve(p)}`).toBe(`${p} null`);
});

test("blocks dotfiles and dot folders", async () => {
	expect(await serve("/.git/config")).toBeNull();
	expect(await serve("/%2egit/config")).toBeNull();
});

test("bad encoding and null bytes -> null", async () => {
	expect(await serve("/%E0%A4%A")).toBeNull();
	expect(await serve("/a.txt%00.png")).toBeNull();
});

test("no root -> null", async () => {
	expect(await serveStatic({ url: "http://x/a.txt", method: "GET" }, null)).toBeNull();
});
