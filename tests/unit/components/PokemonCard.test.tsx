import { render, screen } from '@testing-library/react';
import { PokemonCard } from '../../../src/components/PokemonCard';
import { PokemonRef } from '../../../src/types';
import { describe, it, expect } from 'vitest';
import { ChakraProvider, defaultSystem } from '@chakra-ui/react';
import React from 'react';

const renderWithChakra = (ui: React.ReactElement) => {
  return render(
    <ChakraProvider value={defaultSystem}>
      {ui}
    </ChakraProvider>
  );
};

describe('PokemonCard', () => {
  const mockPokemon: PokemonRef = {
    id: 25,
    name: 'pikachu',
    imageUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/25.png',
  };

  it('renders pokemon name and id', () => {
    renderWithChakra(<PokemonCard pokemon={mockPokemon} />);
    
    expect(screen.getByText('pikachu')).toBeInTheDocument();
    expect(screen.getByText('#025')).toBeInTheDocument();
  });

  it('renders image with correct src and alt', () => {
    renderWithChakra(<PokemonCard pokemon={mockPokemon} />);
    
    const image = screen.getByRole('img');
    expect(image).toHaveAttribute('src', mockPokemon.imageUrl);
    expect(image).toHaveAttribute('alt', mockPokemon.name);
  });
});
