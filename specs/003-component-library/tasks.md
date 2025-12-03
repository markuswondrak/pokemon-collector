# Implementation Tasks: Component Library Integration

**Feature**: 003 - Component Library Integration (Chakra UI)  
**Branch**: `003-component-library`  
**Date**: 2025-12-01  
**Total Tasks**: 47  
**Status**: Ready for Implementation

---

## Overview

This document contains granular, independently executable implementation tasks for integrating Chakra UI v2.8+ into the Pokemon Collector application. Tasks are organized by user story (P1-P2 priorities) with clear dependencies and parallel execution opportunities.

**Task Execution Strategy**:
1. Complete Setup phase (Phase 0) sequentially - blocking all user stories
2. Complete Foundational phase (Phase 1) sequentially - blocking all user stories
3. Execute User Story phases (2-4) in priority order (P1 stories 1-3, P2 story 4)
4. Complete Polish phase (Phase 5) for cross-cutting concerns

**Testing Gate**: After each phase, run `pnpm test --run` and verify zero test failures before proceeding. Per constitution requirement: limit test workers to 4 during implementation (`vitest --run --threads --maxThreads=4`) to prevent resource contention and ensure stable, reproducible results.

---

## Phase 0: Setup & Infrastructure

### Goal
Install Chakra UI, create theme configuration, set up ChakraProvider, establish test utilities.

**Dependencies**: None (blocking all stories)

### Tasks

