const corsHeaders = {
	"Access-Control-Allow-Origin": "*",
	"Access-Control-Allow-Methods": "POST, OPTIONS",
	"Access-Control-Allow-Headers": "Content-Type",
};
function jsonResponse(body, status = 200) {
	return new Response(JSON.stringify(body), {
		status,
		headers: {
			"Content-Type": "application/json",
			...corsHeaders,
		},
	});
}
export default {
	async fetch(request) {
		if (request.method === "OPTIONS") {
			return new Response(null, { headers: corsHeaders });
		}

		if (request.method === "GET") {
			return jsonResponse({ status: "ok", message: "JavaScript runner is ready" });
		}

		if (request.method !== "POST") {
			return jsonResponse({ error: "Method Not Allowed" }, 405);
		}

		try {
			const payload = await request.json();
			const code = payload?.code;

			if (typeof code !== "string" || code.trim() === "") {
				return jsonResponse({ error: "No code provided" }, 400);
			}

			return jsonResponse(
				{
					error:
						"Executing arbitrary JavaScript is not supported in Cloudflare Workers. Run code in the IDE browser.",
				},
				501,
			);
		} catch (error) {
			const message = error instanceof Error ? error.message : String(error);
			return jsonResponse({ error: message }, 500);
		}
	},
};
  