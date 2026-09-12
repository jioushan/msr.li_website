import { SELF } from 'cloudflare:test';
import { describe, expect, it } from 'vitest';

describe('JavaScript runner worker', () => {
	it('responds to browser health checks', async () => {
		const response = await SELF.fetch('http://example.com');

		expect(response.status).toBe(200);
		expect(await response.json()).toEqual({
			status: 'ok',
			message: 'JavaScript runner is ready',
		});
	});

	it('rejects server-side JavaScript execution', async () => {
		const response = await SELF.fetch('http://example.com', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ code: 'return 5 + 10;' }),
		});

		expect(response.status).toBe(501);
		expect(await response.json()).toEqual({
			error:
				'Executing arbitrary JavaScript is not supported in Cloudflare Workers. Run code in the IDE browser.',
		});
	});

	it('returns a CORS response for preflight requests', async () => {
		const response = await SELF.fetch('http://example.com', {
			method: 'OPTIONS',
		});

		expect(response.status).toBe(200);
		expect(response.headers.get('Access-Control-Allow-Origin')).toBe('*');
	});
});
