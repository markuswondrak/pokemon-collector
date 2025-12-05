import { ReactElement, useRef, type RefObject } from 'react'
import { Grid } from '@chakra-ui/react'
import { useLazyRender } from '../hooks/useLazyRender'
import { SkeletonCard } from './SkeletonCard'

interface LazyLoadingGridProps<T = unknown> {
  items: T[]
  renderItem: (item: T, index: number, isVisible: boolean) => ReactElement
  children?: ReactElement
  lazy?: boolean
}

/**
 * LazyLoadingGrid Component
 * Implements Intersection Observer-based lazy loading for efficient rendering
 * of large lists using Chakra Grid, with fallback to full rendering if observer unavailable
 * 
 * Uses useLazyRender hook for visibility tracking and automatic threshold-based
 * lazy loading (enable for ≥50 items, disable for <50 items)
 */
export default function LazyLoadingGrid<T = unknown>({
  items,
  renderItem,
  children,
  lazy = true,
}: LazyLoadingGridProps<T>): ReactElement {
  const containerRef = useRef<HTMLDivElement>(null)
  const { visibleIndices, isLazyEnabled, observe } = useLazyRender(containerRef as RefObject<HTMLElement>, items)

  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  if (renderItem === undefined) {
    return <Grid>{children}</Grid>
  }

  return (
    <Grid
      ref={containerRef}
      gridTemplateColumns={['1fr', '1fr 1fr', 'repeat(3, 1fr)']}
      gap={6}
      w="100%"
      css={{ contain: 'layout paint' }}
    >
      {items.map((item, index) => {
        const isVisible = visibleIndices.has(index)
        const shouldLazyRender = lazy && isLazyEnabled

        return (
          <div
            key={index}
            ref={(el) => { 
              if (el) observe(el, index)
            }}
            data-card-index={index}
          >
            {!shouldLazyRender || isVisible ? (
              renderItem(item, index, isVisible)
            ) : (
              <SkeletonCard data-testid={`skeleton-card-${String(index)}`} />
            )}
          </div>
        )
      })}
    </Grid>
  )
}
