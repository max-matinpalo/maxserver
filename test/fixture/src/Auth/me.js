// GET /me

export default async function (req, res) {
	return req.auth ? { auth: req.auth } : { userId: req.userId, sub: req.user.sub };
}
