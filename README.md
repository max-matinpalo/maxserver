# maxserver
Bun server setup to speed up backend development.  
Built to work optimal for AI agents: predictable files, no hidden wiring, clear errors.

- **Auto Routes**: one comment per file, imports generated at build time, bundles normally
- **Auto Docs**: OpenAPI + Scalar docs generated from schemas
- **Validation**: ajv v8, schemas compiled once at startup
- **Preconfigures essentials**: jwt auth, cookies, cors, security headers
- **Auto Connect MongoDB** (optional)

No Fastify. Runs on `Bun.serve()` with Bun's built-in routes.

<br>

## 🤖 AI Skill
**[SKILL.md](SKILL.md)** is the skill to give AI agents that build apps with maxserver.  
Add it to your agent's skills. It is updated together with maxserver as things evolve.

<br>

## Install
Published on npm, install with npm as usual.  
Bun 1.3+ must be installed, it runs the server.

New project from template:

```sh
npx maxserver new myapp
```

Existing project:

```sh
npm install maxserver
```

The `maxserver` CLI runs on Node or Bun. It stops with a clear message if Bun is missing.  
`dev` and `build` start Bun themselves.

<br>

## Setup
```js
// server.js
import maxserver from "maxserver";
import routes from "./.maxserver/routes.js";

const server = await maxserver({
	routes,
	port: 3000,
	secret: "your_secret"
});

await server.start();
export default server;
```

`.maxserver/routes.js` is generated (see Auto Routing). Importing it explicitly keeps the wiring visible and lets any bundler follow it.

<br>

## ▶️ Commands

| Command | What it does |
| :--- | :--- |
| `maxserver dev` | Generates routes, watches `src/`, regenerates on change, runs `bun --hot server.js` |
| `maxserver build` | Generates routes, bundles with `bun build` into `dist/server.js` |
| `bun dist/server.js` | Runs production build, no file scanning at start |
| `maxserver new <name>` | Creates a new project from the template |

Template `package.json` scripts: `dev`, `build`, `start` mapped to the rows above.

<br>

## ⚙️ Configure
Configs can be passed to **maxserver()** or set in `.env` (Bun loads it automatically).  
In env use all upper case letters.

| Variable | Default | Description |
| :--- | :--- | :--- |
| `routes` | *-* | Generated route table, required, only via `maxserver()` |
| `port` | `3000` | Server port |
| `secret` | *-* | Required. Secret used for jwt and cookies |
| `cors` | `*` | Allowed origins. Default all allowed |
| `docs` | `true` | Set `false` to disable auto generated docs |
| `mongodb` | *-* | MongoDB URI, if set auto-connects db |
| `public` | `false` | Set `true` to bind `0.0.0.0`, else `127.0.0.1` |
| `static` | *-* | If set, serves this directory statically |
| `routesDir` | `src` | Directory scanned by the generator. Env `ROUTESDIR` only |
| `openapiInfo` | `{ title: "API", version: "1.0.0" }` | OpenAPI info block |
| `scalar` | `{}` | Extra Scalar configuration |
| `sounds` | `true` | Dev sounds on macOS |

`NODE_ENV` defaults to `development`. Global `ENV` exposes `process.env` plus `ENV.development` and `ENV.production`.

<br>

## 🤖 Auto Routing
Routes are registered by one comment on the first line of a file:

```
// METHOD /path
```

```js
// GET /hello

export default async function (req) {

	return {
		message: "Hello world",
	};
}
```

Nesting and params work the same everywhere, place files the way you like.  
Files without the comment are not routes.

```
// GET /teams/:teamId
// PATCH /forms/:formId/questions/:questionId
```

### 3 RULES
1. Add magic comment
2. Default export handler
3. One handler per file

### How it works
The generator scans `src/` and writes `.maxserver/routes.js` with plain static imports:

```js
import h1 from "../src/Test/hello.js";
import s1 from "../src/Test/hello.schema.js";
import m1 from "../src/Models/User.schema.js";

export default {
	models: [m1],
	routes: [{ method: "GET", path: "/hello", handler: h1, schema: s1, file: "src/Test/hello.js" }]
};
```

- No dynamic `import()`, so the app bundles like any normal app.
- The file is gitignored and always regenerated. Agents can read it as a map of all routes.
- Generator errors stop with file path: two magic comments in one file, duplicate route, missing default export.

<br>

## 📨 Requests and Responses

### Request
The handler receives Bun's request with these fields added:

| Field | What it is |
| :--- | :--- |
| `req.params` | Path params (Bun built-in) |
| `req.query` | Parsed and validated query string |
| `req.body` | Parsed and validated JSON body |
| `req.cookies` | Bun `CookieMap`, changes are sent back automatically |
| `req.user` | Verified JWT payload on auth routes |
| `req.userId` | `sub`, `userId`, `userid` or `id` from the payload |

### Response
- Return plain data -> sent as `Response.json(data)` with status 200.
- Return a `Response` -> sent as is. Use it for other status codes, headers, files, redirects.

```js
return Response.json(item, { status: 201 });
```

<br>

## 🧾 Schemas
A sibling file ending with **`.schema.js`** belongs to the route.  
For example: **hello.js** and **hello.schema.js**

Schemas are optional. Only routes with a schema appear in the docs.

