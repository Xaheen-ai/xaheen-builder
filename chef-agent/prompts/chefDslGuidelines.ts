import { stripIndents } from '../utils/stripIndent.js';
import type { SystemPromptOptions } from '../types.js';

/**
 * Chef DSL Guidelines
 * 
 * This prompt teaches the AI how to use the Chef DSL for declarative UI authoring.
 * The DSL compiles to platform-ui components via the Gazetteer runtime.
 */
export function chefDslGuidelines(options: SystemPromptOptions) {
    return stripIndents`
# Chef DSL Guidelines

The Chef DSL is a declarative language for building full-stack applications. Instead of writing
React components with raw HTML and Tailwind classes, you write typed page configurations that
compile to production-ready platform-ui components.

## Core Principles

1. **No JSX** - Use DSL block functions instead of JSX elements
2. **No className** - Styling is handled by the Gazetteer runtime with design tokens
3. **No inline styles** - Use the design system's variant API
4. **No raw HTML** - Use DSL blocks which compile to semantic components
5. **No network calls** - Use \`ref()\` for data dependencies

## File Convention

Chef DSL files use the \`.chef.ts\` extension and are placed in \`src/pages/\`:

\`\`\`
src/pages/
├── bookings.chef.ts      # List page
├── booking-detail.chef.ts # Detail page  
├── booking-form.chef.ts   # Form page
└── dashboard.chef.ts      # Dashboard page
\`\`\`

## Imports

All Chef DSL files start with these imports:

\`\`\`typescript
import { ListPage, DetailPage, FormPage, WizardPage, DashboardPage } from '@xala/chef-dsl';
import { bind, ref, key, go } from '@xala/chef-dsl';
import { Table, Header, FilterBar, Section, StatsBlock, FormField, Button } from '@xala/chef-dsl/blocks';
\`\`\`

## Helper Functions

### \`ref(path)\` - Data Reference
References data from the app's data layer. Used in the \`data\` section of page configs.

\`\`\`typescript
data: {
  bookings: ref('app.bookings.list'),
  user: ref('app.auth.currentUser'),
}
\`\`\`

### \`bind(path)\` - Binding Expression
Binds to runtime data within the page. Used in blocks for dynamic values.

Allowed prefixes:
- \`vm.\` - ViewModel state
- \`form.\` - Form field values
- \`route.params.\` - Route parameters
- \`user.\` - Current user data
- \`config.\` - App configuration
- \`i18n.\` - Internationalization

\`\`\`typescript
table: Table({
  data: bind('vm.filteredBookings'),
  loading: bind('vm.isLoading'),
})
\`\`\`

### \`key(translationKey)\` - Translation Key
References a translation string from the i18n system.

\`\`\`typescript
header: Header({
  title: key('pages.bookings.title'),
  subtitle: key('pages.bookings.subtitle'),
})
\`\`\`

### \`go(routeId, params?)\` - Navigation Action
Navigates to another page.

\`\`\`typescript
primaryAction: Button({
  label: key('actions.create'),
  onClick: go('booking-create'),
}),
// With params:
onClick: go('booking-detail', { id: bind('row.id') })
\`\`\`

## Page Scaffolds

### ListPage
For displaying collections of items with filtering and actions.

\`\`\`typescript
import { ListPage, bind, ref, key, go } from '@xala/chef-dsl';
import { Table, Header, FilterBar, Button } from '@xala/chef-dsl/blocks';

export default ListPage({
  id: 'bookings-list',
  shell: 'authenticated', // 'authenticated' | 'public' | 'minimal'
  
  data: {
    bookings: ref('app.bookings.list'),
    isLoading: ref('app.bookings.isLoading'),
  },
  
  header: Header({
    title: key('pages.bookings.title'),
    icon: 'Calendar',
    primaryAction: Button({
      label: key('actions.create'),
      intent: 'primary',
      onClick: go('booking-create'),
    }),
  }),
  
  filters: [
    FilterBar({
      search: { placeholder: key('search.placeholder'), binding: bind('vm.search') },
      filters: [
        { id: 'status', label: key('filters.status'), options: bind('vm.statusOptions') },
        { id: 'date', label: key('filters.date'), type: 'daterange' },
      ],
    }),
  ],
  
  table: Table({
    data: bind('vm.bookings'),
    loading: bind('vm.isLoading'),
    rowKey: 'id',
    columns: [
      { key: 'customer', label: key('bookings.customer') },
      { key: 'date', label: key('bookings.date'), format: 'date' },
      { key: 'status', label: key('bookings.status'), variant: 'badge' },
      { key: 'amount', label: key('bookings.amount'), format: 'currency' },
    ],
    rowActions: [
      { id: 'view', label: key('actions.view'), onClick: go('booking-detail', { id: bind('row.id') }) },
      { id: 'edit', label: key('actions.edit'), onClick: go('booking-edit', { id: bind('row.id') }) },
      { id: 'delete', label: key('actions.delete'), intent: 'danger', confirm: true },
    ],
    pagination: true,
  }),
});
\`\`\`

### DetailPage
For displaying a single item with sections of information.

\`\`\`typescript
import { DetailPage, bind, ref, key, go } from '@xala/chef-dsl';
import { Header, Section, Timeline, Button } from '@xala/chef-dsl/blocks';

export default DetailPage({
  id: 'booking-detail',
  
  data: {
    booking: ref('app.bookings.getById'),
    history: ref('app.bookings.history'),
  },
  
  header: Header({
    title: bind('vm.booking.customerName'),
    subtitle: key('pages.booking.detail'),
    primaryAction: Button({
      label: key('actions.edit'),
      onClick: go('booking-edit', { id: bind('route.params.id') }),
    }),
    secondaryActions: [
      Button({ label: key('actions.cancel'), intent: 'danger', confirm: true }),
    ],
  }),
  
  sections: [
    Section({
      id: 'details',
      title: key('sections.details'),
      fields: [
        { key: 'customer', label: key('booking.customer'), value: bind('vm.booking.customer') },
        { key: 'date', label: key('booking.date'), value: bind('vm.booking.date'), format: 'datetime' },
        { key: 'status', label: key('booking.status'), value: bind('vm.booking.status') },
        { key: 'amount', label: key('booking.amount'), value: bind('vm.booking.amount'), format: 'currency' },
      ],
    }),
    Section({
      id: 'notes',
      title: key('sections.notes'),
      collapsible: true,
      fields: [
        { key: 'notes', label: key('booking.notes'), value: bind('vm.booking.notes') },
      ],
    }),
  ],
  
  sidebar: [
    Timeline({ events: bind('vm.history') }),
  ],
});
\`\`\`

### FormPage
For creating or editing items.

\`\`\`typescript
import { FormPage, bind, ref, key, go } from '@xala/chef-dsl';
import { Header, FormSection, FormField, Button } from '@xala/chef-dsl/blocks';

export default FormPage({
  id: 'booking-form',
  
  data: {
    booking: ref('app.bookings.getById'),
    customers: ref('app.customers.list'),
  },
  
  header: Header({
    title: key('pages.booking.create'),
  }),
  
  schema: 'bookingForm', // Validation schema reference
  
  sections: [
    FormSection({
      id: 'basic',
      title: key('sections.basicInfo'),
      fields: [
        FormField({ id: 'customer', type: 'select', label: key('booking.customer'), options: bind('vm.customers'), required: true }),
        FormField({ id: 'date', type: 'datetime', label: key('booking.date'), required: true }),
        FormField({ id: 'duration', type: 'number', label: key('booking.duration') }),
      ],
    }),
    FormSection({
      id: 'additional',
      title: key('sections.additional'),
      fields: [
        FormField({ id: 'notes', type: 'textarea', label: key('booking.notes'), placeholder: key('booking.notesPlaceholder') }),
        FormField({ id: 'sendConfirmation', type: 'checkbox', label: key('booking.sendConfirmation') }),
      ],
    }),
  ],
  
  submit: Button({ label: key('actions.save'), intent: 'primary' }),
  cancel: Button({ label: key('actions.cancel'), onClick: go('bookings-list') }),
});
\`\`\`

### DashboardPage
For displaying metrics and overview widgets.

\`\`\`typescript
import { DashboardPage, bind, ref, key } from '@xala/chef-dsl';
import { Header, StatsBlock, Card, Table } from '@xala/chef-dsl/blocks';

export default DashboardPage({
  id: 'dashboard',
  
  data: {
    stats: ref('app.dashboard.stats'),
    recentBookings: ref('app.bookings.recent'),
  },
  
  header: Header({
    title: key('pages.dashboard.title'),
    icon: 'LayoutDashboard',
  }),
  
  stats: StatsBlock({
    columns: 4,
    items: [
      { id: 'total', label: key('stats.totalBookings'), value: bind('vm.stats.total'), icon: 'Calendar' },
      { id: 'today', label: key('stats.todayBookings'), value: bind('vm.stats.today'), trend: bind('vm.stats.todayTrend') },
      { id: 'revenue', label: key('stats.revenue'), value: bind('vm.stats.revenue'), format: 'currency' },
      { id: 'customers', label: key('stats.activeCustomers'), value: bind('vm.stats.customers') },
    ],
  }),
  
  widgets: [
    Card({
      id: 'recent',
      title: key('dashboard.recentBookings'),
      actions: [Button({ label: key('actions.viewAll'), onClick: go('bookings-list') })],
    }),
    Table({
      data: bind('vm.recentBookings'),
      rowKey: 'id',
      columns: [
        { key: 'customer', label: key('bookings.customer') },
        { key: 'date', label: key('bookings.date'), format: 'date' },
        { key: 'status', label: key('bookings.status'), variant: 'badge' },
      ],
    }),
  ],
});
\`\`\`

## Block Components

### Table
Displays tabular data with columns, row actions, and pagination.

**Props:**
- \`data\`: Binding to array of items
- \`loading\`: Binding to loading state
- \`rowKey\`: Unique identifier field
- \`columns\`: Array of column configs
- \`rowActions\`: Array of per-row actions
- \`bulkActions\`: Array of multi-select actions
- \`pagination\`: Enable pagination
- \`emptyState\`: Config for empty state display

**Column formats:** \`text\`, \`date\`, \`datetime\`, \`number\`, \`currency\`, \`boolean\`
**Column variants:** \`badge\`, \`link\`, \`avatar\`

### Header
Page header with title, subtitle, and actions.

**Props:**
- \`title\`: Translation key or binding
- \`subtitle\`: Optional subtitle
- \`icon\`: Icon name from Lucide icons
- \`primaryAction\`: Main CTA button
- \`secondaryActions\`: Additional action buttons

### FilterBar
Search and filter controls for list pages.

**Props:**
- \`search\`: Search input config with placeholder and binding
- \`filters\`: Array of filter configs

**Filter types:** \`select\`, \`multiselect\`, \`date\`, \`daterange\`

### Section
Group of read-only fields for detail pages.

**Props:**
- \`id\`: Unique section identifier
- \`title\`: Section title
- \`collapsible\`: Allow collapse/expand
- \`fields\`: Array of field configs

### StatsBlock
Grid of statistic cards for dashboards.

**Props:**
- \`columns\`: Number of columns (2, 3, or 4)
- \`items\`: Array of stat card configs with label, value, trend, icon

### FormField
Form input field.

**Field types:** \`text\`, \`email\`, \`password\`, \`number\`, \`date\`, \`datetime\`, \`select\`, \`multiselect\`, \`checkbox\`, \`radio\`, \`textarea\`, \`file\`

**Props:**
- \`id\`: Field identifier
- \`type\`: Input type
- \`label\`: Field label
- \`placeholder\`: Placeholder text
- \`required\`: Validation requirement
- \`options\`: For select/radio types
- \`disabled\`: Binding to disabled state

### Button
Action button.

**Props:**
- \`label\`: Button text
- \`intent\`: \`primary\`, \`secondary\`, \`danger\`, \`ghost\`
- \`icon\`: Icon name
- \`onClick\`: Navigation or controller action
- \`confirm\`: Show confirmation dialog
- \`disabled\`: Binding to disabled state

## Compiler Guards

The Chef DSL compiler enforces these rules:

| Code | Violation | Message |
|------|-----------|---------|
| CHEF_E001 | JSX syntax | "JSX syntax is not allowed in Chef DSL files" |
| CHEF_E002 | Raw HTML (\`<div>\`, \`<span>\`, etc.) | "Raw HTML elements are not allowed" |
| CHEF_E003 | \`className=\` | "Tailwind/className is not allowed" |
| CHEF_E004 | \`style=\` | "Inline CSS is not allowed" |
| CHEF_E005 | Platform SDK imports | "Direct SDK imports are not allowed" |
| CHEF_E006 | Domain imports | "Domain imports are not allowed" |
| CHEF_E007 | Unauthorized imports | "Only @xala/chef-dsl imports are allowed" |
| CHEF_E008 | Network calls | "Network calls are not allowed" |
| CHEF_E009 | Invalid binding path | "Must start with allowed prefix" |

## Best Practices

1. **Always use translation keys** - Never hardcode user-facing strings
2. **Use semantic intents** - \`primary\`, \`danger\` instead of colors
3. **Leverage format props** - Let the runtime handle date/currency formatting
4. **Group related fields** - Use sections and form sections for organization
5. **Provide empty states** - Always configure empty state for lists and tables
6. **Use confirmation dialogs** - For destructive actions like delete

  `;
}
