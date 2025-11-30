# Quickstart: Sticky Search Bar Feature

**Feature**: `002-sticky-search-bar`  
**Branch**: `002-sticky-search-bar`  
**Status**: Ready for implementation (Phase 1 complete)

---

## Development Setup

### Prerequisites
- Node.js 18+ (check: `node --version`)
- pnpm 9+ (check: `pnpm --version`)
- Git with branch `002-sticky-search-bar` checked out

### Installation
```bash
# Navigate to workspace
cd /home/markus/workspace/pokemon-collector

# Ensure branch is active
git checkout 002-sticky-search-bar

# Install dependencies (if not already done)
pnpm install

# Verify dependencies
pnpm list | grep -E "react|vite|vitest"
```

### Environment Verification
```bash
# Check Node.js version
node --version  # Should be v18.0.0+

# Check TypeScript version
pnpm list typescript  # Should be 5.9+

# Check React version
pnpm list react  # Should be 19.0.0+

# Check build tool
pnpm list vite  # Should be 7.0.0+
```

---

## Running the Development Server

### Start Vite Dev Server
```bash
pnpm dev
# Output: VITE v7.x ready in XXX ms
#         ➜  Local:   http://localhost:5174/
#         ➜  press h + enter to show help
```

### Access Application
- **Local**: http://localhost:5174
- **Network**: http://<your-ip>:5174 (for mobile testing)
- **HMR**: Hot Module Replacement enabled (auto-refresh on file save)

### Stop Dev Server
```bash
# Press Ctrl+C in terminal
^C
```

---

## Testing Strategy

### Test Pyramid

```
                  ▲
                 /│\
                / │ \
               /  │  \
              /   │   \  e2e (browser automation) - not in scope
             /────┼────\
            /     │     \
           /  Integration  \
          /   / Search     \
         /   / Sticky      \
        /   / Performance  \
       /────────┼────────────\
      /         │           \
     /          │            \
    /     Unit Tests          \
   /   / Components           \
  /   / Hooks                 \
 /   / Services               \
/─────────────────────────────\
```

**Target Coverage**: 85% (unit + integration combined)

### Unit Tests

#### StickySearchBar Component Tests
```bash
pnpm test tests/unit/components/StickySearchBar.test.jsx

# Test cases:
# ✓ renders with default props
# ✓ onChange callback fires on keystroke
# ✓ shows clear button when input has text
# ✓ sticky positioning CSS applied
# ✓ Escape key clears search
# ✓ ariaLabel accessibility prop
```

**File**: `tests/unit/components/StickySearchBar.test.jsx` (NEW)

**Key assertions**:
```javascript
// Example test
test('renders input with placeholder', () => {
  render(<StickySearchBar 
    value="" 
    onChange={jest.fn()}
    onClear={jest.fn()}
  />)
  
  const input = screen.getByPlaceholderText('Search Pokemon by name...')
  expect(input).toBeInTheDocument()
  expect(input).toHaveAttribute('aria-label', 'Search Pokemon by name')
})
```

#### useDebounce Hook Tests
```bash
pnpm test tests/unit/hooks/useDebounce.test.js

# Test cases:
# ✓ debounces value after delay
# ✓ resets timer on rapid changes
# ✓ cleans up on unmount
# ✓ isDebouncing state correct
```

**File**: `tests/unit/hooks/useDebounce.test.js` (NEW)

**Key assertions**:
```javascript
test('debounces value after 300ms', () => {
  const { result } = renderHook(() => useDebounce('pika', 300))
  
  expect(result.current.debouncedValue).toBe('initial_value')
  expect(result.current.isDebouncing).toBe(true)
  
  act(() => jest.advanceTimersByTime(300))
  
  expect(result.current.debouncedValue).toBe('pika')
  expect(result.current.isDebouncing).toBe(false)
})
```

#### App Component Refactor Tests
Update existing App test to cover new state:
```bash
pnpm test tests/unit/components/App.test.jsx

# Additional test cases:
# ✓ search state initialized
# ✓ search query state updates on input
# ✓ search results filter grids correctly
```

**File**: `tests/unit/components/App.test.jsx` (REFACTOR)

---

### Integration Tests

