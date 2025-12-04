# API Contracts: Lazy Card Rendering

**Phase 1 Output** | **Date**: 2025-12-04

## Overview

This document defines the public API contracts for the lazy card rendering system. Contracts specify:
- Input/output interfaces for hooks and services
- Component props and behavior
- Error handling and edge cases
- Performance expectations

---

## Hook: useLazyRender

**Location**: `src/hooks/useLazyRender.ts`

**Purpose**: Core hook managing IntersectionObserver and render queue for a card grid.

### Type Signature

```typescript
function useLazyRender<T extends { id?: CardIndex }>(
  items: T[],
  containerRef: React.RefObject<HTMLDivElement>,
  options?: Partial<LazyRenderOptions>
): UseLazyRenderReturn
```

### Input Parameters

```typescript
interface LazyRenderOptions {
  // Enable/disable lazy rendering
  enabled: boolean;  // default: true

  // Buffer zone (pixels before/after viewport)
  bufferPx: number;  // default: 200

  // Intersection observer threshold
  threshold: number | number[];  // default: 0

  // Render batching
  debounceMs: number;  // default: 100
  minBatchSize: number;  // default: 20
  maxBatchSize: number;  // default: 30

  // Search filter threshold (when to enable lazy rendering)
  lazyRenderThreshold: number;  // default: 50
  
  // Performance monitoring
  onRenderStart?: () => void;
  onRenderComplete?: (stats: RenderStats) => void;
  
  // Dev mode logging
  debug?: boolean;  // default: false
}
```

### Return Value

```typescript
interface UseLazyRenderReturn {
  // Visible card indices (Set for O(1) lookup)
  visibleIndices: Set<CardIndex>;
  
  // Whether lazy rendering is active
  isEnabled: boolean;
  
  // Rendering state
  renderState: LazyRenderState;
  
  // Control methods
  reset(): void;
  setEnabled(enabled: boolean): void;
  reprioritize(): void;
  
  // Performance monitoring
  getStats(): RenderStats;
}

interface RenderStats {
  totalRendered: number;
  initialRenderTime: number;  // Time to first viewport (ms)
  cardsPerScrollEvent: number;
  memoryEstimate: number;     // Bytes
  framerate: number;          // Estimated fps
}

interface LazyRenderState {
  enabled: boolean;
  viewport: Viewport;
  bufferZone: BufferZone;
  visibleCardSet: VisibleCardSet;
  filterCount: number;
  shouldLazyRender: boolean;  // false if <50 results
  initialRenderTime: number;
  config: IntersectionObserverConfig;
}
```

### Usage Example

```typescript
export function AvailableGrid({ pokemonList }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  
  const { visibleIndices, isEnabled, getStats } = useLazyRender(
    pokemonList,
    containerRef,
    {
      enabled: true,
      bufferPx: 200,
      lazyRenderThreshold: 50,
      debug: false,
      onRenderComplete: (stats) => {
        console.log(`Rendered ${stats.totalRendered} cards in ${stats.initialRenderTime}ms`);
      },
    }
  );

  return (
    <Box ref={containerRef} css={{ contain: 'layout paint' }}>
      {pokemonList.map((pokemon, idx) => (
        visibleIndices.has(idx) ? (
          <PokemonCard key={idx} {...pokemon} />
        ) : (
          <SkeletonCard key={idx} />
        )
      ))}
    </Box>
  );
}
```

### Behavior Specification

**Initialization**:
1. Hook accepts items and container ref
2. Validates container ref is mounted
3. Creates IntersectionObserver instance
4. Calculates initial viewport and visible cards
5. Returns with first batch of visible indices

**On Scroll**:
1. IntersectionObserver fires intersection events
2. Events are debounced (100ms buffer)
3. Multiple events batched into single state update
4. Visible indices Set updated
5. Component re-renders only changed cards

**On Search Filter**:
1. Items array length changes
2. Calculate new filtered item count
3. If <50: set isEnabled=false (render all)
4. If ≥50: reset visibleIndices, re-enable lazy rendering
5. Re-calculate buffer zone for new items

**On Resize**:
1. Window resize event detected
2. Debounce 200ms
3. Recalculate viewport dimensions
4. Recalculate buffer zone
5. Update visibleIndices if needed

