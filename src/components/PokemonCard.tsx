import { ReactElement } from 'react'
import { Box, Heading, Text, VStack, HStack, Button } from '@chakra-ui/react'
import { Card, Badge } from '@chakra-ui/react'

interface Pokemon {
  index: number
  name: string
  image: string | null
  collected: boolean
  wishlist: boolean
}

interface PokemonCardProps {
  pokemon: Pokemon
  onCollect: (index: number) => void
  onAddToWishlist: (index: number) => void
  onRemove: (index: number) => void
}

/**
 * PokemonCard Component
 * Displays a single Pokemon with its information and action buttons.
 * Uses Chakra UI Card.Root component with consistent padding (16px),
 * spacing (8px-12px), shadows, and hover effects.
 */
export default function PokemonCard({
  pokemon,
  onCollect,
  onAddToWishlist,
  onRemove
}: PokemonCardProps): ReactElement {
  const handleCollect = (): void => {
    if (onCollect) {
      onCollect(pokemon.index)
    }
  }

  const handleAddToWishlist = (): void => {
    if (onAddToWishlist) {
      onAddToWishlist(pokemon.index)
    }
  }

  const handleRemove = (): void => {
    if (onRemove) {
      onRemove(pokemon.index)
    }
  }

  const ariaLabel = `${pokemon.name} Pokemon #${pokemon.index}`
  const statusText = [
    pokemon.collected && 'Collected',
    pokemon.wishlist && 'Wishlisted'
  ].filter(Boolean).join(', ')

  return (
    <Card.Root
      as="article"
      data-pokemon-index={pokemon.index}
      aria-label={ariaLabel}
      role="region"
      p={4}
      w="140px"
      display="flex"
      flexDirection="column"
      alignItems="center"
      textAlign="center"
      transition="all 0.3s ease"
      _hover={{
        boxShadow: '0 4px 16px rgba(0, 0, 0, 0.15)',
        transform: 'translateY(-4px)',
      }}
      _focusWithin={{
        borderColor: 'teal.500',
        boxShadow: '0 4px 16px rgba(27, 160, 152, 0.3)',
      }}
    >
      <Box
        w="75px"
        h="75px"
        display="flex"
        alignItems="center"
        justifyContent="center"
        bg="gray.100"
        borderRadius="8px"
        mb={2}
        overflow="hidden"
        flexShrink={0}
      >
        {pokemon.image ? (
          <img
            src={pokemon.image}
            alt={`${pokemon.name} sprite`}
            loading="lazy"
            style={{
              width: '75px',
              height: '75px',
              objectFit: 'contain',
              maxWidth: '75px',
              maxHeight: '75px',
            }}
          />
        ) : (
          <Text
            color="gray.600"
            fontSize="sm"
            fontWeight="500"
            role="status"
            aria-label="Image not available"
          >
            No Image
          </Text>
        )}
      </Box>

      <VStack flex={1} w="100%" mb={2} gap={1}>
        <Heading as="h3" size="sm" color="gray.800" wordBreak="break-word">
          {pokemon.name}
        </Heading>
        <Text color="gray.600" fontSize="xs" fontWeight="500">
          #{pokemon.index}
        </Text>

        {statusText && (
          <VStack
            role="status"
            aria-label={`Status: ${statusText}`}
            gap={1}
          >
            {pokemon.collected && (
              <Badge
                colorScheme="green"
                variant="subtle"
                fontSize="xs"
                px={2}
                py={1}
                aria-label="Collected"
              >
                ✓ Collected
              </Badge>
            )}

            {pokemon.wishlist && (
              <Badge
                colorScheme="yellow"
                variant="subtle"
                fontSize="xs"
                px={2}
                py={1}
                aria-label="Wishlisted"
              >
                ♡ Wishlist
              </Badge>
            )}
          </VStack>
        )}
      </VStack>

      <HStack gap={2} w="100%">
        {!pokemon.collected ? (
          <Button
            size="sm"
            colorScheme="green"
            onClick={handleCollect}
            aria-label={`Add ${pokemon.name} to collection`}
            flex={1}
          >
            Collect
          </Button>
        ) : (
          <Button
            size="sm"
            colorScheme="red"
            onClick={handleRemove}
            aria-label={`Remove ${pokemon.name} from collection`}
            flex={1}
          >
            Remove
          </Button>
        )}

        <Button
          size="sm"
          colorScheme="orange"
          onClick={handleAddToWishlist}
          disabled={pokemon.collected}
          aria-label={
            pokemon.collected
              ? `Cannot add ${pokemon.name} to wishlist (already collected)`
              : pokemon.wishlist
                ? `Remove ${pokemon.name} from wishlist`
                : `Add ${pokemon.name} to wishlist`
          }
          aria-pressed={pokemon.wishlist}
          flex={1}
        >
          {pokemon.wishlist ? '♡ In Wishlist' : '♡ Wishlist'}
        </Button>
      </HStack>
    </Card.Root>
  )
}
