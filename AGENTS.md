maxserver v2: Bun server setup with auto routes, validation and docs.
v1 (Fastify): git tag v1.0.1, locally ../maxserver_old.


WHERE THINGS ARE
- README.md: user-facing behavior (spec)
- AGENTS.md: implementation decisions only, never repeat README.md
- test/TESTING.md: test requirements
- SKILL.md: skill for AI agents building apps with maxserver


GOAL
- must work optimal for AI agents writing and reading the code
- every decision: check what is good for AI and what is not
- good for AI: predictable file locations, one place per thing, no hidden wiring, clear errors


RULES FOR WORKING HERE
- keep README.md and SKILL.md in sync with every decision
- after every finished feature run the full test suite: npm test
- dependencies: ajv, ajv-formats only


SOURCE LAYOUT
- one file per concern, named exports, index.js only wires them together
- only globals: ENV, createError (no auto globals from named exports, hidden origin is bad for AI)


src/index.js — maxserver(), register(), start
- config: maxserver() > .env > default
- unknown options go to Bun.serve (like v1 passed them to Fastify), maxserver keeps port, hostname, routes, fetch
- maxRequestBodySize default 1 MiB (v1 Fastify bodyLimit)
- start() prints server.url only
- multiple processes are a deployment concern, not maxserver: reusePort is passed through, off by default so a second server on the same port fails loudly (macOS does not balance reusePort)


src/routes.js — wraps each handler
- Bun built-in routes, one wrapper per route: auth, parse, validate, handler, response
- handler (req, res) as in v1: res collects status + headers, data sent with Response.json
- returned Response sent as is, res ignored
- JSON body parse blocks __proto__ / constructor.prototype like Fastify


src/validate.js — ajv
- request instance: Fastify defaults (coerceTypes array, useDefaults, removeAdditional), schemas compiled once at start
- response instance: dev only, no coercion / defaults / removal, so it never changes the response, logs route + ajv errors


src/jwt.js, src/cors.js, src/headers.js, src/static.js, src/errors.js
- jwt: HS256 only, constant time compare, token from Bearer header or token cookie
- headers: helmet defaults without CSP and frameguard (same as v1 config)
- static: Bun.file, blocks paths outside root and dotfiles
- errors: v1 shape { statusCode, error, message }, 5xx message hidden in production
- errors: one log entry per error: status, method, path, message, app file:line; stack only for 5xx; production logs only 5xx


src/docs.js — OpenAPI 3.1 at /docs/openapi.json
- own generator, no swagger package
- no docs UI in maxserver: it stays simple, the UI is a dev tool
- view the spec with the maxdoc_apidocs dev tool (~/Desktop/maxdoc_apidocs, own repo) or any OpenAPI viewer


bin/generate.js — writes setup.js
- static imports of all handlers, schemas, models, then register(), then await import("./server.js")
- why: v1 used dynamic import() at start, so apps could not be bundled
- server.js is imported last because static imports run before the file body
- maxserver() throws a clear error when no routes are registered (bun server.js started directly)


bin/cli.js — new, dev, build
- runs on Node and Bun (npx works), stops with a clear message if Bun is missing
- dev: generate, watch src/, bun --hot setup.js
- build: generate, bun build setup.js --target=bun --outdir=dist --entry-naming=bundle.[ext] --sourcemap=linked
- output dist/: bundle.js and bundle.js.map; deploy the whole folder
- why bundle.js: setup.js is the generated input, the output name must not look the same
- build passes --define process.env.NODE_ENV=globalThis.process.env.NODE_ENV
- why: bun build inlines "development", a bundled production server would run in dev mode
- command is "new", not v1 "maxserver <name>", so a project name never clashes with dev / build


templates/ — new project
- v1 template, changed only where v2 needs it
- package.json: main setup.js, scripts dev / build / start (bun dist/bundle.js)
- .gitignore adds setup.js and dist, jsconfig types "bun", installs @types/bun
- new copies SKILL.md as AGENTS.md plus CLAUDE.md with "@AGENTS.md", SKILL.md stays the single source
