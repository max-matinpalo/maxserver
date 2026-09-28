// Development sounds to make api development even more fun 😃

import { exec } from "node:child_process";

const OK = "/System/Library/Sounds/Glass.aiff";
const ERR = "/System/Library/Sounds/Submarine.aiff";

let lastPlayed = 0;


export function soundsEnabled(config) {
	return !!config.sounds && config.dev && !process.env.CI && process.platform === "darwin";
}


/**
 * Plays a sound for JSON responses, max one per second.
 */
export function playSound(url, response) {
	const ct = String(response.headers.get("content-type") || "").toLowerCase();
	if (!ct.includes("application/json")) return;
	if (new URL(url).pathname === "/docs/openapi.json") return;

	const now = Date.now();
	if (now - lastPlayed < 1000) return;
	lastPlayed = now;

	exec(`afplay "${response.status < 400 ? OK : ERR}" >/dev/null 2>&1 &`);
}
