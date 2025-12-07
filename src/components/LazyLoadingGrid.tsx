import React, { forwardRef } from 'react';
import { VirtuosoGrid } from 'react-virtuoso';
import { SimpleGrid, Box, SimpleGridProps } from '@chakra-ui/react';
import { PokemonRef } from '../types';
import { PokemonCard } from './PokemonCard';

interface LazyLoadingGridProps {
  pokemonList: PokemonRef[];
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

export const LazyLoadingGrid: React.FC<LazyLoadingGridProps> = ({ pokemonList }) => {
  return (
    <VirtuosoGrid
      useWindowScroll
      totalCount={pokemonList.length}
      components={{
        List: GridList as any,
        Item: GridItem,
      }}
      itemContent={(index) => (
        <PokemonCard pokemon={pokemonList[index]} />
      )}
    />
  );
};
