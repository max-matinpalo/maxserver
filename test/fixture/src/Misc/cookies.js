// GET /cookies

export default async function (req, res) {
	res.header("set-cookie", "a=1").header("Set-Cookie", "b=2").header("content-type", "application/vnd.test+json");
	return { ok: true };
}
