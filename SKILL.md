---
name: maxserver
description: Implement, modify, or review Bun server code built with MaxServer and ESM. Apply these conventions only to MaxServer backend work.
---

# MaxServer

Implement the simplest production-ready solution using Bun, MaxServer, and ESM.

## Routes

- Organize routes by feature or domain, such as `Auth/`.
- Create one handler file and one schema file per route.
- Name them `[routeName].js` and `[routeName].schema.js`.
- Do not manually import handlers or route schemas; MaxServer auto-registers them.

## Handlers

1. Put the auto-registration declaration on the first line: `// METHOD /path/:param`.
2. Export the handler with exactly this signature: `export default async function (req, res)`.
3. Split logic into numbered steps with short comments, such as `// 1. Validate`.
4. Put one empty line before the handler function and before every step comment.
5. Access the authenticated user through `req.user` or `req.userId`.
6. Throw errors with the global helper: `throw createError(code, 'Specific failure reason')`.
7. Return response data directly at the root. Do not add response envelopes or status fields.
8. Move reusable logic into separate files that export named functions, and import them normally. There are no auto-globals except `createError` and `ENV`.
9. Set status or headers with `res.status(code)` and `res.header(name, value)`. Return a `Response` only for files or redirects.

## Route Schemas

1. Export a plain JSON Schema object as the default export.
2. Include `summary`, `description`, and `tags`, such as `["Auth"]`.
3. Define every returned response status and its exact JSON shape.
4. Add per-property examples for every required field.
5. Set `auth: true` when the route requires authentication.

## Models

- Create separate reusable model schemas only for entities or shapes used by multiple routes.
- Do not create models for route-specific response objects.
- Good reusable models include `User`, `Project`, and `Item`.
- Define route-specific request and response schemas inline in that route's `.schema.js` file.
- Reference a complete reusable model with `$ref: "ModelName"`.
- Reference one model property with `$ref: "ModelName#/properties/field"`.

## Project Structure

- Organize folders by feature or domain, such as `Auth/`.
- Store reusable model schemas in `Models/`, such as `Models/User.schema.js`.
- Store generic utilities shared by multiple domains in `Utils/`, such as `Utils/example.js`.
- Never manually import handlers or route schemas.
- Never edit `setup.js`; it is generated. Read it to see all routes.
