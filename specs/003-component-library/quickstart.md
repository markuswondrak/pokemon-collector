# Quick Start: Component Library Integration

**Phase**: 1 (Design & Implementation)  
**Duration**: 3 weeks (Phases 1-3)  
**Target Audience**: Development team implementing Chakra UI integration

---

## Overview

This guide walks through the three-phase migration from custom CSS to Chakra UI. Each phase is independently testable and deployable.

**Key Principle**: No breaking changes to existing functionality. Only styling layer updates.

---

## Pre-Implementation Checklist

- [ ] Node.js 18+ installed (`node --version`)
- [ ] pnpm 8+ installed (`pnpm --version`)
- [ ] Workspace at clean state (no uncommitted changes)
- [ ] Branch `003-component-library` created and checked out
- [ ] All existing tests passing (`pnpm test --run`)
- [ ] Bundle size baseline measured (`pnpm build` and record dist/ size)

---

## Phase 1: Infrastructure & Input Components (Week 1)

### Goal
Set up Chakra UI provider, configure theme, create test utilities. Migrate search bar and input fields.

### Step 1: Install Dependencies

```bash
cd /home/markus/workspace/pokemon-collector

# Install Chakra UI and dependencies
pnpm add @chakra-ui/react @emotion/react @emotion/styled framer-motion

# (Optional) Install accessibility testing tools
pnpm add -D @axe-core/react vitest-axe
```

**Verification**:
```bash
pnpm ls | grep chakra  # Should show @chakra-ui/react version
```

### Step 2: Create Theme Configuration

**File**: `src/styles/theme.ts`

```typescript
import { extendTheme } from '@chakra-ui/react'

const theme = extendTheme({
  colors: {
    pokemon: {
      teal: '#1ba098',
      gold: '#ffd700',
    },
  },

  space: {
    px: '1px',
    0: '0',
    1: '4px',
    2: '8px',
    3: '12px',
    4: '16px',
    6: '24px',
    8: '32px',
    12: '48px',
    16: '64px',
  },

  fonts: {
    body: '"Open Sans", system-ui, -apple-system, sans-serif',
    heading: '"Open Sans", system-ui, -apple-system, sans-serif',
    mono: '"Fira Code", monospace',
  },

  fontSizes: {
    xs: '12px',
    sm: '14px',
    md: '16px',
    lg: '20px',
    xl: '24px',
    '2xl': '32px',
    '3xl': '40px',
  },

  fontWeights: {
    normal: 400,
    semibold: 600,
    bold: 700,
  },

  radii: {
    none: '0',
    sm: '4px',
    base: '8px',
    md: '12px',
    lg: '16px',
    full: '9999px',
  },

  shadows: {
    sm: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
    base: '0 2px 8px 0 rgba(0, 0, 0, 0.1)',
    md: '0 4px 12px 0 rgba(0, 0, 0, 0.15)',
    lg: '0 8px 24px 0 rgba(0, 0, 0, 0.2)',
    xl: '0 16px 32px 0 rgba(0, 0, 0, 0.25)',
  },

  components: {
    Button: {
      baseStyle: {
        fontWeight: 600,
        borderRadius: '0.5rem',
      },
      variants: {
        primary: {
          bg: 'pokemon.teal',
          color: 'white',
          _hover: { bg: 'pokemon.teal', opacity: 0.9 },
        },
        secondary: {
          bg: 'gray.200',
          color: 'gray.900',
          _hover: { bg: 'gray.300' },
        },
        destructive: {
          bg: 'red.500',
          color: 'white',
          _hover: { bg: 'red.600' },
        },
      },
    },
  },
})

export default theme
```

### Step 3: Setup ChakraProvider

**File**: `src/main.tsx`

```typescript
import React from 'react'
import ReactDOM from 'react-dom/client'
import { ChakraProvider } from '@chakra-ui/react'
import theme from './styles/theme'
import App from './components/App'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ChakraProvider theme={theme}>
      <App />
    </ChakraProvider>
  </React.StrictMode>
)
```

### Step 4: Create Test Utilities

**File**: `tests/test-utils.tsx`

```typescript
import { ReactElement } from 'react'
import { render, RenderOptions } from '@testing-library/react'
import { ChakraProvider } from '@chakra-ui/react'
import theme from '@/styles/theme'

const AllTheProviders = ({ children }: { children: React.ReactNode }) => (
  <ChakraProvider theme={theme}>
    {children}
  </ChakraProvider>
)

const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => render(ui, { wrapper: AllTheProviders, ...options })

export * from '@testing-library/react'
export { customRender as render }
```

### Step 5: Migrate StickySearchBar Component

**Before** (`src/components/StickySearchBar.tsx` with custom CSS):
```tsx
// Custom styling with CSS classes
<input className={styles.searchInput} ... />
<button className={styles.searchButton} ... />
```

