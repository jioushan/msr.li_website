export default {
	async fetch(request) {
	  const method = request.method;
  
	  // 如果是 OPTIONS 请求，返回 CORS 头部
	  if (method === "OPTIONS") {
		return new Response(null, {
		  headers: {
			"Access-Control-Allow-Origin": "*",  // 允许所有来源
			"Access-Control-Allow-Methods": "POST, GET",  // 允许的方法
			"Access-Control-Allow-Headers": "Content-Type",  // 允许的请求头
		  },
		});
	  }
  
	  // 处理 POST 请求
	  if (method === "POST") {
		try {
		  const { code } = await request.json();
		  if (!code) return new Response("No code provided", { status: 400 });
  
		  // 进行安全检查和处理
		  const result = await runSafeCode(code);
  
		  return new Response(JSON.stringify({ output: result }), {
			headers: {
			  "Content-Type": "application/json",
			  "Access-Control-Allow-Origin": "*",  // 允许所有来源
			  "Access-Control-Allow-Methods": "POST, GET",  // 允许的方法
			},
		  });
		} catch (error) {
		  return new Response(JSON.stringify({ error: error.message }), {
			headers: { "Content-Type": "application/json" },
			status: 500,
		  });
		}
	  }
  
	  return new Response("Method Not Allowed", { status: 405 });
	},
  };
  
  // 安全执行用户输入的代码
  async function runSafeCode(code) {
	try {
	  // 限制只能运行基本的 JavaScript 操作
	  // 只允许 JSON 解析
	  return JSON.parse(code);
	} catch (error) {
	  return `Error: ${error.message}`;
	}
  }
  