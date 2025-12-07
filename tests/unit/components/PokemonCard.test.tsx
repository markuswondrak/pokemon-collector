import { render, screen, fireEvent } from '@testing-library/react';
import { PokemonCard } from '../../../src/components/PokemonCard';
import { PokemonRef } from '../../../src/types';
import { describe, it, expect, vi } from 'vitest';
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

  it('renders catch button when handler is provided', () => {
    renderWithChakra(<PokemonCard pokemon={mockPokemon} onToggleCaught={() => {}} />);
    expect(screen.getByRole('button', { name: /catch/i })).toBeInTheDocument();
  });

  it('renders wishlist button when handler is provided', () => {
    renderWithChakra(<PokemonCard pokemon={mockPokemon} onToggleWishlist={() => {}} />);
    expect(screen.getByRole('button', { name: /add to wishlist/i })).toBeInTheDocument();
  });

  it('calls onToggleCaught when catch button is clicked', () => {
    const handleToggleCaught = vi.fn();
    renderWithChakra(<PokemonCard pokemon={mockPokemon} onToggleCaught={handleToggleCaught} />);
    
    fireEvent.click(screen.getByRole('button', { name: /catch/i }));
    expect(handleToggleCaught).toHaveBeenCalledTimes(1);
  });

  it('calls onToggleWishlist when wishlist button is clicked', () => {
    const handleToggleWishlist = vi.fn();
    renderWithChakra(<PokemonCard pokemon={mockPokemon} onToggleWishlist={handleToggleWishlist} />);
    
    fireEvent.click(screen.getByRole('button', { name: /add to wishlist/i }));
    expect(handleToggleWishlist).toHaveBeenCalledTimes(1);
  });

  it('displays correct state when isCaught is true', () => {
    renderWithChakra(<PokemonCard pokemon={mockPokemon} isCaught={true} onToggleCaught={() => {}} />);
    expect(screen.getByRole('button', { name: /uncatch/i })).toBeInTheDocument();
  });

  it('displays correct state when isWishlisted is true', () => {
    renderWithChakra(<PokemonCard pokemon={mockPokemon} isWishlisted={true} onToggleWishlist={() => {}} />);
    expect(screen.getByRole('button', { name: /remove from wishlist/i })).toBeInTheDocument();
  });

  it('disables wishlist button when isCaught is true', () => {
    renderWithChakra(
      <PokemonCard 
        pokemon={mockPokemon} 
        isCaught={true} 
        onToggleWishlist={() => {}} 
        onToggleCaught={() => {}}
      />
    );
    const wishlistButton = screen.getByRole('button', { name: /add to wishlist/i });
    expect(wishlistButton).toBeDisabled();
  });
});