**After** (Using Chakra):
```tsx
import { Input, Button, Box, VStack } from '@chakra-ui/react'

export function StickySearchBar({ value, onChange, onClear }) {
  return (
    <Box
      position="sticky"
      top={0}
      bg="white"
      zIndex={10}
      py={4}
      borderBottomWidth="1px"
      borderColor="gray.200"
      boxShadow="sm"
    >
      <VStack spacing={2} px={4}>
        <Input
          placeholder="Search Pokemon by name..."
          aria-label="Search for Pokemon"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          size="md"
          variant="outline"
        />
        {value && (
          <Button variant="secondary" size="sm" onClick={onClear}>
            Clear
          </Button>
        )}
      </VStack>
    </Box>
  )
}
```

### Step 6: Validation Gate 1

**Run Tests**:
```bash
pnpm test --run
# Expected: All tests pass, no failures
```

**Check Bundle Size**:
```bash
pnpm build
# Record size: dist/ size (should be ~10-20KB increase)
```

**Visual Verification**:
- [ ] Search bar appears at top of page
- [ ] Styling matches modern aesthetic (teal tint, clean spacing)
- [ ] Search input accepts text
- [ ] No console errors or warnings

**Acceptance**:
- [ ] All tests pass
- [ ] Bundle size increase ≤15%
- [ ] Visual regression check passed
- [ ] Design metrics verified (spacing, colors, contrast)

---

## Phase 2: Core Display Components (Week 2)

### Goal
Migrate PokemonCard, grids, and lazy loading components to Chakra.

### Step 7: Migrate PokemonCard Component

**After** (Using Chakra):
```tsx
import { Card, CardBody, Image, Text, Badge, Button, Box, VStack } from '@chakra-ui/react'

interface PokemonCardProps {
  pokemon: Pokemon
  isCollected: boolean
  onCollect: () => void
  onWishlist: () => void
}

export function PokemonCard({
  pokemon,
  isCollected,
  onCollect,
  onWishlist,
}: PokemonCardProps) {
  return (
    <Card variant="elevated" size="md">
      <CardBody>
        <VStack spacing={3} align="stretch">
          <Image
            src={pokemon.image}
            alt={pokemon.name}
            borderRadius="base"
            w="full"
            h="200px"
            objectFit="cover"
          />
          <Box>
            <Text fontWeight="bold" fontSize="lg">
              {pokemon.name}
            </Text>
            <Badge colorScheme="pokemon.teal" variant="solid">
              #{pokemon.index}
            </Badge>
          </Box>
          <VStack spacing={2} w="full">
            <Button
              variant={isCollected ? 'secondary' : 'primary'}
              w="full"
              onClick={onCollect}
            >
              {isCollected ? 'Collected' : 'Collect'}
            </Button>
            <Button variant="secondary" w="full" onClick={onWishlist}>
              Wishlist
            </Button>
          </VStack>
        </VStack>
      </CardBody>
    </Card>
  )
}
```

### Step 8: Migrate Grid Components

**AvailableGrid.tsx**:
```tsx
import { Grid, GridItem } from '@chakra-ui/react'
import { PokemonCard } from './PokemonCard'

export function AvailableGrid({ pokemon, onCollect, onWishlist }) {
  return (
    <Grid
      templateColumns={{ base: '1fr', md: '2fr', lg: '3fr' }}
      gap={4}
      w="full"
      p={4}
    >
      {pokemon.map((p) => (
        <GridItem key={p.index}>
          <PokemonCard
            pokemon={p}
            isCollected={false}
            onCollect={() => onCollect(p)}
            onWishlist={() => onWishlist(p)}
          />
        </GridItem>
      ))}
    </Grid>
  )
}
```

### Step 9: Update LazyLoadingGrid

The LazyLoadingGrid component already uses custom lazy loading logic. Wrap it with Chakra Grid:

```tsx
import { Grid, GridItem, Box } from '@chakra-ui/react'

export function LazyLoadingGrid({ items, renderItem }) {
  return (
    <Grid
      templateColumns={{ base: '1fr', md: '2fr', lg: '3fr' }}
      gap={4}
      w="full"
      p={4}
    >
      {items.map((item) => (
        <GridItem key={item.id}>
          {renderItem(item)}
        </GridItem>
      ))}
    </Grid>
  )
}
```

### Step 10: Validation Gate 2

**Run Tests**:
```bash
pnpm test --run
# Expected: All tests pass, integration tests for grids pass
```

**Visual Checks**:
- [ ] Pokemon cards display with correct spacing (8px scale)
- [ ] Grids are responsive (test at 320px, 768px, 1024px widths)
- [ ] Images load correctly
- [ ] Badges display with correct colors
- [ ] Buttons are interactive

**Lazy Loading Verification**:
- [ ] Cards render on scroll visibility
- [ ] No console errors from Intersection Observer
- [ ] Performance is smooth (60fps on scroll)

**Acceptance**:
- [ ] All tests pass
- [ ] No visual regressions
- [ ] Lazy loading works as before
- [ ] Responsive design verified
- [ ] Bundle size increase still ≤15% cumulative

