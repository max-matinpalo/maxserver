// GET /raw

export default async function (req, res) {
	return new Response("raw", { status: 202, headers: { "x-raw": "1" } });
}
