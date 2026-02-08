<p align="center">
  <img src="assets/logo.png" alt="Project logo" width="160">
</p>
<br>

# @max-matinpalo/maxserver

-> Node server setup based on **Fastify** with a great new route loader. 

- **Route loader**: auto-register routes and schemas
- **JWT auth** (cookie or `Authorization: Bearer ...`)
- **Autogenerates docs** (`/openapi.json`) + optional UI (`/docs`)
- **MongoDB** auto-connect + global `db` + `oid()` helper
- **Dev server** (auto reload on changes)
- **HTTPS** support (when configured)


---

## Quick Start

```bash
npx @max-matinpalo/maxserver my-app
cd my-app
npm run dev
```

---

## Setup
maxserver(options) forwards options to fastify(options).
It returns the fully configured Fastify server instance.

```js
import maxserver from "@max-matinpalo/maxserver";
const server = await maxserver();
const address = await server.listen({
	port: Number(process.env.PORT || 3000),
});

console.log("Server running at", address);
export default server;
```

---

## ⚙️ Configuration (Environment)

| Variable | Default | Description |
| :--- | :--- | :--- |
| `PORT` | `3000` | Server port |
| `JWT_SECRET` | *(optional)* | Enables JWT auth (private-by-default routes) |
| `MONGODB_URI` | *(optional)* | Enables MongoDB auto-connect + global `db` |
| `DOCS` | `true` | Set `false` to disable docs UI at `/docs` |
| `STATIC_DIR` | *(optional)* | Serve static files (example: `./public`) |
| `CORS_ORIGIN` | `*` | Allowed CORS origins |

---

## 🗂️ Project Structure

**Convention: 1 route = 1 handler file + 1 schema file (siblings).**

Example:

```
src/
	users/
	teams/
	forms/
		get.js
		get.schema.js
	...
```

---

## 🛣️ Writing Route Handlers

### 1) Define method + path
Every route file starts with:

```js
// GET /teams/:id
```

That comment is what the route loader uses to auto-register the route.

### 2) Default export handler

Keep handlers small, and split logic into numbered steps.

If something fails, throw:

```js
throw createError(code, "Specific failure reason");
```

### Example

```js
// GET /teams/:id

export default async function (req, res) {

	// 1. Read input
	const id = req.params.id;

	// 2. Load data
	const team = { id, name: "Team A" };

	// 3. Respond
	return team;
}
```

---

## 🧾 Defining Schemas
Create a sibling file ending in **`.schema.js`**. 
This file will be auto registered.

Schemas:
- validate inputs
- generate OpenAPI docs
- control auth (public/private)


**`src/teams/get.schema.js`**
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

---

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

---

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

Rule of thumb: make the message something you would want to see at 02:00 in logs.

---

## 📚 API Docs

- OpenAPI JSON: **`/openapi.json`**
- Optional UI: **`/docs`** (controlled via `DOCS=true`)

---

## 🛠️ Tips & Tools

### 🔌 Scalar API Client (Live Testing)
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
