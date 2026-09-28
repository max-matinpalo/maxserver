maxserver v2: Bun server setup. v1 (Fastify): git tag v1.0.1.

SPEC
- The spec is .github/README.md (in .github/ so npm does not ship it).
- When behavior changes, update .github/README.md in the same change.
- Test requirements: test/TESTING.md. Run npm test after every change.

RULES
- Do not repeat here what the code or README shows; explain "why" in code comments.
- Built for AI agents: predictable file locations, one file per concern, no hidden wiring, clear errors.
- Dependencies: ajv and ajv-formats only.
- devdocs/ holds built files: never edit them; change ~/Desktop/maxserver-docs and run npm run update-docs-ui.
