# UI Guardrails Contract

> **Status:** AUTHORITATIVE  
> **Version:** 1.0  
> **Date:** 2026-02-03  
> **Scope:** All apps (backoffice, dashboard, web, docs, monitoring) + domain UI packages

This contract ensures UI implementation consistency across Xaheen.

---

## 1. Platform-UI is the Only UI Source of Truth

### ✅ Allowed

- Import UI components from:
  - `@xala-technologies/platform-ui-core`
  - `@xala-technologies/platform-ui-digilist` (domain-specific)
  - `@xala-technologies/platform-ui` (umbrella)
  - `@xala-technologies/guardrails` (verification)

### ❌ Forbidden

- **Direct Digdir imports** in apps:
  - `@digdir/designsystemet-react`
  - `@digdir/designsystemet-css`
  - `@digdir/designsystemet-theme`

- **Other UI kits** in apps (unless approved at platform-ui level):
  - `@radix-ui/*`
  - `@headlessui/*`
  - `antd`, `@mui/*`, `shadcn`

**Reason:** Apps stay thin; platform-ui controls upgrades, accessibility, tokens, and visual consistency.

---

## 2. No Raw HTML Rule

### Default

No raw HTML elements in app pages and feature components.

### ✅ Allowed

- Platform-ui components only
- Layout primitives from platform-ui:
  - `Stack`, `Grid`, `Container`, `Center`, `HorizontalLayout`
  - `Sidebar`, `MainContent`, `LayoutGrid`
  - `Card`, `Text`, `Badge`, `Icon`

### ❌ Forbidden in Apps

| Raw Element | Use Instead |
|-------------|-------------|
| `<div>` | `Stack`, `Container`, `Card` |
| `<span>` | `Text`, `Badge` |
| `<button>` | `Button` |
| `<input>` | `Textfield`, `NumberInput`, `NativeSelect` |
| `<table>` | `DataTable` |
| `<ul>`, `<li>` | `List` from Digdir |
| `<p>`, `<h1-h6>` | `Heading`, `Paragraph` |
| `<a>` | `Link` |
| `<section>` | `SectionCard`, `ContentSection` |

### Exceptions

| Allowed Where | Reason |
|---------------|--------|
| `platform-ui-core/primitives/` | Building blocks that construct layout utilities |
| `.stories.tsx`, `.test.tsx` | Testing and examples |
| Next.js primitives | `<Link>`, `<Image>`, `<Script>` are framework-required |

**Important:** Exception boundaries live in platform-ui, never in apps.

---

## 3. No Custom CSS Rule

### ✅ Allowed

- Styling only through platform-ui tokens + variants
- Theme configuration via DB (tenant themes) consumed by platform-ui
- Component variants: `size`, `color`, `variant` props

### ❌ Forbidden in Apps

- `.css` / `.scss` files (except framework-required globals)
- CSS-in-JS libraries (`styled-components`, `emotion`)
- Tailwind utility classes
- Inline styles (`style={{...}}`) with raw values

### Allowed CSS Properties (Layout Only)

If inline styles are unavoidable, only these properties are allowed:

```
display, position, flex, flexDirection, justifyContent, alignItems,
gridTemplateColumns, gridRow, overflow, visibility, opacity,
transform, transition, cursor, pointerEvents, whiteSpace
```

---

## 4. No Ad-Hoc Styling Rule

### ❌ Forbidden in Apps

- Ad-hoc spacing (raw `margin`/`padding` values)
- Custom colors (hex, rgb, hsl)
- Layout tweaks (manual `width`/`height`)
- Custom responsive breakpoints

### ✅ Allowed

- Layout composition using primitives: `Stack`, `Grid`, `Container`
- Platform-ui "density" and "layout presets"
- Data attributes: `data-size`, `data-color`, `data-spacing`

**Reason:** Consistent WCAG behavior and design across all apps.

---

## 5. Where UI Changes Are Allowed

### ✅ Allowed Locations

