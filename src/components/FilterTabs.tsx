import React from 'react';
import { Tabs } from '@chakra-ui/react';
import { FilterStatus } from '../types';

interface FilterTabsProps {
	status: FilterStatus;
	onStatusChange: (status: FilterStatus) => void;
	counts?: {
		all: number;
		caught: number;
		wishlist: number;
	};
}

export const FilterTabs: React.FC<FilterTabsProps> = ({
	status,
	onStatusChange,
	counts,
}) => {
	return (
		<Tabs.Root
			value={status}
			onValueChange={(details) => onStatusChange(details.value as FilterStatus)}
			variant="line"
		>
			<Tabs.List width="full">
				<Tabs.Trigger value="all" flex="1">
					All {counts ? `(${counts.all})` : ''}
				</Tabs.Trigger>
				<Tabs.Trigger value="caught" flex="1">
					Caught {counts ? `(${counts.caught})` : ''}
				</Tabs.Trigger>
				<Tabs.Trigger value="wishlist" flex="1">
					Wishlist {counts ? `(${counts.wishlist})` : ''}
				</Tabs.Trigger>
			</Tabs.List>
		</Tabs.Root>
	);
};
