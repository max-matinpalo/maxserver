import fs from "node:fs";
import path from "node:path";
import { generate } from "../bin/generate.js";

export const ROOT = path.resolve(import.meta.dir, "..");
export const FIXTURE = path.join(ROOT, "test", "fixture");


/**
 * Fixture imports "maxserver" like a real app: node_modules link + generated setup.js.
 */
export function prepareFixture(dir = FIXTURE) {
	const link = path.join(dir, "node_modules", "maxserver");
	if (!fs.existsSync(link)) {
		fs.rmSync(link, { force: true }); // broken link after the repo moved
		fs.mkdirSync(path.dirname(link), { recursive: true });
		fs.symlinkSync(ROOT, link, "dir");
	}
	generate(dir);
}


/**
 * Starts a server process and waits for its url.
 * Returns { url, logs(), stop(), proc }.
 */
export async function startServer({ env = {}, entry = "setup.js", cwd = FIXTURE, expectUrl = true } = {}) {
	const proc = Bun.spawn(["bun", entry], {
		cwd,
		env: { ...process.env, PORT: "0", NODE_ENV: "development", CI: "1", ...env },
		stdout: "pipe",
		stderr: "pipe",
	});

	let output = "";
	const read = async stream => {
		const decoder = new TextDecoder();
		for await (const chunk of stream) output += decoder.decode(chunk);
	};
	read(proc.stdout);
	read(proc.stderr);

	const server = {
		proc,
		url: null,
		logs: () => output,
		stop: async () => { proc.kill(); await proc.exited; },
	};

	// 1. Wait for "🟢  http://..." or exit
	const deadline = Date.now() + 5000;
	while (Date.now() < deadline) {
		const m = output.match(/🟢\s+(http\S+)/);
		if (m && expectUrl) {
			server.url = m[1];
			return server;
		}
		if (proc.exitCode !== null) break;
		await Bun.sleep(10);
	}

	if (expectUrl) throw new Error(`server did not start:\n${output}`);
	await proc.exited;
	return server;
}


/**
 * Raw HTTP request, path sent exactly as given (fetch would normalize it).
 */
export async function rawGet(url, rawPath) {
	const { hostname, port } = new URL(url);
	return new Promise((resolve, reject) => {
		let data = "";
		Bun.connect({
			hostname,
			port: Number(port),
			socket: {
				open(s) { s.write(`GET ${rawPath} HTTP/1.1\r\nHost: x\r\nConnection: close\r\n\r\n`); },
				data(s, chunk) { data += chunk.toString(); },
				close() { resolve(data); },
				error(s, err) { reject(err); },
			},
		}).catch(reject);
	});
}
