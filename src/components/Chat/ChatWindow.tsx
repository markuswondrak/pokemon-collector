import { Box, VStack, Heading, IconButton, Portal, Text, Spinner, HStack } from '@chakra-ui/react';
import { FaTimes } from 'react-icons/fa';
import { ChatMessage as ChatMessageComponent } from './ChatMessage';
import { ChatMessage } from '../../types/chat';
import { AuthButton } from './AuthButton';
import { ChatInput } from './ChatInput';
import { FilterIntent } from '../../types/chat';

interface ChatWindowProps {
	isOpen: boolean;
	onClose: () => void;
	messages: ChatMessage[];
	isAuthenticated: boolean;
	isAuthLoading: boolean;
	isLoading: boolean;
	error: string | null;
	onLogin: () => void;
	onLogout: () => void;
	onSendMessage: (message: string) => void;
	aiFilter: FilterIntent | null;
	onClearFilter: () => void;
}

export const ChatWindow = ({ 
	isOpen, 
	onClose,
	messages,
	isAuthenticated,
	isAuthLoading,
	isLoading,
	error,
	onLogin,
	onLogout,
	onSendMessage,
	aiFilter,
	onClearFilter,
}: ChatWindowProps) => {
	if (!isOpen) return null;

	const hasActiveFilter = aiFilter?.matching_pokemon_names && aiFilter.matching_pokemon_names.length > 0;

	return (
		<Portal>
			<Box
				position="fixed"
				bottom="80px"
				right="20px"
				width="350px"
				height="500px"
				bg="white"
				boxShadow="xl"
				borderRadius="md"
				zIndex={9999}
				display="flex"
				flexDirection="column"
				overflow="hidden"
				border="1px solid"
				borderColor="gray.200"
			>
				<Box
					p={3}
					bg="blue.500"
					color="white"
					display="flex"
					justifyContent="space-between"
					alignItems="center"
				>
					<Heading size="sm">AI Assistant</Heading>
					<IconButton
						aria-label="Close chat"
						size="xs"
						variant="ghost"
						color="white"
						_hover={{ bg: 'blue.600' }}
						onClick={onClose}
					>
						<FaTimes />
					</IconButton>
				</Box>

				{hasActiveFilter && (
					<Box px={3} py={2} bg="blue.50" borderBottom="1px solid" borderColor="blue.100">
						<HStack justifyContent="space-between">
							<Text fontSize="xs" color="blue.700">
								Filter active: {aiFilter?.matching_pokemon_names?.length} Pokemon
							</Text>
							<Text 
								fontSize="xs" 
								color="blue.600" 
								cursor="pointer" 
								textDecoration="underline"
								onClick={onClearFilter}
							>
								Clear
							</Text>
						</HStack>
					</Box>
				)}

				<VStack flex={1} p={3} overflowY="auto" gap={3} align="stretch">
					{!isAuthenticated && !isAuthLoading && (
						<Box textAlign="center" py={4}>
							<Text mb={4} fontSize="sm" color="gray.600">
								Sign in with Google to chat with the AI assistant
							</Text>
							<AuthButton
								isAuthenticated={false}
								isLoading={false}
								onLogin={onLogin}
								onLogout={onLogout}
							/>
						</Box>
					)}

					{isAuthLoading && (
						<Box textAlign="center" py={4}>
							<Spinner size="sm" />
							<Text mt={2} fontSize="sm" color="gray.600">
								Initializing...
							</Text>
						</Box>
					)}

					{error && (
						<Box 
							p={3} 
							bg="red.50" 
							borderRadius="md" 
							border="1px solid" 
							borderColor="red.200"
						>
							<Text fontSize="sm" color="red.600">
								{error}
							</Text>
						</Box>
					)}

					{isAuthenticated && messages.length === 0 && !error && (
						<Box textAlign="center" py={4}>
							<Text fontSize="sm" color="gray.500">
								Ask me to find Pokemon! Try:
							</Text>
							<Text fontSize="sm" color="gray.400" mt={2} fontStyle="italic">
								"Show me fire pokemon"
							</Text>
							<Text fontSize="sm" color="gray.400" fontStyle="italic">
								"Find legendary pokemon"
							</Text>
						</Box>
					)}

					{messages.map((message) => (
						<ChatMessageComponent key={message.id} message={message} />
					))}

					{isLoading && (
						<Box alignSelf="flex-start" bg="gray.100" px={3} py={2} borderRadius="lg">
							<HStack gap={1}>
								<Spinner size="xs" />
								<Text fontSize="sm" color="gray.500">Thinking...</Text>
							</HStack>
						</Box>
					)}
				</VStack>

				{isAuthenticated && (
					<ChatInput
						onSend={onSendMessage}
						disabled={isLoading}
						placeholder="Ask about Pokemon..."
					/>
				)}

				{isAuthenticated && (
					<Box p={2} borderTop="1px solid" borderColor="gray.100">
						<AuthButton
							isAuthenticated={true}
							isLoading={false}
							onLogin={onLogin}
							onLogout={onLogout}
						/>
					</Box>
				)}
			</Box>
		</Portal>
	);
};
