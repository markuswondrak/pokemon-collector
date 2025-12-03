# Component Patterns Guide

**Version**: 1.3.0  
**Date**: 2025-12-03  
**Purpose**: Establish consistent patterns for creating new components using Chakra UI in the Pokemon Collector application

---

## Table of Contents

1. [Component Structure](#component-structure)
2. [Naming Conventions](#naming-conventions)
3. [Spacing & Layout](#spacing--layout)
4. [Typography](#typography)
5. [Color & Contrast](#color--contrast)
6. [Accessibility Requirements](#accessibility-requirements)
7. [State Management](#state-management)
8. [Testing Patterns](#testing-patterns)
9. [Performance Guidelines](#performance-guidelines)
10. [Code Examples](#code-examples)

---

## Component Structure

All new components **MUST** follow this structure:

```typescript
import { Box, VStack, HStack, Text, Button } from '@chakra-ui/react'
import type { FC, ReactNode } from 'react'

/**
 * [ComponentName]
 * 
 * Brief description of component purpose and usage context.
 * 
 * @prop children - Primary content (if applicable)
 * @prop variant - Visual style variant: 'primary' | 'secondary' | 'tertiary'
 * @prop size - Component size: 'sm' | 'md' | 'lg'
 * @prop disabled - Disabled state
 * 
 * @example
 * <MyComponent variant="primary" size="md">
 *   Click me
 * </MyComponent>
 */
interface MyComponentProps {
  children?: ReactNode
  variant?: 'primary' | 'secondary'
  size?: 'sm' | 'md' | 'lg'
  disabled?: boolean
}

export const MyComponent: FC<MyComponentProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  disabled = false,
}) => {
  return (
    <Box
      // Always use Chakra components for styling
      padding={size === 'sm' ? 8 : size === 'md' ? 12 : 16}
      borderRadius="8px"
      // Never use custom CSS classes
      // Never import CSS files
      _disabled={{
        opacity: 0.5,
        cursor: 'not-allowed',
      }}
    >
      {children}
    </Box>
  )
}
```

### Key Rules

1. **Chakra Components Only**: Never use HTML elements (div, button, input) directly
   - ✅ `<Box>` instead of `<div>`
   - ✅ `<Button>` instead of `<button>`
   - ✅ `<Input>` instead of `<input>`
   - ✅ `<Text>` instead of `<p>` or `<span>`

2. **No Custom CSS**: All styling via Chakra props (sx, padding, color, etc.)
   - ✅ `<Box padding={12} backgroundColor="gray.100" />`
   - ❌ `<Box className="my-box" />` + `.my-box { padding: 12px; }`
   - ❌ `<Box style={{ padding: '12px' }} />`

3. **Type Safety**: Always export interfaces for component props
   - Use strict TypeScript (strict mode enabled in tsconfig.json)
   - Document all props with JSDoc comments

4. **Accessibility First**: Every component must be keyboard accessible
   - See [Accessibility Requirements](#accessibility-requirements) section

---

## Naming Conventions

### File Naming

- **Component files**: PascalCase (e.g., `PokemonCard.tsx`, `StickySearchBar.tsx`)
- **Test files**: `[ComponentName].test.jsx` (e.g., `PokemonCard.test.jsx`)
- **Style files**: None! Use Chakra theme configuration instead
- **Hook files**: camelCase starting with "use" (e.g., `useCollection.ts`, `useDebounce.ts`)
- **Service files**: camelCase with descriptive name (e.g., `pokemonApi.ts`, `collectionStorage.ts`)

### Component Naming

- **Wrapper components**: Suffix with base element name
  - `ButtonBase` (wraps Chakra Button)
  - `CardBase` (wraps Chakra Card)
  - `ContainerBase` (wraps Chakra Box for page layout)

- **Feature components**: Descriptive name of feature
  - `StickySearchBar` (sticky search input)
  - `PokemonCard` (individual Pokemon display)
  - `CollectionList` (list of collected Pokemon)

- **Utility components**: Generic descriptive names
  - `Stack` (spacing utility)
  - `Container` (layout utility)
  - `Badge` (status indicator)

### Variant Naming

Use lowercase kebab-case for variant strings:

```typescript
type ButtonVariant = 'primary' | 'secondary' | 'destructive' | 'outline'
type Size = 'sm' | 'md' | 'lg'
type ColorScheme = 'teal' | 'gray' | 'red' | 'gold'
```

---

## Spacing & Layout

### Spacing Scale

**All spacing MUST use the 8px base unit scale**:

```typescript
// ✅ CORRECT: Use multiples of 8px
padding={8}      // 8px
padding={12}     // 12px (1.5x)
padding={16}     // 16px (2x)
padding={24}     // 24px (3x)
padding={32}     // 32px (4x)
gap={8}          // Gap between items
margin={16}      // Margin

// ❌ INCORRECT: Non-standard values
padding={10}     // Not on scale
margin={7}       // Not on scale
gap={5}          // Not on scale
```

### Responsive Spacing

Use responsive arrays for mobile-first spacing:

```typescript
<Box
  padding={[8, 12, 16]}    // Mobile: 8px, Tablet: 12px, Desktop: 16px
  marginBottom={[12, 16, 24]}
  gap={[8, 12, 16]}
/>
```

### Layout Patterns

**Vertical Stack (Single Column)**:
```typescript
<VStack gap={16} align="stretch">
  <Box>Item 1</Box>
  <Box>Item 2</Box>
</VStack>
```

**Horizontal Stack (Multiple Columns)**:
```typescript
<HStack gap={12} justify="space-between">
  <Box flex={1}>Left</Box>
  <Box flex={1}>Right</Box>
</HStack>
```

**Responsive Grid (Auto-fit columns)**:
```typescript
<Box
  display="grid"
  gridTemplateColumns={['1fr', '1fr 1fr', 'repeat(3, 1fr)']}
  gap={16}
>
  {items.map(item => <Box key={item.id}>{item.name}</Box>)}
</Box>
```

---

## Typography

### Text Components

Always use Chakra text components, never raw HTML:

```typescript
// ✅ CORRECT: Chakra components
<Heading as="h1" size="2xl">Title</Heading>
<Text fontSize="md">Body text</Text>
<Text fontSize="sm" color="gray.600">Secondary text</Text>

// ❌ INCORRECT: HTML elements
<h1>Title</h1>
<p>Body text</p>
<span>Secondary text</span>
```

### Font Sizes

Use predefined Chakra sizes or 8px-scale values:

```typescript
// Chakra sizes
<Heading size="2xl" />  // 48px (Display/H1)
<Heading size="xl" />   // 36px (H2)
<Heading size="lg" />   // 24px (H3)
<Text fontSize="lg" />  // 18px (H4/Body)
<Text fontSize="md" />  // 16px (Body primary)
<Text fontSize="sm" />  // 14px (Body secondary)
<Text fontSize="xs" />  // 12px (Caption)

// Scale values (8px base)
<Text fontSize={12} />  // 12px
<Text fontSize={14} />  // 14px
<Text fontSize={16} />  // 16px
<Text fontSize={18} />  // 18px
```

### Font Weights

```typescript
<Text fontWeight="regular">Normal text (400)</Text>
<Text fontWeight="semibold">Emphasized (600)</Text>
<Text fontWeight="bold">Strong emphasis (700)</Text>
```

### Line Height

Line height is auto-applied by Chakra based on font size. Override only when necessary:

```typescript
<Text fontSize="md" lineHeight="1.5">  // Default: 1.5x
  Body text with standard readability
</Text>

<Heading fontSize="2xl" lineHeight="1.2">  // Default: 1.2x for headings
  Tight heading
</Heading>
```

---

## Color & Contrast

### Color Tokens

Use Chakra theme colors. Pokemon-specific colors are available:

```typescript
// Chakra base colors
<Box backgroundColor="gray.100" />
<Text color="gray.700" />
<Button colorScheme="blue" />

// Pokemon brand colors (via theme)
<Button backgroundColor="#1BA098" />  // Teal
<Badge backgroundColor="#FFD700" />   // Gold
<Box color="#2C3E50" />                // Dark gray (primary text)
```

### Contrast Requirements

**Every color combination MUST meet WCAG AA minimum (4.5:1)**:

- ✅ Dark gray (#2C3E50) on white: 13.2:1 (AAA Pass)
- ✅ Teal (#1BA098) on white with text: AA compliant
- ✅ Gold (#FFD700) on dark background: 8.1:1 (AAA Pass)
- ❌ Gold on white: 1.2:1 (FAILS - use only as background with dark text)

**Test Contrast**:
1. Use WebAIM Contrast Checker: https://webaim.org/resources/contrastchecker/
2. Run Lighthouse audit (Chrome DevTools → Lighthouse → Accessibility)
3. Test with color blindness simulator: https://www.color-blindness.com/coblis-color-blindness-simulator/

### Color Blindness Support

**Never use color alone to convey meaning**:

```typescript
// ✅ CORRECT: Color + icon + text
<HStack>
  <Box as="span" color="red.500">●</Box>
  <Text>Error: Invalid input</Text>
</HStack>

// ❌ INCORRECT: Color only
<Box color="red.500">Error</Box>
```

Pair colors with:
- **Icons**: ✓ (success), ✗ (error), ? (warning)
- **Text labels**: "Error:", "Success:", "Warning:"
- **Patterns**: Striped (disabled), dotted (pending)

---

## Accessibility Requirements

### Every component MUST support

1. **Keyboard Navigation**: Tab, Shift+Tab, Enter, Escape
2. **Screen Reader Support**: Semantic HTML, ARIA labels, role attributes
3. **Focus Visibility**: Clear focus indicator (3:1 contrast minimum)
4. **Color Contrast**: 4.5:1 minimum (7:1 target for critical controls)
5. **Touch Targets**: 44x44px minimum for interactive elements

### Implementing Accessibility

**Semantic HTML via Chakra**:
```typescript
// ✅ CORRECT: Chakra semantic components
<Button onClick={handleClick}>Click me</Button>
<Heading as="h1">Page title</Heading>
<Text role="status" aria-live="polite">{status}</Text>

// ❌ INCORRECT: Non-semantic
<Box onClick={handleClick} cursor="pointer">Click me</Box>
<Box fontSize="2xl" fontWeight="bold">Page title</Box>
```

**ARIA Labels for Icon-Only Buttons**:
```typescript
<Button aria-label="Close menu" size="sm">
  <CloseIcon />
</Button>
```

**Form Accessibility**:
```typescript
<VStack>
  <FormControl isRequired>
    <FormLabel htmlFor="search">Search Pokemon</FormLabel>
    <Input
      id="search"
      placeholder="Type a name..."
      aria-describedby="search-hint"
    />
    <FormHelperText id="search-hint">
      Enter 3+ characters to search
    </FormHelperText>
  </FormControl>
</VStack>
```

**Focus States**:
```typescript
<Button
  _focus={{
    outline: '2px solid #1BA098',
    outlineOffset: '2px',
  }}
>
  Focused button
</Button>
```

---

## State Management

### Component State Patterns

**Using Chakra's built-in state props**:
```typescript
<Button isDisabled={loading}>
  {loading ? 'Loading...' : 'Submit'}
</Button>

<Input isInvalid={hasError} />
<FormErrorMessage>{errorMessage}</FormErrorMessage>

<Checkbox isChecked={isSelected} onChange={handleChange} />
```

**Visual feedback for states**:
```typescript
<Box
  padding={16}
  borderRadius="8px"
  backgroundColor={isSelected ? 'teal.50' : 'white'}
  borderWidth={isSelected ? '2px' : '1px'}
  borderColor={isSelected ? 'teal.500' : 'gray.200'}
  transition="all 200ms ease-in-out"
  _hover={{
    borderColor: 'teal.300',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.08)',
  }}
>
  {children}
</Box>
```

---

## Testing Patterns

### Unit Test Template

```typescript
import { render, screen } from '@/tests/setup'

describe('MyComponent', () => {
  it('should render with correct text', () => {
    render(<MyComponent>Click me</MyComponent>)
    expect(screen.getByText('Click me')).toBeInTheDocument()
  })

  it('should apply Chakra styling correctly', () => {
    const { container } = render(<MyComponent size="lg" />)
    const element = container.querySelector('[class*="chakra"]')
    expect(element).toHaveClass('chakra-box')
  })

  it('should be keyboard accessible', async () => {
    render(<MyComponent />)
    const button = screen.getByRole('button')
    button.focus()
    expect(button).toHaveFocus()
  })

  it('should handle disabled state', () => {
    render(<MyComponent isDisabled />)
    expect(screen.getByRole('button')).toBeDisabled()
  })
})
```

### Integration Test Template

```typescript
import { render, screen, userEvent } from '@/tests/setup'

describe('MyComponent Integration', () => {
  it('should maintain 8px spacing scale in rendered HTML', () => {
    const { container } = render(<MyComponent />)
    const element = container.firstChild as HTMLElement
    const styles = window.getComputedStyle(element)
    // Verify padding is multiple of 8
    expect(parseInt(styles.padding) % 8).toBe(0)
  })

  it('should have sufficient color contrast', async () => {
    // Use axe-core or WebAIM Contrast Checker for validation
    render(<MyComponent />)
    // Automated contrast checking would go here
  })
})
```

---

## Performance Guidelines

### Optimization Patterns

**1. Memoize expensive components**:
```typescript
import { memo } from 'react'

export const PokemonCard = memo(({ pokemon }: Props) => {
  return <Box>{pokemon.name}</Box>
}, (prevProps, nextProps) => {
  // Custom comparison: only re-render if Pokemon data actually changed
  return (
    prevProps.pokemon.id === nextProps.pokemon.id &&
    prevProps.pokemon.collected === nextProps.pokemon.collected
  )
})
```

**2. Cache filter/sort operations**:
```typescript
import { useMemo } from 'react'

export const AvailableGrid = ({ allPokemon, searchTerm }: Props) => {
  // Only recalculate if dependencies change
  const filtered = useMemo(() => {
    return allPokemon.filter(p =>
      p.name.toLowerCase().includes(searchTerm.toLowerCase())
    )
  }, [allPokemon, searchTerm])

  return <Box>{/* Render filtered Pokemon */}</Box>
}
```

**3. Avoid inline object creation**:
```typescript
// ❌ BAD: Creates new object every render
<Box sx={{ padding: 16, margin: 8 }}>

// ✅ GOOD: Use prop values directly
<Box padding={16} margin={8}>
```

**4. Use Grid instead of VStack for large lists**:
```typescript
// ❌ VStack: Single column, tall DOM tree
<VStack>
  {items.map(item => <Box key={item.id}>{item.name}</Box>)}
</VStack>

// ✅ Grid: Responsive columns, efficient layout
<Box
  display="grid"
  gridTemplateColumns={['1fr', 'repeat(2, 1fr)', 'repeat(3, 1fr)']}
  gap={16}
>
  {items.map(item => <Box key={item.id}>{item.name}</Box>)}
</Box>
```

---

## Code Examples

### Example 1: Button Component

```typescript
import { Button as ChakraButton, type ButtonProps } from '@chakra-ui/react'
import { forwardRef } from 'react'

export interface MyButtonProps extends ButtonProps {
  variant?: 'primary' | 'secondary' | 'destructive'
}

export const MyButton = forwardRef<HTMLButtonElement, MyButtonProps>(
  ({ variant = 'primary', children, ...props }, ref) => {
    const variantStyles = {
      primary: { colorScheme: 'teal', borderRadius: '8px' },
      secondary: { colorScheme: 'gray', borderRadius: '8px' },
      destructive: { colorScheme: 'red', borderRadius: '8px' },
    }

    return (
      <ChakraButton
        ref={ref}
        {...variantStyles[variant]}
        {...props}
      >
        {children}
      </ChakraButton>
    )
  }
)

MyButton.displayName = 'MyButton'
```

### Example 2: Card Component

```typescript
import { Box, type BoxProps } from '@chakra-ui/react'
import { ReactNode } from 'react'

export interface MyCardProps extends BoxProps {
  children: ReactNode
}

export const MyCard = ({ children, ...props }: MyCardProps) => {
  return (
    <Box
      backgroundColor="white"
      borderRadius="8px"
      padding={16}
      boxShadow="0 2px 4px rgba(0, 0, 0, 0.08)"
      transition="box-shadow 200ms ease-in-out"
      _hover={{
        boxShadow: '0 4px 8px rgba(0, 0, 0, 0.12)',
      }}
      {...props}
    >
      {children}
    </Box>
  )
}
```

### Example 3: Responsive Grid

```typescript
import { Box, Grid, type GridProps } from '@chakra-ui/react'

export interface MyGridProps extends GridProps {
  items: Array<{ id: string; name: string }>
}

export const MyGrid = ({ items, ...props }: MyGridProps) => {
  return (
    <Grid
      gridTemplateColumns={[
        '1fr',           // Mobile: 1 column
        'repeat(2, 1fr)', // Tablet: 2 columns
        'repeat(3, 1fr)', // Desktop: 3 columns
      ]}
      gap={16}
      {...props}
    >
      {items.map(item => (
        <Box key={item.id} padding={12} borderRadius="8px" backgroundColor="gray.50">
          {item.name}
        </Box>
      ))}
    </Grid>
  )
}
```

---

## Checklist for New Components

Before submitting a PR with a new component:

- [ ] Component uses Chakra UI components exclusively (no custom CSS)
- [ ] Component exports TypeScript interface for props (with JSDoc comments)
- [ ] All spacing uses 8px scale (4px, 8px, 12px, 16px, 24px, 32px, 48px, 64px)
- [ ] All colors tested for WCAG AA contrast (4.5:1 minimum)
- [ ] Component is keyboard accessible (Tab, Enter, Escape)
- [ ] Focus indicator visible and properly styled
- [ ] Component has unit tests covering main functionality
- [ ] Component has integration tests for accessibility and spacing
- [ ] Performance optimized (React.memo or useMemo if needed)
- [ ] No CSS files imported in component directory
- [ ] Props naming follows convention (variant, size, disabled, isOpen, etc.)
- [ ] Documentation includes usage examples
- [ ] ARIA labels added for icon-only buttons or screen reader context

---

**Last Updated**: 2025-12-03  
**Maintained By**: Pokemon Collector Development Team
