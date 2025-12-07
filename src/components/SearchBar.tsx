import React from 'react';
import { Input, IconButton, Box } from '@chakra-ui/react';
import { FaSearch, FaTimes } from 'react-icons/fa';

interface SearchBarProps {
	value: string;
	onChange: (value: string) => void;
	placeholder?: string;
}

export const SearchBar: React.FC<SearchBarProps> = ({
	value,
	onChange,
	placeholder = 'Search Pokemon...',
}) => {
	return (
		<Box position="relative" width="full">
			<Box
				position="absolute"
				left="3"
				top="50%"
				transform="translateY(-50%)"
				zIndex="1"
				pointerEvents="none"
				color="gray.400"
			>
				<FaSearch />
			</Box>
			<Input
				value={value}
				onChange={(e) => onChange(e.target.value)}
				placeholder={placeholder}
				bg="white"
				pl="10"
				pr={value ? '10' : '4'}
			/>
			{value && (
				<Box
					position="absolute"
					right="2"
					top="50%"
					transform="translateY(-50%)"
					zIndex="1"
				>
					<IconButton
						aria-label="Clear search"
						size="xs"
						variant="ghost"
						onClick={() => onChange('')}
					>
						<FaTimes />
					</IconButton>
				</Box>
			)}
		</Box>
	);
};
