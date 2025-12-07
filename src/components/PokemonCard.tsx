import React from 'react';
import { Box, Text, VStack } from '@chakra-ui/react';
import { PokemonRef } from '../types';
import { LazyImage } from './LazyImage';

interface PokemonCardProps {
  pokemon: PokemonRef;
}

export const PokemonCard: React.FC<PokemonCardProps> = ({ pokemon }) => {
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
      </VStack>
    </Box>
  );
};
