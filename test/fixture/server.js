import maxserver from "maxserver";

const server = await maxserver({
	secret: process.env.TEST_NO_SECRET ? undefined : "test_secret",
	static: "public",
	sounds: false,
	openapiInfo: { title: "Fixture API", version: "1.2.3" },
});

await server.start();
export default server;
