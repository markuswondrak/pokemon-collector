# Data Model: Component Library Integration

**Phase**: 1 (Design & Contracts)  
**Date**: 2025-12-01  
**Focus**: Chakra UI component type definitions, theme configuration structure, design tokens

---

## Overview

This document defines the data structures and type definitions for Chakra UI integration in the Pokemon Collector application. All UI components will be instances of Chakra UI base components, styled exclusively through the centralized theme configuration (`src/styles/theme.ts`).

---

## 1. Theme Configuration Structure

### Theme Entity

**File**: `src/styles/theme.ts`

**Purpose**: Centralized design token configuration using Chakra UI's `extendTheme()` API.

**Type Definition**:
```typescript
import { extendTheme, ThemeConfig, theme as chakraTheme } from '@chakra-ui/react'

interface ThemeConfiguration {
  // Color palette
  colors: {
    gray: ColorValue[]
    pokemon: {
      teal: string      // #1ba098
      gold: string      // #ffd700
    }
    // + all Chakra base colors
  }

  // Spacing tokens (8px base unit)
  space: Record<string, string>

  // Typography tokens
  fonts: {
    body: string
    heading: string
    mono: string
  }
  fontSizes: Record<string, string>
  lineHeights: Record<string, string>
  fontWeights: Record<string, number>

  // Border radius tokens
  radii: Record<string, string>

  // Shadow tokens (elevation system)
  shadows: Record<string, string>

  // Component-level customizations
  components: {
    Button: ComponentVariant
    Card: ComponentVariant
    Input: ComponentVariant
    Grid: ComponentVariant
    Badge: ComponentVariant
    // ...
  }
}

type ComponentVariant = {
  variants?: Record<string, StyleObject>
  sizes?: Record<string, StyleObject>
  defaultProps?: {
    variant?: string
    size?: string
  }
}
```

**Implementation**:
```typescript
const theme = extendTheme({
  colors: {
    // Chakra base colors (inherited)
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
    hairline: 100,
    thin: 200,
    light: 300,
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
    extrabold: 800,
    black: 900,
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
    // Component overrides define variants, sizes, defaults
  },
})

export default theme
```

---

## 2. Chakra UI Component Type Definitions

### Base Components (Used Directly)

#### Button Component

**Chakra Type**: `ButtonProps`  
**Variants** (defined in theme):
- `primary`: Teal background, white text, 7:1 contrast, 16px padding
- `secondary`: Gray background, dark text, subtle elevation
- `destructive`: Red background, white text, for delete actions
- `ghost`: Transparent, hover effect only

**Sizes** (Chakra defaults):
- `sm`: 32px height, 12px padding
- `md`: 40px height, 16px padding (default)
- `lg`: 48px height, 20px padding

**Example Usage**:
```tsx
<Button variant="primary" size="md" onClick={handleCollect}>
  Collect Pokemon
</Button>
```

#### Input Component

**Chakra Type**: `InputProps`  
**Variants**:
- `outline` (default): Gray border, clean styling
- `flushed`: No border, underline on focus
- `filled`: Light gray background

**Sizes**:
- `sm`: 28px height
- `md`: 40px height (default)
- `lg`: 48px height

**Accessible Props**:
- `aria-label`: For screen readers
- `placeholder`: User guidance
- `isDisabled`: Disable state
- `isInvalid`: Error state with red border

**Example Usage**:
```tsx
<Input
  placeholder="Search Pokemon..."
  aria-label="Search for Pokemon by name"
  value={searchQuery}
  onChange={handleSearch}
  variant="outline"
  size="md"
/>
```

#### Card Component

**Chakra Type**: `CardProps`  
**Structure**:
```tsx
<Card>
  <CardHeader>   {/* Header section */}
  <CardBody>     {/* Main content */}
  <CardFooter>   {/* Footer section */}
</Card>
```

**Styling**:
- Default padding: `space.4` (16px)
- Shadow: `base` (elevation 1)
- Border radius: `base` (8px)
- Background: White (theme-aware)

