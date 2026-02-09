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

- Dependencies: original fastify packages + scalar/fastify-api-reference (doc generator)
- The source is simple. Everyone can read, understand and modify if needed.


## Install

### Setup ready project (recommended)
```js
npx maxserver [appname]
```

### Install as packge
```js
npm install maxserver
```

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
Any fastify options can be passed to maxserver() too.

| Variable | Default | Description |
| :--- | :--- | :--- |
| `PORT` | `3000` | Server port |
| `SECRET` | *-* | Secret used for jwt and cookies |
| `CORS` | `*` | Allowed CORS origins, default all allowed |
| `DOCS` | `true` | Set `false` to disable auto generated docs` |
| `MONGODB` | *-* | MongoDB URI, if set auto-connects db |
| `PUBLIC` | `false` | Set `true` to expose the server publicly (binds to `0.0.0.0`) |
| `STATIC` | *-* | If set, serves this directory statically |
<br><br>

## 🗂️ Project Structure
**maxserver** stands for maximized simplicity - minimum boilerplate.  
Our golden rule is: **1 route = 1 handler file + 1 schema file**

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

## 🛣️ Handlers

#### 1) Define method + path
Start each route file with a comment to define the path.  
That comment is what the route loader uses to auto-register the route.

```js
// GET /teams/:id
```

#### 2) Export default handler


```js
// GET /teams/:id

export default async function (req, res) {

	const id = req.params.id;
	console.log("Example id": id);
	return team;
}
```

<br>
<br>


## 🧾 Schemas
Create a sibling file ending with **`.schema.js`**, so it will be auto registered.  
For example: **hello.js** and **hello.schema.js**  

Besides the basic schema fields we can set fields like summary and description,
which will appear in the docs. Mostly you don't need to write schemas yourself, chat gpt and gemini do it excelently.


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

**`‼️ Important use export default`**

<br>

## Route Options
Though we don't register routes manually, we don't set route options on the register call. If needed, route options can be set on the schema object.
For example **schema.auth = true** to enable authentication.
So the schema holds all configs about a root and handlers the pure logic.

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

### 🤖 AI Assistants (Code Style)
Copy **`RULES.md`** into your AI tool as system context, then ask it to generate routes + schemas.
