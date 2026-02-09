[![npm version](https://img.shields.io/npm/v/vite-plugin-lint-overlay.svg?style=flat)](https://www.npmjs.com/package/vite-plugin-lint-overlay) [![license](https://img.shields.io/npm/l/vite-plugin-lint-overlay.svg?style=flat)](./LICENSE)

<p align="center" style="margin-top: 20px;" >
  <img src="https://raw.githubusercontent.com/max-matinpalo/maxserver/refs/heads/main/assets/logo.png" alt="Project logo" width="160">
</p>
<br>


# maxserver
‼️ **ATTENTION** ‼️ - Not download yet, check out few days later 😉  
I am simplifying and improving things, that it will work for everyone plugn play.


Ready node server setup based on **Fastify** to speed up backend development.  
maxserver stands for **maximized simplicity** and **minimum boilerplate**.

- **Auto Routes**: auto imports and registers routes and schemas
- **Auto Docs**: auto generates docs based on schemas
- **Preconfigures essentials**: jwt auth, cors, helmet
- **Auto Connect MongoDB** (optional)
- **Dev server**
<br><br>


## Install

### Setup ready project
```js
npx maxserver [appname]
```

### Or install as packge
```js
npm install maxserver
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
Any fastify options can be passed to maxserver() too.


| Variable | Default | Description |
| :--- | :--- | :--- |
| `port` | `3000` | Server port |
| `secret` | *-* | Secret used for jwt and cookies |
| `cors` | `*` | Allowed CORS origins, default all allowed |
| `docs` | `true` | Set `false` to disable auto generated docs` |
| `mongodb` | *-* | MongoDB URI, if set auto-connects db |
| `public` | `false` | Set `true` to expose the server publicly (binds to `0.0.0.0`) |
| `static` | *-* | If set, serves this directory statically |
| `routesDir` | *src* | Directory to auto collect routes |
---

<br>

## 🗂️ Project Structure 
Our golden rule: **1 route = 1 handler file + 1 schema file**

Example:

```
src/
	users/
	teams/
	forms/
		hello.js
		hello.schema.js
	...
```
<br>

## 🤖 Auto Routing

To auto-register routes, simple add a comment of the form:  
**// METHOD /path**  
**// GET /user**  
**// POST /feedback/something**  
...

```js
// GET /example/:id

export default async function (req, res) {

	const id = req.params.id;
	console.log("Example id": id);
	return team;
}
```
<br>
  
And remember to use default export for your handler.
If you don't want to autoregister some routes, then simply don't add that magic comment 😃
That's it.


<br>
<br>


## 🧾 Schemas
Create a sibling file ending with **`.schema.js`**, so it will be auto registered. For example: **hello.js** and **hello.schema.js** 

Besides the basic validation fields we can set fields like summary and description, which will appear in the docs. Mostly you don't need to write schemas yourself, chat gpt and gemini do it excelently.




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

**‼️ Important use export default
**

<br>

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

## 📚 API Docs

Open in your browser **`localhost:3000/docs`**  
OpenAPI JSON: **`/openapi.json`**

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

<br>

## 🍃 MongoDB
Set option **`MONGODB`** your mongodbURI and it will auto-connect at server start and you get:

- global **`db`** (connected database handle)
- global **`oid(string)`** (string → MongoDB `ObjectId`)

| Global | What it is | Why it exists |
| :--- | :--- | :--- |
| `db` | MongoDB database handle | Use it directly in handlers |
| `oid(id)` | string → `ObjectId` | Avoid importing `ObjectId` everywhere |

### Example

```js
// Inside route handlers

export default async function (req, res) {

	await db.feedback.insert(...)
}
```


<br>

## 🧰 Error Handling

Use `createError(code, message)` to stop immediately with a clean HTTP error.

```js
if (!user) throw createError(404, "User not found");
```

Rule of thumb: make the message something you would want to see at 03:00 in logs.

<br>

## About
- Dependencies: original fastify packages + scalar/fastify-api-reference
- The source is simple. Everyone can read, understand and modify if needed.

<br>

## 🛠️ Tips & Tools

### 🔌 Scalar API Client (Live Testing)
- Download the great new api client
- It autosyncs well with the server
- Add Item → Import from OpenAPI
- Paste: `http://localhost:3000/openapi.json`
- Enable watch mode for live updates

### ⚡ VS Code Auto-Start
In `.vscode/tasks.json`, enable the task with:
```json
"runOptions": { "runOn": "folderOpen" }
```

### 🤖 AI Assistants
Copy **`RULES.md`** into your AI tool as system context,  
then ask it to generate routes + schemas.
