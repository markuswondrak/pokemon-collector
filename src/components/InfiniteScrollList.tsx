import { useRef, useEffect, ReactElement, ReactNode } from 'react'
import { useVirtualizer } from '@tanstack/react-virtual'
import { Box, VStack, Spinner, Text, HStack } from '@chakra-ui/react'
import { useInfiniteScroll, UseInfiniteScrollOptions } from '../hooks/useInfiniteScroll'

export interface InfiniteScrollListProps<T> extends Omit<UseInfiniteScrollOptions<T>, 'initialItems' | 'hasMore'> {
  /** Items to render */
  items: T[]
  /** Whether more items can be loaded */
  hasMore: boolean
  /** Function to render each item */
  renderItem: (item: T, index: number) => ReactNode
  /** Height of each item in pixels */
  itemHeight: number
  /** Container height in pixels */
  containerHeight?: number
  /** Threshold (0-1) for when to trigger loadMore (0.9 = last 10% of list) */
  loadMoreThreshold?: number
  /** Custom loading spinner component */
  loadingComponent?: ReactElement
  /** Custom error message component */
  errorComponent?: (error: string) => ReactElement
  /** Test ID for the component */
  testId?: string
}

/**
 * Infinite scroll list component with virtual rendering
 * 
 * Features:
 * - Virtual rendering: Only renders visible items + buffer zone
 * - Automatic pagination: Triggers loadMore when scrolling past threshold
 * - Loading and error states: Shows spinner during fetch, error message on failure
 * - Accessibility: ARIA labels and semantic HTML
 * 
 * @example
 * ```tsx
 * <InfiniteScrollList
 *   items={items}
 *   hasMore={hasMore}
 *   loadMore={async () => { ... }}
 *   renderItem={(item) => <div>{item.name}</div>}
 *   itemHeight={100}
 *   containerHeight={600}
 * />
 * ```
 */
export function InfiniteScrollList<T>({
  items,
  hasMore,
  loadMore: loadMoreCallback,
  renderItem,
  itemHeight,
  containerHeight = 600,
  loadMoreThreshold = 0.9,
  loadingComponent,
  errorComponent,
  isLoading: initialIsLoading = false,
  testId = 'infinite-scroll-list',
}: InfiniteScrollListProps<T>): ReactElement {
  const parentRef = useRef<HTMLDivElement>(null)
  const { loadedItems, isLoading, error, loadMore } = useInfiniteScroll({
    initialItems: items,
    loadMore: loadMoreCallback,
    hasMore,
    isLoading: initialIsLoading,
  })

  // Create virtualizer instance
  const virtualizer = useVirtualizer({
    count: loadedItems.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => itemHeight,
    overscan: 10, // Render 10 items outside viewport for smooth scrolling
  })

  // Trigger loadMore when scrolling to threshold
  useEffect(() => {
    const parentElement = parentRef.current
    if (!parentElement || !hasMore || isLoading) return

    const handleScroll = () => {
      // Check if we've scrolled past the threshold
      const scrollTop = parentElement.scrollTop
      const scrollHeight = parentElement.scrollHeight
      const clientHeight = parentElement.clientHeight
      const scrolledRatio = (scrollTop + clientHeight) / scrollHeight

      if (scrolledRatio >= loadMoreThreshold) {
        void loadMore()
      }
    }

    parentElement.addEventListener('scroll', handleScroll)
    return () => { parentElement.removeEventListener('scroll', handleScroll); }
  }, [hasMore, isLoading, loadMore, loadMoreThreshold])

  const virtualItems = virtualizer.getVirtualItems()
  const totalSize = virtualizer.getTotalSize()

  // Default loading component
  const DefaultLoader = (
    <HStack justifyContent="center" py={4}>
      <Spinner size="md" />
      <Text>Loading more items...</Text>
    </HStack>
  )

  // Default error component
  const DefaultErrorMessage = (err: string) => (
    <Box
      bg="red.50"
      border="1px solid"
      borderColor="red.200"
      borderRadius="md"
      p={4}
      my={2}
    >
      <Text color="red.800">
        Failed to load items: {err}
      </Text>
    </Box>
  )

  return (
    <VStack spacing={0} width="100%">
      <Box
        ref={parentRef}
        overflowY="auto"
        height={`${containerHeight}px`}
        width="100%"
        position="relative"
        data-testid={testId}
        role="region"
        aria-label="Scrollable item list"
      >
        <Box
          height={`${totalSize.toString()}px`}
          width="100%"
          position="relative"
        >
          {virtualItems.map(virtualItem => (
            <Box
              key={virtualItem.key}
              data-index={virtualItem.index}
              position="absolute"
              top={0}
              left={0}
              width="100%"
              height={`${itemHeight.toString()}px`}
              transform={`translateY(${virtualItem.start.toString()}px)`}
            >
              {renderItem(loadedItems[virtualItem.index], virtualItem.index)}
            </Box>
          ))}
        </Box>
      </Box>

      {/* Loading indicator */}
      {isLoading && (loadingComponent || DefaultLoader)}

      {/* Error message */}
      {error && (errorComponent?.(error) || DefaultErrorMessage(error))}

      {/* End of list indicator */}
      {!hasMore && loadedItems.length > 0 && (
        <Box py={4} textAlign="center" width="100%">
          <Text color="gray.500" fontSize="sm">
            No more items to load ({loadedItems.length} total)
          </Text>
        </Box>
      )}
    </VStack>
  )
}