#### Search Flow (User Story 4)
```bash
pnpm test tests/integration/search.us4.test.jsx

# Test cases:
# ✓ Search triggers when 3+ characters typed
# ✓ Search does NOT trigger with 1-2 characters
# ✓ Clear button clears search and resets grids
# ✓ Search results with 0 matches
# ✓ Rapid search queries handled correctly
```

**File**: `tests/integration/search.us4.test.jsx` (EXTEND)

**Setup**:
```javascript
describe('US4: Search Pokemon by Name', () => {
  beforeEach(() => {
    render(<App />)
  })
  
  test('filters to matching Pokemon after 3+ chars', async () => {
    const input = screen.getByPlaceholderText('Search Pokemon by name...')
    
    // Type "pika" (4 chars)
    await userEvent.type(input, 'pika')
    
    // Wait for debounce (300ms)
    await waitFor(() => {
      expect(screen.getByText('Pikachu')).toBeInTheDocument()
    }, { timeout: 500 })
    
    // Verify grids filtered
    expect(screen.queryByText('Charmander')).not.toBeInTheDocument()
  })
})
```

#### Sticky Scroll Behavior
```bash
pnpm test tests/integration/sticky-scroll.test.jsx

# Test cases:
# ✓ Search bar stays sticky when scrolling down
# ✓ Search bar unsticks when scrolling back to header
# ✓ Gap maintained between search and grid (8px)
# ✓ No layout shift (CLS = 0)
```

**File**: `tests/integration/sticky-scroll.test.jsx` (NEW)

**Setup**:
```javascript
test('search bar stays sticky when scrolling', async () => {
  render(<App />)
  
  // Scroll past header (header height = 60px)
  window.scrollY = 100
  fireEvent.scroll(window, { y: 100 })
  
  const searchSection = screen.getByRole('region').parentElement
  const computedStyle = window.getComputedStyle(searchSection)
  
  expect(computedStyle.position).toBe('sticky')
  expect(computedStyle.top).toBe('0px')
})
```

#### All Integration Tests
```bash
# Run all integration tests for this feature
pnpm test tests/integration/ -t "US4|sticky|search"

# Or run all integration tests
pnpm test tests/integration/
```

---

### Accessibility Tests

```bash
pnpm test tests/integration/a11y-search.test.jsx

# Test cases:
# ✓ Search input has proper ARIA labels
# ✓ Keyboard Tab navigation works
# ✓ Escape key clears search
# ✓ Screen reader announces results
# ✓ Focus indicator visible (contrast >= 3:1)
```

**File**: `tests/integration/a11y-search.test.jsx` (NEW)

**Key assertions**:
```javascript
test('search input has ARIA label', () => {
  render(<StickySearchBar 
    value="" 
    onChange={() => {}}
    onClear={() => {}}
    ariaLabel="Search Pokemon by name"
  />)
  
  const input = screen.getByRole('textbox', { name: /search pokemon/i })
  expect(input).toHaveAttribute('aria-label')
})

test('keyboard Escape clears search', async () => {
  const { getByRole } = render(<StickySearchBar 
    value="pika"
    onChange={() => {}}
    onClear={() => {}}
  />)
  
  const input = getByRole('textbox')
  input.focus()
  await userEvent.keyboard('{Escape}')
  
  expect(input).toHaveValue('')
})
```

---

### Performance Tests

```bash
pnpm test tests/integration/search-performance.test.jsx

# Test cases:
# ✓ Search completes within 350ms (debounce + render)
# ✓ No memory leaks in debounce cleanup
# ✓ Sticky scroll at 60 FPS with no jank
```

**File**: `tests/integration/search-performance.test.jsx` (NEW)

**Key assertions**:
```javascript
test('search completes within 350ms', async () => {
  render(<App />)
  const input = screen.getByPlaceholderText('Search Pokemon by name...')
  
  const startTime = performance.now()
  await userEvent.type(input, 'pika')
  
  await waitFor(() => {
    expect(screen.getByText('Pikachu')).toBeInTheDocument()
  })
  const endTime = performance.now()
  
  expect(endTime - startTime).toBeLessThan(350)
})
```

---

## Full Test Suite Execution