| Location | What Can Change |
|----------|-----------------|
| `platform-ui-core/` | Tokens, theming, new components, accessibility |
| `platform-ui-digilist/` | Domain-specific compositions |
| `guardrails/` | Linting rules, verification scripts |
| `.storybook/` | Documentation and examples |

### Apps Should Only

- ✅ Compose existing components
- ✅ Pass props
- ✅ Load data via SDK hooks
- ❌ Never define new styles
- ❌ Never create new primitives

---

## 6. Component Inventory (platform-ui-core)

> This is the authoritative list of available components.

### Primitives (23)

| Component | Purpose |
|-----------|---------|
| `Stack` | Vertical layout with gap |
| `Grid` | CSS Grid wrapper |
| `Container` | Max-width + padding |
| `Center` | Centering wrapper |
| `HorizontalLayout` | Flexbox row |
| `Sidebar` | Fixed sidebar layout |
| `MainContent` | Content area wrapper |
| `LayoutGrid` | Dashboard grid |
| `Card` | Card surface |
| `Text` | Text with variants |
| `Badge` | Status/label badge |
| `Icon` | Icon wrapper |
| `Progress` | Progress bar |
| `FilterChip` | Filter chip |
| `FormField` | Form field wrapper |
| `Logo` | Logo component |
| `NativeSelect` | Native select dropdown |
| `BidiSafeInput` | RTL-safe input |
| `DirectionalIcon` | LTR/RTL icon flip |

### Composed (87 components)

Key components:

| Component | Purpose |
|-----------|---------|
| `DataTable` | Sortable, filterable table |
| `Modal` | Modal dialog |
| `Drawer` | Slide-out panel |
| `Toast` | Notification toast |
| `Breadcrumbs` | Navigation breadcrumbs |
| `Tabs` | Tab navigation |
| `Accordion` | Collapsible sections |
| `SearchableSelect` | Searchable dropdown |
| `FilterPanel` | Multi-filter panel |
| `Stepper` | Multi-step wizard |
| `FileUploader` | File upload |
| `RichTextEditor` | WYSIWYG editor |
| `DateRangePicker` | Date range selection |
| `Tooltip` | Hover tooltip |
| `Popover` | Popover content |

### Blocks (53 components)

Domain-agnostic business patterns.

### Patterns (21 components)

High-level compositions (forms, reviews, multi-step).

### Shells (4)

- `AppLayout` — Full application shell
- `DashboardHeader` — Dashboard header
- `DashboardSidebar` — Dashboard sidebar

---

## 7. Enforcement (CI/Lint)

### @xala-technologies/guardrails

Already provides:

| Export | Purpose |
|--------|---------|
| `eslintPreset` | ESLint config with all rules |
| `createFlatConfig()` | ESLint 9+ flat config |
| `verifyDesignTokens()` | Scan for raw HTML, inline styles |
| `checkCompliance()` | Full compliance check |

### ESLint Rules (Already Enforced)

```javascript
// Forbidden imports
'no-restricted-imports': ['error', {
  paths: [
    { name: '@digdir/designsystemet-react', message: 'Use platform-ui' },
    { name: '@digdir/designsystemet-css', message: 'Styles via platform-ui' }
  ]
}]

// Forbidden raw HTML
'no-restricted-syntax': ['error', 
  { selector: 'JSXOpeningElement[name.name="div"]', message: 'Use Stack/Container' },
  { selector: 'JSXOpeningElement[name.name="span"]', message: 'Use Text/Badge' },
  // ... all elements mapped
]
```

### CI Commands

```bash
# Run guardrails compliance check
npx guardrails check-compliance

# Verify design tokens
npx guardrails verify:design-tokens

# Lint apps
eslint apps/ --config eslint.config.js
```

---

## 8. Adding New Components

### In platform-ui (Allowed)

1. Create component in appropriate layer (`primitives/`, `composed/`, `blocks/`)
2. Export from layer index
3. Add Storybook story
4. Document accessibility
5. Add to guardrails element-mappings if replacing raw HTML

