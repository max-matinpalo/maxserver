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

New project:
```js
npx maxserver new myapp
```
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


| Variable | Default | Description |
| :--- | :--- | :--- |
| `port` | `3000` | Server port |
| `secret` | *-* | Secret used for jwt and cookies |
| `cors` | `*` | Default all allowed |
| `docs` | `true` | Set `false` to disable auto generated docs |
| `public` | `false` | Set `true` to expose the server publicly (binds to `0.0.0.0`) |
| `static` | *-* | If set, serves this directory statically |
| `routesDir` | *src* | Directory to auto collect routes |
| `workers` | `1` | Processes on Linux, one per core. macOS always 1 |
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

export default async function handler(req, rep) {

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

### 3 RULES
1. Add magic comment
2. Default export handler
3. One handler per file 

Imports are generated into **`setup.js`** (no dynamic imports, so the app bundles normally).  
It registers all routes, then starts `server.js`. Don't edit it, it is regenerated.  
`maxserver dev` regenerates it on changes, `maxserver build` generates and bundles to `dist/setup.js`.

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
Open in your browser **`localhost:3000/docs`**  
You should find all your routes well documented.  
And you can also easily test any route.

<br>



## Global Named Exports

Every named export across your JavaScript files is automatically assigned to the Node.js `global` object on startup. This makes your utility functions, constants, or services instantly accessible anywhere in the application without manual `import` statements. The system safely ignores `default` exports and lifecycle hooks, and it will immediately halt with a clear console error if it detects duplicate variable names across different files.













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

## 🛠️ Route Options
Though we don't mostly register routes manually, we don't set route options on the register call.  
If needed, you can wether register that route manually or just set them on the schema.

```js
// Inside schema

export default {
	routeOptions: {
		config: {
			preHandler: ...
		},
	},
	...
```

<br>
<br>

## 🧰 Error Handling

Use `createError(code, message)` to stop immediately with a clean HTTP error.

```js
if (!user) throw createError(404, "User not found");
```

Rule of thumb: make the message something you would want to see at 03:00 in logs.

<br>


## Autoregister Hooks

Exported functions starting with `autoregister_` automatically execute on startup and receive the Fastify `app` instance. This allows files to self-inject custom hooks, plugins, or configurations locally.

### Example
```javascript
// In any standard .js file
export async function autoregister_custom_auth(app) {
	app.addHook("onRequest", async (req, reply) => {
		// Local hook logic here
	});
}
```




## 🤖 AI Skill
**[SKILL.md](SKILL.md)** is the skill to give AI agents that build apps with maxserver.  
It is updated together with maxserver as things evolve.


## About
- Dependencies: ajv, ajv-formats. Runs on Bun.serve(), no fastify
- The source is simple. Everyone can read, understand and modify if needed.


## Todo
- MongoDB as optional add-on (removed from basic version)
- document how to pass scalar options
- more example and best practises


