export default {
  async fetch(request) {
    try {
      const { code } = await request.json();
      if (!code) return new Response("No code provided", { status: 400 });

      return new Response(JSON.stringify({
        error: "Executing arbitrary JavaScript is not supported in Cloudflare Workers. Run code in the IDE browser."
      }), {
        status: 501,
        headers: { "Content-Type": "application/json" },
      });
    } catch (error) {
      return new Response(JSON.stringify({ error: error.message }), {
        headers: { "Content-Type": "application/json" },
        status: 500,
      });
    }
  },
};