### In apps (Forbidden)

Never create new UI primitives in apps.
If a component is needed, request it in platform-ui repo.

---

## 9. RTL & Arabic Support

### Supported Locales

| Locale | Direction | Status |
|--------|-----------|--------|
| `nb` | LTR | Primary |
| `en` | LTR | Required |
| `ar` | RTL | Required |

**CI Rule:** Every package/app must provide `locales/nb.json`, `locales/en.json`, `locales/ar.json`. CI fails if any are missing.

---

### 9.1 RTL is Platform-Level Only

Apps must **never** implement RTL manually.

#### ✅ Allowed

- Platform-ui sets direction via a single global mechanism:
  - `dir="rtl" | "ltr"` on the root
  - Token-based logical styling in components
  - `PlatformRoot` wrapper (platform-ui owned)

#### ❌ Forbidden in Apps

- Per-component hacks: `style={{ direction: 'rtl' }}`
- Conditional Tailwind classes for RTL
- Custom CSS "flip" rules
- Manual `left`/`right` positioning

---

### 9.2 Direction Derived from Locale

The localization layer exposes:

```typescript
interface LocaleContext {
  locale: 'nb' | 'en' | 'ar';
  direction: 'ltr' | 'rtl';
}
```

**Mapping:**

| Locale | Direction |
|--------|-----------|
| `ar` | `rtl` |
| `*` (all others) | `ltr` |

**Platform-ui applies:**

```html
<html lang="{locale}" dir="{direction}">
```

---

### 9.3 Use Logical Properties, Not left/right

Platform-ui components use logical layout primitives:

| ❌ Physical | ✅ Logical |
|-------------|------------|
| `padding-left` | `padding-inline-start` |
| `margin-right` | `margin-inline-end` |
| `left` | `inset-inline-start` |
| `text-align: left` | `text-align: start` |

**Apps must only use:**
- `Stack`, `Inline`, `Grid`, `Container`
- `AlignStart` / `AlignEnd` props (if exposed)

❌ Apps cannot reference `left`/`right` alignment or spacing.

---

### 9.4 Icon Mirroring

RTL affects UI semantics, not just text.

**Platform-ui responsibility:**

| Component | RTL Behavior |
|-----------|--------------|
| Chevrons, arrows | Mirror automatically |
| Back/forward buttons | Flip direction |
| Breadcrumb separators | Flip direction |
| Stepper arrows | Flip direction |
| Pagination next/prev | Flip |
| Sidebar collapse arrows | Flip |

**Component:** `DirectionalIcon` (already in primitives)

**Apps must:**
- Never hardcode directional icons
- Always use `DirectionalIcon` or platform-ui icon wrappers

---

### 9.5 Typography & Font Strategy

Arabic requires a readable Arabic-capable font.

**Rule:** Font decisions live in platform-ui `themes/tokens`.

```typescript
// Platform-ui defines font stacks per script
tokens.font.body.ltr = 'Inter, system-ui, sans-serif';
tokens.font.body.rtl = 'Noto Sans Arabic, system-ui, sans-serif';
tokens.font.heading.ltr = 'Inter, system-ui, sans-serif';
tokens.font.heading.rtl = 'Noto Sans Arabic, system-ui, sans-serif';
```

❌ Apps do not set fonts.

---

### 9.6 Localization Content Rules for Arabic

| Rule | Reason |
|------|--------|
| No string concatenation | Arabic grammar differs |
| Use interpolation | `t('items', { count })` |
| Use pluralization | Arabic has complex plural forms |
| Localized punctuation | Arabic uses different punctuation |

---

### 9.7 Numbers, Dates, Currency

**Single formatting policy** enforced in `@xaheen/localization`:

```typescript
// Numbers
new Intl.NumberFormat(locale).format(value);

// Dates
new Intl.DateTimeFormat(locale).format(date);

// Currency
new Intl.NumberFormat(locale, { style: 'currency', currency: 'NOK' }).format(value);
```

