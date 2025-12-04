# Quickstart: Lazy Card Rendering Implementation

**Phase 1 Output** | **Date**: 2025-12-04

## Overview

This quickstart guides developers through implementing lazy card rendering for the Pokemon Collector application. The feature reduces initial page load time by 60% by rendering only visible cards plus a 200px buffer zone.

**Key Outcomes**:
- First viewport cards render in <1 second (was ~5+ seconds)
- Smooth 30+ fps scrolling throughout collection
- Memory usage stays <100MB for 1025 cards
- Zero changes to existing PokemonCard component
- Graceful fallback for older browsers

---

## Architecture at a Glance

```
useLazyRender Hook (custom hook)
    ↓
LazyRenderService (low-level service)
    ├→ IntersectionObserver (native Web API)
    ├→ CardRenderQueue (prioritized batch queue)
    └→ VisibleCardSet (rendered card tracking)
        ↓
LazyLoadingGrid Component (wrapper)
    ├→ PokemonCard (existing, no changes)
    └→ SkeletonCard (new placeholder)
```

**Complexity**: Low (no virtualization, no unmounting)
**Learning Curve**: Medium (IntersectionObserver is new concept)
**Testing**: Comprehensive (hook, service, component, integration)

---

## Implementation Phases

### Phase 0: Research (COMPLETED)
✅ Analyzed IntersectionObserver patterns
✅ Designed batching and queuing strategy
✅ Evaluated Chakra UI integration points
✅ Created data model and contracts

### Phase 1: Design (IN PROGRESS)
- [ ] Review data model and entities
- [ ] Review API contracts and hook signatures
- [ ] Review component integration plan

### Phase 2: Implementation
- [ ] Create LazyRenderService
- [ ] Create useLazyRender hook
- [ ] Create SkeletonCard component
- [ ] Enhance LazyLoadingGrid component
- [ ] Update AvailableGrid, CollectionList, WishlistList
- [ ] Write unit tests (80%+ coverage)
- [ ] Write integration tests
- [ ] Performance profiling and optimization

### Phase 3: Validation & Deployment
- [ ] Manual testing of all user stories
- [ ] Performance verification (<1s initial load, ≥30 fps scroll)
- [ ] Accessibility testing (screen reader, keyboard)
- [ ] Cross-browser testing (Chrome, Firefox, Safari, Edge)
- [ ] Document lessons learned

---

## File Structure

```
src/
├── components/
│   ├── LazyLoadingGrid.tsx          [MODIFY existing]
│   ├── SkeletonCard.tsx             [CREATE new]
│   ├── AvailableGrid.tsx            [MODIFY to use LazyLoadingGrid]
│   ├── CollectionList.tsx           [MODIFY to use LazyLoadingGrid]
│   ├── WishlistList.tsx             [MODIFY to use LazyLoadingGrid]
│   └── PokemonCard.tsx              [NO CHANGES]
│
├── hooks/
│   └── useLazyRender.ts             [CREATE new]
│
├── services/
│   └── lazyRenderService.ts         [CREATE new]
│
└── styles/
    └── theme.ts                     [NO CHANGES]

tests/
├── unit/
│   ├── hooks/
│   │   └── useLazyRender.test.ts    [CREATE new]
│   └── services/
│       └── lazyRenderService.test.ts [CREATE new]
│
└── integration/
    └── lazy-loading-grid.test.jsx   [CREATE new]
```

---

## Step-by-Step Implementation Guide

### Step 1: Create LazyRenderService (Low-Level)

**File**: `src/services/lazyRenderService.ts`

**Responsibility**: Manage IntersectionObserver instance and coordinate render batching.

**Key Methods**:
- `initialize(items)`: Set up observer, calculate initial visible set
- `destroy()`: Disconnect observer, clean up resources
- `getVisibleIndices()`: Return Set of currently visible card indices
- `setEnabled(boolean)`: Toggle lazy rendering on/off
- `on/off(event, callback)`: Event subscription

**Test Strategy**:
- Mock IntersectionObserver for unit tests
- Test initialization, destruction, visibility calculations
- Test event batching and debouncing
- Test error cases (missing container, no support)

