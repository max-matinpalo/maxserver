// POST /items

export default async function (req, res) {
	res.status(201).header("x-created", "1");
	return req.body;
}
