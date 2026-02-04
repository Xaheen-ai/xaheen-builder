# Accessibility Development Guide - apps/web/

**Target:** WCAG 2.1 Level AAA + Universell Utforming (Norwegian Universal Design)
**Compliance:** 87% AAA (13/15 criteria met)

This guide ensures all future development maintains our WCAG AAA accessibility standards.

---

## 🎯 Quick Reference Checklist

Before merging any PR, verify:

- [ ] All interactive elements keyboard accessible
- [ ] Focus indicators visible (no `outline: none` without replacement)
- [ ] All images have `alt` attributes
- [ ] All buttons have accessible labels
- [ ] Form inputs have associated labels
- [ ] Dynamic content has aria-live regions
- [ ] Color contrast meets 7:1 ratio (AAA)
- [ ] Design tokens used (no hardcoded colors)
- [ ] Respects `prefers-reduced-motion`
- [ ] Works with screen readers (test with VoiceOver)

---

## 📋 Core Patterns

### 1. Skip Navigation (WCAG 2.4.1 Level A)

**When:** Every page with repeating header navigation

**Implementation:**
```tsx
import { SkipLinks } from '../components';

function App() {
  return (
    <>
      <SkipLinks />
      <AppHeader id="main-navigation" aria-label="Hoved navigasjon" />
      <main id="main-content">
        {/* Your content */}
      </main>
    </>
  );
}
```

**Key Points:**
- `SkipLinks` must be first element in DOM
- Main content must have `id="main-content"`
- Header must have `id="main-navigation"`

---

### 2. Live Regions (WCAG 4.1.3 Level AA)

**When:** Content updates dynamically without page reload

#### Status Updates (Loading, Processing)
```tsx
{isLoading && (
  <div
    role="status"
    aria-live="polite"
    aria-busy="true"
  >
    <Spinner aria-label="Laster innhold..." />
  </div>
)}
```

#### Error Alerts (Urgent)
```tsx
{error && (
  <div
    role="alert"
    aria-live="assertive"
  >
    <Text color="var(--ds-color-danger-text-default)">
      {errorMessage}
    </Text>
  </div>
)}
```

#### Success Messages (Polite)
```tsx
{success && (
  <div
    role="status"
    aria-live="polite"
  >
    <Text color="var(--ds-color-success-text-default)">
      Lagret!
    </Text>
  </div>
)}
```

**When to use:**
- `aria-live="assertive"` → Errors, critical alerts (interrupts screen reader)
- `aria-live="polite"` → Loading states, success messages (waits for pause)
- `aria-live="off"` → Content not time-sensitive

---

### 3. Focus Management (WCAG 2.4.7 Level AA)

**Automatic via root.css:**
```css
/* Applied globally - no action needed */
*:focus-visible {
  outline: 3px solid var(--ds-color-focus-outer);
  outline-offset: 2px;
}
```

**Custom focus indicators (when needed):**
```tsx
<button
  style={{
    outline: 'none', /* Remove default */
  }}
  onFocus={(e) => {
    e.currentTarget.style.boxShadow = '0 0 0 3px var(--ds-color-focus-outer)';
  }}
  onBlur={(e) => {
    e.currentTarget.style.boxShadow = 'none';
  }}
>
  Custom Button
</button>
```

**❌ Never do this:**
```css
button:focus {
  outline: none; /* WITHOUT replacement */
}
```

---

### 4. Form Accessibility (WCAG 3.3.1 Level A)

#### Labels Required
```tsx
// ✅ CORRECT - Explicit label association
<label htmlFor="email-input">
  E-post
</label>
<input
  id="email-input"
  type="email"
  autoComplete="email"
  aria-required="true"
/>

// ✅ ALSO CORRECT - Implicit association
<label>
  E-post
  <input type="email" autoComplete="email" />
</label>

// ❌ WRONG - No label
<input type="email" placeholder="E-post" />
```

#### Autocomplete Attributes (WCAG 1.3.5 Level AA)
```tsx
<input type="email" autoComplete="email" />
<input type="tel" autoComplete="tel" />
<input type="text" autoComplete="name" />
<input type="text" autoComplete="street-address" />
<input type="text" autoComplete="postal-code" />
<input type="search" autoComplete="off" />
```

