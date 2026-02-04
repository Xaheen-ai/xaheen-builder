# @xaheen/ds-registry

A comprehensive registry for Designsystemet components, patterns, and usage guidelines.

## Quick Start

### Simple JSON Registry (Recommended)

The registry is available as a single JSON file for maximum simplicity:

```typescript
// Import the JSON registry utilities
import { components, patterns, examples, getComponent } from '@xaheen/ds-registry/registry';

// Or import the raw JSON directly
import registryData from '@xaheen/ds-registry/registry.json';

// Get component info
const buttonInfo = components.button;
console.log(buttonInfo.description);
// Output: Primary action element with multiple variants and sizes.

// Get all components in a category
const inputComponents = Object.values(components)
  .filter(c => c.category === 'input');

// Find a specific component
const alertComponent = getComponent('alert');
```

### TypeScript Registry (Legacy)

For full TypeScript support, use the complex registry:

```typescript
import { components, patterns, examples } from '@xaheen/ds-registry';

const buttonInfo = components.button;
```

## Registry Structure

### JSON Registry Format

```json
{
  "version": "1.0.0",
  "lastUpdated": "2025-01-12",
  "components": { ... },
  "patterns": { ... },
  "examples": { ... },
  "guidelines": { ... },
  "rules": { ... },
  "metadata": { ... }
}
```

### Components

Each component includes:
- Basic metadata (name, category, description)
- Import path from `@xaheen/ds`
- Accessibility features
- Common use cases
- Related components
- Props documentation (when available)

### Patterns

UI patterns include:
- Components used
- When to use the pattern
- Accessibility considerations
- Related patterns

### Examples

Code examples provide:
- Copy-paste ready implementations
- Component associations
- Tags for categorization

### Guidelines

Best practices cover:
- Accessibility requirements
- Styling guidelines
- Performance recommendations
- Architecture rules

## Usage Examples

### Finding Components

```typescript
// Get all input components
const inputComponents = Object.values(components)
  .filter(c => c.category === 'input');

// Check if a component supports asChild
if (components.button.supportsAsChild) {
  // Component supports asChild pattern
}
```

### Working with Patterns

```typescript
// Get form validation pattern
const formPattern = patterns.formValidation;
console.log(formPattern.components);
// ["ErrorSummary", "Field", "Input", "Button"]
```

### Using Examples

```typescript
// Get all button examples
const buttonExamples = Object.values(examples)
  .filter(e => e.component === 'button');

// Use an example
const example = buttonExamples[0];
console.log(example.code);
```

## Development Rules

### Required Rules

1. **Import Restrictions**
   - Must import UI only from `@xaheen/ds`
   - Must not import `@digdir/*` packages directly
   - Must import `@xaheen/ds/styles` exactly once

2. **Styling Guidelines**
   - No custom UI components in apps
   - Avoid custom CSS
   - Use component variants and design tokens

3. **Accessibility Requirements**
   - All interactive elements keyboard accessible
   - Proper ARIA attributes and semantic HTML
   - WCAG 2.2 AA color contrast

## Registry Statistics

```bash
# View registry metadata
pnpm validate

# Output:
# {
#   totalComponents: 18,
#   totalPatterns: 4,
#   totalExamples: 4,
#   totalGuidelines: 3,
#   categories: { ... },
#   themes: ["digdir", "altinn", "uutilsynet", "portal"],
#   dataAttributes: { ... }
# }
```

## Available Themes

- `digdir`: Default Digdir theme
- `altinn`: Altinn theme
- `uutilsynet`: Utsynet theme
- `portal`: Portal theme

## Data Attributes

Designsystemet uses these data attributes:
- `data-color-scheme`: "auto" | "light" | "dark"
- `data-size`: "sm" | "md" | "lg"
- `data-typography`: "primary" | "secondary"

## Contributing

To update the registry:

1. Edit `registry.json` directly
2. Update component documentation
3. Add new examples as needed
4. Run `pnpm validate` to check structure

The JSON format makes it easy to:
- Parse in any language
- Generate documentation
- Create tooling
- Sync with design system updates

## License

Internal Xala package - not for external distribution.
