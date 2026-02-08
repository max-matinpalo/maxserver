import os from "os";


export function setupGetAddress(app) {
	app.decorate("getAddress", function () {
		const addr = this.server.address();

		if (!addr) return null;
		if (typeof addr === "string") return addr;

		const protocol = this.initialConfig.https ? "https" : "http";
		const host = getExternalIp() || "localhost";

		return `${protocol}://${host}:${addr.port}`;
	});
}


function getExternalIp() {
	const nets = os.networkInterfaces();

	for (const name of Object.keys(nets)) {
		for (const net of nets[name]) {
			if (net.family === "IPv4" && !net.internal) return net.address;
		}
	}

	return null;
}