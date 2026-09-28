// Baseline: plain Bun.serve, same routes as app/

Bun.serve({
	port: Number(process.env.PORT),
	routes: {
		"/hello": {
			GET: () => Response.json({ message: "Hello world" }),
			POST: async req => {
				const body = await req.json();
				return Response.json({ message: `Hello ${body.name}` });
			},
		},
	},
});

console.log("ready");