**Example Usage**:
```tsx
<Card>
  <CardBody>
    <Image src={pokemon.image} alt={pokemon.name} />
    <Text fontSize="lg" fontWeight="bold">{pokemon.name}</Text>
    <Badge>{pokemon.index}</Badge>
  </CardBody>
</Card>
```

#### Grid Component

**Chakra Type**: `GridProps`  
**Props**:
- `templateColumns`: Define column layout (e.g., `"repeat(auto-fill, minmax(200px, 1fr))"`)
- `gap`: Space between items (use spacing scale: 2, 4, 6, 8)
- `w`: Width (full, auto)
- `p`: Padding (use spacing scale)

**Responsive Variant**:
```tsx
<Grid
  templateColumns={{ base: '1fr', md: '2fr', lg: '3fr' }}
  gap={4}
>
  {items.map(item => <GridItem key={item.id}>{item}</GridItem>)}
</Grid>
```

#### Text/Heading Components

**Chakra Types**: `TextProps`, `HeadingProps`  
**Typography Tokens**:
- Heading levels: h1-h6 with predefined sizes
- Text variants: default, muted, subtle
- Font sizes: Use predefined scale (xs, sm, md, lg, xl, 2xl, 3xl)

**Example Usage**:
```tsx
<Heading as="h2" size="lg">{title}</Heading>
<Text fontSize="md" color="gray.600">{description}</Text>
```

#### Badge Component

**Chakra Type**: `BadgeProps`  
**Variants**:
- `solid`: Filled background (default)
- `subtle`: Light background
- `outline`: Border only

**Sizes**:
- `sm`: Small text, compact padding
- `md`: Medium text, standard padding (default)
- `lg`: Large text

**Example Usage**:
```tsx
<Badge colorScheme="pokemon.teal" variant="solid">
  #{pokemon.index}
</Badge>
```

#### Box Component

**Chakra Type**: `BoxProps`  
**Purpose**: Flexible container for grouping and layout  
**Common Props**:
- `p`: Padding (use spacing scale)
- `m`: Margin (use spacing scale)
- `gap`: Gap between children (flexbox)
- `display`: Flex, block, grid, etc.
- `bg`: Background color
- `borderRadius`: Border radius (use radii scale)

**Example Usage**:
```tsx
<Box p={4} borderRadius="base" bg="gray.50">
  {content}
</Box>
```

#### Stack Components

**Chakra Types**: `VStackProps`, `HStackProps`, `StackProps`  
**Purpose**: Consistent layout with spacing

**Usage**:
```tsx
// Vertical stack (column layout)
<VStack spacing={3} align="stretch">
  {items}
</VStack>

// Horizontal stack (row layout)
<HStack spacing={4}>
  <Button>Cancel</Button>
  <Button>Save</Button>
</HStack>
```

---

## 3. Component Entity Relationships

### UI Component Hierarchy

```
App.tsx (ChakraProvider wrapper)
├── StickySearchBar (Input, Button components)
├── CollectionList (Grid, Card, Badge components)
├── WishlistList (Grid, Card, Badge components)
├── AvailableGrid (Grid, Card, Badge, Button components)
│   └── LazyLoadingGrid (Grid container with lazy loading)
│       └── PokemonCard (Card, Image, Text, Badge, Button)
```

### Data Flow (Unchanged)

```
App state (React hooks)
  ↓
Components (Chakra UI styled)
  ↓
Services (pokemonService, collectionStorage)
  ↓
External APIs (PokéAPI)
```

**Key Point**: Data models (Pokemon, Collection) remain unchanged. Only styling layer changes from custom CSS to Chakra UI components.

---

## 4. Validation Rules & Component State

### Pokemon Entity (Unchanged)

```typescript
interface Pokemon {
  index: number          // 1-1025
  name: string          // 'Charizard'
  image: string         // PokéAPI image URL
  collected: boolean    // Stored in localStorage
  wishlisted: boolean   // Stored in localStorage
}
```