### Run All Tests
```bash
pnpm test

# Output example:
# ✓ tests/unit/components/StickySearchBar.test.jsx (6)
# ✓ tests/unit/hooks/useDebounce.test.js (7)
# ✓ tests/integration/search.us4.test.jsx (5)
# ✓ tests/integration/sticky-scroll.test.jsx (4)
# ✓ tests/integration/a11y-search.test.jsx (6)
# ✓ tests/integration/search-performance.test.jsx (3)
#
# Test Files  6 passed (6)
# Tests      31 passed (31)
# Coverage   85% statements | 82% branches | 87% functions | 84% lines
```

### Run Tests in Watch Mode
```bash
pnpm test -- --watch

# Watches for file changes; re-runs affected tests automatically
# Press 'q' to quit watch mode
```

### Run Specific Test File
```bash
pnpm test tests/integration/search.us4.test.jsx
```

### Run Tests Matching Pattern
```bash
pnpm test -t "Search triggers when"  # Single test
pnpm test -t "sticky"                # All tests with "sticky" in name
```

### Generate Coverage Report
```bash
pnpm test -- --coverage

# Output: HTML report in coverage/index.html
# Shows line coverage, branch coverage, function coverage
```

---

## Building for Production

### Production Build
```bash
pnpm build

# Output example:
# ✓ 1234 modules transformed
# dist/index.html       1.2 kB
# dist/index-xxx.js   185.3 kB (gzipped: 42.1 kB)
# dist/index-xxx.css   12.5 kB (gzipped: 3.2 kB)
```

### Preview Production Build
```bash
pnpm preview

# Starts local server with optimized build
# Output: ➜  Local:   http://localhost:4173/
```

---

## Development Workflow

### Feature Branch Workflow
```bash
# Ensure on feature branch
git branch -v
# * 002-sticky-search-bar

# Create feature work
# 1. Create components (StickySearchBar.tsx, useDebounce.ts)
# 2. Refactor App.tsx for layout
# 3. Update CSS (App.css, components.css)
# 4. Write tests alongside implementation

# Commit work incrementally
git add src/components/StickySearchBar.tsx
git commit -m "feat: add StickySearchBar component with sticky positioning"

git add src/hooks/useDebounce.ts
git commit -m "feat: add useDebounce hook with 300ms debounce"

git add src/components/App.tsx
git commit -m "refactor: restructure App layout to single-column vertical"

git add src/styles/App.css src/styles/components.css
git commit -m "style: update CSS for sticky search and refactored layout"

git add tests/
git commit -m "test: add unit and integration tests for search feature"
```

### Incremental Testing
```bash
# Test after each component implementation
pnpm test tests/unit/components/StickySearchBar.test.jsx

# Test after hook implementation
pnpm test tests/unit/hooks/useDebounce.test.js

# Test after App refactor
pnpm test tests/unit/components/App.test.jsx

# Test integration
pnpm test tests/integration/search.us4.test.jsx

# Full test suite before commit
pnpm test
```

### Code Quality
```bash
# Lint code
pnpm lint

# Type checking
pnpm type-check

# Both
pnpm test && pnpm lint && pnpm type-check
```

---

## Debugging

### VS Code Debug Configuration
Create `.vscode/launch.json`:
```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "chrome",
      "request": "launch",
      "name": "Launch Chrome",
      "url": "http://localhost:5174",
      "webRoot": "${workspaceFolder}/src",
      "skipFiles": ["<node_internals>/**"]
    }
  ]
}
```

### Browser DevTools
1. Open http://localhost:5174 in Chrome/Firefox
2. Press F12 (DevTools)
3. React DevTools extension helpful for inspecting component state
4. Performance tab for measuring search latency

### Console Logging
```javascript
// In StickySearchBar.tsx
console.log('Search query:', searchQuery)
console.log('Debounced value:', debouncedValue)
console.log('Is debouncing:', isDebouncing)
```

### Test Debugging
```bash
# Run single test with debugging
node --inspect-brk ./node_modules/.bin/vitest search.us4.test.jsx

# Or in VS Code: Vitest extension
# Set breakpoints in test file
# Click "Debug" button on test
```

---

## Common Tasks

### Add a New Component Test
```bash
# Create test file
touch tests/unit/components/MyComponent.test.jsx

# Add test template
cat > tests/unit/components/MyComponent.test.jsx << 'EOF'
import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import MyComponent from '../../../src/components/MyComponent'

describe('MyComponent', () => {
  it('renders correctly', () => {
    render(<MyComponent />)
    expect(screen.getByRole('region')).toBeInTheDocument()
  })
})
EOF

# Run test
pnpm test tests/unit/components/MyComponent.test.jsx
```

