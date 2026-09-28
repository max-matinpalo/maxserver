// Benchmark: maxserver vs plain Bun and plain Node, same two routes.
// Needs wrk (Debian: apt install wrk). Run: npm run bench

import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { prepareFixture } from "../helpers.js";

const DIR = import.meta.dir;
const APP = path.join(DIR, "app");
const PORT = process.env.BENCH_PORT || "3999";
const SECONDS = process.env.BENCH_SECONDS || "10";
const ROUNDS = Number(process.env.BENCH_ROUNDS || 3);

const SERVERS = {
	bun: ["bun", "bun.js"],
	node: ["node", "node.js"],
	maxserver: ["bun", "app/dist/bundle.js"],
};
const TESTS = {
	"GET /hello": [],
	"POST /hello (JSON)": ["-s", path.join(DIR, "post.lua")],
};


/**
 * Linux: server on one physical core (cpu0 + its sibling), wrk on the rest,
 * so both do not fight over a core. Returns taskset prefixes or [].
 */
function pinning() {
	try {
		const list = fs.readFileSync("/sys/devices/system/cpu/cpu0/topology/thread_siblings_list", "utf8").trim();
		const server = list.split(",").flatMap(p => {
			const [a, b = a] = p.split("-").map(Number);
			return Array.from({ length: b - a + 1 }, (_, i) => a + i);
		});
		const rest = os.cpus().map((_, i) => i).filter(i => !server.includes(i));
		if (!rest.length || spawnSync("taskset", ["-V"]).error) return {};
		return { server: ["taskset", "-c", server.join(",")], wrk: ["taskset", "-c", rest.join(",")] };
	} catch {
		return {};
	}
}
const PIN = pinning();


/**
 * Runs wrk once, returns { rps, p50, p99 }.
 */
function wrk(args, seconds) {
	const [cmd, ...pre] = [...(PIN.wrk || []), "wrk"];
	const out = spawnSync(cmd, [...pre, "-t4", "-c128", `-d${seconds}s`, "--latency", ...args, `http://127.0.0.1:${PORT}/hello`], { encoding: "utf8" }).stdout;
	const pick = re => out.match(re)?.[1];
	return { rps: Number(pick(/Requests\/sec:\s+([\d.]+)/)), p50: pick(/^\s+50%\s+(\S+)/m), p99: pick(/^\s+99%\s+(\S+)/m) };
}


/**
 * Starts a server, waits for its first log line.
 */
async function start(command) {
	const proc = Bun.spawn([...(PIN.server || []), ...command], {
		cwd: DIR,
		env: { ...process.env, PORT, NODE_ENV: "production" },
		stdout: "pipe",
		stderr: "inherit",
	});
	await proc.stdout.getReader().read();
	return proc;
}


function median(list) {
	const s = [...list].sort((a, b) => a - b);
	return s[Math.floor(s.length / 2)];
}


// 1. Setup
if (spawnSync("wrk", ["-v"]).error) {
	console.error("❌ wrk is not installed (Debian: apt install wrk)");
	process.exit(1);
}
prepareFixture(APP);
const build = spawnSync("bun", [path.resolve(DIR, "../../bin/cli.js"), "build"], { cwd: APP, encoding: "utf8" });
if (build.status !== 0) throw new Error(build.stderr);

// 2. Rounds: every server in turn, so drift hits all equally
const results = {};
for (let round = 1; round <= ROUNDS; round++) {
	for (const [name, command] of Object.entries(SERVERS)) {
		const proc = await start(command);
		for (const [test, args] of Object.entries(TESTS)) {
			wrk(args, 2);
			const r = wrk(args, SECONDS);
			((results[test] ||= {})[name] ||= []).push(r);
			console.log(`round ${round}  ${name.padEnd(10)} ${test.padEnd(20)} ${Math.round(r.rps).toLocaleString("en").padStart(9)} req/s  p50 ${r.p50}  p99 ${r.p99}`);
		}
		proc.kill();
		await proc.exited;
	}
}

// 3. Summary: median req/s, maxserver vs plain Bun
console.log(`\nMedian of ${ROUNDS} rounds, ${SECONDS} s each, wrk -t4 -c128${PIN.server ? `, server on cpu ${PIN.server[2]}` : ""}\n`);
console.log("".padEnd(20) + Object.keys(SERVERS).map(n => n.padStart(12)).join("") + "  maxserver vs bun");
for (const [test, byServer] of Object.entries(results)) {
	const rps = Object.fromEntries(Object.entries(byServer).map(([n, list]) => [n, median(list.map(r => r.rps))]));
	const diff = ((rps.maxserver / rps.bun - 1) * 100).toFixed(1);
	console.log(test.padEnd(20) + Object.values(rps).map(v => Math.round(v).toLocaleString("en").padStart(12)).join("") + `  ${diff}%`);
}
