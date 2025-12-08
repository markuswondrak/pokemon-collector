import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { AuthButton } from '../../../../src/components/Chat/AuthButton';
import { ChakraProvider, defaultSystem } from '@chakra-ui/react';

const renderWithChakra = (ui: React.ReactElement) => {
	return render(
		<ChakraProvider value={defaultSystem}>
			{ui}
		</ChakraProvider>
	);
};

describe('AuthButton', () => {
	it('should render sign in button when not authenticated', () => {
		const onLogin = vi.fn();
		const onLogout = vi.fn();

		renderWithChakra(
			<AuthButton
				isAuthenticated={false}
				isLoading={false}
				onLogin={onLogin}
				onLogout={onLogout}
			/>
		);

		expect(screen.getByText('Sign in with Google')).toBeInTheDocument();
	});

	it('should render sign out button when authenticated', () => {
		const onLogin = vi.fn();
		const onLogout = vi.fn();

		renderWithChakra(
			<AuthButton
				isAuthenticated={true}
				isLoading={false}
				onLogin={onLogin}
				onLogout={onLogout}
			/>
		);

		expect(screen.getByText('Sign Out')).toBeInTheDocument();
	});

	it('should render loading state', () => {
		const onLogin = vi.fn();
		const onLogout = vi.fn();

		renderWithChakra(
			<AuthButton
				isAuthenticated={false}
				isLoading={true}
				onLogin={onLogin}
				onLogout={onLogout}
			/>
		);

		expect(screen.getByText('Loading...')).toBeInTheDocument();
	});

	it('should call onLogin when sign in button is clicked', () => {
		const onLogin = vi.fn();
		const onLogout = vi.fn();

		renderWithChakra(
			<AuthButton
				isAuthenticated={false}
				isLoading={false}
				onLogin={onLogin}
				onLogout={onLogout}
			/>
		);

		fireEvent.click(screen.getByText('Sign in with Google'));
		expect(onLogin).toHaveBeenCalled();
	});

	it('should call onLogout when sign out button is clicked', () => {
		const onLogin = vi.fn();
		const onLogout = vi.fn();

		renderWithChakra(
			<AuthButton
				isAuthenticated={true}
				isLoading={false}
				onLogin={onLogin}
				onLogout={onLogout}
			/>
		);

		fireEvent.click(screen.getByText('Sign Out'));
		expect(onLogout).toHaveBeenCalled();
	});
});
