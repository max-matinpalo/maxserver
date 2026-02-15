// Development sounds  to make api development even more fun 😃


import { exec } from 'child_process';

export async function setupDevSounds(app) {
	if (!app.maxserver.sounds) return;
	if (app.maxserver.env === 'production' || process.env.CI) return;

	// Using here some builtin macos sounds see file paths
	// For windows we should add alternative
	if (process.platform !== 'darwin') return;
	const ok = '/System/Library/Sounds/Glass.aiff';
	const err = '/System/Library/Sounds/Submarine.aiff';




	const play = file => exec(`afplay "${file}" >/dev/null 2>&1 &`);

	app.addHook('onResponse', async (req, reply) => {

		// Dev sounds only for api requests - not for static served files 😃
		const ct = String(reply.getHeader('content-type') || '').toLowerCase();
		const disabled = req.routeOptions?.config?.devSound === false;
		let trigger = ct && ct.includes('application/json') && !disabled;

		// Though this is route is auto registered by scalar, and we can't set sounds false on it...
		if (req.url === "/docs/openapi.json") return;

		if (trigger) {
			const code = reply.statusCode;
			if (code < 400) play(ok);
			else play(err);
		}
	});
}
