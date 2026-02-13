import swagger from "@fastify/swagger";
import apiReference from "@scalar/fastify-api-reference";



const schema = {
	summary: "OpenAPI Specification",
	description: "Returns the full OpenAPI 3.0 specification for this API in JSON format.",
	tags: ["Docs"],
	response: {
		200: {
			type: "object",
			additionalProperties: true,
			properties: {
				openapi: {
					type: "string",
					example: "3.0.3"
				},
				info: {
					type: "object",
					properties: {
						title: { type: "string", example: "maxserver API" },
						version: { type: "string", example: "1.0.0" }
					},
					required: ["title", "version"]
				},
				paths: {
					type: "object",
					example: {}
				}
			},
			required: ["openapi", "info", "paths"]
		}
	}
};





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
		},
	});


	app.get("/openapi.json", { schema }, () => app.swagger());

	if (app.maxserver.docs !== false)
		await app.register(apiReference, { routePrefix: "/docs", openapi: true });

	app.addHook("onRoute", (route) => {
		const auth = route.config?.auth;
		if (!auth) return;
		route.schema ||= {};
		route.schema.security ||= [{ bearerAuth: [] }, { cookieAuth: [] }];
	});
}




