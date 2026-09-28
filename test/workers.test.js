import { test, expect, beforeAll, afterAll, describe } from "bun:test";
import { prepareFixture, startServer } from "./helpers.js";

// reusePort balancing only exists on Linux
const linux = process.platform === "linux";


describe.skipIf(!linux)("workers on Linux", () => {
	let server, url;

	beforeAll(async () => {
		prepareFixture();
		const probe = Bun.serve({ port: 0, fetch: () => new Response() });
		const port = probe.port;
		probe.stop(true);

		url = `http://127.0.0.1:${port}`;
		server = await startServer({ env: { NODE_ENV: "production", WORKERS: "3", PORT: String(port) } });
		await Bun.sleep(300);
	});

	afterAll(() => server?.stop());

	async function pids(n = 60) {
		const set = new Set();
		for (let i = 0; i < n; i++) {
			const r = await fetch(url + "/pid", { headers: { connection: "close" } });
			set.add((await r.json()).pid);
		}
		return set;
	}

	test("primary starts workers and connections spread over them", async () => {
		expect(server.logs()).toContain("3 workers started");
		expect((await pids()).size).toBeGreaterThan(1);
	});

	test("crashed worker is restarted", async () => {
		const [victim] = await pids(10);
		process.kill(victim, "SIGKILL");
		await Bun.sleep(1500);

		expect(server.logs()).toContain("restarting in 1s");
		const after = await pids();
		expect(after.has(victim)).toBe(false);
		expect(after.size).toBeGreaterThan(1);
	});

	test("SIGTERM stops primary and all workers", async () => {
		const workers = [...await pids()];
		server.proc.kill("SIGTERM");
		await server.proc.exited;
		await Bun.sleep(100);

		for (const pid of workers) {
			let alive = true;
			try { process.kill(pid, 0); } catch { alive = false; }
			expect(`${pid} ${alive}`).toBe(`${pid} false`);
		}
	});
});
