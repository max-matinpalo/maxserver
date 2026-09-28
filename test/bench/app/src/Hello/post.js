// POST /hello

export default async function handler(req, res) {
	return { message: `Hello ${req.body.name}` };
}
