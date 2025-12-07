import { render, screen, fireEvent } from '@testing-library/react';
import { LazyImage } from '../../../src/components/LazyImage';
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

describe('LazyImage', () => {
  const src = 'https://example.com/image.png';
  const alt = 'Test Image';

  it('renders skeleton initially', () => {
    renderWithChakra(<LazyImage src={src} alt={alt} />);
    // Chakra Skeleton usually has a specific class or structure, but we can check if the image is hidden or if a skeleton is present.
    // In the code: {isLoading && <Skeleton ... />}
    // We can check if the image has opacity 0.
    const image = screen.getByRole('img');
    expect(image).toHaveStyle({ opacity: 0 });
  });

  it('renders image visible after load', () => {
    renderWithChakra(<LazyImage src={src} alt={alt} />);
    const image = screen.getByRole('img');
    
    // Simulate load
    fireEvent.load(image);
    
    expect(image).toHaveStyle({ opacity: 1 });
  });

  it('renders error fallback on error', () => {
    renderWithChakra(<LazyImage src={src} alt={alt} />);
    const image = screen.getByRole('img');
    
    // Simulate error
    fireEvent.error(image);
    
    expect(screen.getByText('Offline / Missing')).toBeInTheDocument();
  });
});