### Component Props (Type-Safe via Chakra)

All Chakra components are fully typed via TypeScript. Example:

```typescript
interface PokemonCardProps {
  pokemon: Pokemon
  onCollect: (pokemon: Pokemon) => void
  onWishlist: (pokemon: Pokemon) => void
  isLoading?: boolean
}

export function PokemonCard({
  pokemon,
  onCollect,
  onWishlist,
  isLoading = false,
}: PokemonCardProps) {
  return (
    <Card>
      <CardBody>
        <Image src={pokemon.image} alt={pokemon.name} />
        <Text>{pokemon.name}</Text>
        <Badge>{pokemon.index}</Badge>
        <Button
          variant="primary"
          isLoading={isLoading}
          onClick={() => onCollect(pokemon)}
        >
          Collect
        </Button>
      </CardBody>
    </Card>
  )
}
```

---

## 5. Theme Customization Points

### Extensibility via Theme Config

**Override Component Defaults**:
```typescript
const theme = extendTheme({
  components: {
    Button: {
      baseStyle: {
        fontWeight: 600,
        borderRadius: 'base',
      },
      variants: {
        primary: {
          bg: 'pokemon.teal',
          color: 'white',
          _hover: { bg: 'pokemon.teal', opacity: 0.9 },
          _active: { bg: 'pokemon.teal', opacity: 0.8 },
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
      defaultProps: {
        variant: 'primary',
      },
    },
  },
})
```

### Color Mode Support (Future Enhancement)

Chakra supports dark mode via theme config (not required for Phase 1):
```typescript
const theme = extendTheme({
  config: {
    initialColorMode: 'light',
    useSystemColorMode: true,
  },
})
```

---

## 6. Accessibility Data Attributes

### ARIA Props in Chakra Components

Chakra components automatically handle ARIA labels and roles. Examples:

```tsx
// Chakra adds ARIA automatically
<FormControl isInvalid={hasError}>
  <FormLabel>Pokemon Name</FormLabel>
  <Input aria-label="Enter Pokemon name" />
  <FormErrorMessage>Name is required</FormErrorMessage>
</FormControl>

// Button role automatically added
<Button>Collect</Button>
// ↓ Rendered as: <button>Collect</button>

// Image with alt text (required)
<Image src={url} alt={pokemon.name} />
// ↓ Rendered with alt attribute
```

### Manual ARIA When Needed

```tsx
<Button aria-pressed={isCollected} onClick={toggle}>
  {isCollected ? 'Remove' : 'Collect'}
</Button>
```

---

## 7. Validation & Constraint Mapping

| Entity | Constraint | Chakra Implementation |
|---|---|---|
| Button variant | Must be primary/secondary/destructive | Define in theme.ts |
| Input field | Min 3 characters before filtering | Logic in component, not CSS |
| Card spacing | 8px base unit | `p={4}` (16px) from spacing scale |
| Text contrast | 7:1 WCAG AAA | Colors defined in theme |
| Border radius | ≥8px (some components 4px min) | `borderRadius="base"` (8px) |
| Image fallback | Generic silhouette placeholder | Logic in component; Chakra Image handles rendering |
| Responsive grid | Auto-fill columns based on viewport | CSS Grid via theme tokenization |

---

## Summary: Phase 1 Data Model Complete

**Entities Defined**:
- ✅ Theme configuration structure (`src/styles/theme.ts`)
- ✅ Chakra UI component types (Button, Input, Card, Grid, Badge, etc.)
- ✅ Component prop types (TypeScript interfaces)
- ✅ Accessibility data attributes
- ✅ Validation & constraint mapping

**No Breaking Changes to Existing Models**:
- Pokemon, Collection data structures unchanged
- Services (pokemonApi, pokemonService, collectionStorage) unchanged
- Only styling layer affected

**Ready for Phase 1**: ✅ Data model complete. Proceeding to component contracts.
