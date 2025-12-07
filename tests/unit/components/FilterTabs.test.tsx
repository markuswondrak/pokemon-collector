import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { FilterTabs } from '../../../src/components/FilterTabs';
import { ChakraProvider, defaultSystem } from '@chakra-ui/react';

const renderWithChakra = (ui: React.ReactElement) => {
	return render(<ChakraProvider value={defaultSystem}>{ui}</ChakraProvider>);
};

describe('FilterTabs', () => {
	it('should render all tabs', () => {
		renderWithChakra(
			<FilterTabs status="all" onStatusChange={() => {}} />
		);

		expect(screen.getByText('All')).toBeInTheDocument();
		expect(screen.getByText('Caught')).toBeInTheDocument();
		expect(screen.getByText('Wishlist')).toBeInTheDocument();
	});

	it('should display counts when provided', () => {
		const counts = { all: 10, caught: 5, wishlist: 2 };
		renderWithChakra(
			<FilterTabs status="all" onStatusChange={() => {}} counts={counts} />
		);

		expect(screen.getByText('All (10)')).toBeInTheDocument();
		expect(screen.getByText('Caught (5)')).toBeInTheDocument();
		expect(screen.getByText('Wishlist (2)')).toBeInTheDocument();
	});

	it('should call onStatusChange when a tab is clicked', async () => {
		const user = userEvent.setup();
		const handleStatusChange = vi.fn();
		renderWithChakra(
			<FilterTabs status="all" onStatusChange={handleStatusChange} />
		);

		await user.click(screen.getByText('Caught'));
		expect(handleStatusChange).toHaveBeenCalledWith('caught');

		await user.click(screen.getByText('Wishlist'));
		expect(handleStatusChange).toHaveBeenCalledWith('wishlist');
	});

	it('should highlight the active tab', () => {
		renderWithChakra(
			<FilterTabs status="caught" onStatusChange={() => {}} />
		);

		const caughtTab = screen.getByText('Caught').closest('button');
		expect(caughtTab).toHaveAttribute('data-selected');
		
		const allTab = screen.getByText('All').closest('button');
		expect(allTab).not.toHaveAttribute('data-selected');
	});
});
