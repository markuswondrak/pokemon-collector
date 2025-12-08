import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useGemini } from '../../../src/hooks/useGemini';
import { geminiService } from '../../../src/services/ai/gemini';

vi.mock('../../../src/services/ai/gemini', () => ({
	geminiService: {
		sendMessage: vi.fn(),
	},
}));

describe('useGemini', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	afterEach(() => {
		vi.clearAllMocks();
	});

	it('should return text response from Gemini', async () => {
		vi.mocked(geminiService.sendMessage).mockResolvedValue({
			text: 'Here are some fire Pokemon',
		});

		const { result } = renderHook(() => useGemini());

		let response: { text?: string; filterIntent?: any };
		await act(async () => {
			response = await result.current.sendMessage(
				[{ role: 'user', content: 'Show me fire pokemon' }],
				'test-token'
			);
		});

		expect(response!.text).toBe('Here are some fire Pokemon');
		expect(result.current.isLoading).toBe(false);
		expect(result.current.error).toBeNull();
	});

	it('should return filter intent from function call', async () => {
		vi.mocked(geminiService.sendMessage).mockResolvedValue({
			functionCall: {
				name: 'filter_pokemon',
				args: {
					types: ['fire', 'flying'],
					matching_pokemon_names: ['Charizard', 'Moltres'],
				},
			},
		});

		const { result } = renderHook(() => useGemini());

		let response: { text?: string; filterIntent?: any };
		await act(async () => {
			response = await result.current.sendMessage(
				[{ role: 'user', content: 'Show me fire flying pokemon' }],
				'test-token'
			);
		});

		expect(response!.filterIntent).toEqual({
			types: ['fire', 'flying'],
			matching_pokemon_names: ['Charizard', 'Moltres'],
			minStat: undefined,
			nameContains: undefined,
			generation: undefined,
		});
	});

	it('should set loading state during request', async () => {
		let resolvePromise: (value: any) => void;
		const pendingPromise = new Promise((resolve) => {
			resolvePromise = resolve;
		});

		vi.mocked(geminiService.sendMessage).mockReturnValue(pendingPromise as any);

		const { result } = renderHook(() => useGemini());

		expect(result.current.isLoading).toBe(false);

		act(() => {
			result.current.sendMessage(
				[{ role: 'user', content: 'test' }],
				'test-token'
			);
		});

		expect(result.current.isLoading).toBe(true);

		await act(async () => {
			resolvePromise!({ text: 'done' });
		});

		expect(result.current.isLoading).toBe(false);
	});

	it('should set error state on failure', async () => {
		vi.mocked(geminiService.sendMessage).mockRejectedValue(
			new Error('API error')
		);

		const { result } = renderHook(() => useGemini());

		await act(async () => {
			try {
				await result.current.sendMessage(
					[{ role: 'user', content: 'test' }],
					'test-token'
				);
			} catch {
				// Expected error
			}
		});

		expect(result.current.error).toBe('API error');
		expect(result.current.isLoading).toBe(false);
	});
});
