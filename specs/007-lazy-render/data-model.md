# Data Model: Lazy Card Rendering System

**Phase 1 Output** | **Date**: 2025-12-04

## Entity Relationship Diagram

```
Viewport
  ├── dimensions: { width, height }
  └── scrollTop: number
        ↓
    intersects with
        ↓
  BufferZone
    ├── topMargin: 200px
    ├── bottomMargin: 200px
    └── visibleRange: { start, end } indices
          ↓
      contains visible
          ↓
    CardRenderQueue
      ├── highPriority: Set<CardIndex> (viewport)
      ├── mediumPriority: Set<CardIndex> (buffer zone)
      └── lowPriority: Set<CardIndex> (off-screen)
            ↓
        processed by
            ↓
      VisibleCardSet
      ├── renderedCards: Set<number> (indices)
      ├── skeletonCards: Set<number> (indices waiting to render)
      └── lastUpdateTime: number (timestamp)
```

---

## Core Entities

### 1. Viewport

**Purpose**: Represents the visible browser window area where users see cards.

**Fields**:
```typescript
interface Viewport {
  // Dimensions (pixels)
  width: number;           // Browser window width
  height: number;          // Browser window height
  
  // Scroll position
  scrollTop: number;       // Current scroll position from top
  scrollHeight: number;    // Total scrollable height
  
  // Calculated properties
  visibleTop: number;      // Top edge of visible area (scrollTop)
  visibleBottom: number;   // Bottom edge (scrollTop + height)
  centerY: number;         // Center point of visible area
}
```

**Responsibilities**:
- Track current viewport dimensions and position
- Calculate visible card range based on scroll position
- Trigger recalculation on window resize (200ms debounce)
- Notify dependent components when dimensions change

**Relationships**:
- `intersects` BufferZone → determines which cards to render
- `depends on` Window Resize Events
- `triggers` CardRenderQueue updates

**Validation Rules**:
- `width > 0` and `height > 0` (must have positive dimensions)
- `scrollTop >= 0` (cannot scroll above top)
- `scrollTop <= scrollHeight - height` (cannot scroll past bottom)
- `visibleBottom = visibleTop + height` (derived, always consistent)

**Constraints**:
- Update frequency: max 1 update per 200ms (debounced resize)
- Must trigger recalculation when dimensions change
- Must maintain scroll position during resize

---

### 2. BufferZone

**Purpose**: Invisible area extending 200px beyond viewport edges where cards pre-render before becoming visible.

**Fields**:
```typescript
interface BufferZone {
  // Margins (pixels)
  topMargin: number;       // 200px - cards render this far above viewport
  bottomMargin: number;    // 200px - cards render this far below viewport
  
  // Calculated boundaries
  topEdge: number;         // viewport.visibleTop - topMargin
  bottomEdge: number;      // viewport.visibleBottom + bottomMargin
  
  // Calculated card indices
  startIndex: number;      // First card index in buffer zone
  endIndex: number;        // Last card index in buffer zone
  cardCount: number;       // endIndex - startIndex + 1
}
```

**Responsibilities**:
- Define pre-render zone boundaries
- Calculate which cards should be rendered (viewport + buffer)
- Adjust buffer size dynamically (smaller on mobile if needed)
- Convert viewport coordinates to card indices

**Relationships**:
- `contains` CardRenderQueue (cards to render)
- `depends on` Viewport (for size/position)
- `feeds into` IntersectionObserver (threshold configuration)

**Validation Rules**:
- `topMargin = 200` (fixed per spec)
- `bottomMargin = 200` (fixed per spec)
- `topEdge >= 0` (clamped to top of document)
- `bottomEdge <= scrollHeight` (clamped to end of document)
- `startIndex >= 0` and `endIndex < totalCards` (within bounds)

**Constraints**:
- Cannot be modified by user code (immutable design)
- Recalculate on Viewport change
- Must never render negative card indices or beyond dataset

**Performance Note**: Converting viewport pixels to card indices requires knowing card height; use grid layout information or estimate ~180px average height.

---

### 3. CardRenderQueue

**Purpose**: Prioritized list of cards waiting to be rendered, sorted by viewport proximity.

**Fields**:
```typescript
interface CardRenderQueue {
  // Priority buckets (Set for O(1) lookup)
  immediate: Set<CardIndex>;      // Cards in current viewport (priority 1)
  upcoming: Set<CardIndex>;       // Cards in buffer zone (priority 2)
  deferred: Set<CardIndex>;       // Cards outside buffer (priority 3)
  
  // Queue metadata
  lastProcessedTime: number;      // Timestamp of last batch render
  batchSize: number;              // 20-30 cards per batch
  throttleMs: number;             // 100ms debounce between batches
}
```

**Responsibilities**:
- Accept IntersectionObserver events
- Sort cards by viewport proximity
- Execute renders in priority order (immediate → upcoming → deferred)
- Batch multiple intersection events to prevent thrashing
- Clear queue when search filter changes

**Relationships**:
- `receives input from` IntersectionObserver
- `feeds into` VisibleCardSet (execute render operations)
- `depends on` Viewport (for distance calculations)