---

## Phase 3: Supporting Components & Cleanup (Week 3)

### Goal
Migrate remaining components and remove custom CSS files.

### Step 11: Migrate CollectionList & WishlistList

Similar approach to AvailableGrid. Use Chakra Grid and PokemonCard components.

### Step 12: Update App.tsx Wrapper

Wrap your three-grid layout with Chakra Box/Container:

```tsx
import { Box, VStack, Container } from '@chakra-ui/react'

export function App() {
  return (
    <Box minH="100vh" bg="gray.50">
      <Container maxW="1400px">
        <VStack spacing={6} align="stretch" py={6}>
          {/* Grids */}
        </VStack>
      </Container>
    </Box>
  )
}
```

### Step 13: Remove Custom CSS Files

**Delete**:
- `src/styles/App.css`
- `src/styles/components.css`
- `src/styles/index.css` (if Chakra resets included)

**Keep**:
- `src/styles/theme.ts` (Chakra configuration)

### Step 14: Validation Gate 3 (Final)

**Run Complete Test Suite**:
```bash
pnpm test --run
pnpm test:coverage
# Expected: All tests pass, coverage ≥80%
```

**Build & Bundle Size Check**:
```bash
pnpm build
# Compare final size vs Phase 0 baseline
# Expected increase: ≤15%
```

**Visual & A11y Verification**:
```bash
# Run accessibility audit
pnpm test:a11y  # If configured with vitest-axe
# Run Lighthouse audit in Chrome DevTools
# Expected: No a11y violations, 90+ Lighthouse score
```

**Design Metrics**:
- [ ] All spacing uses 8px scale (verify via computed styles)
- [ ] All text meets 7:1 contrast (axe-core validation)
- [ ] All colors use theme tokens (no hardcoded colors)
- [ ] All border radius values from scale
- [ ] All shadows from elevation system

**Acceptance Checklist**:
- [ ] All tests pass (zero failures)
- [ ] 80%+ code coverage maintained
- [ ] No visual regressions vs baseline
- [ ] No console errors or warnings
- [ ] Bundle size increase ≤15% from Phase 0
- [ ] Accessibility compliant (WCAG 2.1 AA)
- [ ] Responsive design verified (320px-2560px)
- [ ] No custom CSS files in component directories
- [ ] All styling via theme.ts only

---

## Troubleshooting

### Issue: Chakra styles not applying

**Cause**: ChakraProvider missing or in wrong location  
**Solution**: Verify ChakraProvider wraps App in src/main.tsx

### Issue: TypeScript errors with Chakra props

**Cause**: Missing type definitions  
**Solution**: Ensure `@chakra-ui/react` is installed; check tsconfig.json includes @chakra-ui types

### Issue: Bundle size larger than expected

**Cause**: Importing entire Chakra (e.g., `import * as Chakra from '@chakra-ui/react'`)  
**Solution**: Import specific components (e.g., `import { Button, Box } from '@chakra-ui/react'`)

### Issue: Custom CSS still applies

**Cause**: CSS specificity conflicts with Chakra styles  
**Solution**: Remove custom CSS files; use theme customization instead

### Issue: Tests fail after migration

**Cause**: Tests using CSS selectors instead of accessible queries  
**Solution**: Update tests to use `getByRole`, `getByLabelText`, etc.

---

## Rollback Plan

If issues arise mid-phase:

1. **Phase 1 rollback**: Remove ChakraProvider, delete theme.ts, revert StickySearchBar
2. **Phase 2 rollback**: Revert Grid and Card migrations
3. **Phase 3 rollback**: Restore deleted CSS files (from git history)

**Command**:
```bash
git reset --hard HEAD~N  # Where N is number of commits to revert
```

---

## Post-Implementation

### Documentation
- [ ] Update component README with Chakra usage patterns
- [ ] Create Storybook stories for components (optional, for future)
- [ ] Document theme customization process

### Monitoring
- [ ] Track bundle size metric in CI/CD
- [ ] Set up Lighthouse CI for accessibility regression detection
- [ ] Monitor performance metrics (First Contentful Paint, etc.)

### Next Steps
- [ ] Consider dark mode implementation (via Chakra's color mode)
- [ ] Evaluate component library documentation generation
- [ ] Plan design system expansion for future features

---

## Success Criteria Summary

| Criterion | Target | Measurement |
|---|---|---|
| Test Coverage | ≥80% | `pnpm test:coverage` |
| Bundle Size | ≤15% increase | `pnpm build` dist/ size |
| Accessibility | WCAG 2.1 AA | axe-core, Lighthouse |
| Visual Consistency | Zero regressions | Visual comparison vs baseline |
| Design Metrics | All values from tokens | Computed styles audit |
| Performance | <50ms render latency | React DevTools Profiler |
| Responsive Design | 320px-2560px | Viewport testing at breakpoints |

---

**Phase 1 Complete**: ✅ Ready to begin Phase 2 (Core Components)
