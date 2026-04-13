import swagger from "@fastify/swagger";
import apiReference from "@scalar/fastify-api-reference";


/*
const schema = {
	summary: "OpenAPI Specification",
	description: "Returns the full OpenAPI 3.0 specification.",
	tags: ["Docs"],
	response: {
		200: {
			type: "object",
			additionalProperties: true,
			required: ["openapi", "info", "paths"],
			properties: {
				openapi: { type: "string", example: "3.0.3" },
				info: {
					type: "object",
					required: ["title", "version"],
					properties: {
						title: { type: "string", example: "API" },
						version: { type: "string", example: "1.0.0" }
					}
				},
				paths: { type: "object", example: {} }
			}
		}
	}
};
*/





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
		// Only consider for documentation routes which have a schema
		transform: ({ schema, url }) => {
			const isDefined = schema && (schema.summary || schema.response || schema.body);
			if (!isDefined) return { schema: { hide: true }, url };
			return { schema, url };
		}
	});

	// not needed, the scalar extension provides it by default on /docs/openapi.json
	// app.get("/openapi.json", {schema}, () => app.swagger());


	if (app.maxserver.docs !== false)
		await app.register(apiReference, {
			"routePrefix": "/docs",
			"openapi": true,
			"configuration": {
				hideSearch: true,
				hiddenClients: true,
				hideClientButton: true,
				telemetry: false,
				persistAuth: true,
				showDeveloperTools: "never",
				//"expandAllModelSections": true,
				operationsSorter: "alpha",
				orderSchemaPropertiesBy: "preserve",
				metaData: {
					title: "API Docs 👨‍💻",
				},
				authentication: {
					preferredSecurityScheme: 'bearerAuth',
					apiKey: { token: "" }
				},
				customCss: `
				.darklight-reference a[href*="scalar.com"] {
							 display: none !important;
				},
				.text-sidebar-c-2 {
					display: none !important;
				}`,
				...app.maxserver.scalar
			}
		});

	app.addHook("onRoute", (route) => {
		const auth = route.config?.auth;
		if (!auth) return;
		route.schema ||= {};
		route.schema.security ||= [{ bearerAuth: [] }, { cookieAuth: [] }];
	});
}




