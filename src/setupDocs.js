import swagger from "@fastify/swagger";
import apiReference from "@scalar/fastify-api-reference";


export async function setupDocs(app) {

	const info = app.maxserver.openapiInfo || {
		title: "API",
		version: "1.0.0",
	};

	await app.register(swagger, {
		openapi: {
			info,
			// OpenAPI 3.x: securitySchemes must be defined globally here not per route
			// Routes only add `security: [...]` that references these scheme names
			components: {
				securitySchemes: {
					bearerAuth: { type: "http", scheme: "bearer" },
					cookieAuth: { type: "apiKey", in: "cookie", name: "token" },
				},
			},

			// This replaces your manual app.get line
			exposeRoute: true,
			routePrefix: "/openapi.json"
		},
	});


	//app.get("/openapi.json", {}, () => app.swagger());

	if (app.maxserver.docs !== false)
		await app.register(apiReference, { routePrefix: "/docs", openapi: true });

	app.addHook("onRoute", (route) => {
		const auth = route.config?.auth;
		if (!auth) return;
		route.schema ||= {};
		route.schema.security ||= [{ bearerAuth: [] }, { cookieAuth: [] }];
	});
}




export default {
	summary: "OpenAPI Documentation",
	description: "Returns the OpenAPI 3.0.0 specification for the entire API.",
	tags: ["Documentation"],
	response: {
		200: {
			type: "object",
			properties: {
				openapi: {
					type: "string",
					example: "3.0.0"
				},
				info: {
					type: "object",
					properties: {
						title: {
							type: "string",
							example: "maxserver API"
						},
						version: {
							type: "string",
							example: "1.0.0"
						}
					},
					required: ["title", "version"]
				},
				paths: {
					type: "object",
					example: {}
				},
				components: {
					type: "object",
					example: {}
				}
			},
			required: ["openapi", "info", "paths"]
		}
	}
};