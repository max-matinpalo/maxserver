// GET /items/:id
import { label } from "../Utils/format.js";

export default async function (req, res) {
	return { id: req.params.id, type: typeof req.params.id, label: label(req.params.id) };
}