**Example Implementation Skeleton**:
```typescript
export class LazyRenderService {
  private observer: IntersectionObserver | null = null;
  private visibleIndices = new Set<number>();
  private cardRenderQueue = new CardRenderQueue();
  private eventEmitter = new EventEmitter();
  
  constructor(
    private container: HTMLElement,
    private config: IntersectionObserverConfig
  ) {}
  
  initialize(items: any[]): void {
    // 1. Feature detection for IntersectionObserver
    // 2. Create observer with config
    // 3. Observe all card elements (via querySelectorAll)
    // 4. Calculate initial visible set
    // 5. Emit 'renderStart' event
  }
  
  destroy(): void {
    // 1. Disconnect observer
    // 2. Clear all Sets
    // 3. Remove event listeners
  }
  
  getVisibleIndices(): Set<number> {
    return new Set(this.visibleIndices);
  }
  
  // [implement other methods]
}
```

### Step 2: Create useLazyRender Hook

**File**: `src/hooks/useLazyRender.ts`

**Responsibility**: React hook wrapper around LazyRenderService, managing service lifecycle and state.

**Key Logic**:
- Initialize service on mount
- Create Ref to container element
- Return visibleIndices to component
- Handle props changes (items, threshold, enabled)
- Cleanup on unmount

**Test Strategy**:
- Test hook initialization with useRef
- Test visible indices updates when items change
- Test lazy rendering threshold (<50 render all)
- Test error handling (missing container, no support)
- Test cleanup on unmount

**Example Implementation Skeleton**:
```typescript
export function useLazyRender<T extends { id?: number }>(
  items: T[],
  containerRef: React.RefObject<HTMLDivElement>,
  options?: Partial<LazyRenderOptions>
): UseLazyRenderReturn {
  const [visibleIndices, setVisibleIndices] = useState<Set<number>>(new Set());
  const serviceRef = useRef<LazyRenderService | null>(null);
  
  // Initialize service on mount
  useEffect(() => {
    if (!containerRef.current) return;
    
    const service = new LazyRenderService(containerRef.current, {
      // config from options
    });
    
    service.initialize(items);
    service.on('visibleChanged', setVisibleIndices);
    
    serviceRef.current = service;
    return () => service.destroy();
  }, [containerRef, items, options]);
  
  return {
    visibleIndices,
    // other return values
  };
}
```

### Step 3: Create SkeletonCard Component

**File**: `src/components/SkeletonCard.tsx`

**Responsibility**: Placeholder card for unrealized items, prevents layout shift.

**Key Features**:
- Fixed dimensions matching PokemonCard (140px × 180px)
- Animated pulse effect using Chakra Skeleton
- Aria-busy attribute for accessibility
- CSS containment for performance

**Implementation**:
```typescript
export function SkeletonCard() {
  return (
    <Box
      width="140px"
      height="180px"
      borderRadius="md"
      css={{ contain: 'layout paint' }}
    >
      <Skeleton height="100px" mb={2} />
      <Skeleton height="20px" mb={2} />
      <Skeleton height="16px" width="80%" />
    </Box>
  );
}
```

### Step 4: Enhance LazyLoadingGrid Component

**File**: `src/components/LazyLoadingGrid.tsx`

**Current State**: May have basic scroll detection; needs enhancement.

**Changes**:
1. Replace scroll listener with useLazyRender hook
2. Accept children render function with isVisible param
3. Render SkeletonCard for non-visible items
4. Pass through lazy rendering options

**Example**:
```typescript
export function LazyLoadingGrid({
  items,
  children,
  lazy = true,
  ...chakraProps
}: LazyLoadingGridProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  
  const { visibleIndices } = useLazyRender(items, containerRef, {
    enabled: lazy,
  });
  
  return (
    <SimpleGrid ref={containerRef} {...chakraProps}>
      {items.map((item, idx) => 
        visibleIndices.has(idx) 
          ? children(item, idx, true)
          : <SkeletonCard key={idx} />
      )}
    </SimpleGrid>
  );
}
```

### Step 5: Update Consumer Components

**Files**: 
- `src/components/AvailableGrid.tsx`
- `src/components/CollectionList.tsx`
- `src/components/WishlistList.tsx`

**Changes**: Use LazyLoadingGrid wrapper instead of direct Grid.

