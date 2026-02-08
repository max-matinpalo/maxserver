import maxserver from "maxserver";

const server = await maxserver();

await server.listen({
	port: Number(process.env.PORT || 3000),
});

console.log("Server running at ", server.getAddress());
export default server;