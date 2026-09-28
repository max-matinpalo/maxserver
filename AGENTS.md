maxserver v2: Bun server setup. v1 (Fastify): git tag v1.0.1.

SPEC
- The spec is .github/README.md (in .github/ so npm does not ship it).
- When behavior changes, update .github/README.md in the same change.
- Test requirements: test/TESTING.md. Run npm test after every change.

RULES
- Built for AI agents: predictable file locations, one file per concern, no hidden wiring, clear errors.
- devdocs/ holds the API docs GUI (/docs in development), built in the separate maxserver-docs repo. Never edit it here.
  To update it, ask the user where the maxserver-docs repo is, run npm run build there, and copy dist/maxserver-docs.js and .css into devdocs/.
