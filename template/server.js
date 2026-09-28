import maxserver from "maxserver";

const server = await maxserver({
	port: 3000,
	secret: "your_secret"
});

await server.start();
export default server;