**Important:** Arabic locales may render Arabic-Indic digits.

**Policy (choose one and enforce):**
- ✅ Accept native digits (locale-appropriate)
- OR force Latin digits for civic contexts

**Enforcement:** `@xaheen/localization` formatting helpers, never in apps.

---

### 9.8 RTL Testing & CI Gates

#### A) Translation Completeness Gate

CI verifies every key used exists in `nb`, `en`, and `ar`.

```bash
npx guardrails verify:translations
```

#### B) RTL Smoke Test (Playwright)

Each app must have at least one test:

```typescript
test('RTL layout renders correctly', async ({ page }) => {
  await page.goto('/?lang=ar');
  
  // Assert root has dir="rtl"
  const html = page.locator('html');
  await expect(html).toHaveAttribute('dir', 'rtl');
  
  // Assert nav renders
  await expect(page.locator('[data-testid="main-nav"]')).toBeVisible();
  
  // Assert table renders without overflow
  await expect(page.locator('[data-testid="data-table"]')).toBeVisible();
  
  // Assert dialog opens/closes
  await page.click('[data-testid="open-dialog"]');
  await expect(page.locator('[role="dialog"]')).toBeVisible();
  await page.click('[data-testid="close-dialog"]');
  await expect(page.locator('[role="dialog"]')).not.toBeVisible();
});
```

#### C) Visual Regression (Recommended)

At least for:
- Backoffice sidebar layout
- Dashboard tables + forms
- Web booking flow header/steps

---

### 9.9 PlatformRoot Wrapper

To avoid raw HTML exceptions for `<html>` attributes:

```tsx
// platform-ui-core/shells/PlatformRoot.tsx
// ONLY platform-ui-owned place to set dir/lang

interface PlatformRootProps {
  locale: string;
  children: ReactNode;
}

export function PlatformRoot({ locale, children }: PlatformRootProps) {
  const direction = locale === 'ar' ? 'rtl' : 'ltr';
  
  useEffect(() => {
    document.documentElement.lang = locale;
    document.documentElement.dir = direction;
  }, [locale, direction]);
  
  return <>{children}</>;
}
```

**Apps just use:**

```tsx
<PlatformRoot locale={currentLocale}>
  <App />
</PlatformRoot>
```

---

## 10. Localization Guardrails

### Goals

- No hardcoded user-facing strings in apps or platform-ui
- Norwegian Bokmål (`nb`) is primary; English (`en`) always supported; Arabic (`ar`) required
- Translation keys are stable, discoverable, and versioned
- Domain modules ship their own keys; runtime overrides possible per tenant

---

### 10.1 Source of Truth for Translations

#### Translation Storage Model

| Layer | Source |
|-------|--------|
| **Baseline** | Code-based dictionaries (versioned, shipped with packages) |
| **Overrides** | DB-based per tenant/environment (control plane) |

**Rule:** Apps load translations through `@xaheen/localization`, never directly.

#### Ownership Boundaries

| Owner | Key Namespace |
|-------|---------------|
| platform-ui | `ui.*`, `layout.*`, `common.*` |
| Kernel | `platform.*`, `auth.*`, `billing.*`, `governance.*` |
| Domain modules | `<domain>.*` (e.g., `digilist.*`) |

❌ No other key namespaces are allowed.

---

### 10.2 No Hardcoded Strings Rule

#### ❌ Forbidden

- Any literal user-facing string in JSX/TS

#### ✅ Allowed

- `t('key.path')`
- `<Trans i18nKey="key.path" />`
- Formatting via localization utilities

#### Exceptions

| Allowed | Reason |
|---------|--------|
| Test files | Not user-facing |
| Developer logs | Structured logging preferred |
| `data-testid` | Not user-facing |
| HTTP headers/constants | Internal only |

**Examples:**

