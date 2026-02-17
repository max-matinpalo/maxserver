# maxserver
Node server setup based on **Fastify** to speed up backend development.  
maxserver stands for **maximized simplicity** and **minimum boilerplate**.

- **Auto Routes**: auto imports and registers routes and schemas
- **Auto Docs**: auto generates docs based on schemas
- **Preconfigures essentials**: jwt auth, cors, helmet
- **Auto Connect MongoDB** (optional)

<br><br>

## Install
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
| `cors` | `*` | Default all allowed |
| `docs` | `true` | Set `false` to disable auto generated docs |
| `mongodb` | *-* | MongoDB URI, if set auto-connects db |
| `public` | `false` | Set `true` to expose the server publicly (binds to `0.0.0.0`) |
| `static` | *-* | If set, serves this directory statically |
| `routesDir` | *src* | Directory to auto collect routes |
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

<br>


## 🧾 Schemas
Files ending with **`.schema.js`** will be auto registered.  
For example: **hello.js** and **hello.schema.js**  

Besides the basic validation fields we can set fields like `tags`, `summary` and description,  
which will appear in the docs.


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

**‼️ Important use export default**  
Some examples in the template folder.


### MODELS
You can also auto register **models** (schemas which are shared between multiple routes).  
For example `User.schema.js`. It "magically" understand the difference betwen route specific
schema or generic model, by looking if a sibling file exist or not 😉

<br>



## 📚 API Docs
Open in your browser **`localhost:3000/docs`**  
You should find all your routes well documented.  
And you can also easily test any route.

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

## 🍃 MongoDB
Set option **`MONGODB`** your mongodbURI and it will auto-connect at server start and you get:

- global **`db`** (connected database handle)
- global **`oid(string)`** (string → MongoDB `ObjectId`)

| Global | What it is | Why it exists |
| :--- | :--- | :--- |
| `db` | MongoDB database handle | Use it directly in handlers |
| `oid(id)` | string → `ObjectId` | Saves you from importing everywhere `ObjectId` |

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


## Todo
- document how to add fastify hooks
- document how to pass scalar options
- more example and best practises
- document project setup with npx
- npx option, atm devserver macos only
- unit tests

```
I am just starting to publish packages on github / npm.  
Still not sure if it's worth the time 😃

If anyone else than me and bots is using this package,
just follow me on github and I will improve it.

https://github.com/max-matinpalo

```