import { useState, KeyboardEvent } from 'react';
import { Input, IconButton, HStack } from '@chakra-ui/react';
import { FaPaperPlane } from 'react-icons/fa';

interface ChatInputProps {
	onSend: (message: string) => void;
	disabled?: boolean;
	placeholder?: string;
}

export const ChatInput = ({ onSend, disabled = false, placeholder = 'Type a message...' }: ChatInputProps) => {
	const [value, setValue] = useState('');

	const handleSend = () => {
		const trimmed = value.trim();
		if (trimmed) {
			onSend(trimmed);
			setValue('');
		}
	};

	const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
		if (e.key === 'Enter' && !e.shiftKey) {
			e.preventDefault();
			handleSend();
		}
	};

	return (
		<HStack gap={2} p={3} borderTop="1px solid" borderColor="gray.200">
			<Input
				value={value}
				onChange={(e) => setValue(e.target.value)}
				onKeyDown={handleKeyDown}
				placeholder={placeholder}
				disabled={disabled}
				size="sm"
				flex={1}
			/>
			<IconButton
				aria-label="Send message"
				onClick={handleSend}
				disabled={disabled || !value.trim()}
				colorPalette="blue"
				size="sm"
			>
				<FaPaperPlane />
			</IconButton>
		</HStack>
	);
};
