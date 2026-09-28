import maxserver from "maxserver";

const server = await maxserver({
	secret: process.env.TEST_NO_SECRET ? undefined : "test_secret",
	static: "public",
	openapiInfo: { title: "Fixture API", version: "1.2.3" },
	reusePort: process.env.TEST_REUSEPORT === "1",
	...(process.env.TEST_ROUTESDIR && { routesDir: process.env.TEST_ROUTESDIR }),
});

await server.start();
export default server;
