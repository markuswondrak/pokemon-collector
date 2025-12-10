import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { GeminiService } from '../../../../src/services/ai/gemini.ts';

describe('GeminiService', () => {
	let service: GeminiService;
	const mockFetch = vi.fn();

	beforeEach(() => {
		globalThis.fetch = mockFetch;
		service = new GeminiService();
	});

	afterEach(() => {
		vi.clearAllMocks();
	});

	it('should send message to API', async () => {
		mockFetch.mockResolvedValueOnce({
			ok: true,
			json: async () => ({
				candidates: [
					{
						content: {
							parts: [{ text: 'Hello' }],
						},
					},
				],
			}),
		});

		const response = await service.sendMessage([{ role: 'user', content: 'Hi' }], 'test-access-token');
		expect(mockFetch).toHaveBeenCalledWith(
			'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent',
			expect.objectContaining({
				method: 'POST',
				headers: expect.objectContaining({
					'Content-Type': 'application/json',
					Authorization: 'Bearer test-access-token',
				}),
			})
		);
		expect(response).toEqual({ text: 'Hello' });
	});

    it('should handle function calls', async () => {
        mockFetch.mockResolvedValueOnce({
            ok: true,
            json: async () => ({
                candidates: [
                    {
                        content: {
                            parts: [{
                                functionCall: {
                                    name: 'filter_pokemon',
                                    args: { types: ['fire'] }
                                }
                            }]
                        }
                    }
                ]
            })
        });

        const response = await service.sendMessage([{ role: 'user', content: 'Show me fire pokemon' }], 'test-access-token');
        expect(response).toEqual({
            functionCall: {
                name: 'filter_pokemon',
                args: { types: ['fire'] }
            }
        });
    });
});