**On Unmount**:
1. Disconnect IntersectionObserver
2. Clear all tracking Sets
3. Clean up event listeners
4. Cancel pending batches

### Error Handling

```typescript
// Error Cases

// E1: Container ref is null
// Behavior: Log warning, disable lazy rendering, render all items
// Impact: User sees all cards (full page load)

// E2: IntersectionObserver not supported
// Behavior: Detect via feature check, disable lazy rendering, render all
// Impact: User sees all cards (graceful degradation)

// E3: Items array is empty
// Behavior: Return empty visibleIndices, no observer needed
// Impact: No cards rendered (expected)

// E4: Item count changes drastically (filter change)
// Behavior: Reset visible set, recalculate thresholds
// Impact: Smooth transition to new result set
```

### Performance Expectations

| Metric | Target | Notes |
|--------|--------|-------|
| Hook initialization | <50ms | Creating observer and initial calculations |
| First render batch | <1000ms | Initial viewport cards rendered within this time |
| Intersection event debounce | 100ms | Multiple scroll events batched |
| Render batch size | 20-30 cards | Adjustable via options |
| Memory per card | ~50KB | Estimate for monitoring |
| Frame rate during scroll | ≥30fps | Achieved via batching and no unmounting |

### Testing Contract

```typescript
describe('useLazyRender', () => {
  // Test initialization with container ref
  test('initializes with visible cards in first batch')
  
  // Test scroll behavior
  test('batches multiple intersection events')
  test('adds cards to visibleIndices when they enter buffer zone')
  test('maintains scroll position (never unmounts cards)')
  
  // Test search/filter integration
  test('renders all items when count < 50')
  test('enables lazy rendering when count >= 50')
  test('resets visible set when items change')
  
  // Test resize handling
  test('recalculates visible cards on window resize')
  test('debounces resize events (200ms)')
  
  // Test error cases
  test('gracefully handles missing IntersectionObserver')
  test('handles null container ref')
  
  // Test performance
  test('initial render time < 1 second')
  test('memory usage stays < 100MB for 1025 items')
  
  // Test cleanup
  test('disconnects observer on unmount')
  test('clears all tracking sets on unmount')
})
```

---

## Service: LazyRenderService

**Location**: `src/services/lazyRenderService.ts`

**Purpose**: Low-level service managing IntersectionObserver and render queue logic (used by hook).

### Type Signature

```typescript
class LazyRenderService {
  constructor(containerElement: HTMLElement, config: IntersectionObserverConfig)
  
  // Lifecycle
  initialize(items: any[]): void
  destroy(): void
  
  // State management
  getVisibleIndices(): Set<CardIndex>
  getState(): LazyRenderState
  getStats(): RenderStats
  
  // Control
  reset(): void
  setEnabled(enabled: boolean): void
  reprioritize(viewport: Viewport): void
  
  // Events
  on(event: LazyRenderEvent, callback: Function): () => void
  off(event: LazyRenderEvent, callback: Function): void
}

enum LazyRenderEvent {
  VISIBLE_CHANGED = 'visibleChanged',
  RENDER_START = 'renderStart',
  RENDER_COMPLETE = 'renderComplete',
  ERROR = 'error',
}
```

### Usage Example

```typescript
const service = new LazyRenderService(containerRef.current, {
  root: null,
  rootMargin: '200px',
  threshold: 0,
  debounceMs: 100,
  minBatchSize: 20,
  maxBatchSize: 30,
});

service.initialize(items);

// Listen for visibility changes
const unsubscribe = service.on('visibleChanged', (visibleIndices) => {
  setVisible(visibleIndices);
});

// Cleanup
service.destroy();
unsubscribe();
```

### Public Methods