```tsx
// ✅ Correct
<Heading>{t('digilist.bookings.title')}</Heading>

// ❌ Forbidden
<Heading>Bookings</Heading>
```

---

### 10.3 Key Design Rules

#### Key Format

- Lowercase, dot-separated: `digilist.booking.status.confirmed`
- No spaces, no camelCase
- Keys are immutable once released (only values change)

#### Key Placement

| Package | Location |
|---------|----------|
| platform-ui | `packages/ui/locales/{nb,en,ar}.json` |
| Kernel | `locales/{nb,en,ar}.json` |
| Domain UI | `packages/<domain>-ui/locales/{nb,en,ar}.json` |

**Rule:** Domain apps (dashboard/web) do not define domain keys — the domain UI package does.

---

### 10.4 Runtime Overrides (Tenant-Level)

If DB overrides are supported:

1. Overrides live in `app.translations` (or equivalent)
2. Loaded at app boot:
   - Base dictionaries (code)
   - Environment overrides (optional)
   - Tenant overrides
3. Merge strategy: deep merge by key, missing falls back to base

**Rule:** Apps must not fetch translation JSON manually. Only through `@xaheen/localization` API.

---

### 10.5 Formatting Rules

| Type | Helper | Example |
|------|--------|---------|
| Dates | `formatDate(date, locale)` | `formatDate(new Date(), 'nb')` |
| DateTime | `formatDateTime(date, locale, tz?)` | `formatDateTime(date, 'ar', 'Europe/Oslo')` |
| Numbers | `formatNumber(value, locale)` | `formatNumber(1234.56, 'nb')` |
| Currency | `formatCurrency(amount, currency, locale)` | `formatCurrency(100, 'NOK', 'nb')` |
| Plurals | `t('key', { count })` | `t('common.items', { count: 5 })` |

---

### 10.6 Accessibility + Localization

#### ✅ Required

- All `aria-label` must be localized: `aria-label={t('common.close')}`
- All `alt` text must be localized: `alt={t('digilist.object.image_alt')}`

#### ❌ Forbidden

- Hardcoded `aria-label` strings
- Icons without accessible labels (unless `aria-hidden` defined by platform-ui)

---

### 10.7 Localization Enforcement (Lint + CI)

#### ESLint Rules

| Rule | Purpose |
|------|---------|
| Ban string literals in JSX text nodes | No hardcoded strings |
| Ban string literals in `aria-*` attributes | Accessibility compliance |
| Ban `title="..."` and `placeholder="..."` literals | Form accessibility |

**Allow list:**
- `data-testid`
- Non-user-facing constants
- Test files

#### CI Validation Script

```bash
npx guardrails verify:translations
```

**Validates:**
- Every referenced key exists in `nb.json`, `en.json`, `ar.json`
- No unused keys (recommended)
- No duplicate keys across namespaces
- All packages provide all required locales

---

### 10.8 @xaheen/localization API

Apps use only:

| Export | Purpose |
|--------|---------|
| `useT()` | Returns `t()` function |
| `useLocale()` | Current locale + direction |
| `I18nProvider` | Loads base + overrides |
| `formatDate()` | Date formatting |
| `formatNumber()` | Number formatting |
| `formatCurrency()` | Currency formatting |

❌ Apps never import translation JSON directly.

---

### 10.9 File Structure

```
platform-ui/
  packages/ui/locales/
    nb.json
    en.json
    ar.json

xalabase/
  locales/           # Kernel (platform/auth/billing/governance)
    nb.json
    en.json
    ar.json

  packages/
    digilist-ui/
      locales/       # Domain keys
        nb.json
        en.json
        ar.json
```

---

## Ratification

> **Status:** APPROVED AS AUTHORITATIVE  
> **Applies to:** All Xaheen apps and domain UI packages  
> **Enforcement:** CI failure on violation

This document is referenced by [APP_ARCHITECTURE_CONTRACT.md](./APP_ARCHITECTURE_CONTRACT.md).

