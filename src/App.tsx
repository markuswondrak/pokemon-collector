import { Box, Button, Heading, Spinner, Text, VStack, Tabs } from '@chakra-ui/react'
import { Toaster, toaster } from './components/Toaster'
import { usePokemonIndex } from './hooks/usePokemonIndex'
import { useCollection } from './hooks/useCollection'
import { LazyLoadingGrid } from './components/LazyLoadingGrid'

function App() {
	const { pokemonList, isLoading: isIndexLoading, error: indexError, retry } = usePokemonIndex();
	const { collection, toggleCaught, toggleWishlist } = useCollection();

	const isLoading = isIndexLoading;

	const caughtPokemon = pokemonList.filter(p => collection.caught.includes(p.id));
	const wishlistPokemon = pokemonList.filter(p => collection.wishlist.includes(p.id));
	const availablePokemon = pokemonList.filter(p => !collection.caught.includes(p.id) && !collection.wishlist.includes(p.id));

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
		<Box p={5}>
			<VStack gap={4} align="stretch">
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
						<Text mb={4}>Loaded {pokemonList.length} Pokemon.</Text>
						<Tabs.Root defaultValue="available" lazyMount unmountOnExit>
							<Tabs.List mb={4}>
								<Tabs.Trigger value="available">Available ({availablePokemon.length})</Tabs.Trigger>
								<Tabs.Trigger value="caught">Caught ({caughtPokemon.length})</Tabs.Trigger>
								<Tabs.Trigger value="wishlist">Wishlist ({wishlistPokemon.length})</Tabs.Trigger>
							</Tabs.List>
							<Tabs.Content value="available">
								<LazyLoadingGrid 
									pokemonList={availablePokemon} 
									caughtIds={collection.caught}
									wishlistIds={collection.wishlist}
									onToggleCaught={handleToggleCaught}
									onToggleWishlist={handleToggleWishlist}
								/>
							</Tabs.Content>
							<Tabs.Content value="caught">
								<LazyLoadingGrid 
									pokemonList={caughtPokemon} 
									caughtIds={collection.caught}
									wishlistIds={collection.wishlist}
									onToggleCaught={handleToggleCaught}
									onToggleWishlist={handleToggleWishlist}
								/>
							</Tabs.Content>
							<Tabs.Content value="wishlist">
								<LazyLoadingGrid 
									pokemonList={wishlistPokemon} 
									caughtIds={collection.caught}
									wishlistIds={collection.wishlist}
									onToggleCaught={handleToggleCaught}
									onToggleWishlist={handleToggleWishlist}
								/>
							</Tabs.Content>
						</Tabs.Root>
					</Box>
				)}
			</VStack>
			<Toaster />
		</Box>
	)
}

export default App
