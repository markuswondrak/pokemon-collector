import { ReactElement, useEffect, useRef, useState, useCallback } from 'react'

interface LazyLoadingGridProps {
  items: any[]
  renderItem: (item: any, index: number) => ReactElement
  children?: ReactElement
  batchSize?: number
}

/**
 * LazyLoadingGrid Component
 * Implements Intersection Observer-based lazy loading for efficient rendering
 * of large lists, with fallback to full rendering if observer unavailable
 */
export default function LazyLoadingGrid({
  items,
  renderItem,
  children,
  batchSize = 20,
}: LazyLoadingGridProps): ReactElement {
  const [visibleIndices, setVisibleIndices] = useState<Set<number>>(new Set())
  const [observerSupported, setObserverSupported] = useState<boolean>(true)
  const observerRef = useRef<IntersectionObserver | null>(null)
  const itemRefsRef = useRef<Map<number, HTMLElement>>(new Map())

  // Initialize Intersection Observer
  useEffect(() => {
    if (!observerSupported || typeof window === 'undefined') {
      return
    }

    if (!('IntersectionObserver' in window)) {
      setObserverSupported(false)
      return
    }

    // Create intersection observer
    const observer = new IntersectionObserver(
      (entries) => {
        setVisibleIndices((prevIndices) => {
          const newVisibleIndices = new Set(prevIndices)

          entries.forEach((entry) => {
            const element = entry.target as HTMLElement
            const indexStr = element.getAttribute('data-item-index')
            if (indexStr !== null) {
              const index = parseInt(indexStr, 10)

              if (entry.isIntersecting) {
                newVisibleIndices.add(index)
                // Preload nearby items (buffer above/below)
                for (let i = Math.max(0, index - batchSize); i < Math.min(items.length, index + batchSize); i++) {
                  newVisibleIndices.add(i)
                }
              }
            }
          })

          return newVisibleIndices
        })
      },
      {
        root: null,
        rootMargin: '100px', // Preload 100px before/after viewport
        threshold: 0.01,
      }
    )

    observerRef.current = observer

    return () => {
      observer.disconnect()
    }
  }, [observerSupported, items.length, batchSize])



  // Initialize visible items on mount
  useEffect(() => {
    if (!observerSupported) {
      // Render all items immediately if observer not supported
      setVisibleIndices(new Set(Array.from({ length: items.length }, (_, i) => i)))
    } else if (visibleIndices.size === 0 && items.length > 0) {
      // Initial load: render first batch and some preload
      const initialBatch = new Set<number>()
      for (let i = 0; i < Math.min(batchSize, items.length); i++) {
        initialBatch.add(i)
      }
      setVisibleIndices(initialBatch)
    }
  }, [items.length, batchSize, observerSupported, visibleIndices.size])

  const handleItemRef = useCallback(
    (index: number, element: HTMLElement | null) => {
      if (element) {
        itemRefsRef.current.set(index, element)
        if (observerRef.current) {
          observerRef.current.observe(element)
        }
      } else {
        const element = itemRefsRef.current.get(index)
        if (element && observerRef.current) {
          observerRef.current.unobserve(element)
        }
        itemRefsRef.current.delete(index)
      }
    },
    []
  )

  // If no custom render function, render children
  if (!renderItem) {
    return <div className="lazy-loading-grid">{children}</div>
  }

  // Render lazily loaded items
  return (
    <div className="lazy-loading-grid">
      {items.map((item, index) => (
        <div
          key={index}
          ref={(el) => { handleItemRef(index, el); }}
          data-item-index={index}
          className="lazy-loading-item"
        >
          {visibleIndices.has(index) ? renderItem(item, index) : null}
        </div>
      ))}
    </div>
  )
}
