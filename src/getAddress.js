import os from "node:os";


/**
 * When listening on all interfaces (0.0.0.0), Node returns "0.0.0.0".
 * This is a setting, not a valid URL for other devices.
 * So we try hunt down the actual LAN IP to print the real address on which server can be accessed
 */


function getLanIp() {
	const nets = os.networkInterfaces();

	for (const name of Object.keys(nets)) {
		for (const net of (nets[name] || [])) {
			if (net?.family === "IPv4" && !net.internal) return net.address;
		}
	}

	return null;
}


export function getAddress(app) {

	const addr = app.server?.address();
	const protocol = app.initialConfig?.https ? "https" : "http";

	if (!addr) return null;
	if (typeof addr === "string") return addr;

	const isPublicBind = addr.address === "0.0.0.0" || addr.address === "::";
	const isLoopback = addr.address === "127.0.0.1" || addr.address === "::1";

	const envIp = String(process.env.PUBLIC_IP || "").trim() || null;
	const detectedIp = envIp || getLanIp();

	const ip = (isPublicBind && !isLoopback)
		? (detectedIp || addr.address)
		: "localhost";

	const host = ip.includes(":") ? `[${ip}]` : ip;

	return `${protocol}://${host}:${addr.port}`;
}

