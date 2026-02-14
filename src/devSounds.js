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


	// Test fix, that sound not plays for static served 😃
	const ct = String(reply.getHeader('content-type') || '').toLowerCase();
	if (ct && ct.includes('application/json')) return;


	const play = file => exec(`afplay "${file}" >/dev/null 2>&1 &`);

	app.addHook('onResponse', async (req, reply) => {
		const code = reply.statusCode;
		if (code < 400) play(ok);
		else play(err);
	});
}
