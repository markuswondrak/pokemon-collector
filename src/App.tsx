import { Box, Button, Heading, Spinner, Text, VStack } from '@chakra-ui/react'
import { usePokemonIndex } from './hooks/usePokemonIndex'

function App() {
	const { pokemonList, isLoading, error, retry } = usePokemonIndex();

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

				{error && (
					<Box color="red.500" p={4} borderWidth={1} borderColor="red.200" borderRadius="md">
						<VStack align="start" gap={2}>
							<Text>Error: {error.message}</Text>
							<Button onClick={retry} colorScheme="red" size="sm">
								Retry
							</Button>
						</VStack>
					</Box>
				)}

				{!isLoading && !error && (
					<Box>
						<Text>Loaded {pokemonList.length} Pokemon.</Text>
						{/* List will be implemented in future tasks/features */}
					</Box>
				)}
			</VStack>
		</Box>
	)
}

export default App
