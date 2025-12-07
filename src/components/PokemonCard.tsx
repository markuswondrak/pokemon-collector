import React from 'react';
import { Box, Text, VStack, Button, Flex } from '@chakra-ui/react';
import { PokemonRef } from '../types';
import { LazyImage } from './LazyImage';
import { TbPokeball } from 'react-icons/tb';
import { FaHeart } from 'react-icons/fa';

interface PokemonCardProps {
  pokemon: PokemonRef;
  isCaught?: boolean;
  isWishlisted?: boolean;
  onToggleCaught?: () => void;
  onToggleWishlist?: () => void;
}

export const PokemonCard: React.FC<PokemonCardProps> = ({
  pokemon,
  isCaught = false,
  isWishlisted = false,
  onToggleCaught,
  onToggleWishlist,
}) => {
  return (
    <Box
      borderWidth="1px"
      borderRadius="lg"
      overflow="hidden"
      p={4}
      textAlign="center"
      _hover={{ shadow: 'md' }}
    >
      <VStack gap={2}>
        <Box boxSize="100px" mx="auto">
          <LazyImage
            src={pokemon.imageUrl}
            alt={pokemon.name}
            boxSize="100px"
            objectFit="contain"
          />
        </Box>
        <Text fontSize="sm" color="gray.500">
          #{pokemon.id.toString().padStart(3, '0')}
        </Text>
        <Text fontWeight="bold" textTransform="capitalize">
          {pokemon.name}
        </Text>
        <Flex gap={2} mt={2} wrap="wrap" justify="center">
          {onToggleCaught && (
            <Button
              size="sm"
              variant={isCaught ? "solid" : "outline"}
              colorPalette={isCaught ? 'red' : 'gray'}
              onClick={(e) => {
                e.stopPropagation();
                onToggleCaught();
              }}
              aria-label={isCaught ? 'Uncatch' : 'Catch'}
              title={isCaught ? 'Uncatch' : 'Catch'}
            >
              <TbPokeball />
            </Button>
          )}
          {onToggleWishlist && (
            <Button
              size="sm"
              variant={isWishlisted ? "solid" : "outline"}
              colorPalette={isWishlisted ? 'pink' : 'gray'}
              onClick={(e) => {
                e.stopPropagation();
                onToggleWishlist();
              }}
              disabled={isCaught}
              aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
              title={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
            >
              <FaHeart />
            </Button>
          )}
        </Flex>
      </VStack>
    </Box>
  );
};