```js
export default {

	tags: ["Test"],
	summary: "Post hello",
	description: "Accepts a name and returns a greeting.",
	auth: true,
	order: 1,

	body: {
		type: "object",
		required: ["name"],
		properties: {
			name: { type: "string", examples: ["Max"] },
		},
	},

	response: {
		200: {
			type: "object",
			properties: {
				message: { type: "string" },
			},
		},
	},
};
```

| Field | Use |
| :--- | :--- |
| `params`, `querystring`, `body`, `headers` | Request validation |
| `response` | Docs + dev validation, per status code |
| `tags`, `summary`, `description` | Docs |
| `auth` | `true` requires a valid JWT |
| `order` | Sorts routes in docs within one folder, default `999` |

### Request validation
- ajv v8, all schemas compiled once at startup.
- Same behavior as Fastify defaults: `coerceTypes: "array"`, `useDefaults`, `removeAdditional`, `strictSchema: false`.
- Invalid request -> `400` with the ajv error message.

### Response schemas
- Used for docs.
- No response filtering. Handlers return exactly what gets sent.
- Development: every JSON response is validated. Mismatch logs route + ajv errors, response is still sent.
- Production: no response validation.
- Response validation uses its own ajv instance without `coerceTypes`, `useDefaults` and `removeAdditional`, so it never changes the response.

### Models
Schemas shared by multiple routes, for example `Models/User.schema.js`.  
A `.schema.js` file without a sibling `.js` file is a model. Models need an `$id`.

```js
export default {
	$id: "User",
	type: "object",
	properties: { name: { type: "string" } }
};
```

Reference with `$ref: "User"` or `$ref: "User#/properties/name"`. In docs, models appear under `components.schemas`.

**‼️ Always use export default in schema files.**

<br>

## 📚 API Docs
Open **`localhost:3000/docs`**.  
Scalar UI loaded from CDN, spec at **`/docs/openapi.json`**. Every route can be tested there.  
Auth routes get `bearerAuth` and `cookieAuth` security automatically.

<br>

## 🔐 Authentication
JWT (HS256) via `Authorization: Bearer <token>` header or `token` cookie.  
Set **`auth: true`** in the route schema. Missing or invalid token -> `401`.

```js
import { signJwt } from "maxserver";

const token = await signJwt({ sub: user._id.toString() }, { expiresIn: "7d" });
req.cookies.set("token", token, { httpOnly: true, secure: true, sameSite: "lax" });
```

<br>

## 🛡️ CORS and Headers
- CORS with credentials. Dev with `*` reflects the request origin. Prod with `*` logs a warning.
- Handles `OPTIONS` preflight for all routes.
- Security headers like Helmet defaults, without CSP and frameguard, `Cross-Origin-Resource-Policy: cross-origin`.

<br>

## 🍃 MongoDB
Set **`MONGODB`** to your MongoDB URI. It connects at start (official `mongodb` driver) and you get:

| Global | What it is | Why it exists |
| :--- | :--- | :--- |
| `db` | MongoDB database handle | Use it directly in handlers |
| `oid(id)` | string -> `ObjectId` | Saves importing `ObjectId` everywhere |

```js
export default async function (req) {

	await db.collection("feedback").insertOne({ text: req.body.text });
	return { ok: true };
}
```

<br>

## 🧰 Error Handling
Use `createError(code, message)` to stop immediately with a clean HTTP error.

```js
if (!user) throw createError(404, "User not found");
```

- Response shape: `{ statusCode, error, message }` (same as v1).
- Unknown errors -> `500`, message hidden in production.
- Development: logs file and line of the error.

Rule of thumb: make the message something you would want to see at 03:00 in logs.

<br>

## 🌍 Globals
Only these framework globals exist, typed in `index.d.ts`:

| Global | What it is |
| :--- | :--- |
| `ENV` | `process.env` + `development` / `production` flags |
| `db`, `oid` | MongoDB, only if `mongodb` is set |
| `createError` | HTTP error helper |

<br>

## 🔊 Dev Sounds
macOS, development only. Success sound for JSON responses < 400, error sound for >= 400. Max one per second.

<br>

## ⬆️ Changes from v1
- Bun instead of Node.js, no Fastify.
- Routes imported statically from generated `.maxserver/routes.js`, `server.js` imports it.
- Handler returns data or a `Response`. No Fastify `reply` object.
- `routeOptions` removed (Fastify specific).
- Response schemas no longer filter output.
- Two magic comments in one file is an error, not a warning.
- `maxserver new <name>` instead of `maxserver <name>`.

<br>

## ❓ Open Decisions
Not decided yet. Do not implement until agreed.

- **Global named exports**: v1 made every named export global. Proposal: drop, use normal imports. Hidden origin is bad for AI.
- **Autoregister hooks**: v1 `autoregister_*` received the Fastify app. Needs a Bun replacement or drop.
- **Hooks / middleware**: how to add custom logic before handlers (replaces Fastify hooks and `routeOptions`).
- **WebSockets**: v1 registered Fastify websocket without docs. Bun.serve supports them natively.
- **Handler signature**: proposal `(req)` only, return data or `Response`. v1 handlers using `res` need changes.
- **signJwt**: proposal named import from `maxserver` instead of a global.
