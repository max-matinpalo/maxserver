// POST /login
import { signJwt } from "maxserver";

export default async function (req, res) {
	const token = signJwt({ sub: req.body.userId }, { expiresIn: req.body.expiresIn ?? "1h" });
	req.cookies.set("token", token, { httpOnly: true });
	return { token };
}