### Update Existing Test
```javascript
// tests/unit/components/App.test.jsx
import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import App from '../../../src/components/App'

describe('App', () => {
  it('renders search bar', () => {
    render(<App />)
    // Add new assertion
    expect(screen.getByPlaceholderText('Search Pokemon by name...')).toBeInTheDocument()
  })
})
```

### View Test Coverage
```bash
pnpm test -- --coverage

# Open coverage report
open coverage/index.html  # macOS
xdg-open coverage/index.html  # Linux
start coverage/index.html  # Windows
```

---

## Performance Baseline

### Metrics to Track

| Metric | Target | Measurement Method |
|--------|--------|-------------------|
| Search latency | < 350ms | keystroke → result visible |
| Debounce delay | 300ms | design choice |
| Frame rate (sticky scroll) | ≥ 55 FPS | DevTools Performance tab |
| Input responsiveness | < 16ms | keystroke → onChange fire |
| Memory usage | stable | heap snapshot analysis |

### Measuring Search Latency
```javascript
// In test
const startTime = performance.now()
await userEvent.type(input, 'pika')
await waitFor(() => {
  expect(screen.getByText('Pikachu')).toBeInTheDocument()
})
const endTime = performance.now()

console.log(`Search latency: ${endTime - startTime}ms`)
expect(endTime - startTime).toBeLessThan(350)
```

### Measuring Scroll Performance
1. Open DevTools → Performance tab
2. Start recording
3. Scroll grid content
4. Stop recording
5. Check FPS graph (should be mostly green, ≥ 55 FPS)

---

## Browser Compatibility

### Target Browsers

| Browser | Version | Status | Notes |
|---------|---------|--------|-------|
| Chrome | Latest | ✅ Supported | CSS sticky works natively |
| Firefox | Latest | ✅ Supported | CSS sticky works natively |
| Safari | Latest | ✅ Supported | CSS sticky works natively |
| Edge | Latest | ✅ Supported | Chromium-based |

### Testing on Different Browsers
```bash
# Manual testing
pnpm dev
# Open http://localhost:5174 in each browser

# Or use responsive design mode (DevTools)
# F12 → Responsive Design Mode → Select device/size
```

---

## Rollback Plan

### If Issues Found After Merge
```bash
# If critical bug discovered after feature branch merged to main:

# 1. Create hotfix branch
git checkout -b hotfix/search-bar-critical-fix main

# 2. Fix issue
# (edit affected files)

# 3. Test thoroughly
pnpm test

# 4. Merge to main and update docs
git checkout main
git merge --no-ff hotfix/search-bar-critical-fix

# OR completely revert feature if necessary
git revert <commit-hash>

# 5. Update branch tracking
git branch -d hotfix/search-bar-critical-fix
```

---

## Next Steps (Phase 2)

After Phase 1 (design) is complete:

1. **Code Implementation**
   - Create StickySearchBar.tsx component
   - Create useDebounce.ts hook
   - Refactor App.tsx and CSS
   - Implement search integration

2. **Test Development**
   - Write unit tests for components/hooks
   - Write integration tests for flows
   - Add accessibility and performance tests

3. **Code Review**
   - Peer review pull request
   - Address feedback
   - Verify all tests pass (CI/CD)

4. **Integration**
   - Merge to main branch
   - Update user documentation
   - Deploy to production (if applicable)

---

## Support & Documentation

### Files to Reference
- **Feature Spec**: `specs/002-sticky-search-bar/spec.md`
- **Data Model**: `specs/002-sticky-search-bar/data-model.md`
- **API Contracts**: `specs/002-sticky-search-bar/contracts/search-bar-api.yaml`
- **Implementation Plan**: `specs/002-sticky-search-bar/plan.md`
- **Research**: `specs/002-sticky-search-bar/research.md`

### Related Code
- `src/services/pokemonService.ts` - Search utility to reuse
- `src/hooks/useCollection.ts` - Existing hook pattern to follow
- `tests/unit/components/App.test.jsx` - Test patterns

### Getting Help
- Check existing tests for patterns
- Refer to React Testing Library docs: https://testing-library.com/docs/react-testing-library/intro
- Vitest docs: https://vitest.dev/

