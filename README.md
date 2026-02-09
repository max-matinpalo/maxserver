[![npm version](https://img.shields.io/npm/v/vite-plugin-lint-overlay.svg?style=flat)](https://www.npmjs.com/package/vite-plugin-lint-overlay) [![license](https://img.shields.io/npm/l/vite-plugin-lint-overlay.svg?style=flat)](./LICENSE)

<p align="center" style="margin-top: 20px;" >
  <img src="https://raw.githubusercontent.com/max-matinpalo/maxserver/refs/heads/main/assets/logo.png" alt="Project logo" width="160">
</p>
<br>


# maxserver
‼️ **ATTENTION** ‼️ - Not download yet, check out few days later 😉  
I am simplifying and improving things, that it will work for everyone plugn play.


Ready node server setup based on **Fastify** to speedup api development.

- **Auto Routes**: auto imports and registers routes and schemas
- **Auto Docs**: auto generates docs based on schemas
- **Preconfigures JWT auth, Cores, Helmet**
- **Auto Connect MongoDB** (optional)
- **Dev server**
<br><br>

- Dependencies: original fastify packages + scalar/fastify-api-reference (doc generator)
- The source is simple and short. Everyone shall be able to read, understand and modify if needed.


## Install

### Setup ready project
npx maxserver [appname]

### Install 
npm install maxserver

## Setup
```js
import maxserver from "maxserver";

const server = await maxserver();
await server.listen();

console.log("Server running at ", server.getAddress());
export default server;

```
---

## ⚙️ Configure
Quick configure your server by passing options to the **maxserver()** or define them in your .env file.  
You can also pass any fastify options.

| Variable | Default | Description |
| :--- | :--- | :--- |
| `PORT` | `3000` | Server port |
| `JWT_SECRET` | *-* | Enables JWT auth (private-by-default routes) |
| `MONGODB_URI` | *-* | Enables MongoDB auto-connect + global `db` |
| `DOCS` | `true` | Set `false` to disable docs UI at `/docs` |
| `STATIC_DIR` | *(optional)* | Serve static files (example: `./public`) |
| `CORS_ORIGIN` | `*` | Allowed CORS origins |

---

## 🗂️ Project Structure

**1 route = 1 handler file + 1 schema file**

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

---

## 🛣️ Handlers

### 1) Define method + path
Start each route file with a comment to define the path.  
That comment is what the route loader uses to auto-register the route.

```js
// GET /teams/:id
```



### 2) Default export handler


### Example

```js
// GET /teams/:id

export default async function (req, res) {

	const id = req.params.id;
	console.log("Example id": id);
	return team;
}
```

---

## 🧾 Define Schemas
Create a sibling file ending in **`.schema.js`**. 
The schema is offcourse a jsonschema.
This file will be auto registered.

Schemas:
- validate inputs
- generate OpenAPI docs
- control route options for example (public/private)


**`Important - use default export`**
```js
export default {
	tags: ["Teams"],
	summary: "Get team",
	description: "Returns a single team by identifier.",

	params: {
		type: "object",
		required: ["id"],
		properties: {
			id: {
				type: "string",
				minLength: 24,
				example: "",
			},
		},
	},

	response: {
		200: {
			type: "object",
			properties: {
				id: {
					type: "string",
					example: "507f1f77bcf86cd799439011",
				},
				name: { type: "string", example: "Team A" },
			},
			required: ["id", "name"],
		},
	},
};
```

<br>


## 📚 API Docs

- Open in your browser **`localhost:3000/docs`**
- OpenAPI JSON: **`/openapi.json`**

<br>




## 🔐 Authentication (JWT)

Enable auth by setting:

- `JWT_SECRET`

Behavior:
- **Private by default**: routes require JWT (cookie or Bearer header)
- Authenticated user identifier is available as **`req.userId`**
- Make a route **public** by setting `config.public: true` in its schema

```js
export default {
	config: { public: true },
	// ...
};
```

<br>

## 🍃 MongoDB
Define in the env **`MONGODB_URI`** and it will auto-connect at server start and you get:

- global **`db`** (connected database handle)
- global **`oid(string)`** (string → MongoDB `ObjectId`)

| Global | What it is | Why it exists |
| :--- | :--- | :--- |
| `db` | MongoDB database handle | Use it directly in handlers |
| `oid(id)` | string → `ObjectId` | Avoid importing `ObjectId` everywhere |


---

## 🧰 Error Handling

Use `createError(code, message)` to stop immediately with a clean HTTP error.

```js
if (!user) throw createError(404, "User not found");
```

Rule of thumb: make the message something you would want to see at 03:00 in logs.

---



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
