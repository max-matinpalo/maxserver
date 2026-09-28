// GET /me

export default async function (req, res) {
	return { userId: req.userId, sub: req.user.sub };
}