```typescript
// Initialize with items
initialize(items: any[]): void {
  // Purpose: Set up observer and calculate initial visible set
  // Precondition: Container element must be mounted
  // Postcondition: Observer active, initial visible indices calculated
  // Side effects: Creates IntersectionObserver, fires 'renderStart' event
  // Throws: Error if container not found, no fallback possible
}

// Destroy observer and cleanup
destroy(): void {
  // Purpose: Clean up resources on component unmount
  // Precondition: None
  // Postcondition: Observer disconnected, all sets cleared
  // Side effects: Removes event listeners, cancels pending batches
  // Idempotent: Safe to call multiple times
}

// Get current visible card indices
getVisibleIndices(): Set<CardIndex> {
  // Purpose: Query which cards are currently rendered
  // Precondition: Service initialized
  // Postcondition: No state changes
  // Complexity: O(1) - returns Set reference
  // Uses: To determine which cards render in component
}

// Get complete system state (for testing/debugging)
getState(): LazyRenderState {
  // Purpose: Snapshot for debugging or test assertions
  // Precondition: Service initialized
  // Postcondition: No state changes (returns snapshot)
  // Complexity: O(1) - returns object reference
  // Uses: Debugging, integration tests, performance monitoring
}

// Get performance statistics
getStats(): RenderStats {
  // Purpose: Retrieve performance metrics
  // Returns: { totalRendered, initialRenderTime, cardsPerScrollEvent, memoryEstimate }
  // Postcondition: No state changes
  // Frequency: Can call every frame, but expensive in production
}

// Reset to initial state
reset(): void {
  // Purpose: Clear all rendered cards and start over
  // Use case: Search filter changed
  // Precondition: Service initialized
  // Postcondition: visibleIndices empty, will re-render on next scroll
  // Idempotent: Safe to call multiple times
}

// Enable/disable lazy rendering
setEnabled(enabled: boolean): void {
  // Purpose: Toggle lazy rendering on/off
  // Behavior if enabled=false: Render all items immediately (no lazy loading)
  // Behavior if enabled=true: Resume lazy loading (recalculate visible set)
  // Idempotent: Safe to call with same value multiple times
}

// Reprioritize render queue
reprioritize(viewport: Viewport): void {
  // Purpose: Re-sort render queue by distance to viewport center
  // Use case: Called on scroll to prioritize visible cards
  // Precondition: Viewport object with valid coordinates
  // Postcondition: CardRenderQueue priority buckets re-sorted
}

// Event subscription
on(event: LazyRenderEvent, callback: Function): () => void {
  // Purpose: Subscribe to service events
  // Events:
  //   'visibleChanged': fired when visible card set changes (Set<CardIndex> param)
  //   'renderStart': fired when batch render starts
  //   'renderComplete': fired when batch render completes (RenderStats param)
  //   'error': fired on error (Error param)
  // Returns: Unsubscribe function
  // Example: service.on('visibleChanged', (indices) => setVisible(indices))
}

off(event: LazyRenderEvent, callback: Function): void {
  // Purpose: Unsubscribe from service events
  // Idempotent: Safe to call even if not subscribed
}
```

### Event Flow Diagram

```
Item mounted in DOM
  ↓
IntersectionObserver.observe(element)
  ↓
[on scroll, element enters buffer zone]
  ↓
Intersection callback fires
  ↓
[debounced 100ms]
  ↓
Callback batches with other recent events
  ↓
CardRenderQueue.enqueue(indices)
  ↓
[prioritized by distance to viewport]
  ↓
Fire 'renderStart' event
  ↓
VisibleCardSet.markRendering(indices)
  ↓
Emit 'visibleChanged' event with new Set<CardIndex>
  ↓
[Component re-renders]
  ↓
Fire 'renderComplete' event with RenderStats
```

---

## Component: LazyLoadingGrid (Enhanced)

**Location**: `src/components/LazyLoadingGrid.tsx`

**Purpose**: React component wrapper providing lazy rendering for grid children.

### Props Contract

```typescript
interface LazyLoadingGridProps<T> {
  // Data
  items: T[];
  
  // Render function
  children: (item: T, index: number, isVisible: boolean) => React.ReactNode;
  
  // Lazy rendering options
  lazy?: boolean;  // default: true
  bufferPx?: number;  // default: 200
  lazyThreshold?: number;  // default: 50 (items count)
  
  // Layout
  columns?: ResponsiveValue<number>;  // Chakra UI responsive
  spacing?: ResponsiveValue<Spacings>;  // Chakra UI
  
  // Event handlers
  onRenderStart?: () => void;
  onRenderComplete?: (stats: RenderStats) => void;
  
  // Chakra UI props
  containerProps?: BoxProps;
  
  // Skeleton placeholder (optional, uses default if not provided)
  skeletonComponent?: React.ComponentType<{ index: number }>;
}
```

