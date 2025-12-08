import { renderHook, act } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { useChat } from '../../../src/hooks/useChat';

describe('useChat', () => {
	it('should initialize with default state', () => {
		const { result } = renderHook(() => useChat());
		expect(result.current.isOpen).toBe(false);
		expect(result.current.messages).toEqual([]);
		expect(result.current.isLoading).toBe(false);
		expect(result.current.error).toBeNull();
	});

	it('should toggle isOpen', () => {
		const { result } = renderHook(() => useChat());
		act(() => {
			result.current.toggleChat();
		});
		expect(result.current.isOpen).toBe(true);
		act(() => {
			result.current.toggleChat();
		});
		expect(result.current.isOpen).toBe(false);
	});

	it('should add message and return it', () => {
		const { result } = renderHook(() => useChat());
		let returnedMessage;
		act(() => {
			returnedMessage = result.current.addMessage({ role: 'user', content: 'Hello' });
		});
		expect(result.current.messages).toHaveLength(1);
		expect(result.current.messages[0].content).toBe('Hello');
		expect(result.current.messages[0].id).toBeDefined();
		expect(result.current.messages[0].timestamp).toBeDefined();
		expect(returnedMessage).toEqual(result.current.messages[0]);
	});

	it('should set loading state', () => {
		const { result } = renderHook(() => useChat());
		act(() => {
			result.current.setLoading(true);
		});
		expect(result.current.isLoading).toBe(true);
		act(() => {
			result.current.setLoading(false);
		});
		expect(result.current.isLoading).toBe(false);
	});

	it('should set error state', () => {
		const { result } = renderHook(() => useChat());
		act(() => {
			result.current.setError('Something went wrong');
		});
		expect(result.current.error).toBe('Something went wrong');
		act(() => {
			result.current.setError(null);
		});
		expect(result.current.error).toBeNull();
	});

	it('should clear messages', () => {
		const { result } = renderHook(() => useChat());
		act(() => {
			result.current.addMessage({ role: 'user', content: 'Hello' });
			result.current.addMessage({ role: 'model', content: 'Hi!' });
		});
		expect(result.current.messages).toHaveLength(2);
		act(() => {
			result.current.clearMessages();
		});
		expect(result.current.messages).toHaveLength(0);
	});
});