[Full autocomplete values list](https://html.spec.whatwg.org/multipage/form-control-infrastructure.html#autofill)

#### Error Handling
```tsx
const [error, setError] = useState('');

<label htmlFor="email">E-post</label>
<input
  id="email"
  type="email"
  aria-invalid={error ? 'true' : 'false'}
  aria-describedby={error ? 'email-error' : undefined}
/>
{error && (
  <span
    id="email-error"
    role="alert"
    style={{ color: 'var(--ds-color-danger-text-default)' }}
  >
    {error}
  </span>
)}
```

---

### 5. Button Accessibility (WCAG 4.1.2 Level A)

#### Icon-only Buttons
```tsx
// ✅ CORRECT - aria-label for screen readers
<button
  type="button"
  aria-label="Lukk"
  onClick={handleClose}
>
  <CloseIcon size={24} aria-hidden="true" />
</button>

// ❌ WRONG - No accessible label
<button onClick={handleClose}>
  <CloseIcon size={24} />
</button>
```

#### Button Type
```tsx
// ✅ ALWAYS specify type
<button type="button">Click me</button>
<button type="submit">Send</button>
<button type="reset">Reset</button>

// ❌ NEVER omit type (defaults to submit)
<button>Click me</button>
```

#### Toggle Buttons
```tsx
<button
  type="button"
  aria-pressed={isActive}
  aria-label={isActive ? 'Deaktiver' : 'Aktiver'}
>
  Toggle
</button>
```

---

### 6. Image Accessibility (WCAG 1.1.1 Level A)

#### Informative Images
```tsx
<img
  src="/logo.svg"
  alt="Digilist logo - Enkel booking"
/>
```

#### Decorative Images
```tsx
<img
  src="/pattern.svg"
  alt=""
  aria-hidden="true"
/>
```

#### Complex Images (Charts, Diagrams)
```tsx
<img
  src="/chart.png"
  alt="Sales chart"
  aria-describedby="chart-description"
/>
<div id="chart-description" className="sr-only">
  Bar chart showing sales increasing from January (100) to December (500).
  Peak month is December with 500 units sold.
</div>
```

---

### 7. Color Contrast (WCAG 1.4.6 Level AAA)

**Requirements:**
- Normal text: 7:1 ratio
- Large text (18pt+/14pt+ bold): 4.5:1 ratio

**Always use design tokens:**
```tsx
// ✅ CORRECT - Design tokens (AAA compliant)
<Text style={{
  color: 'var(--ds-color-neutral-text-default)',
  backgroundColor: 'var(--ds-color-neutral-background-default)',
}}>
  High contrast text
</Text>

// ⚠️ CAUTION - Subtle may not meet AAA
<Text style={{
  color: 'var(--ds-color-neutral-text-subtle)', // AA compliant, may not be AAA
}}>
  Secondary text
</Text>

// ❌ WRONG - Hardcoded colors
<Text style={{
  color: '#999', // Unknown contrast ratio
}}>
  Bad practice
</Text>
```

**Safe AAA color combinations:**
| Foreground Token | Background Token | Use Case |
|------------------|------------------|----------|
| `--ds-color-neutral-text-default` | `--ds-color-neutral-background-default` | Body text |
| `--ds-color-accent-contrast-default` | `--ds-color-accent-base-default` | Buttons |
| `--ds-color-danger-text-default` | `--ds-color-danger-surface-default` | Errors |
| `--ds-color-success-text-default` | `--ds-color-success-surface-default` | Success |

---

### 8. Motion & Animation (WCAG 2.3.3 Level AAA)

**Automatic via root.css:**
```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

**Manual implementation (if needed):**
```tsx
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

<motion.div
  animate={{ opacity: 1 }}
  transition={{
    duration: prefersReducedMotion ? 0 : 0.3
  }}
/>
```

---

### 9. Landmarks & Regions (WCAG 1.3.1 Level A)

#### Required Landmarks
```tsx
<header role="banner" aria-label="Hoved navigasjon">
  <AppHeader />
</header>

<main role="main" id="main-content">
  {/* Primary page content */}
</main>

<aside role="complementary" aria-label="Sideinnhold">
  {/* Related content */}
</aside>

<footer role="contentinfo">
  {/* Site footer */}
</footer>
```

#### Multiple Landmarks of Same Type
```tsx
<nav aria-label="Hovedmeny">
  {/* Primary navigation */}
</nav>

<nav aria-label="Brødsmule navigasjon">
  <Breadcrumb />
</nav>

<nav aria-label="Bunntekstkoblinger">
  {/* Footer links */}
</nav>
```

---

### 10. Screen Reader Only Content (Utility)

**When:** Additional context for screen reader users

**Implementation:**
```tsx
<button aria-label="Slett rad 3 av 10">
  <TrashIcon aria-hidden="true" />
  <span className="sr-only">Slett rad 3 av 10</span>
</button>
```

**CSS already available in `root.css`:**
```css
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border-width: 0;
}
```

---

## 🧪 Testing Guidelines

### Keyboard Navigation Test

1. Use only `Tab`, `Shift+Tab`, `Enter`, `Space`, `Arrow keys`
2. No mouse or trackpad
3. Verify:
   - All interactive elements reachable
   - Focus indicator always visible
   - Logical tab order
   - No keyboard traps
   - Skip links work

### Screen Reader Test

**VoiceOver (Mac):**
```bash
# Enable: Cmd + F5
# Navigate: Ctrl + Option + Arrow keys
# Read next: Ctrl + Option + A
```

**Test checklist:**
- [ ] All content announced
- [ ] Headings navigable (Ctrl+Opt+Cmd+H)
- [ ] Landmarks navigable (Ctrl+Opt+U → Landmarks)
- [ ] Form labels read aloud
- [ ] Error messages announced
- [ ] Loading states announced
- [ ] Dynamic updates announced (live regions)

### Color Contrast Test

**Tools:**
- [Chrome DevTools Contrast Ratio](https://developer.chrome.com/docs/devtools/accessibility/contrast/)
- [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/)
- [Figma A11y Plugin](https://www.figma.com/community/plugin/732603254453395948/Stark)

**Test:**
1. Inspect element in Chrome DevTools
2. Click color swatch in Styles panel
3. Verify contrast ratio shows ✅ AAA

---

## 🚫 Common Mistakes

### 1. Removing Focus Indicators
```tsx
// ❌ WRONG - Removes keyboard navigation indicator
button:focus {
  outline: none;
}