**Example Before**:
```typescript
<SimpleGrid columns={5} spacing={4}>
  {pokemonList.map((pokemon) => (
    <PokemonCard key={pokemon.id} {...pokemon} />
  ))}
</SimpleGrid>
```

**Example After**:
```typescript
<LazyLoadingGrid items={pokemonList} columns={5} spacing={4}>
  {(pokemon) => <PokemonCard key={pokemon.id} {...pokemon} />}
</LazyLoadingGrid>
```

### Step 6: Write Unit Tests

**Files**:
- `tests/unit/hooks/useLazyRender.test.ts`
- `tests/unit/services/lazyRenderService.test.ts`

**Coverage Goals**: 80%+ for critical logic

**Key Test Cases**:
```typescript
describe('useLazyRender', () => {
  test('returns visible indices on mount')
  test('updates visible indices on scroll')
  test('renders all items when count < 50')
  test('enables lazy rendering when count >= 50')
  test('resets on items change')
  test('handles missing IntersectionObserver')
  test('cleans up on unmount')
})

describe('LazyRenderService', () => {
  test('initializes observer with correct config')
  test('batches multiple intersection events')
  test('maintains scroll position (no unmounting)')
  test('disconnects observer on destroy')
})
```

### Step 7: Write Integration Tests

**File**: `tests/integration/lazy-loading-grid.test.jsx`

**Test Scenarios**:
1. Full page load → initial viewport renders in <1s
2. Scroll down → cards render before entering view
3. Rapid scroll → maintains 30+ fps
4. Search filter → transitions from lazy to all-render
5. Resize window → recalculates visible set
6. Accessibility → screen reader announces changes

**Example**:
```typescript
test('renders initial viewport within 1 second', async () => {
  const start = performance.now();
  render(<LazyLoadingGrid items={1000 pokemon} />);
  const end = performance.now();
  
  expect(end - start).toBeLessThan(1000);
  expect(screen.getAllByTestId('pokemon-card')).toHaveLength(30);
});
```

### Step 8: Performance Profiling

**Tools**:
- Chrome DevTools Performance tab
- React DevTools Profiler
- Lighthouse audit
- Custom performance marks via Performance API

**Success Criteria**:
- ✅ Initial render: <1 second
- ✅ Scroll frame rate: ≥30 fps
- ✅ Memory delta: <50MB for 1025 cards
- ✅ Search filter <50 items: instant render

---

## Key Design Patterns

### Pattern 1: Debounced Intersection Events

IntersectionObserver can fire many events per second. Use debouncing:

```typescript
// In service
private debounceTimer: ReturnType<typeof setTimeout> | null = null;

private onIntersect = (entries: IntersectionObserverEntry[]) => {
  clearTimeout(this.debounceTimer);
  
  this.debounceTimer = setTimeout(() => {
    const newIndices = entries
      .filter(e => e.isIntersecting)
      .map(e => parseInt(e.target.getAttribute('data-index')));
    
    this.visibleIndices.add(...newIndices);
    this.eventEmitter.emit('visibleChanged', this.visibleIndices);
  }, 100);
};
```

### Pattern 2: Conditional Rendering Based on Visibility

```typescript
// In component
{items.map((item, idx) => 
  visibleIndices.has(idx)
    ? <PokemonCard key={idx} {...item} />
    : <SkeletonCard key={idx} />
)}
```

### Pattern 3: Feature Detection with Fallback

```typescript
// In service
const hasSupport = typeof window !== 'undefined' && 
  'IntersectionObserver' in window;

if (!hasSupport) {
  console.warn('IntersectionObserver not supported; rendering all items');
  this.visibleIndices = new Set(items.map((_, idx) => idx));
  return;
}
```

---

## Performance Optimization Tips

### 1. React.memo on PokemonCard
Already applied (verify in existing code).

### 2. CSS Containment
```css
contain: layout paint;  /* Isolate card layout */
```

### 3. Batch DOM Updates
Don't update visible set on every intersection event; debounce and batch.

### 4. Avoid Layout Thrashing
Read viewport dimensions once per event batch, not per card.