### Usage Example

```typescript
<LazyLoadingGrid
  items={pokemonList}
  columns={{ base: 2, md: 3, lg: 5 }}
  spacing={4}
  lazy={true}
  lazyThreshold={50}
  onRenderComplete={(stats) => console.log(stats)}
>
  {(pokemon, idx, isVisible) => (
    isVisible ? (
      <PokemonCard key={idx} {...pokemon} />
    ) : (
      <SkeletonCard key={idx} />
    )
  )}
</LazyLoadingGrid>
```

### Behavior Specification

**Props Validation**:
- items: required, array of any type
- children: required, function returning ReactNode
- columns: optional, default responsive (auto-calculate)
- spacing: optional, default "4"

**Render Logic**:
1. Pass items to useLazyRender hook
2. Get visibleIndices Set back
3. Render each item:
   - If `isVisible` (in Set): render children(item, idx, true)
   - If not visible: render skeletonComponent or default SkeletonCard
4. Return Chakra UI Grid with all children

**Prop Changes**:
- If `items.length` changes: reset visible set (search filter case)
- If `lazyThreshold` changes: toggle lazy rendering mode
- If `lazy` prop changes: toggle lazy rendering on/off

### Contract with Parent Components

```typescript
// AvailableGrid, CollectionList, WishlistList all use LazyLoadingGrid

<LazyLoadingGrid
  items={filteredCards}
  columns={{ base: 2, md: 3, lg: 5 }}
  lazy={filteredCards.length >= 50}  // or let component decide
  onRenderComplete={(stats) => {
    // Parent can track performance if needed
  }}
>
  {(card, idx, isVisible) => (
    <PokemonCard key={idx} pokemon={card} />
  )}
</LazyLoadingGrid>
```

---

## Skeleton Card Component

**Location**: `src/components/SkeletonCard.tsx`

**Purpose**: Placeholder for cards awaiting lazy rendering.

### Props Contract

```typescript
interface SkeletonCardProps {
  index: number;  // Card index (optional, for debugging)
}
```

### Implementation

Uses Chakra UI `Skeleton` component with:
- Fixed width: 140px (matches PokemonCard)
- Fixed height: 180px (matches PokemonCard average)
- Animated pulse effect (default Chakra animation)
- Aria-busy="true" for accessibility

```typescript
export function SkeletonCard({ index }: SkeletonCardProps) {
  return (
    <Box
      width="140px"
      height="180px"
      borderRadius="md"
      overflow="hidden"
      css={{ contain: 'layout paint' }}
    >
      <Skeleton
        height="100px"
        mb={2}
        startColor="gray.100"
        endColor="gray.200"
      />
      <Skeleton height="20px" mb={2} />
      <Skeleton height="16px" width="80%" />
    </Box>
  );
}
```

---

## Integration Points

### How Components Work Together

```
App.tsx (state: filteredCards, searchQuery)
  ↓
AvailableGrid/CollectionList/WishlistList
  ↓
  ├─→ LazyLoadingGrid (props: items, children)
  │     ├─→ useLazyRender(items, containerRef, options)
  │     │     └─→ LazyRenderService.initialize()
  │     │
  │     └─→ Map items → render children()
  │           ├─→ PokemonCard (if visible)
  │           └─→ SkeletonCard (if not visible)
  │
  └─→ [other UI elements]
```

### State Flow

```
Search Query Changes
  ↓
filteredCards.length changes
  ↓
LazyLoadingGrid receives new items prop
  ↓
useLazyRender calls service.reset()
  ↓
service.reset() clears visibleIndices
  ↓
Component re-renders with empty visible set
  ↓
Only cards visible in current viewport render
  ↓
As user scrolls, cards render via intersection observer
```

---

## Contract Validation Checklist

- [ ] All type definitions are complete and consistent
- [ ] All public methods have clear preconditions and postconditions
- [ ] Error cases are documented with fallback behavior
- [ ] Performance expectations are measurable
- [ ] Integration tests cover all contracts
- [ ] Component props are fully specified
- [ ] Event contracts are clear (parameters, firing conditions)
- [ ] Usage examples compile and work

---

**Next Steps**: Create quickstart.md with implementation overview and developer guide.
