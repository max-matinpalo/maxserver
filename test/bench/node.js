// Baseline: plain node:http, same routes as app/

import http from "node:http";

function json(res, data) {
	res.writeHead(200, { "Content-Type": "application/json" });
	res.end(JSON.stringify(data));
}

http.createServer((req, res) => {
	if (req.url !== "/hello") return res.writeHead(404).end();
	if (req.method === "GET") return json(res, { message: "Hello world" });

	let text = "";
	req.on("data", chunk => text += chunk);
	req.on("end", () => json(res, { message: `Hello ${JSON.parse(text).name}` }));
}).listen(Number(process.env.PORT), () => console.log("ready"));
