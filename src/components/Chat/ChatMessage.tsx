import { Box, Text } from '@chakra-ui/react';
import { ChatMessage as ChatMessageType } from '../../types/chat';

interface ChatMessageProps {
	message: ChatMessageType;
}

export const ChatMessage = ({ message }: ChatMessageProps) => {
	const isUser = message.role === 'user';

	return (
		<Box
			alignSelf={isUser ? 'flex-end' : 'flex-start'}
			bg={isUser ? 'blue.500' : 'gray.100'}
			color={isUser ? 'white' : 'black'}
			px={3}
			py={2}
			borderRadius="lg"
			borderBottomRightRadius={isUser ? 0 : 'lg'}
			borderBottomLeftRadius={isUser ? 'lg' : 0}
			maxWidth="80%"
		>
			<Text fontSize="sm">{message.content}</Text>
		</Box>
	);
};
