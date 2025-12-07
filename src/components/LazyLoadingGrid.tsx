import React, { forwardRef } from 'react';
import { VirtuosoGrid } from 'react-virtuoso';
import { SimpleGrid, Box, SimpleGridProps, Text } from '@chakra-ui/react';
import { PokemonRef } from '../types';
import { PokemonCard } from './PokemonCard';

interface LazyLoadingGridProps {
  pokemonList: PokemonRef[];
  caughtIds?: number[];
  wishlistIds?: number[];
  onToggleCaught?: (id: number) => void;
  onToggleWishlist?: (id: number) => void;
}

// 1. Define the List container (The Grid itself)
const GridList = forwardRef<HTMLDivElement, SimpleGridProps>((props, ref) => {
  return (
    <SimpleGrid
      ref={ref}
      {...props}
      columns={{ base: 2, md: 3, lg: 4, xl: 5 }}
      gap={4}
      p={4}
    />
  );
});

// 2. Define the Item container (The wrapper for each card)
const GridItem = forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>((props, ref) => {
  return (
    <Box ref={ref} {...props} />
  );
});

export const LazyLoadingGrid: React.FC<LazyLoadingGridProps> = ({
  pokemonList,
  caughtIds = [],
  wishlistIds = [],
  onToggleCaught,
  onToggleWishlist,
}) => {
  if (pokemonList.length === 0) {
    return (
      <Box p={10} textAlign="center" color="gray.500">
        <Text>No Pokemon found in this list.</Text>
      </Box>
    );
  }

  return (
    <VirtuosoGrid
      useWindowScroll
      totalCount={pokemonList.length}
      components={{
        List: GridList as any,
        Item: GridItem,
      }}
      itemContent={(index) => {
        const pokemon = pokemonList[index];
        return (
          <PokemonCard
            pokemon={pokemon}
            isCaught={caughtIds.includes(pokemon.id)}
            isWishlisted={wishlistIds.includes(pokemon.id)}
            onToggleCaught={onToggleCaught ? () => onToggleCaught(pokemon.id) : undefined}
            onToggleWishlist={onToggleWishlist ? () => onToggleWishlist(pokemon.id) : undefined}
          />
        );
      }}
    />
  );
};
