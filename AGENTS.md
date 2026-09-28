- This will be the new version of maxserver.
- The current old version is ../maxserver_old.


BIG IMPROVEMENTS
- bun instead of nodejs
- no fastify
- no dynamic imports, imports generated at bundle/build time


	


WHAT STAYS
- most of api




SPECS
- bun.serve()
- for routing bun built-in routes
- validation ajv v8, schemas compiled once at startup
- responses via response.json()


RESPONSE SCHEMAS
- used for docs (OpenAPI)
- no response filtering, handlers return exactly what gets sent
- development: validate responses against schema, log route + ajv errors, still send response
- production: no response validation
- response validation uses its own ajv instance without coerceTypes, useDefaults and removeAdditional, so it never changes the response