**Methods**:
```typescript
interface CardRenderQueue {
  // Add cards from intersection event
  enqueue(indices: number[], intersectionRatio: number): void
  
  // Process queue in priority order
  processNextBatch(): Promise<void>
  
  // Prioritize cards by distance to viewport center
  reprioritize(viewport: Viewport): void
  
  // Clear queue on search change
  clear(): void
  
  // Get next batch of cards to render
  nextBatch(size: number): number[]
}
```

**Validation Rules**:
- No duplicate indices across priority buckets
- `batchSize` between 20-30 (configurable)
- `throttleMs` must be >0
- Queue size cannot exceed total card count (1025)

**Constraints**:
- Processing must not block main thread (use batching)
- Must prioritize viewport cards over buffer cards
- Must handle rapid scroll (queue multiple events before processing)

---

### 4. VisibleCardSet

**Purpose**: Tracks which cards are currently rendered in the DOM and which still need rendering.

**Fields**:
```typescript
interface VisibleCardSet {
  // Tracking sets
  rendered: Set<CardIndex>;       // Cards fully rendered in DOM
  rendering: Set<CardIndex>;      // Cards currently being rendered
  pending: Set<CardIndex>;        // Cards queued for render
  
  // Lifecycle tracking
  renderStartTime: Map<CardIndex, number>;  // Timestamp when render began
  renderEndTime: Map<CardIndex, number>;    // Timestamp when render completed
  
  // Statistics
  totalRendered: number;          // Count of rendered cards
  totalMemoryBytes: number;       // Estimated DOM memory used
  lastUpdateTime: number;         // Most recent update timestamp
}
```

**Responsibilities**:
- Maintain authoritative set of which cards are in the DOM
- Track render lifecycle (pending → rendering → rendered)
- Calculate memory usage statistics
- Prevent duplicate renders
- Clean up completed renders

**Relationships**:
- `receives from` CardRenderQueue (cards to render)
- `feeds into` Grid Component (which cards to show)
- `depends on` Search Filter (reset on filter change)

**Methods**:
```typescript
interface VisibleCardSet {
  // Add cards to render pipeline
  enqueue(indices: number[]): void
  
  // Mark cards as rendering
  markRendering(indices: number[]): void
  
  // Mark cards as fully rendered
  markRendered(indices: number[]): void
  
  // Remove cards from tracking (on error)
  remove(indices: number[]): void
  
  // Check if card is already rendered
  isRendered(index: number): boolean
  
  // Reset on search filter change
  reset(): void
  
  // Get current statistics
  getStats(): { totalRendered: number; memoryEstimate: number }
}
```

**Validation Rules**:
- No index can be in multiple states simultaneously (rendered XOR rendering XOR pending)
- `totalRendered <= 1025` (cannot exceed dataset)
- `renderStartTime <= renderEndTime` for each card
- Cannot transition directly from pending to rendered (must pass through rendering)

**Constraints**:
- Rendered cards stay in DOM (never removed per spec)
- Memory usage must stay <100MB for 1025 cards (target ~50KB per card)
- Must maintain insertion order for scroll position integrity

**Memory Estimation**:
- Estimated ~50KB per rendered card (DOM + React state + styles)
- 1025 cards at worst case ≈ 51MB (well within 100MB budget)
- Monitor actual memory via `performance.memory` during implementation

---

### 5. IntersectionObserverConfig

**Purpose**: Configuration for IntersectionObserver instance.

**Fields**:
```typescript
interface IntersectionObserverConfig {
  // Root element
  root: Element | null;           // null = viewport
  
  // Margin for triggering intersection
  rootMargin: string;             // "-0px 0px -0px 0px" (converts to 200px threshold)
  
  // Intersection threshold
  threshold: number | number[];   // 0 (immediate detection)
  
  // Debouncing
  debounceMs: number;             // 100ms between batches
  
  // Batch sizing
  minBatchSize: number;           // 20 cards minimum
  maxBatchSize: number;           // 30 cards maximum
}
```

**Constants** (hardcoded per spec):
- `rootMargin`: "200px" (pre-render 200px before viewport)
- `threshold`: 0 (detect immediately on intersection)
- `debounceMs`: 100 (throttle frequent events)
- `minBatchSize`: 20
- `maxBatchSize`: 30

**Responsibilities**:
- Define observer behavior
- Provide sensible defaults
- Allow limited customization for different screen sizes

---

### 6. LazyRenderState

**Purpose**: Complete state snapshot for lazy rendering system.

**Fields**:
```typescript
interface LazyRenderState {
  // Enable/disable
  enabled: boolean;               // Can be toggled off
  
  // Current state
  viewport: Viewport;
  bufferZone: BufferZone;
  visibleCardSet: VisibleCardSet;
  
  // Filtering
  filterCount: number;            // Total cards matching current filter
  shouldLazyRender: boolean;      // false if <50 results
  
  // Performance
  initialRenderTime: number;      // Time to first viewport render (ms)
  memoryUsage: number;            // Estimated DOM memory (bytes)
  
  // Configuration
  config: IntersectionObserverConfig;
}
```

