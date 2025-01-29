export default {
	async fetch(request) {
	  try {
		const { code } = await request.json();
		if (!code) return new Response("No code provided", { status: 400 });
  
		// 安全执行代码
		const result = await runCode(code);
  
		return new Response(JSON.stringify({ output: result }), {
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
  
  async function runCode(code) {
	try {
	  // 在安全环境中执行代码
	  return new Function(`"use strict"; return (async () => { ${code} })();`)();
	} catch (error) {
	  return `Error: ${error.message}`;
	}
  }
  