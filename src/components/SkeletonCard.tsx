/**
 * SkeletonCard Component
 * 
 * Placeholder component for Pokemon cards that haven't loaded yet.
 * Uses Chakra UI Skeleton for animated loading state.
 * 
 * Dimensions match PokemonCard: 140px width × 180px height
 */

import { Box, Skeleton, SkeletonText } from '@chakra-ui/react';

export interface SkeletonCardProps {
  /** Optional data attribute for testing */
  'data-testid'?: string;
}

/**
 * Skeleton placeholder for unloaded Pokemon cards
 */
export function SkeletonCard({ 'data-testid': testId }: SkeletonCardProps = {}) {
  return (
    <Box
      data-testid={testId}
      width="140px"
      height="180px"
      borderRadius="md"
      overflow="hidden"
      bg="gray.50"
      padding={3}
      aria-busy="true"
      aria-label="Loading Pokemon card"
      css={{ contain: 'layout paint' }}
    >
      {/* Image skeleton */}
      <Skeleton
        height="80px"
        width="100%"
        marginBottom={2}
        borderRadius="sm"
      />

      {/* Name skeleton */}
      <SkeletonText
        noOfLines={1}
        marginBottom={2}
      />

      {/* Button skeleton */}
      <Skeleton
        height="32px"
        width="100%"
        borderRadius="md"
      />
    </Box>
  );
}
