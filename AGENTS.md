- This will be the new version of maxserver.
- The current old version is ../maxserver_old.


GOAL
- must work optimal for AI agents writing and reading the code
- every decision: check what is good for AI and what is not
- good for AI: predictable file locations, one place per thing, no hidden wiring, clear errors


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


ROUTE LOADING
- old version scanned src/ and used dynamic import() at every start -> app could not be bundled normally
- new: generator scans src/ for magic comments, writes .maxserver/routes.js with plain static imports + route table
- app imports only that file, so any normal bundler works (bun build)
- dev: maxserver dev regenerates on src/ changes and runs bun --hot
- prod: maxserver build = generate + bun build -> dist/server.js, no scanning at start
- magic comments and file layout stay the same


RESPONSE SCHEMAS
- used for docs (OpenAPI)
- no response filtering, handlers return exactly what gets sent
- development: validate responses against schema, log route + ajv errors, still send response
- production: no response validation
- response validation uses its own ajv instance without coerceTypes, useDefaults and removeAdditional, so it never changes the response


SPEC
- README.md is the implementation spec, keep it in sync with decisions here
