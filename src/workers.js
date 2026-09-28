/**
 * Multiple processes on Linux: each worker runs Bun.serve with reusePort,
 * the kernel spreads connections. Primary only spawns and restarts workers.
 */


export function isWorker() {
	return !!process.env.MAXSERVER_WORKER;
}


/**
 * Returns true if this process became the primary (workers started).
 */
export function startWorkers(count, dev) {
	if (!(count > 1) || isWorker()) return false;

	// 1. Only Linux balances reusePort, dev always one process
	if (dev || process.platform !== "linux") {
		const why = dev ? "development" : process.platform;
		console.warn(`⚠️  workers: ${count} ignored, ${why} runs one process (multiple workers need Linux production)`);
		return false;
	}

	// 2. Spawn, restart crashed workers after 1s
	let stopping = false;
	const children = new Set();

	const spawn = id => {
		const child = Bun.spawn([process.execPath, ...process.argv.slice(1)], {
			env: { ...process.env, MAXSERVER_WORKER: String(id) },
			stdio: ["inherit", "inherit", "inherit"],
			onExit(proc, code, signal) {
				children.delete(child);
				if (stopping) return;
				console.error(`❌ worker ${id} exited (${signal || code}), restarting in 1s`);
				setTimeout(() => spawn(id), 1000);
			},
		});
		children.add(child);
	};

	for (let i = 1; i <= count; i++) spawn(i);

	// 3. Stop: pass signal to workers, exit when all are done
	const stop = signal => {
		stopping = true;
		for (const c of children) c.kill(signal);
		Promise.all([...children].map(c => c.exited)).then(() => process.exit(0));
	};
	process.on("SIGTERM", () => stop("SIGTERM"));
	process.on("SIGINT", () => stop("SIGINT"));

	console.log(`🟢  ${count} workers started`);
	return true;
}