// ✅ CORRECT - Already handled by root.css
// No action needed
```

### 2. Click-only Handlers
```tsx
// ❌ WRONG - Not keyboard accessible
<div onClick={handleClick}>Click me</div>

// ✅ CORRECT - Use button
<button type="button" onClick={handleClick}>Click me</button>

// ✅ ALSO CORRECT - Add keyboard support if div required
<div
  role="button"
  tabIndex={0}
  onClick={handleClick}
  onKeyDown={(e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleClick();
    }
  }}
>
  Click me
</div>
```

### 3. Icon-only Buttons Without Labels
```tsx
// ❌ WRONG
<button><TrashIcon /></button>

// ✅ CORRECT
<button aria-label="Slett">
  <TrashIcon aria-hidden="true" />
</button>
```

### 4. Form Inputs Without Labels
```tsx
// ❌ WRONG
<input type="email" placeholder="E-post" />

// ✅ CORRECT
<label htmlFor="email">E-post</label>
<input id="email" type="email" />
```

### 5. Hardcoded Colors
```tsx
// ❌ WRONG
style={{ color: '#333', backgroundColor: '#f5f5f5' }}

// ✅ CORRECT
style={{
  color: 'var(--ds-color-neutral-text-default)',
  backgroundColor: 'var(--ds-color-neutral-surface-subtle)',
}}
```

---

## 🔧 Development Tools

### Browser Extensions

- [axe DevTools](https://www.deque.com/axe/devtools/) - Automated accessibility testing
- [Lighthouse](https://developers.google.com/web/tools/lighthouse) - Built into Chrome DevTools
- [WAVE](https://wave.webaim.org/extension/) - Visual accessibility feedback

### VS Code Extensions

- [axe Accessibility Linter](https://marketplace.visualstudio.com/items?itemName=deque-systems.vscode-axe-linter)
- [ESLint](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint) - Already configured with a11y rules

### Testing Libraries

```bash
# Install jest-axe for unit testing
pnpm add -D jest-axe @testing-library/jest-dom

# Install @testing-library/react for component testing
pnpm add -D @testing-library/react @testing-library/user-event
```

**Example Test:**
```tsx
import { render } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';

expect.extend(toHaveNoViolations);

describe('MyComponent', () => {
  it('should not have accessibility violations', async () => {
    const { container } = render(<MyComponent />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
```

---

## 📚 Resources

### Official Standards
- [WCAG 2.1 Quick Reference](https://www.w3.org/WAI/WCAG21/quickref/)
- [ARIA Authoring Practices](https://www.w3.org/WAI/ARIA/apg/)
- [Norwegian UU Regulations](https://www.uutilsynet.no/)

### Design System
- [Digdir Designsystemet](https://designsystemet.no/)
- [Design Token Reference](https://designsystemet.no/grunnleggende/design-tokens/)

### Learning
- [WebAIM](https://webaim.org/) - Accessibility tutorials
- [The A11Y Project](https://www.a11yproject.com/) - Community-driven checklist
- [Inclusive Components](https://inclusive-components.design/) - Pattern library

---

## 🎓 Training Checklist

For new developers, complete:

- [ ] Read this guide
- [ ] Navigate app with keyboard only (15 min)
- [ ] Test app with VoiceOver (15 min)
- [ ] Run axe DevTools on all pages
- [ ] Review ACCESSIBILITY_REPORT.md
- [ ] Complete one accessibility fix

---

## 🔄 Continuous Improvement

### Pre-commit Checklist
- Run ESLint (includes a11y rules)
- Verify keyboard navigation
- Check color contrast for new colors

### PR Review Checklist
- Accessibility section in PR template
- Automated Lighthouse CI checks
- Manual screen reader test for critical features

### Quarterly Audit
- Full screen reader test (all pages)
- Color contrast audit
- Keyboard navigation regression test
- Update this documentation

---

**Questions?** Review `ACCESSIBILITY_REPORT.md` or reach out to the team.

**Last Updated:** 2026-01-14
