// Development sounds to make api development even more fun 😃

import { exec } from "child_process";

export async function setupDevSounds(app) {
	if (!app.maxserver.sounds) return;
	if (app.maxserver.env !== "development" || process.env.CI) return;
	if (process.platform !== "darwin") return;

	const ok = "/System/Library/Sounds/Glass.aiff";
	const err = "/System/Library/Sounds/Submarine.aiff";

	let lastPlayed = 0;

	const play = file => {
		const now = Date.now();
		if (now - lastPlayed < 1000) return;
		lastPlayed = now;
		exec(`afplay "${file}" >/dev/null 2>&1 &`);
	};

	app.addHook("onResponse", async (req, reply) => {
		const ct = String(reply.getHeader("content-type") || "").toLowerCase();
		const disabled = req.routeOptions?.config?.devSound === false;
		const trigger = ct && ct.includes("application/json") && !disabled;

		if (req.url === "/docs/openapi.json") return;

		if (trigger) {
			const code = reply.statusCode;
			if (code < 400) play(ok);
			else play(err);
		}
	});
}