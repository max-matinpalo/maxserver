# maxserver
Bun server setup to speed up backend development.  
Built to work optimal for AI agents.  

- **Auto Routes**: auto imports and registers routes and schemas
- **Auto Docs**: auto generates docs based on schemas
- **Preconfigures essentials**: jwt auth, cors, security headers

<br><br>

## Install
Requires Bun.
```js
npm install maxserver
```

New project, ready to run with hello world routes and schemas:
```js
npx maxserver new myapp
cd myapp
npm run dev
```
`npm run dev` opens the API docs in your browser, where you can test every route.
<br>

## Setup
```js
import maxserver from "maxserver";

const server = await maxserver({
	port: 3000,
	secret: "your_secret"
});

await server.start();
export default server;
```
<br>

## ⚙️ Configure
Configs can be passed to the init call to **maxserver()** or set in your .env file.  
If you define options in env, use all upper case letters.  
Any Bun.serve options (e.g. `reusePort`, `idleTimeout`, `tls`) can be passed to maxserver() too. `maxRequestBodySize` defaults to 1 MiB.


| Variable | Default | Description |
| :--- | :--- | :--- |
| `port` | `3000` | Server port |
| `secret` | *-* | Secret used for jwt and cookies; not needed with `authenticate` |
| `cors` | `*` | `*` or comma separated origins, e.g. `https://a.com,https://b.com` |
| `docs` | `true` | Set `false` to turn docs off. Development: `/docs` UI + spec. Production: only `/docs/openapi.json` |
| `public` | `false` | Set `true` to expose the server publicly (binds to `0.0.0.0`) |
| `static` | *-* | If set, serves this directory statically |
| `authenticate` | *-* | Your own auth for routes with `auth: true`, instead of jwt. Pass to maxserver() only |
| `routesDir` | *src* | Directory to auto collect routes. Env `ROUTESDIR` only, read by the generator |
---

<br>


## 🤖 Auto Routing
Routes are auto registered based on one small comment per file:  

```
// METHOD /path 
```
<br>


```js
// GET /hello

export default async function handler(req, res) {

	console.log("GET /hello");
	return {
		message: "Hello world",
	};

}
```
<br>

Doesn't matter how nested your path is or how many params,  
It always works this simple and you are free to position your files the way you like.  
If you don't want to autoregister some files, then simply don't add that magic comment 😃
<br>
<br>
```
// GET /teams/:teamid  
// PATCH /forms/:formId/questions/:questionId
...   
```
<br/>

Return data and it is sent as JSON with status 200.  
Use `res.status(201)` and `res.header(name, value)` to change status or headers.  
Return a `Response` for anything else (files, redirects), it is sent as is.

### 3 RULES
1. Add magic comment
2. Default export handler
3. One handler per file 

Imports are generated into **`setup.js`** (no dynamic imports, so the app bundles normally).  
It registers all routes, then starts `server.js`. Don't edit it, it is regenerated.  
`maxserver dev` regenerates it on changes, `maxserver build` generates and bundles to `dist/bundle.js`. Deploy the whole `dist/` folder (bundle and source map).

<br>


## 🧾 Schemas
Files ending with **`.schema.js`** will be auto registered.  
For example: **hello.js** and **hello.schema.js**  

Schemas are optional.
Besides the basic validation fields we can set fields like `tags`, `summary` and description,  
which will appear in the docs. Only if a schema exists the route will be added to the documentation.


```js
export default {

	tags: ["Test"],
	summary: "Post hello",
	description: "Accepts a name and returns a greeting.",

	body: {
		type: "object",
		required: ["name"],
		properties: {
			name: {
				type: "string",
			},
		},
	},

	...
};
```

Validation with ajv v8, schemas compiled once at startup.

Response schemas are for docs, responses are not filtered.  
In development responses are validated and mismatches logged, in production not.


### MODELS
You can also auto register **models** (schemas which are shared between multiple routes).  
For example `User.schema.js`. It "magically" understand the difference betwen route specific
schema or generic model, by looking if a sibling file exist or not 😉

<br>

**‼️ Important use export default**  
Some examples in the template folder.



## 📚 API Docs
`npm run dev` opens **`localhost:3000/docs`** in your browser (`maxserver dev --no-open` to skip).  
All routes are documented, and **Test Request** sends real requests to your server.  
An app with an MCP endpoint: type its path, like `/mcp`, in the **MCP** field. The docs list its tools as ChatGPT does (`tools/list`), test them with `tools/call`, and render their `ui://` views.

The docs UI runs in development only. Production serves just the OpenAPI 3.1 spec at `/docs/openapi.json`.

<br>



## 🔐 Authentication
JWT header and cookie based auth is preconfigured.  
To enable auth for a route set in it's schema **auth = true**  
The authenticated user is available as **`req.userId`**

```js
// Inside schema

export default {
	auth: true
};
```

Create tokens with **`signJwt`**:

```js
import { signJwt } from "maxserver";

const token = await signJwt({ sub: userId }, { expiresIn: "7d" });
```

Own auth instead of jwt: pass **`authenticate`** to maxserver(). It runs for routes with **auth = true**, its result is **`req.auth`**. A falsy result is 401, a thrown error keeps its status. The docs then show Bearer auth only.

```js
const server = await maxserver({
	authenticate: req => sessions.get(req.headers.get("authorization"))
});
```

## 🧰 Error Handling

Use `createError(code, message)` to stop immediately with a clean HTTP error.

```js
if (!user) throw createError(404, "User not found");
```

Rule of thumb: make the message something you would want to see at 03:00 in logs.

<br>


## 🪝 No Hooks
There are no hooks or middleware. Shared logic before a handler is a normal function call at the top of the handler.  
Everything that runs for a route is visible in its file, which is easier to follow for humans and even better for AI.

```js
// GET /teams/:teamId/settings
import { requireTeamAdmin } from "../Utils/teams.js";

export default async function (req, res) {

	const team = await requireTeamAdmin(req, req.params.teamId);
	return team.settings;
}
```

<br>


## About
- Dependencies: ajv, ajv-formats. Runs on Bun.serve(), no fastify
- The source is simple. Everyone can read, understand and modify if needed.


## Todo
- api for websockets (Bun has them built in, needs exposing through maxserver)
