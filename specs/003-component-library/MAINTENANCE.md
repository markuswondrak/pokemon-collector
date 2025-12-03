# Component Library Maintenance Guide

**Version**: 1.3.0  
**Date**: 2025-12-03  
**Scope**: Chakra UI v2.8+ integration in Pokemon Collector  
**Audience**: Development team, architects, future maintainers

---

## Table of Contents

1. [Version Management](#version-management)
2. [Upgrade Process](#upgrade-process)
3. [Theme Extension Patterns](#theme-extension-patterns)
4. [Component Deprecation Strategy](#component-deprecation-strategy)
5. [Breaking Change Handling](#breaking-change-handling)
6. [Dependency Management](#dependency-management)
7. [Performance Monitoring](#performance-monitoring)
8. [Troubleshooting](#troubleshooting)

---

## Version Management

### Current Versions

| Dependency | Version | Status | EOL |
|-----------|---------|--------|-----|
| Chakra UI | ^2.8.0 | Maintained | 2026-12+ |
| @emotion/react | ^11.11.0 | Maintained | 2025-12+ |
| @emotion/styled | ^11.11.0 | Maintained | 2025-12+ |
| framer-motion | ^10.16.0 | Maintained | 2025-12+ |
| React | ^19.2.0 | Current | 2025-12+ |

### Version Policy

- **Major versions** (2.x.x → 3.x.x): Requires full integration review and migration plan
- **Minor versions** (2.8.x → 2.9.x): Safe to upgrade; run full test suite before merging
- **Patch versions** (2.8.0 → 2.8.1): Safe to upgrade; apply immediately for security fixes

### Semantic Versioning

Pokemon Collector follows semantic versioning for this design system:

- **v1.3.0**: Initial Chakra UI v2.8 integration
- **v1.3.1**: Bug fixes and patch updates
- **v1.4.0**: New color tokens, component variants
- **v2.0.0**: Chakra UI v3.0 upgrade (breaking changes)

---

## Upgrade Process

### Pre-Upgrade Checklist

Before upgrading Chakra UI or related dependencies:

- [ ] Verify current test suite passes: `pnpm test --run`
- [ ] Document baseline bundle size: `pnpm build && ls -lh dist/`
- [ ] Create feature branch: `git checkout -b upgrade/chakra-vX.X.X`
- [ ] Review Chakra UI changelog: https://github.com/chakra-ui/chakra-ui/releases
- [ ] Check for breaking changes in dependency list
- [ ] Schedule upgrade during low-traffic periods (off-peak development)

### Minor Version Upgrade (Recommended Quarterly)

**Example: Upgrading from 2.8.0 → 2.9.0**

```bash
# 1. Update package.json
pnpm up @chakra-ui/react @emotion/react @emotion/styled framer-motion

# 2. Install new versions
pnpm install

# 3. Run full test suite (with isolated thread configuration)
pnpm test --run --threads --maxThreads=4

# 4. Rebuild and check bundle size
pnpm build
ls -lh dist/

# 5. If bundle size increased >5%, investigate:
npm install -g @vite/inspect
vite-inspect

# 6. Run linter
pnpm lint

# 7. Verify visual consistency with Lighthouse
# Open dist/index.html with python -m http.server

# 8. If all checks pass, commit and PR
git add package.json pnpm-lock.yaml
git commit -m "chore: upgrade Chakra UI to v2.9.0"
git push origin upgrade/chakra-vX.X.X
```

### Major Version Upgrade (Annual Review)

**Example: Upgrading from Chakra UI v2 → v3**

1. **Create detailed migration plan** (1-2 weeks lead time)
   - Review breaking changes in release notes
   - Identify affected components
   - Plan re-testing strategy
   - Estimate development time (typically 3-5 days)

2. **Create upgrade branch and document migration**
   ```bash
   git checkout -b upgrade/chakra-v3
   # Create UPGRADE_CHAKRA_V3.md with detailed migration steps
   ```

3. **Update dependencies in stages**
   - Update Chakra UI first: `pnpm up @chakra-ui/react@3`
   - Update peer dependencies: `pnpm up @emotion/react @emotion/styled`
   - Test after each update

4. **Address breaking changes**
   - Update component API calls if signatures changed
   - Verify theme configuration still valid
   - Test all responsive breakpoints
   - Validate accessibility features

5. **Full test cycle**
   ```bash
   pnpm test --run --threads --maxThreads=4
   pnpm build
   pnpm lint
   # Visual regression testing
   ```

6. **Performance baseline comparison**
   - Compare bundle size (target: <15% increase)
   - Profile component render times
   - Verify build time remains <1s

7. **Staged rollout**
   - Merge to development branch first
   - Run in staging environment for 1 week
   - Address any production issues
   - Deploy to production

### Rollback Procedure

If an upgrade introduces critical issues:

```bash
# 1. Revert to previous version
git revert <commit-hash>

# 2. Reinstall dependencies
pnpm install

# 3. Run test suite
pnpm test --run

# 4. Verify application works
pnpm dev

# 5. Document issue and create GitHub issue
# Example: "Chakra UI v2.9.0 breaks button focus states on Safari"

# 6. Schedule investigation for next sprint
```

---

## Theme Extension Patterns

### Adding New Colors

**Goal**: Extend the color palette without breaking existing components

**Pattern**:

```typescript
// src/styles/theme.ts

import { createSystem, defaultConfig, extendTheme } from '@chakra-ui/react'

export const theme = createSystem({
  ...defaultConfig,
  theme: extendTheme({
    tokens: {
      colors: {
        pokemon: {
          teal: { value: '#1BA098' },
          gold: { value: '#FFD700' },
          emerald: { value: '#50C878' }, // NEW: Add this color
        },
      },
    },
  }),
})
```

**Usage in components**:

```typescript
<Button backgroundColor="pokemon.emerald">Collect</Button>
<Box color="pokemon.teal">Text</Box>
```

**Validation**:

```bash
# 1. Run tests to ensure no regressions
pnpm test --run

# 2. Verify contrast with WebAIM
# Visit https://webaim.org/resources/contrastchecker/
# Enter hex values and verify ≥4.5:1 contrast on white

# 3. Test with color blindness simulator
# https://www.color-blindness.com/coblis-color-blindness-simulator/

# 4. Update documentation
# Add color to src/components/COMPONENT_PATTERNS.md
```

### Adding New Component Variants

**Goal**: Create new visual styles without modifying theme globally

**Pattern**:

```typescript
// src/styles/theme.ts

export const theme = createSystem({
  ...defaultConfig,
  theme: extendTheme({
    components: {
      Button: {
        variants: {
          pokemon: {
            bg: 'pokemon.teal',
            color: 'white',
            _hover: { bg: 'pokemon.teal', opacity: 0.8 },
            _active: { bg: 'pokemon.teal', opacity: 0.6 },
          },
        },
      },
    },
  }),
})
```

**Usage in components**:

```typescript
// This requires updating TypeScript types
// See Breaking Change Handling section

<Button variant="pokemon">Catch Pokemon</Button>
```

### Extending Border Radius

**Pattern**:

```typescript
export const theme = createSystem({
  ...defaultConfig,
  theme: extendTheme({
    tokens: {
      radii: {
        xs: { value: '4px' },
        sm: { value: '8px' },
        md: { value: '12px' },
        full: { value: '9999px' },
        xl: { value: '16px' },
      },
    },
  }),
})
```

**Validation**:

- Ensure only 4px, 8px, 12px, 16px, and 9999px are used
- Run visual regression tests to verify appearance

### Extending Shadows (Elevation System)

**Pattern**:

```typescript
export const theme = createSystem({
  ...defaultConfig,
  theme: extendTheme({
    tokens: {
      shadows: {
        '0': { value: 'none' },
        '1': { value: '0 1px 2px rgba(0, 0, 0, 0.05)' },
        '2': { value: '0 2px 4px rgba(0, 0, 0, 0.08)' },
        '3': { value: '0 4px 8px rgba(0, 0, 0, 0.12)' },
        '4': { value: '0 8px 16px rgba(0, 0, 0, 0.15)' },
        '5': { value: '0 12px 24px rgba(0, 0, 0, 0.18)' },
      },
    },
  }),
})
```

**Validation**:

- Test shadow appearance on light and dark backgrounds
- Verify no accessibility issues (shadows shouldn't affect contrast)

---

## Component Deprecation Strategy

### Marking Components as Deprecated

When a component needs to be removed or replaced:

**Step 1**: Add deprecation notice to component

```typescript
/**
 * @deprecated Use `NewComponent` instead
 * This component will be removed in v2.0.0 (estimated: 2026-06)
 * 
 * Migration guide:
 * - Old: <OldComponent variant="primary" />
 * - New: <NewComponent variant="pokemon" />
 */
export const OldComponent = ({ variant }: Props) => {
  // Still functional, but marked for removal
}
```

**Step 2**: Add deprecation test

```typescript
describe('OldComponent (Deprecated)', () => {
  it('should still work but show deprecation warning', () => {
    const consoleSpy = jest.spyOn(console, 'warn').mockImplementation()
    
    render(<OldComponent variant="primary" />)
    
    // Component still renders
    expect(screen.getByText('Old Component')).toBeInTheDocument()
    
    // Warning is logged (optional - can add runtime warning)
    // expect(consoleSpy).toHaveBeenCalled()
    
    consoleSpy.mockRestore()
  })
})
```

**Step 3**: Create migration guide

```markdown
# Migration: OldComponent → NewComponent

## Timeline
- v1.3.0: Deprecation notice added
- v1.4.0: Deprecation warning logged at runtime
- v2.0.0: Component removed entirely

## Migration Steps

### Before (Old Component)
\`\`\`tsx
<OldComponent variant="primary" size="md">
  Click me
</OldComponent>
\`\`\`

### After (New Component)
\`\`\`tsx
<NewComponent variant="pokemon" size="md">
  Click me
</NewComponent>
\`\`\`

## Changes
- `variant="primary"` → `variant="pokemon"`
- All other props remain the same
```

**Step 4**: Track deprecation in version history

```typescript
// package.json or CHANGELOG.md

{
  "version": "1.3.0",
  "deprecated": {
    "OldComponent": {
      "replacement": "NewComponent",
      "removalVersion": "2.0.0",
      "migrationGuide": "docs/migration/old-component.md"
    }
  }
}
```

### Deprecation Timeline

| Phase | Duration | Action |
|-------|----------|--------|
| Deprecation Notice | Current release | Add `@deprecated` JSDoc |
| Runtime Warning | +1 minor version (1-2 months) | Log warning to console |
| Hard Removal | +1 major version (6-12 months) | Remove entirely |

---

## Breaking Change Handling

### Detecting Breaking Changes

**When upgrading Chakra UI**:

1. Check official changelog for "Breaking Changes" section
2. Run full test suite and note any failures
3. Check type definitions for API changes
4. Test all components with old props

### Communicating Breaking Changes

**Create issue documenting**:

```markdown
# Breaking Change: Chakra UI v2.9.0

## What Changed
- Button `variant` prop signature updated
- Input component renamed to `Input`

## Migration Required
- Update Button variant names (see table below)
- No Input component changes needed

## Timeline
- Affects: All components using updated APIs
- Plan: 3-day upgrade sprint in Q2
- Deployment: Monday 2025-05-20
```

### TypeScript Breaking Changes

If component API changes, update type definitions:

```typescript
// OLD API
interface MyButtonProps {
  variant: 'primary' | 'secondary'
}

// NEW API (breaking change)
interface MyButtonProps {
  variant: 'solid' | 'outline' | 'ghost'
}

// Migration: Update all component usages
// <Button variant="primary" /> → <Button variant="solid" />
```

---

## Dependency Management

### Lock File Strategy

**pnpm-lock.yaml is ALWAYS committed**:

```bash
# ✅ DO: Commit lock file
git add pnpm-lock.yaml
git commit -m "chore: update dependencies"

# ❌ DON'T: Ignore lock file
.npmrc  # Should NOT include --frozen-lockfile for deployment
```

### Peer Dependency Resolution

Chakra UI requires specific peer dependencies:

```json
{
  "peerDependencies": {
    "react": "^18.0.0",
    "react-dom": "^18.0.0"
  },
  "dependencies": {
    "@chakra-ui/react": "^2.8.0",
    "@emotion/react": "^11.11.0",
    "@emotion/styled": "^11.11.0",
    "framer-motion": "^10.16.0"
  }
}
```

### Security Patch Strategy

**Critical security vulnerabilities**:

1. Apply immediately to all branches
2. Run tests immediately
3. Create hotfix branch: `hotfix/security-patch-<date>`
4. Deploy to production within 24 hours

**Example**:

```bash
# 1. Install security patch
pnpm up @emotion/react @emotion/styled

# 2. Run full test suite
pnpm test --run

# 3. Verify no regressions
pnpm build

# 4. Create hotfix PR
git checkout -b hotfix/cve-2025-xxxx
git commit -m "security: patch CVE-2025-xxxx in @emotion"
```

---

## Performance Monitoring

### Baseline Metrics

**Record these metrics after each major upgrade**:

| Metric | Baseline | Target | Tool |
|--------|----------|--------|------|
| Bundle size (gzip) | 170.38 kB | ≤195.94 kB | `pnpm build && ls -lh` |
| Component render | <50ms | <100ms | Chrome DevTools Profiler |
| Build time | <1s | <1.5s | `time pnpm build` |
| Search latency | <350ms | <400ms | Performance tab |

### Quarterly Performance Reviews

**Every 3 months**:

1. Run performance benchmark
2. Compare against baseline
3. Identify regressions
4. Create optimization tasks if needed

### Performance Dashboard

Suggested tracking:

```markdown
# Performance Metrics (Updated 2025-12-03)

## Bundle Size Trend
- v1.3.0 (2025-12-03): 180 kB (gzip) - Baseline after Chakra integration
- Previous (2025-11-01): 155 kB - Pre-Chakra

## Component Render Time (Average)
- Button: 8ms
- PokemonCard: 12ms
- AvailableGrid (100 items): 45ms

## Build Time Trend
- Latest: 0.8s (Vite + Chakra)
- Target: <1s ✓ PASS
```

---

## Troubleshooting

### Issue: Components not rendering after upgrade

**Symptoms**: White screen or missing components after upgrading Chakra

**Solution**:

```typescript
// Verify ChakraProvider is wrapping app
import { ChakraProvider } from '@chakra-ui/react'
import { theme } from '@/styles/theme'

<ChakraProvider theme={theme}>
  <App />
</ChakraProvider>
```

### Issue: TypeScript errors after upgrade

**Symptoms**: `Type 'xxx' is not assignable to type 'yyy'`

**Solution**:

```bash
# 1. Update type definitions
pnpm up @types/react @types/react-dom

# 2. Rebuild TypeScript
pnpm exec tsc --noEmit

# 3. If still failing, check tsconfig.json
# Verify strict mode is enabled and correct
```

### Issue: Performance regression after upgrade

**Symptoms**: Slower component rendering, larger bundle size

**Diagnosis**:

```bash
# 1. Check bundle size
pnpm build
npm install -g @vite/inspect
vite-inspect

# 2. Profile with Chrome DevTools
# - Open dist/index.html locally
# - Record performance profile
# - Identify slow components

# 3. Check Chakra UI version
pnpm list @chakra-ui/react
```

**Common causes**:

- Unused Chakra components not tree-shaken (requires import cleanup)
- New version includes more features (expected, verify <15% increase)
- Theme configuration creating duplicate styles (review theme.ts)

### Issue: Style conflicts after theme extension

**Symptoms**: Styles not applying correctly, conflicting CSS

**Solution**:

```typescript
// Verify theme configuration syntax
export const theme = createSystem({
  ...defaultConfig,
  theme: extendTheme({
    // Check: No typos in token names
    tokens: {
      colors: {
        pokemon: { teal: { value: '#1BA098' } },
      },
    },
  }),
})

// Test in component
import { Box } from '@chakra-ui/react'
<Box color="pokemon.teal">Test</Box>
```

### Issue: Accessibility regression after upgrade

**Symptoms**: Focus indicators not visible, keyboard navigation broken

**Solution**:

```bash
# 1. Run Lighthouse audit
# Chrome DevTools → Lighthouse → Accessibility

# 2. Test keyboard navigation
# Tab, Shift+Tab, Enter, Escape should all work

# 3. Verify focus styles exist
# Check computed styles for :focus states

# 4. Check for broken ARIA attributes
# Use axe-core or WAVE browser extension
```

### Issue: Tests failing after upgrade

**Symptoms**: Unit tests pass but integration tests fail

**Solution**:

```bash
# 1. Run tests in isolation
pnpm test tests/integration/ --run

# 2. Check test setup (ChakraProvider wrapper)
# tests/setup.tsx should include ChakraProvider

# 3. Update snapshots if visual output changed
pnpm test --run -u

# 4. Verify DOM queries still work
# Use getByRole, getByLabelText (more robust than getByTestId)
```

---

## Appendix: Common Maintenance Tasks

### Adding Font to Theme

```typescript
// Import font
import '@fontsource/open-sans'

export const theme = createSystem({
  ...defaultConfig,
  theme: extendTheme({
    tokens: {
      fonts: {
        body: { value: 'Open Sans, sans-serif' },
        heading: { value: 'Open Sans, sans-serif' },
        mono: { value: 'Courier New, monospace' },
      },
    },
  }),
})
```

### Updating Responsive Breakpoints

```typescript
export const theme = createSystem({
  ...defaultConfig,
  theme: extendTheme({
    tokens: {
      breakpoints: {
        base: { value: '0px' },    // Mobile-first
        sm: { value: '320px' },
        md: { value: '768px' },
        lg: { value: '1024px' },
        xl: { value: '1440px' },
        '2xl': { value: '1920px' },
      },
    },
  }),
})
```

### Recording Performance Baseline

```bash
#!/bin/bash
# save_perf_baseline.sh

echo "Building project..."
pnpm build

echo "Measuring bundle size..."
GZIP_SIZE=$(ls -lh dist/*.js | awk '{sum+=$5} END {print sum}')
echo "Bundle size (gzip): $GZIP_SIZE"

echo "Testing build time..."
time pnpm build

echo "Recording in PERFORMANCE_BASELINE.md..."
cat >> PERFORMANCE_BASELINE.md << EOF
## Baseline: $(date)
- Bundle size: $GZIP_SIZE
- Timestamp: $(date -u +%Y-%m-%dT%H:%M:%SZ)
EOF
```

---

## References

- **Chakra UI Docs**: https://chakra-ui.com/docs
- **Release Notes**: https://github.com/chakra-ui/chakra-ui/releases
- **TypeScript Handbook**: https://www.typescriptlang.org/docs/
- **React 19 Docs**: https://react.dev
- **Vite Build Guide**: https://vitejs.dev/guide/build.html
- **WCAG 2.1 Standards**: https://www.w3.org/WAI/WCAG21/quickref/

---

**Last Updated**: 2025-12-03  
**Maintained By**: Pokemon Collector Development Team  
**Review Frequency**: Quarterly (next review: 2026-03-03)
