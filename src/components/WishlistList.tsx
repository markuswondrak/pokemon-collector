import { ReactElement } from 'react'
import { Box, Heading, Text, VStack, Grid } from '@chakra-ui/react'
import PokemonCard from './PokemonCard'

interface Pokemon {
  index: number
  name: string
  image: string | null
  collected: boolean
  wishlist: boolean
}

interface WishlistListProps {
  pokemon: Pokemon[]
  title: string
  onRemoveWishlist: (index: number) => void
  onCollect: (index: number) => void
}

/**
 * WishlistList Component
 * Displays a list of wishlisted Pokemon using LazyLoadingGrid.
 * Uses responsive columns: 1 col mobile, 2 col tablet, 3+ col desktop.
 * Displays a list of wishlisted Pokemon using Grid layout.
 * Enables grid layout for performance optimization with large wishlists.
 */
export default function WishlistList({
  pokemon,
  title,
  onRemoveWishlist,
  onCollect
}: WishlistListProps): ReactElement {
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
            id="wishlist-title"
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
            aria-labelledby="wishlist-title"
            width="100%"
          >
            <Grid
              templateColumns={{
                base: '1fr',
                sm: 'repeat(2, 1fr)',
                md: 'repeat(3, 1fr)',
                lg: 'repeat(4, 1fr)',
              }}
              gap={4}
              w="100%"
            >
              {pokemon.map((poke: Pokemon) => (
                <PokemonCard
                  key={poke.index}
                  pokemon={poke}
                  onCollect={onCollect}
                  onRemove={onRemoveWishlist}
                  onAddToWishlist={onRemoveWishlist}
                />
              ))}
            </Grid>
          </Box>
        )}
      </VStack>
    </Box>
  )
}
