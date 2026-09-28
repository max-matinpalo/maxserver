// GET /welcome

export default async function handler(req, res) {

	console.log("GET /welcome");
	return {
		message: "Weclome to maxserver 😉 - Updated",
	};

}


// Remember the very first line of the file must be the ROUTE COMMENT
// other imports if needed after it