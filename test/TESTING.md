TESTING
- runner: bun test, no extra dependencies, one command runs all: npm test
- everything test related lives in test/: http/, unit/, fixture/, helpers.js, this file
- fast: whole suite under ~10 s, no network, no external services
- every test server on port 0 (free port)
- main style: HTTP tests in test/http/, real server with fixture app in test/fixture/, real requests
- unit tests only for risky logic (jwt, generator, OpenAPI conversion, static path guard) in test/unit/
- test names describe behavior, e.g. "expired token -> 401"
- fixture includes v1 template routes (Test/hello, welcome) to guard v1 compatibility


MUST COVER
1. Generator
- finds magic comments, nested folders, params
- ignores files without comment
- detects models (schema without sibling .js)
- setup.js has top comment, static imports, loads server.js last
- clear errors: two comments in one file, duplicate route, missing default export

2. Bundling
- maxserver build, then run dist/bundle.js, answers requests

3. Handlers
- returned data -> 200 JSON
- returned Response passes through unchanged
- params, query, body filled
- invalid JSON -> 400
- unknown route -> 404

4. Validation
- bad body, query, params -> 400 with readable message
- coerceTypes: query "5" -> 5
- useDefaults, removeAdditional
- format checked (email, date-time)
- model $ref works

5. Response validation
- dev: mismatch logged, response still sent
- prod: no validation
- response never changed

6. Auth / JWT
- valid token in header or cookie -> req.userId set
- missing, bad signature, tampered, expired -> 401
- alg none and any alg other than HS256 rejected

7. Errors
- createError: right status, shape { statusCode, error, message }
- unknown error -> 500, message hidden in production

8. CORS
- preflight answered
- dev reflects origin
- configured origin list respected
- credentials allowed

9. Security headers
- on every response, including errors and static files

10. Static
- serves file with right content type
- missing -> 404
- ../ and %2e%2e blocked

11. Docs
- /docs loads bundled Scalar file
- openapi.json valid OpenAPI 3.1: {id} paths, query params, body, responses
- models in components, $ref rewritten
- auth routes have security
- only routes with schema, sorted by order
- docs: false disables

12. Config and start
- env overrides defaults
- missing secret -> clear error
- no routes registered -> clear error
- public binds 0.0.0.0

13. CLI new
- copies template, renames dotfiles, fills project name
- npm install step not tested


NOT TESTED
- watcher restart timing, performance benchmarks
