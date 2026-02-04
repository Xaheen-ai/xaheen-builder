# Designsystemet Examples

This directory contains practical examples demonstrating how to use Designsystemet components correctly within the Xala platform.

## Available Examples

### 1. Provider Usage (`provider-usage.tsx`)

Demonstrates the correct setup of `DesignsystemetProvider` and alternative data attribute usage.

**Key concepts:**
- Provider placement at application root
- Theme, color scheme, and size management
- Direct data attribute manipulation for non-React integration

**Usage:**
```typescript
import { AppLayout } from '@xaheen/ds-registry/examples';

function MyApp() {
  return (
    <AppLayout>
      <YourAppContent />
    </AppLayout>
  );
}
```

### 2. asChild Pattern (`asChild-pattern.tsx`)

Shows how to use the `asChild` prop to render components as different HTML elements while maintaining all behaviors.

**Key concepts:**
- Rendering buttons as links
- Integration with routing libraries
- Single child rule and complex nested content
- Radix Slot behavior explanation

**Usage:**
```typescript
import { ButtonAsLink, ButtonAsRouterLink } from '@xaheen/ds-registry/examples';

// Basic link button
<ButtonAsLink />

// Router integration
<ButtonAsRouterLink to="/dashboard">Go to Dashboard</ButtonAsRouterLink>
```

### 3. Theme Switching (`theme-switching.tsx`)

Complete example of runtime theme switching with both provider and programmatic control.

**Key concepts:**
- Runtime theme switching
- Color scheme controls (light/dark/auto)
- Size mode adjustments
- Programmatic theme manipulation

**Usage:**
```typescript
import { ThemeSwitcher, useThemeSwitch } from '@xaheen/ds-registry/examples';

// Provider-based switching
<ThemeSwitcher />

// Programmatic control
function MyComponent() {
  const { setTheme, setColorScheme } = useThemeSwitch();
  
  return (
    <button onClick={() => setTheme('altinn')}>
      Switch to Altinn theme
    </button>
  );
}
```

## Common Patterns

### Form Field with Label

```typescript
import { Label, Select } from '@xaheen/ds';

<div style={{ marginBottom: 16 }}>
  <Label htmlFor="my-select">Select an option</Label>
  <Select id="my-select" onChange={handleChange}>
    <option value="1">Option 1</option>
    <option value="2">Option 2</option>
  </Select>
</div>
```

### Button as Link

```typescript
import { Button } from '@xaheen/ds';

<Button asChild>
  <a href="/external-page" target="_blank" rel="noopener noreferrer">
    External Link
  </a>
</Button>
```

### Theme Provider Setup

```typescript
import { DesignsystemetProvider } from '@xaheen/ds';

<DesignsystemetProvider 
  theme="digdir" 
  colorScheme="auto" 
  size="md"
>
  <App />
</DesignsystemetProvider>
```

## Best Practices Demonstrated

1. **Single CSS Import**: All examples assume `@xaheen/ds/styles` is imported once at the app entry point
2. **No Direct Digdir Imports**: All components come through `@xaheen/ds`
3. **Accessibility**: Proper label associations and semantic HTML
4. **TypeScript**: Full type safety with proper imports

## Running Examples

Since these are example components, you can import and use them directly in your application:

```typescript
import { ThemeSwitcher } from '@xaheen/ds-registry/examples';

function MyPage() {
  return <ThemeSwitcher />;
}
```

Or copy the code patterns into your own components as needed.

## Common Mistakes to Avoid

❌ **Wrong**: Multiple CSS imports
```typescript
import '@digdir/designsystemet-theme/digdir.css'; // Don't do this!
```

✅ **Correct**: Single import through facade
```typescript
import '@xaheen/ds/styles'; // Do this once in main.tsx
```

❌ **Wrong**: Direct Digdir imports
```typescript
import { Button } from '@digdir/designsystemet-react'; // Don't do this!
```

✅ **Correct**: Import through facade
```typescript
import { Button } from '@xaheen/ds'; // Correct!
```

❌ **Wrong**: Multiple children with asChild
```typescript
<Button asChild>
  <div>
    <Icon /> {/* Wrong - multiple direct children */}
    <span>Text</span>
  </div>
</Button>
```

✅ **Correct**: Single child with nested content
```typescript
<Button asChild>
  <a href="#">
    <Icon /> {/* Correct - nested content is fine */}
    <span>Text</span>
  </a>
</Button>
```
