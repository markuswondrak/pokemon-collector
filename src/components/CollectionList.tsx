import { ReactElement } from 'react'
import { Box, Heading, Text, VStack } from '@chakra-ui/react'
import PokemonCard from './PokemonCard'
import LazyLoadingGrid from './LazyLoadingGrid'

interface Pokemon {
  index: number
  name: string
  image: string | null
  collected: boolean
  wishlist: boolean
}

interface CollectionListProps {
  pokemon: Pokemon[]
  title: string
  onCollect: (index: number) => void
  onAddToWishlist: (index: number) => void
  onRemove: (index: number) => void
}

/**
 * CollectionList Component
 * Displays a list of Pokemon (collected or wishlist) using LazyLoadingGrid.
 * Uses responsive columns: 1 col mobile, 2 col tablet, 3+ col desktop.
 * Enables lazy rendering for performance optimization with large collections.
 */
export default function CollectionList({
  pokemon,
  title,
  onCollect,
  onAddToWishlist,
  onRemove
}: CollectionListProps): ReactElement {
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  const count = pokemon ? pokemon.length : 0
  const countText = count === 1 ? '1 pokemon' : `${String(count)} pokemon`

  return (
    <Box as="section" aria-label={title}>
      <VStack align="flex-start" gap={4} width="100%">
        {/* Header with title and count */}
        <Box width="100%">
          <Heading
            as="h2"
            id="collection-title"
            size="lg"
            fontFamily="Open Sans, sans-serif"
            mb={2}
          >
            {title}
          </Heading>
          <Text
            fontSize="sm"
            color="gray.600"
            aria-live="polite"
            aria-atomic="true"
          >
            {countText}
          </Text>
        </Box>

        {/* Content area */}
        {count === 0 ? (
          <Box
            width="100%"
            p={8}
            textAlign="center"
            bg="gray.50"
            borderRadius="md"
            role="status"
            aria-label={`No pokemon in ${title.toLowerCase()} yet`}
          >
            <Text color="gray.500" fontFamily="Open Sans, sans-serif">
              No pokemon in collection yet
            </Text>
          </Box>
        ) : (
          <Box
            role="region"
            aria-labelledby="collection-title"
            width="100%"
          >
            <LazyLoadingGrid
              items={pokemon}
              lazy={true}
              renderItem={(poke: Pokemon) => (
                <PokemonCard
                  pokemon={poke}
                  onCollect={onCollect}
                  onAddToWishlist={onAddToWishlist}
                  onRemove={onRemove}
                />
              )}
            />
          </Box>
        )}
      </VStack>
    </Box>
  )
}
