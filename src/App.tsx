import { Box, Button, Heading, Spinner, Text, VStack, Center } from '@chakra-ui/react'
import { Toaster, toaster } from './components/Toaster'
import { usePokemonIndex } from './hooks/usePokemonIndex'
import { useCollection } from './hooks/useCollection'
import { usePokemonSearch } from './hooks/usePokemonSearch'
import { LazyLoadingGrid } from './components/LazyLoadingGrid'
import { SearchBar } from './components/SearchBar'
import { FilterTabs } from './components/FilterTabs'
import { FloatingChatButton } from './components/FloatingChatButton'
import { ChatWindow } from './components/Chat/ChatWindow'
import { useChat } from './hooks/useChat'
import { useGoogleAuth } from './hooks/useGoogleAuth'
import { useGemini } from './hooks/useGemini'

function App() {
	const { pokemonList, isLoading: isIndexLoading, error: indexError, retry } = usePokemonIndex();
	const { collection, toggleCaught, toggleWishlist } = useCollection();
	const { isOpen, toggleChat, messages, addMessage, isLoading: isChatLoading, setLoading, error: chatError, setError } = useChat();
	const { session, isInitializing, login, logout } = useGoogleAuth();
	const { sendMessage: sendGeminiMessage, isLoading: isGeminiLoading, error: geminiError } = useGemini();

	const { 
		searchQuery, 
		setSearchQuery, 
		filterStatus, 
		setFilterStatus, 
		filteredPokemon,
		counts,
		aiFilter,
		setAiFilter,
		clearAiFilter,
	} = usePokemonSearch({
		pokemonList,
		userCollection: collection,
	});

	const isLoading = isIndexLoading;
	const isAuthenticated = !!session?.accessToken;

	const handleSendMessage = async (content: string) => {
		if (!session?.accessToken) return;

		// Add user message
		addMessage({ role: 'user', content });
		setLoading(true);
		setError(null);

		try {
			const response = await sendGeminiMessage(
				[...messages, { role: 'user', content }],
				session.accessToken
			);

			if (response.filterIntent) {
				setAiFilter(response.filterIntent);
				
				const filterDescription = [];
				if (response.filterIntent.matching_pokemon_names?.length) {
					filterDescription.push(`${response.filterIntent.matching_pokemon_names.length} matching Pokemon`);
				}
				if (response.filterIntent.types?.length) {
					filterDescription.push(`types: ${response.filterIntent.types.join(', ')}`);
				}
				if (response.filterIntent.nameContains) {
					filterDescription.push(`name contains: ${response.filterIntent.nameContains}`);
				}

				addMessage({
					role: 'model',
					content: `I found ${filterDescription.join(', ')}. The grid has been filtered!`,
				});
			} else if (response.text) {
				addMessage({ role: 'model', content: response.text });
			}
		} catch (err) {
			const errorMessage = err instanceof Error ? err.message : 'Failed to get response';
			setError(errorMessage);
			addMessage({ 
				role: 'model', 
				content: `Sorry, I encountered an error: ${errorMessage}`,
				isError: true,
			});
		} finally {
			setLoading(false);
		}
	};

	const handleToggleCaught = (id: number) => {
		const wasCaught = collection.caught.includes(id);
		const wasWishlisted = collection.wishlist.includes(id);
		
		toggleCaught(id);
		
		if (!wasCaught) {
			toaster.create({
				title: "Caught!",
				description: wasWishlisted ? "Removed from wishlist" : undefined,
				action: {
					label: "Undo",
					onClick: () => {
						toggleCaught(id);
						if (wasWishlisted) toggleWishlist(id);
					}
				}
			});
		} else {
				toaster.create({
				title: "Released",
				action: {
					label: "Undo",
					onClick: () => toggleCaught(id)
				}
				});
		}
	};

	const handleToggleWishlist = (id: number) => {
		const wasWishlisted = collection.wishlist.includes(id);
		
		toggleWishlist(id);
		
		if (!wasWishlisted) {
			toaster.create({
				title: "Added to Wishlist",
				action: {
					label: "Undo",
					onClick: () => toggleWishlist(id)
				}
			});
		} else {
				toaster.create({
				title: "Removed from Wishlist",
				action: {
					label: "Undo",
					onClick: () => toggleWishlist(id)
				}
				});
		}
	};

	return (
		<Box minH="100vh" bg="gray.50">
			<Toaster />
			<VStack gap={4} align="stretch" maxW="container.xl" mx="auto" p={4}>
				<Heading>Pokemon Collector</Heading>
				
				{isLoading && (
					<VStack py={10}>
						<Spinner size="xl" />
						<Text>Loading Global Index...</Text>
					</VStack>
				)}

				{indexError && (
					<Box colorPalette="red" p={4} borderWidth={1} borderColor="red.200" borderRadius="md">
						<VStack align="start" gap={2}>
							<Text>Error: {indexError.message}</Text>
							<Button onClick={retry} colorPalette="red" size="sm">
								Retry
							</Button>
						</VStack>
					</Box>
				)}

				{!isLoading && !indexError && (
					<Box>
						<Box 
							position="sticky" 
							top="0" 
							zIndex="sticky" 
							bg="gray.50" 
							pb={4} 
							pt={2}
							shadow="sm"
							mx="-4"
							px="4"
						>
							<VStack gap={4} align="stretch">
								<SearchBar value={searchQuery} onChange={setSearchQuery} />
								<FilterTabs 
									status={filterStatus} 
									onStatusChange={setFilterStatus} 
									counts={counts} 
								/>
							</VStack>
						</Box>

						<Text mb={4} mt={2}>Loaded {pokemonList.length} Pokemon.</Text>

						{filteredPokemon.length === 0 && searchQuery ? (
							<Center py={10}>
								<VStack>
									<Text fontSize="lg" fontWeight="bold">No Pokemon found</Text>
									<Text color="gray.500">Try adjusting your search.</Text>
								</VStack>
							</Center>
						) : (
							<LazyLoadingGrid 
								pokemonList={filteredPokemon} 
								caughtIds={collection.caught}
								wishlistIds={collection.wishlist}
								onToggleCaught={handleToggleCaught}
								onToggleWishlist={handleToggleWishlist}
							/>
						)}
					</Box>
				)}
			</VStack>
			<FloatingChatButton onClick={toggleChat} />
			<ChatWindow 
				isOpen={isOpen} 
				onClose={toggleChat}
				messages={messages}
				isAuthenticated={isAuthenticated}
				isAuthLoading={isInitializing}
				isLoading={isChatLoading || isGeminiLoading}
				error={chatError || geminiError}
				onLogin={login}
				onLogout={logout}
				onSendMessage={handleSendMessage}
				aiFilter={aiFilter}
				onClearFilter={clearAiFilter}
			/>
		</Box>
	);
}

export default App