**Responsibilities**:
- Encapsulate complete lazy render system state
- Provide snapshot for debugging and testing
- Calculate derived properties (shouldLazyRender based on filter count)

---

## Data Relationships & Flow

### Render Pipeline

```
User Action (scroll, resize, search)
  ↓
Window Event (scroll, resize, change)
  ↓
Debounce/Throttle (100-200ms)
  ↓
Recalculate Viewport → BufferZone
  ↓
IntersectionObserver Callback (batch multiple events)
  ↓
CardRenderQueue.enqueue(intersected_indices)
  ↓
Prioritize by viewport distance
  ↓
Process batch (20-30 cards)
  ↓
VisibleCardSet.markRendering()
  ↓
Render PokemonCard or Skeleton components
  ↓
VisibleCardSet.markRendered()
  ↓
Update Grid display
  ↓
Grid re-renders with new visible cards
```

### State Updates

**On Scroll**:
1. Viewport.scrollTop updates
2. BufferZone recalculates visible range
3. IntersectionObserver fires for new cards
4. CardRenderQueue enqueues them
5. VisibleCardSet marks them as rendering
6. Components re-render

**On Search Filter**:
1. Filter applied to Pokemon list
2. VisibleCardSet.reset() (clear all previous renders)
3. Check filtered result count
4. If <50: render all immediately (bypass lazy loading)
5. If ≥50: re-enable lazy rendering with new filtered set

**On Window Resize**:
1. Viewport dimensions update (200ms debounce)
2. BufferZone recalculates card indices
3. Grid reflows to new column count
4. IntersectionObserver re-checks all visible cards
5. New cards in visible range are enqueued for render

---

## Type Definitions (TypeScript)

```typescript
// Core types
type CardIndex = number;  // 0-1024 (Pokemon index)
type CardId = number;     // Same as index for now

// Viewport
interface Viewport {
  width: number;
  height: number;
  scrollTop: number;
  scrollHeight: number;
  readonly visibleTop: number;
  readonly visibleBottom: number;
  readonly centerY: number;
}

// Buffer zone
interface BufferZone {
  readonly topMargin: 200;
  readonly bottomMargin: 200;
  readonly topEdge: number;
  readonly bottomEdge: number;
  readonly startIndex: CardIndex;
  readonly endIndex: CardIndex;
  readonly cardCount: number;
}

// Render queue
interface CardRenderQueue {
  immediate: Set<CardIndex>;
  upcoming: Set<CardIndex>;
  deferred: Set<CardIndex>;
  lastProcessedTime: number;
  readonly batchSize: number;
  readonly throttleMs: number;
  
  enqueue(indices: CardIndex[], ratio: number): void;
  processNextBatch(): Promise<void>;
  reprioritize(viewport: Viewport): void;
  clear(): void;
  nextBatch(size: number): CardIndex[];
}

// Visible card set
interface VisibleCardSet {
  rendered: Set<CardIndex>;
  rendering: Set<CardIndex>;
  pending: Set<CardIndex>;
  renderStartTime: Map<CardIndex, number>;
  renderEndTime: Map<CardIndex, number>;
  readonly totalRendered: number;
  readonly totalMemoryBytes: number;
  lastUpdateTime: number;
  
  enqueue(indices: CardIndex[]): void;
  markRendering(indices: CardIndex[]): void;
  markRendered(indices: CardIndex[]): void;
  remove(indices: CardIndex[]): void;
  isRendered(index: CardIndex): boolean;
  reset(): void;
  getStats(): RenderStats;
}

interface RenderStats {
  totalRendered: number;
  memoryEstimate: number;
  renderTime: number;
}

// Complete state
interface LazyRenderState {
  enabled: boolean;
  viewport: Viewport;
  bufferZone: BufferZone;
  visibleCardSet: VisibleCardSet;
  filterCount: number;
  shouldLazyRender: boolean;
  initialRenderTime: number;
  memoryUsage: number;
  config: IntersectionObserverConfig;
}
```

---

## Validation & Constraints Summary

| Entity | Key Constraints | Validation |
|--------|-----------------|-----------|
| **Viewport** | width > 0, height > 0, scrollTop >= 0 | Always valid after update |
| **BufferZone** | topMargin = 200, bottomMargin = 200 | Fixed values, always valid |
| **CardRenderQueue** | No duplicates, batchSize 20-30, throttle >0 | Check on enqueue |
| **VisibleCardSet** | No overlapping states, ≤1025 total | Check on state transition |
| **IntersectionObserver** | rootMargin "200px", threshold 0 | Configuration constant |
| **Overall** | Memory <100MB, latency <200ms | Monitor during implementation |

---

## Next Steps

This data model defines the entities and relationships for lazy rendering implementation. The actual React hook (`useLazyRender`) will manage these entities and coordinate state updates. The model ensures:

- ✅ No premature optimization (simple data structures)
- ✅ Clear separation of concerns (each entity has single responsibility)
- ✅ Type safety (TypeScript interfaces)
- ✅ Performance tracking (statistics collection)
- ✅ Memory safety (no leaks via proper cleanup)
- ✅ Testability (each entity can be tested independently)

Ready to proceed to API contracts and quickstart documentation.
