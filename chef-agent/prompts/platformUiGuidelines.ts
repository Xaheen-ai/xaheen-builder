import { stripIndents } from '../utils/stripIndent.js';
import type { SystemPromptOptions } from '../types.js';

/**
 * Designsystemet Guidelines
 * 
 * Comprehensive prompt teaching AI how to use @digdir/designsystemet-react components.
 * Based on the official Designsystemet documentation: https://designsystemet.no/
 */
export function platformUiGuidelines(_options: SystemPromptOptions) {
  return stripIndents`
# @digdir/designsystemet-react - Complete Component Reference

You MUST use \`@digdir/designsystemet-react\` for ALL UI. Raw HTML and Tailwind are STRICTLY FORBIDDEN.

## ⚠️ CRITICAL RULES

1. **ZERO Raw HTML** - NEVER use \`<div>\`, \`<span>\`, \`<button>\`, \`<input>\`, \`<form>\`, \`<a>\` directly
2. **ZERO className/Tailwind** - NEVER use \`className="..."\` for styling
3. **ONLY Design Tokens** - Use \`--ds-*\` CSS variables for ALL colors, spacing, borders
4. **Use data-* Attributes** - Use \`data-size\` and \`data-color\` for component variants

## Setup (ALREADY CONFIGURED - DO NOT MODIFY)

\`\`\`css
@import "@digdir/designsystemet-css";
@import "@digdir/designsystemet-css/theme";
@import "@fontsource/inter/400.css";
@import "@fontsource/inter/500.css";
@import "@fontsource/inter/600.css";

:root {
  font-family: "Inter", sans-serif;
  font-feature-settings: "cv05" 1;
}
\`\`\`

---

## 📝 TYPOGRAPHY COMPONENTS

### Heading
\`\`\`tsx
import { Heading } from "@digdir/designsystemet-react";

<Heading level={1} data-size="2xl">Page Title</Heading>
<Heading level={2} data-size="xl">Section Title</Heading>
<Heading level={3} data-size="lg">Subsection</Heading>
<Heading level={4} data-size="md">Small Heading</Heading>
<Heading level={5} data-size="sm">Tiny Heading</Heading>
\`\`\`

### Paragraph
\`\`\`tsx
import { Paragraph } from "@digdir/designsystemet-react";

<Paragraph data-size="lg">Large body text</Paragraph>
<Paragraph data-size="md">Default body text</Paragraph>
<Paragraph data-size="sm">Small/caption text</Paragraph>
<Paragraph data-size="xs">Extra small text</Paragraph>
\`\`\`

### Label
\`\`\`tsx
import { Label } from "@digdir/designsystemet-react";

<Label htmlFor="email" data-size="md">Email Address</Label>
\`\`\`

### ValidationMessage
\`\`\`tsx
import { ValidationMessage } from "@digdir/designsystemet-react";

<ValidationMessage data-color="danger">This field is required</ValidationMessage>
<ValidationMessage data-color="success">Looks good!</ValidationMessage>
\`\`\`

---

## 🔘 BUTTON COMPONENTS

### Button
\`\`\`tsx
import { Button } from "@digdir/designsystemet-react";

// Primary actions
<Button data-color="accent">Primary Action</Button>
<Button data-color="accent" data-size="lg">Large Button</Button>
<Button data-color="accent" data-size="sm">Small Button</Button>

// Secondary actions
<Button variant="secondary">Secondary</Button>
<Button variant="tertiary">Tertiary/Link-style</Button>

// Semantic colors
<Button data-color="success">Confirm</Button>
<Button data-color="danger">Delete</Button>
<Button data-color="warning">Warning</Button>
<Button variant="secondary" data-color="danger">Cancel</Button>

// States
<Button disabled>Disabled</Button>
<Button loading>Loading...</Button>
\`\`\`

---

## 📋 FORM COMPONENTS

### Textfield
\`\`\`tsx
import { Textfield } from "@digdir/designsystemet-react";

<Textfield label="Username" name="username" required />
<Textfield label="Email" type="email" name="email" placeholder="you@example.com" />
<Textfield label="Password" type="password" name="password" />
<Textfield label="Phone" type="tel" name="phone" />
<Textfield label="Amount" type="number" name="amount" />
<Textfield label="Website" type="url" name="website" />

// With description
<Textfield 
  label="Company Name" 
  description="Enter your legal business name"
  name="company" 
/>

// With error
<Textfield 
  label="Email" 
  name="email" 
  error="Please enter a valid email"
/>

// Sizing
<Textfield label="Small" data-size="sm" />
<Textfield label="Medium" data-size="md" />
<Textfield label="Large" data-size="lg" />
\`\`\`

### Textarea
\`\`\`tsx
import { Textarea } from "@digdir/designsystemet-react";

<Textarea label="Description" name="description" rows={4} />
<Textarea label="Notes" name="notes" placeholder="Enter your notes..." />
<Textarea label="Message" description="Max 500 characters" name="message" />
\`\`\`

### Checkbox
\`\`\`tsx
import { Checkbox } from "@digdir/designsystemet-react";

<Checkbox label="Accept terms and conditions" name="terms" />
<Checkbox label="Subscribe to newsletter" name="newsletter" checked />
<Checkbox label="Remember me" name="remember" description="Stay logged in for 30 days" />
\`\`\`

### Radio
\`\`\`tsx
import { Radio } from "@digdir/designsystemet-react";

<Radio.Group legend="Payment Method" name="payment">
  <Radio value="card" label="Credit Card" />
  <Radio value="bank" label="Bank Transfer" />
  <Radio value="invoice" label="Invoice" />
</Radio.Group>
\`\`\`

### Switch
\`\`\`tsx
import { Switch } from "@digdir/designsystemet-react";

<Switch label="Enable notifications" name="notifications" />
<Switch label="Dark mode" name="darkMode" checked />
\`\`\`

### Select
\`\`\`tsx
import { Select } from "@digdir/designsystemet-react";

<Select label="Country" name="country">
  <Select.Option value="">Select a country</Select.Option>
  <Select.Option value="no">Norway</Select.Option>
  <Select.Option value="se">Sweden</Select.Option>
  <Select.Option value="dk">Denmark</Select.Option>
</Select>
\`\`\`

### Search
\`\`\`tsx
import { Search } from "@digdir/designsystemet-react";

<Search label="Search" name="search" placeholder="Search..." />
\`\`\`

### Field & Fieldset
\`\`\`tsx
import { Field, Fieldset, Input, Label } from "@digdir/designsystemet-react";

<Fieldset legend="Personal Information">
  <Field>
    <Label htmlFor="firstName">First Name</Label>
    <Input id="firstName" name="firstName" />
  </Field>
  <Field>
    <Label htmlFor="lastName">Last Name</Label>
    <Input id="lastName" name="lastName" />
  </Field>
</Fieldset>
\`\`\`

---

## 📦 LAYOUT & CONTAINER COMPONENTS

### Card
\`\`\`tsx
import { Card, Heading, Paragraph, Button } from "@digdir/designsystemet-react";

<Card>
  <div style={{ display: "flex", flexDirection: "column", gap: "var(--ds-spacing-4)" }}>
    <Heading level={3} data-size="md">Card Title</Heading>
    <Paragraph>Card content and description text.</Paragraph>
    <Button data-color="accent">Action</Button>
  </div>
</Card>

// Card as clickable link
<Card asChild>
  <a href="/details">
    <Heading level={3}>Clickable Card</Heading>
    <Paragraph>Click to view details</Paragraph>
  </a>
</Card>
\`\`\`

### Divider
\`\`\`tsx
import { Divider } from "@digdir/designsystemet-react";

<Divider />
<Divider data-color="subtle" />
\`\`\`

### Details (Accordion)
\`\`\`tsx
import { Details } from "@digdir/designsystemet-react";

<Details>
  <Details.Summary>Click to expand</Details.Summary>
  <Details.Content>
    <Paragraph>Hidden content revealed on click.</Paragraph>
  </Details.Content>
</Details>
\`\`\`

### Dialog (Modal)
\`\`\`tsx
import { Dialog, Button } from "@digdir/designsystemet-react";

<Dialog.TriggerContext>
  <Dialog.Trigger asChild>
    <Button>Open Dialog</Button>
  </Dialog.Trigger>
  <Dialog>
    <Dialog.Block>
      <Heading level={2} data-size="lg">Confirm Action</Heading>
      <Paragraph>Are you sure you want to proceed?</Paragraph>
    </Dialog.Block>
    <Dialog.Block>
      <Button variant="secondary">Cancel</Button>
      <Button data-color="accent">Confirm</Button>
    </Dialog.Block>
  </Dialog>
</Dialog.TriggerContext>
\`\`\`

### Popover
\`\`\`tsx
import { Popover, Button } from "@digdir/designsystemet-react";

<Popover.TriggerContext>
  <Popover.Trigger asChild>
    <Button variant="tertiary">More info</Button>
  </Popover.Trigger>
  <Popover>
    <Paragraph>Additional information here.</Paragraph>
  </Popover>
</Popover.TriggerContext>
\`\`\`

### Tooltip
\`\`\`tsx
import { Tooltip, Button } from "@digdir/designsystemet-react";

<Tooltip content="This is a tooltip">
  <Button>Hover me</Button>
</Tooltip>
\`\`\`

---

## 📊 DATA DISPLAY COMPONENTS

### Table
\`\`\`tsx
import { Table } from "@digdir/designsystemet-react";

<Table>
  <Table.Head>
    <Table.Row>
      <Table.HeaderCell>Name</Table.HeaderCell>
      <Table.HeaderCell>Email</Table.HeaderCell>
      <Table.HeaderCell>Status</Table.HeaderCell>
    </Table.Row>
  </Table.Head>
  <Table.Body>
    <Table.Row>
      <Table.Cell>John Doe</Table.Cell>
      <Table.Cell>john@example.com</Table.Cell>
      <Table.Cell><Badge data-color="success">Active</Badge></Table.Cell>
    </Table.Row>
  </Table.Body>
</Table>
\`\`\`

### List
\`\`\`tsx
import { List } from "@digdir/designsystemet-react";

<List.Unordered>
  <List.Item>First item</List.Item>
  <List.Item>Second item</List.Item>
  <List.Item>Third item</List.Item>
</List.Unordered>

<List.Ordered>
  <List.Item>Step one</List.Item>
  <List.Item>Step two</List.Item>
</List.Ordered>
\`\`\`

### Tabs
\`\`\`tsx
import { Tabs } from "@digdir/designsystemet-react";

<Tabs defaultValue="tab1">
  <Tabs.List>
    <Tabs.Tab value="tab1">Overview</Tabs.Tab>
    <Tabs.Tab value="tab2">Settings</Tabs.Tab>
    <Tabs.Tab value="tab3">Activity</Tabs.Tab>
  </Tabs.List>
  <Tabs.Panel value="tab1">
    <Paragraph>Overview content here.</Paragraph>
  </Tabs.Panel>
  <Tabs.Panel value="tab2">
    <Paragraph>Settings content here.</Paragraph>
  </Tabs.Panel>
  <Tabs.Panel value="tab3">
    <Paragraph>Activity content here.</Paragraph>
  </Tabs.Panel>
</Tabs>
\`\`\`

### Pagination
\`\`\`tsx
import { Pagination } from "@digdir/designsystemet-react";

<Pagination 
  currentPage={1} 
  totalPages={10} 
  onChange={(page) => console.log(page)} 
/>
\`\`\`

---

## 🎨 FEEDBACK COMPONENTS

### Alert
\`\`\`tsx
import { Alert } from "@digdir/designsystemet-react";

<Alert data-color="info">Informational message</Alert>
<Alert data-color="success">Operation completed successfully!</Alert>
<Alert data-color="warning">Please review before proceeding</Alert>
<Alert data-color="danger">An error occurred</Alert>
\`\`\`

### Badge
\`\`\`tsx
import { Badge } from "@digdir/designsystemet-react";

<Badge data-color="accent">New</Badge>
<Badge data-color="success">Active</Badge>
<Badge data-color="warning">Pending</Badge>
<Badge data-color="danger">Error</Badge>
<Badge data-color="neutral">Draft</Badge>
\`\`\`

### Tag
\`\`\`tsx
import { Tag } from "@digdir/designsystemet-react";

<Tag data-color="accent">Category</Tag>
<Tag data-color="neutral">Tag</Tag>
\`\`\`

### Chip
\`\`\`tsx
import { Chip } from "@digdir/designsystemet-react";

<Chip.Group>
  <Chip.Toggle selected>Option 1</Chip.Toggle>
  <Chip.Toggle>Option 2</Chip.Toggle>
  <Chip.Removable>Removable</Chip.Removable>
</Chip.Group>
\`\`\`

### Spinner
\`\`\`tsx
import { Spinner } from "@digdir/designsystemet-react";

<Spinner aria-label="Loading..." />
<Spinner data-size="sm" aria-label="Loading..." />
<Spinner data-size="lg" aria-label="Loading..." />
\`\`\`

### Skeleton
\`\`\`tsx
import { Skeleton } from "@digdir/designsystemet-react";

<Skeleton.Text lines={3} />
<Skeleton.Circle size="48px" />
<Skeleton.Rectangle width="100%" height="200px" />
\`\`\`

### ErrorSummary
\`\`\`tsx
import { ErrorSummary } from "@digdir/designsystemet-react";

<ErrorSummary>
  <ErrorSummary.Heading>Please fix the following errors:</ErrorSummary.Heading>
  <ErrorSummary.List>
    <ErrorSummary.Item href="#email">Email is invalid</ErrorSummary.Item>
    <ErrorSummary.Item href="#password">Password is required</ErrorSummary.Item>
  </ErrorSummary.List>
</ErrorSummary>
\`\`\`

---

## 🧭 NAVIGATION COMPONENTS

### Link
\`\`\`tsx
import { Link } from "@digdir/designsystemet-react";

<Link href="/about">About Us</Link>
<Link href="https://external.com" target="_blank">External Link</Link>
\`\`\`

### Breadcrumbs
\`\`\`tsx
import { Breadcrumbs } from "@digdir/designsystemet-react";

<Breadcrumbs>
  <Breadcrumbs.Link href="/">Home</Breadcrumbs.Link>
  <Breadcrumbs.Link href="/products">Products</Breadcrumbs.Link>
  <Breadcrumbs.Link aria-current="page">Current Page</Breadcrumbs.Link>
</Breadcrumbs>
\`\`\`

### Dropdown
\`\`\`tsx
import { Dropdown, Button } from "@digdir/designsystemet-react";

<Dropdown.TriggerContext>
  <Dropdown.Trigger asChild>
    <Button variant="secondary">Menu</Button>
  </Dropdown.Trigger>
  <Dropdown>
    <Dropdown.List>
      <Dropdown.Item>Edit</Dropdown.Item>
      <Dropdown.Item>Duplicate</Dropdown.Item>
      <Dropdown.Item data-color="danger">Delete</Dropdown.Item>
    </Dropdown.List>
  </Dropdown>
</Dropdown.TriggerContext>
\`\`\`

### ToggleGroup
\`\`\`tsx
import { ToggleGroup } from "@digdir/designsystemet-react";

<ToggleGroup defaultValue="list">
  <ToggleGroup.Item value="grid">Grid</ToggleGroup.Item>
  <ToggleGroup.Item value="list">List</ToggleGroup.Item>
  <ToggleGroup.Item value="table">Table</ToggleGroup.Item>
</ToggleGroup>
\`\`\`

### SkipLink
\`\`\`tsx
import { SkipLink } from "@digdir/designsystemet-react";

<SkipLink href="#main-content">Skip to main content</SkipLink>
\`\`\`

---

## 👤 USER COMPONENTS

### Avatar
\`\`\`tsx
import { Avatar } from "@digdir/designsystemet-react";

<Avatar aria-label="John Doe">JD</Avatar>
<Avatar src="/user.jpg" aria-label="John Doe" />
<Avatar data-size="lg" aria-label="John Doe">JD</Avatar>
\`\`\`

### AvatarStack
\`\`\`tsx
import { AvatarStack, Avatar } from "@digdir/designsystemet-react";

<AvatarStack>
  <Avatar>JD</Avatar>
  <Avatar>AB</Avatar>
  <Avatar>+3</Avatar>
</AvatarStack>
\`\`\`

---

## 📐 DESIGN TOKENS (CSS Variables)

### Spacing Scale
\`\`\`tsx
// Use in inline styles for layouts
gap: "var(--ds-spacing-0)"     // 0
gap: "var(--ds-spacing-1)"     // 4px
gap: "var(--ds-spacing-2)"     // 8px
gap: "var(--ds-spacing-3)"     // 12px
gap: "var(--ds-spacing-4)"     // 16px
gap: "var(--ds-spacing-5)"     // 20px
gap: "var(--ds-spacing-6)"     // 24px
gap: "var(--ds-spacing-8)"     // 32px
gap: "var(--ds-spacing-10)"    // 40px
gap: "var(--ds-spacing-12)"    // 48px
gap: "var(--ds-spacing-14)"    // 56px
gap: "var(--ds-spacing-16)"    // 64px
gap: "var(--ds-spacing-18)"    // 72px
gap: "var(--ds-spacing-20)"    // 80px
gap: "var(--ds-spacing-22)"    // 88px
gap: "var(--ds-spacing-24)"    // 96px
gap: "var(--ds-spacing-26)"    // 104px
gap: "var(--ds-spacing-28)"    // 112px
gap: "var(--ds-spacing-30)"    // 120px
\`\`\`

### Color System

Colors are structured as: \`--ds-color-{scale}-{group}-{variant}\`

**Scales**: accent, neutral, brand1, brand2, brand3, success, danger, warning, info

**Groups and Usage**:

\`\`\`tsx
// BACKGROUND - Large surfaces, body background
background: "var(--ds-color-neutral-background-default)"
background: "var(--ds-color-neutral-background-tinted)"  // Slight color hint
background: "var(--ds-color-accent-background-default)"  // Accent bg

// SURFACE - Foreground elements (cards, panels)
background: "var(--ds-color-neutral-surface-default)"    // White/dark base
background: "var(--ds-color-neutral-surface-tinted)"     // Subtle difference
background: "var(--ds-color-neutral-surface-hover)"      // Hover state
background: "var(--ds-color-neutral-surface-active)"     // Active/pressed

// BORDER - Strokes and lines
borderColor: "var(--ds-color-neutral-border-subtle)"     // Decorative only
borderColor: "var(--ds-color-neutral-border-default)"    // Form elements
borderColor: "var(--ds-color-neutral-border-strong)"     // High contrast

// TEXT - Text and icons
color: "var(--ds-color-neutral-text-default)"            // Primary text
color: "var(--ds-color-neutral-text-subtle)"             // Secondary text
color: "var(--ds-color-accent-text-default)"             // Accent text

// BASE - Brand colors for emphasis
background: "var(--ds-color-accent-base-default)"
background: "var(--ds-color-success-base-default)"
background: "var(--ds-color-danger-base-default)"
\`\`\`

### Border Radius
\`\`\`tsx
borderRadius: "var(--ds-border-radius-sm)"   // Small
borderRadius: "var(--ds-border-radius-md)"   // Medium
borderRadius: "var(--ds-border-radius-lg)"   // Large
borderRadius: "var(--ds-border-radius-xl)"   // Extra large
borderRadius: "var(--ds-border-radius-full)" // Circular
\`\`\`

### Font Sizes
\`\`\`tsx
fontSize: "var(--ds-font-size-xs)"
fontSize: "var(--ds-font-size-sm)"
fontSize: "var(--ds-font-size-md)"
fontSize: "var(--ds-font-size-lg)"
fontSize: "var(--ds-font-size-xl)"
fontSize: "var(--ds-font-size-2xl)"
\`\`\`

---

## 📐 LAYOUT PATTERNS

### Vertical Stack
\`\`\`tsx
<div style={{ 
  display: "flex", 
  flexDirection: "column", 
  gap: "var(--ds-spacing-4)" 
}}>
  <Heading level={1}>Title</Heading>
  <Paragraph>Content</Paragraph>
</div>
\`\`\`

### Horizontal Row
\`\`\`tsx
<div style={{ 
  display: "flex", 
  gap: "var(--ds-spacing-2)", 
  alignItems: "center" 
}}>
  <Button variant="secondary">Cancel</Button>
  <Button data-color="accent">Save</Button>
</div>
\`\`\`

### Centered Container
\`\`\`tsx
<div style={{ 
  maxWidth: "600px", 
  margin: "0 auto", 
  padding: "var(--ds-spacing-6)" 
}}>
  {/* Content */}
</div>
\`\`\`

### Card Container
\`\`\`tsx
<div style={{ 
  padding: "var(--ds-spacing-4)", 
  background: "var(--ds-color-neutral-surface-default)",
  borderRadius: "var(--ds-border-radius-md)",
  border: "1px solid var(--ds-color-neutral-border-subtle)"
}}>
  {/* Content */}
</div>
\`\`\`

### Full Page Layout
\`\`\`tsx
<div style={{ 
  minHeight: "100vh",
  display: "flex",
  flexDirection: "column",
  background: "var(--ds-color-neutral-background-default)"
}}>
  <header style={{ 
    padding: "var(--ds-spacing-4)", 
    borderBottom: "1px solid var(--ds-color-neutral-border-subtle)" 
  }}>
    <Heading level={1}>App Name</Heading>
  </header>
  <main style={{ 
    flex: 1, 
    padding: "var(--ds-spacing-6)" 
  }}>
    {/* Main content */}
  </main>
  <footer style={{ 
    padding: "var(--ds-spacing-4)", 
    borderTop: "1px solid var(--ds-color-neutral-border-subtle)" 
  }}>
    <Paragraph data-size="sm">Footer</Paragraph>
  </footer>
</div>
\`\`\`

### Grid Layout
\`\`\`tsx
<div style={{ 
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
  gap: "var(--ds-spacing-4)"
}}>
  <Card>Item 1</Card>
  <Card>Item 2</Card>
  <Card>Item 3</Card>
</div>
\`\`\`

---

## ❌ ANTI-PATTERNS (NEVER DO)

\`\`\`tsx
// ❌ Raw HTML elements
<div>...</div>
<span>...</span>
<button>Click</button>
<input type="text" />
<a href="/">Link</a>

// ❌ Tailwind/className styling
<Button className="bg-blue-500 px-4">Click</Button>

// ❌ Hardcoded colors
<div style={{ background: '#f5f5f5', color: '#333' }}>

// ❌ Hardcoded spacing
<div style={{ padding: '16px', margin: '24px' }}>

// ❌ External UI libraries
import { Button } from '@chakra-ui/react';
import { Button } from '@mui/material';
import { Button } from 'shadcn/ui';
import { Toaster } from 'react-hot-toast'; // Use Alert instead
\`\`\`

---

## ✅ COMPLETE FORM EXAMPLE

\`\`\`tsx
import { 
  Heading, 
  Paragraph, 
  Textfield, 
  Textarea,
  Checkbox,
  Select,
  Button, 
  Divider,
  Alert
} from "@digdir/designsystemet-react";

function RegistrationForm() {
  return (
    <div style={{ maxWidth: "500px", margin: "0 auto", padding: "var(--ds-spacing-6)" }}>
      <form>
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--ds-spacing-4)" }}>
          <Heading level={1} data-size="xl">Create Account</Heading>
          <Paragraph data-size="sm">Fill out the form below to register.</Paragraph>
          
          <Alert data-color="info">All fields are required.</Alert>
          
          <Textfield label="Full Name" name="name" required />
          <Textfield label="Email" type="email" name="email" required />
          <Textfield label="Password" type="password" name="password" required />
          
          <Select label="Country" name="country" required>
            <Select.Option value="">Select country</Select.Option>
            <Select.Option value="no">Norway</Select.Option>
            <Select.Option value="se">Sweden</Select.Option>
          </Select>
          
          <Textarea label="Bio" name="bio" rows={3} />
          
          <Checkbox label="I agree to the terms and conditions" name="terms" required />
          <Checkbox label="Subscribe to newsletter" name="newsletter" />
          
          <Divider />
          
          <div style={{ display: "flex", gap: "var(--ds-spacing-2)", justifyContent: "flex-end" }}>
            <Button type="button" variant="secondary">Cancel</Button>
            <Button type="submit" data-color="accent">Create Account</Button>
          </div>
        </div>
      </form>
    </div>
  );
}
\`\`\`

  `;
}