- [x] T001 Install Chakra UI and peer dependencies (`pnpm add @chakra-ui/react @emotion/react @emotion/styled framer-motion`)
- [x] T002 Create Chakra theme configuration file at `src/styles/theme.ts` with colors (Chakra base + Pokemon teal #1ba098, gold #ffd700), spacing (8px scale: 4px, 8px, 12px, 16px, 24px, 32px, 48px, 64px), typography (Open Sans, font sizes 12px-40px), radii (4px-full), and shadows (sm-xl)
- [x] T003 Update `src/main.tsx` to wrap `<App />` with ChakraProvider and apply custom theme from `src/styles/theme.ts`
- [x] T004 [P] Update `tsconfig.json` to include Chakra UI type definitions and ensure @emotion/react module resolution
- [x] T005 [P] Create test utility file `tests/setup.tsx` with `render` function wrapper that includes ChakraProvider for all component tests
- [x] T006 [P] Update `vitest.config.js` to configure jsdom environment and Chakra UI initialization
- [x] T007 Verify setup: Run `pnpm test --run` to confirm all existing tests still pass with ChakraProvider wrapper; run `pnpm build` and record baseline bundle size

**Validation Gate**: ✅ PASS - All tests pass (240 tests, 22 suites), baseline bundle size: 170.38 kB (gzip), no console errors related to Chakra initialization.

---

## Phase 1: Foundational Components & Design Tokens

### Goal
Establish shared UI patterns, Button component foundation, responsive utilities, and theme validation.

**Dependencies**: Phase 0 complete

### Tasks

- [x] T008 Create Button component wrapper `src/components/ButtonBase.tsx` that extends Chakra Button with Pokemon-specific variants: `primary` (teal background, white text, 7:1 contrast), `secondary` (gray), `destructive` (red), with sizes: `sm` (8px-12px padding), `md` (12px-16px padding), `lg` (16px-24px padding)
- [x] T009 [P] Create Container wrapper `src/components/Container.tsx` using Chakra Box with max-width 1440px, responsive padding (8px-16px mobile, 16px-24px desktop), and proper spacing
- [x] T010 [P] Create Stack utilities `src/components/Stack.tsx` exporting VStack and HStack from Chakra with Pokemon-specific spacing defaults (gap: 16px base, responsive scaling)
- [x] T011 [P] Create Card wrapper `src/components/CardBase.tsx` using Chakra Card with consistent shadow (0 2px 8px rgba), border-radius (8px), and padding (16px)
- [x] T012 Create unit tests for Button variants at `tests/unit/components/ButtonBase.test.jsx` validating: primary variant has teal color, all variants render without custom CSS, sizes apply correct padding
- [x] T013 [P] Create unit tests for Container at `tests/unit/components/Container.test.jsx` validating responsive padding and max-width constraints
- [x] T014 [P] Create contract validation tests at `tests/contract/component-contracts.test.js` ensuring Button, Input, Card, Grid match OpenAPI specs from `specs/003-component-library/contracts/component-contracts.yaml`
- [x] T015 Verify Phase 1: Run `pnpm test --run` and confirm 0 test failures, all button/container/card tests passing; verify no custom CSS in component files

**Validation Gate**: ✅ PASS - All Phase 1 tests pass (288 tests total, 0 failures), foundational components created, contract tests validated, no custom CSS in wrapper components.

---

## Phase 2: User Story 1 - Consistent Visual Design Across All Screens (P1)

### Goal
Migrate search/input components and establish visual consistency baseline using Chakra UI components. All UI elements follow consistent design language (spacing, colors, typography, shadows).

**Dependencies**: Phase 0 & Phase 1 complete

**Independent Test Criteria**:
- [ ] All search bar and input fields use Chakra Input component (zero custom CSS)
- [ ] Visual consistency verified: spacing matches 8px scale, colors use Chakra palette + Pokemon teal/gold, typography is Open Sans, all text contrast ≥7:1 (WCAG AAA)
- [ ] Sticky search bar maintains responsive behavior across 320px-2560px viewports
- [ ] All tests pass with zero failures; bundle size increase ≤15% from baseline

### Tasks

- [x] T016 [P] [US1] Migrate `src/components/StickySearchBar.tsx` to use Chakra Input component replacing custom input styling; apply consistent spacing (16px padding, 8px gap between input and icons), Open Sans typography, teal border/focus color
- [x] T017 [P] [US1] Update App search state management in `src/components/App.tsx` to use Chakra Container/HStack/VStack layout components replacing custom CSS Grid; apply responsive spacing and alignment
- [x] T018 [US1] Create unit tests at `tests/unit/components/StickySearchBar.test.jsx` validating: uses Chakra Input component, spacing matches design spec, focus states show correct color (teal), responsive behavior works at 320px/768px/1440px viewports
- [x] T019 [US1] Create integration test at `tests/integration/search-ui-consistency.test.jsx` validating: search bar styling, button styling consistency, input field focus/hover states, spacing uniformity across all interactive elements
- [x] T020 [US1] Verify visual consistency: Run `pnpm test --run`, check bundle size increase (<15%), inspect component tree confirming zero custom CSS in StickySearchBar and App components
- [x] T021 [US1] Add design metric validation in `tests/integration/design-metrics.test.jsx`: verify 8px spacing scale usage (margin/padding values), Open Sans typography application, minimum 7:1 text contrast ratios, 8px+ border radius on interactive elements

**Validation Gate**: US1 tests pass (0 failures), visual consistency confirmed (spacing scale, colors, typography), responsive 320px-1440px verified, bundle size within 15% increase. ✅ PASS - 54 tests pass (11 StickySearchBar + 14 App + 10 search-ui-consistency + 19 design-metrics), all Phase 2 components migrated to Chakra UI, zero custom CSS in StickySearchBar and App components.

---

## Phase 3: User Story 2 - Replace Custom CSS with Library Components (P1)

### Goal
Migrate card and grid components to Chakra UI, eliminating all custom CSS from component files. Pokemon cards, available grid, wishlist grid, collection grid all use library components exclusively.

**Dependencies**: Phase 0, Phase 1, Phase 2 (US1) complete

**Independent Test Criteria**:
- [x] PokemonCard, LazyLoadingGrid, AvailableGrid use 100% Chakra UI components (zero custom CSS)
- [x] All grid layouts use Chakra Grid component with responsive column configuration (1 col mobile, 2 col tablet, 3+ col desktop)
- [x] Card styling consistent: shadows, border-radius, padding use Chakra defaults with theme customization
- [x] All card interaction states (hover, active) use Chakra styling only
- [x] All tests pass (0 failures); bundle size maintained within 15% increase

### Tasks

- [x] T022 [P] [US2] Migrate `src/components/PokemonCard.tsx` to use Chakra Card component with Badge for index/status indicators; apply consistent padding (16px), spacing between elements (8px-12px), shadow (0 2px 8px), hover effect using Chakra transitions
- [x] T023 [P] [US2] Replace custom CSS Grid in `src/components/AvailableGrid.tsx` with Chakra Grid component; configure responsive columns: `gridTemplateColumns={['1fr', '1fr 1fr', 'repeat(3, 1fr)']}` for 320px/600px/1024px+ viewports; apply gap spacing (16px base)
- [x] T024 [P] [US2] Update `src/components/LazyLoadingGrid.tsx` to use Chakra Grid for layout; maintain lazy loading functionality while using library grid component exclusively
- [x] T025 [US2] Create unit tests at `tests/unit/components/PokemonCard.test.jsx` validating: uses Chakra Card and Badge, no custom CSS overrides, hover states work, responsive padding applied
- [x] T026 [US2] Create unit tests at `tests/unit/components/AvailableGrid.test.jsx` validating: uses Chakra Grid, responsive columns render correctly at breakpoints, gap spacing matches spec
- [x] T027 [US2] Create unit tests at `tests/unit/components/LazyLoadingGrid.test.jsx` validating: lazy loading behavior preserved, Chakra Grid applied, no custom CSS
- [x] T028 [US2] Create integration test at `tests/integration/card-consistency.test.jsx` validating: all cards render with consistent styling, spacing uniform across cards, shadows match spec, hover effects work
- [x] T029 [US2] Create integration test at `tests/integration/grid-responsive.test.jsx` validating: grids respond correctly to viewport sizes (320px 1-col, 600px 2-col, 1024px 3-col), gap spacing consistent, lazy loading still functional
- [x] T030 [US2] Verify Phase 3: Run `pnpm test --run`, confirm all US2 tests pass (0 failures), inspect `src/components/` confirming zero custom CSS in PokemonCard, AvailableGrid, LazyLoadingGrid files; verify bundle size <15% increase
- [x] T031 [US2] Remove custom CSS overrides: Audit `src/styles/components.css` and remove all rules related to card styling, grid layout, and shadows used by migrated components

**Validation Gate**: US2 tests pass (0 failures), all card/grid components use Chakra exclusively, no custom CSS in component files, responsive behavior verified at all breakpoints, bundle size within limit. ✅ PASS - All Phase 3 tests pass (55 tests: 13 PokemonCard + 9 AvailableGrid + 14 LazyLoadingGrid + 8 card-consistency + 11 grid-responsive), PokemonCard/AvailableGrid/LazyLoadingGrid fully migrated to Chakra UI components (Card.Root, Grid with responsive columns), custom CSS removed from src/styles/components.css (deprecated .pokemon-card*, .pokemon-grid, .collection-list sections), zero regressions in Phase 3 component tests.

---

## Phase 4: User Story 3 - Modern Aesthetic and Professional Appearance (P1)

### Goal
Migrate supporting components (CollectionList, WishlistList, App wrapper) to complete visual modernization. Verify modern design language is consistently applied across entire application.

**Dependencies**: Phase 0, Phase 1, Phase 2 (US1), Phase 3 (US2) complete

**Independent Test Criteria**:
- [ ] CollectionList and WishlistList components use 100% Chakra UI components
- [ ] All text elements use Open Sans typography via Chakra theme
- [ ] All interactive elements have smooth transitions and micro-interactions (Chakra Framer Motion integration)
- [ ] Visual hierarchy clearly distinguishes information types (headings, body, labels)
- [ ] Responsive design maintains professional appearance at all viewport sizes (320px-2560px)
- [ ] All tests pass (0 failures)

### Tasks

- [x] T032 [P] [US3] Migrate `src/components/CollectionList.tsx` to use Chakra components: List for container, ListItem for entries, Text for typography, Button for actions; apply consistent spacing and typography
- [x] T033 [P] [US3] Migrate `src/components/WishlistList.tsx` to use Chakra components: List container, ListItem entries, Badge for visual status, consistent styling with CollectionList
- [x] T034 [US3] Update `src/components/App.tsx` wrapper to use Chakra Box, VStack, HStack for layout (replace any remaining custom CSS Grid/Flexbox rules); apply responsive spacing and transitions
- [x] T035 [US3] Create unit tests at `tests/unit/components/CollectionList.test.jsx` validating: uses Chakra List components, spacing consistent with design spec, no custom CSS
- [x] T036 [US3] Create unit tests at `tests/unit/components/WishlistList.test.jsx` validating: uses Chakra List/Badge components, styling matches CollectionList for consistency
- [x] T037 [US3] Create integration test at `tests/integration/typography-consistency.test.jsx` validating: all text elements use Open Sans (via Chakra theme), font sizes follow hierarchy, line heights appropriate for readability
- [x] T038 [US3] Create integration test at `tests/integration/visual-hierarchy.test.jsx` validating: headings visually distinct from body text, active/inactive states clear, spacing creates logical grouping
- [x] T039 [US3] Create accessibility test at `tests/integration/a11y-visual.test.jsx` validating: all text meets WCAG AAA contrast (7:1 minimum), interactive elements have visible focus states, color not sole indicator of information
- [x] T040 [US3] Add responsive visual validation in `tests/integration/responsive-aesthetic.test.jsx`: verify appearance at 320px, 768px, 1440px viewports; check padding/margin scales appropriately; confirm modern aesthetic maintained at all sizes
- [x] T041 [US3] Verify Phase 4: Run `pnpm test --run`, confirm all US3 tests pass (0 failures); audit all component files confirming zero custom CSS; verify bundle size <15% increase

**Validation Gate**: US3 tests pass (0 failures), all components use Chakra exclusively, modern aesthetic verified (typography, spacing, hierarchy, contrast), responsive design tested at all breakpoints.

---

## Phase 5: User Story 4 - Maintainable and Future-Proof Design System (P2)

### Goal
Complete design system documentation, establish component patterns for future development, verify theme extensibility, and ensure design system can scale with new features.

**Dependencies**: All Phase 0-4 complete

**Independent Test Criteria**:
- [ ] Design system documentation complete and updated in `src/styles/theme.ts` with comments for all design tokens
- [ ] New components can be created using library components without custom CSS
- [ ] Theme configuration is centralized and easily extensible
- [ ] Component library version upgrades can be applied without breaking changes
- [ ] All tests pass (0 failures)

### Tasks

- [ ] T042 [P] [US4] Document design system in `src/styles/theme.ts` with comprehensive comments: explain each color token, spacing value, typography scale, component variant; include examples of how to extend theme
- [ ] T043 [P] [US4] Create component pattern guide `src/components/COMPONENT_PATTERNS.md` documenting: how to create new components using Chakra, naming conventions, spacing/typography application, accessibility requirements
- [ ] T044 [US4] Create extendability test at `tests/integration/design-system-extensibility.test.jsx` validating: new Button variant can be added to theme without code changes, new colors can be added and applied automatically, component library updates don't break existing components
- [ ] T045 [US4] Create performance validation test at `tests/integration/performance-metrics.test.jsx` validating: bundle size increase ≤15%, component render latency <50ms (Chakra components), build time remains <1s (Vite)
- [ ] T046 [US4] Add component library maintainability guidelines in `specs/003-component-library/MAINTENANCE.md`: version upgrade process, theme extension patterns, deprecation strategy for custom components
- [ ] T047 [US4] Final verification: Run complete test suite `pnpm test --run`, measure final bundle size, document design system completeness; confirm 100% of components use Chakra UI with zero custom CSS files for components

**Validation Gate**: US4 tests pass (0 failures), design system documentation complete, new component pattern validated, bundle size acceptable, performance metrics met.

---

## Phase 6: Polish & Cross-Cutting Concerns

### Goal
Remove custom CSS files, verify no regressions, optimize bundle size, finalize documentation.

**Dependencies**: All user story phases complete

### Tasks

- [ ] T048 [P] Remove custom CSS files: delete `src/styles/App.css` and `src/styles/components.css` (keep only `src/styles/theme.ts` and `src/styles/index.css` for global resets if needed)
- [ ] T049 [P] Update `src/styles/index.css` to contain only global resets and animations (if needed); remove all component styling rules
- [ ] T050 [P] Create CSS removal validation: search codebase (`grep -r "import.*\.css" src/components/`) confirming no CSS imports in component files; only `index.css` should be imported in `main.tsx`
- [ ] T051 Run full regression test suite: `pnpm test --run` confirming all tests pass (0 failures), including unit, integration, contract tests
- [ ] T052 [P] Run visual regression testing: compare screenshots of all components (cards, grids, buttons, search bar) against baseline screenshots to confirm no unintended visual changes
- [ ] T053 Optimize bundle: Analyze bundle with `pnpm build && npm install -g @vite/inspect && vite-inspect` confirming Chakra UI components are efficiently bundled, no duplicate dependencies
- [ ] T054 Update project documentation: Add section to `README.md` explaining Chakra UI integration, design token usage, component patterns, and maintenance procedures
- [ ] T055 Create feature completion summary: Document all design metrics (spacing scale, typography, colors, contrast) with validation evidence in `specs/003-component-library/COMPLETION_REPORT.md`

**Validation Gate**: All custom CSS removed, zero test failures, bundle size finalized, visual regression testing passed, documentation complete.

---

## Summary by User Story

| User Story | Priority | Status | Task Count | Dependencies |
|-----------|----------|--------|-----------|---|
| US1: Consistent Visual Design | P1 | Ready (T016-T021) | 6 | Phase 0 & 1 |
| US2: Replace Custom CSS | P1 | Ready (T022-T031) | 10 | Phase 0, 1 & US1 |
| US3: Modern Aesthetic | P1 | Ready (T032-T041) | 10 | Phase 0, 1, US1 & US2 |
| US4: Maintainable Design System | P2 | Ready (T042-T047) | 6 | All P1 stories |
| Setup & Infrastructure | - | Ready (T001-T007) | 7 | None |
| Foundational Components | - | Ready (T008-T015) | 8 | Phase 0 |
| Polish & Final | - | Ready (T048-T055) | 8 | All stories |

**Total Tasks**: 55 (planning + setup + implementation + validation)

---

## Execution Timeline

**Estimated Duration**: 3 weeks (15 working days)

- **Week 1**: Phase 0 (Setup) + Phase 1 (Foundational) - 3 days (T001-T015)
- **Week 2**: Phase 2 (US1) + Phase 3 (US2) - 5 days (T016-T031)
- **Week 2-3**: Phase 4 (US3) + Phase 5 (US4) - 5 days (T032-T047)
- **Week 3**: Phase 6 (Polish & Validation) - 2 days (T048-T055)

---

## Parallel Execution Opportunities

### Parallelization Strategy

**Within Phase 0** (after T001 dependencies):
- T004, T005, T006 can run in parallel (tsconfig, test utilities, vitest config)
- T002 and T003 must be sequential (theme creation then provider setup)

**Within Phase 1** (after T008 foundations):
- T009, T010, T011 can run in parallel (Container, Stack, Card wrappers)
- T012, T013, T014 can run in parallel after wrapper components (unit tests)

**Within Phase 2 (US1)**:
- T016, T017 can run in parallel (StickySearchBar and App migration)
- T018, T019 can start after T016/T017 complete (unit/integration tests)

**Within Phase 3 (US2)**:
- T022, T023, T024 can run in parallel (PokemonCard, AvailableGrid, LazyLoadingGrid migration)
- T025, T026, T027 can run in parallel (component unit tests)
- T028, T029 can run in parallel (integration tests)

**Within Phase 4 (US3)**:
- T032, T033 can run in parallel (CollectionList, WishlistList migration)
- T035, T036 can run in parallel (unit tests)
- T037, T038, T039, T040 can run in parallel (integration/a11y tests)

**Within Phase 6 (Polish)**:
- T048, T049, T050 can run in parallel (CSS file removal and validation)
- T052, T053 can run in parallel (visual regression and bundle analysis)

---

## MVP Scope (Minimal Viable Product)

For rapid delivery, suggest focusing on:

**Phase 0 + Phase 1**: Complete setup and foundational components (all 15 tasks) - **Week 1**

**Phase 2 (US1)**: Migrate search/input and establish visual consistency (T016-T021) - **Days 3-4, Week 2**

**Phase 3 (US2)**: Migrate cards and grids (T022-T031) - **Days 5, Week 2 + Days 1-2, Week 3**

**MVP Completion**: Full Chakra integration with zero custom CSS, all core components modernized. **Deliverable**: Modern, consistent UI across entire application.

**Post-MVP (P2)**: Phase 4 (US3 polish) and Phase 5 (US4 extensibility) can be completed in following sprint if needed.

---

## Testing & Validation Strategy

### Test Execution Order

1. **After Phase 0**: `pnpm test --run` - confirm no regressions with ChakraProvider
2. **After Phase 1**: `pnpm test --run` - validate foundational components
3. **After Phase 2 (US1)**: `pnpm test --run` + visual consistency review - verify search/input consistency
4. **After Phase 3 (US2)**: `pnpm test --run` + visual regression - verify cards/grids modernization
5. **After Phase 4 (US3)**: `pnpm test --run` + comprehensive accessibility audit - verify professional appearance
6. **After Phase 5 (US4)**: `pnpm test --run` + design system completeness - verify extensibility
7. **After Phase 6**: Final `pnpm test --run` + CSS removal validation - confirm no custom CSS remains

### Bundle Size Tracking

- **Baseline** (before Phase 0): Measure with `pnpm build`
- **After Phase 0**: Record post-Chakra-install bundle size
- **After each phase**: Compare against baseline; flag if >15% increase
- **Final** (after Phase 6): Optimize and confirm final bundle size within constraints

### Design Metric Validation

**8px Spacing Scale**: Verify all component padding/margin values: 4px, 8px, 12px, 16px, 24px, 32px, 48px, 64px

**Typography**: Open Sans applied via theme, font sizes: 12px, 14px, 16px, 20px, 24px, 32px, 40px

**Colors**: Chakra base palette + Pokemon teal (#1ba098) and gold (#ffd700) used throughout

**Contrast**: All text elements minimum 7:1 contrast ratio (WCAG AAA)

**Border Radius**: All interactive elements ≥2px border radius

**Shadows**: Consistent shadow elevation: sm, base, md, lg, xl

---

## Rollback Procedure (if needed)

If any phase encounters critical issues:

1. Revert branch: `git reset --hard <commit-before-phase>`
2. Reinstall dependencies: `pnpm install`
3. Run tests: `pnpm test --run` to confirm clean state
4. Re-plan failing phase with adjusted timeline
5. Create detailed issue documentation for post-mortem

---

## Success Metrics (Go/No-Go Gates)

| Gate | Criteria | Owner |
|------|----------|-------|
| Phase 0 Complete | All tests pass, ChakraProvider integrated, theme.ts created | Dev |
| Phase 1 Complete | Foundational components working, test utilities set up, 0 test failures | Dev |
| Phase 2 (US1) Complete | Search/input components migrated, visual consistency verified, responsive works | Dev + Design |
| Phase 3 (US2) Complete | Cards/grids migrated, custom CSS removed from components, 0 test failures | Dev |
| Phase 4 (US3) Complete | All components modernized, aesthetic professional, accessibility verified | Dev + QA |
| Phase 5 (US4) Complete | Design system documented, extensibility validated, performance acceptable | Dev |
| Phase 6 Complete | CSS files removed, full test pass, visual regression negative, documentation updated | Dev + QA |
| **Feature Launch** | All success criteria met, zero custom CSS in components, bundle <15% increase | PM + Dev |

---

## Notes & Considerations

- **No Breaking Changes**: All functionality remains identical; only visual layer updates
- **Accessibility Priority**: Chakra UI WAI-ARIA patterns ensure WCAG 2.1 AA compliance maintained/improved
- **Testing First**: Each phase includes test creation before/during component migration
- **Design System Ownership**: `src/styles/theme.ts` is single source of truth for all styling decisions
- **Future Extensibility**: New components should use Chakra directly without custom CSS
- **Team Communication**: Daily standups recommended during migration to catch blockers early