### 5. Profile During Development
```typescript
performance.mark('render-start');
// render cards
performance.mark('render-end');
performance.measure('render', 'render-start', 'render-end');
```

---

## Debugging & Monitoring

### Development Mode

Enable debug logging:
```typescript
useLazyRender(items, ref, { debug: true })
```

Console output:
```
[LazyRender] Initializing with 1025 items
[LazyRender] Viewport: 1920x1080, scroll: 0
[LazyRender] Buffer zone: indices 0-35
[LazyRender] Rendering 30 cards
[LazyRender] Event: visibleChanged (35 total)
```

### React DevTools Profiler
Profile LazyLoadingGrid component to see:
- Initial render time
- Re-render frequency on scroll
- Component that causes re-renders

### Chrome DevTools Performance Tab
1. Open Performance tab
2. Record page load
3. Check for:
   - Long tasks (should be <50ms batches)
   - Layout shifts (should be minimal)
   - Frame rate (should stay ≥30fps)

### Memory Profiling
```javascript
// In browser console
performance.memory.usedJSHeapSize / 1024 / 1024  // MB

// Before scroll: ~20MB
// After scrolling 100 cards: ~40MB
// Should not exceed 100MB
```

---

## Common Pitfalls & Solutions

| Pitfall | Cause | Solution |
|---------|-------|----------|
| **All cards render, no skeleton** | useLazyRender not called or disabled | Check items.length >= 50 threshold |
| **Scroll stuttering** | Rendering too many cards per event | Increase debounceMs, reduce maxBatchSize |
| **Skeleton never disappears** | visibleIndices never updates | Check IntersectionObserver events firing |
| **Memory grows unbounded** | Old service instance never destroyed | Call cleanup in useEffect return |
| **Search results all render** | Threshold is 50, but results are 100+ | Feature working as designed |
| **Layout shift visible** | Skeleton dimensions wrong | Verify SkeletonCard is 140×180px |

---

## Success Metrics

After implementation, verify:

| Metric | Target | How to Measure |
|--------|--------|----------------|
| Initial Load | <1s | DevTools Performance tab, Lighthouse |
| Scroll FPS | ≥30 fps | DevTools Performance tab, slow motion |
| Memory Growth | <50MB / 100 cards | DevTools Memory tab, measure before/after |
| Search <50 | Instant | Manual test with "char" filter (returns 22) |
| Search ≥50 | Lazy render | Manual test with "" filter (returns 1025) |
| Accessibility | WCAG AA | axe DevTools, screen reader test |
| Cross-browser | Chrome, FF, Safari, Edge | Manual testing on each |

---

## Testing Checklist

Before considering implementation complete:

- [ ] Unit tests: 80%+ coverage (hook, service)
- [ ] Integration tests: All user stories validated
- [ ] Performance tests: <1s initial, ≥30fps scroll
- [ ] Accessibility: ARIA attributes, screen reader
- [ ] Browser compat: Chrome 51+, FF 55+, Safari 12.1+, Edge 79+
- [ ] Search integration: <50 items render all, ≥50 lazy render
- [ ] Edge cases: Rapid scroll, resize, search changes
- [ ] Memory: <100MB for 1025 cards
- [ ] Console: No errors or warnings
- [ ] Code: Lints cleanly, TypeScript strict mode

---

## Next Steps

1. **Review** data-model.md and contracts (this document's prerequisites)
2. **Implement** in order: LazyRenderService → useLazyRender → SkeletonCard → LazyLoadingGrid
3. **Test** after each step (unit tests first)
4. **Integrate** into AvailableGrid, CollectionList, WishlistList
5. **Validate** against success criteria
6. **Deploy** to main branch after code review

---

## Additional Resources

- [MDN: IntersectionObserver API](https://developer.mozilla.org/en-US/docs/Web/API/Intersection_Observer_API)
- [React Hooks: useEffect cleanup](https://react.dev/reference/react/useEffect#cleaning-up-an-effect)
- [Chakra UI: Skeleton](https://chakra-ui.com/docs/components/skeleton)
- [Web.dev: Web Vitals](https://web.dev/vitals/)
- [Constitution: Development Standards](../../.specify/memory/constitution.md)

---

**Status**: Phase 1 complete. Ready for Phase 2 (Implementation).
