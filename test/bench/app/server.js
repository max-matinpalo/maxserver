import maxserver from "maxserver";

const server = await maxserver({
	port: Number(process.env.PORT),
	secret: "bench_secret",
	cors: "https://example.com",
});

await server.start();
export default server;
