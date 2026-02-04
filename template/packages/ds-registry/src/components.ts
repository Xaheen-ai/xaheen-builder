/**
 * Component registry for Designsystemet components.
 * 
 * This registry provides metadata, usage guidelines, and examples for all
 * Designsystemet components available through @xaheen/ds.
 */

export interface ComponentInfo {
  /** Component identifier */
  id: string;
  /** Display name */
  name: string;
  /** Component category */
  category: 'feedback' | 'navigation' | 'input' | 'layout' | 'typography' | 'media' | 'utility';
  /** Brief description */
  description: string;
  /** Import path from @xaheen/ds */
  importPath: string;
  /** Whether component supports the asChild pattern */
  supportsAsChild?: boolean;
  /** Accessibility features */
  a11yFeatures?: string[];
  /** Common use cases */
  useCases?: string[];
  /** Related components */
  related?: string[];
}

export const components: Record<string, ComponentInfo> = {
  // Feedback Components
  alert: {
    id: 'alert',
    name: 'Alert',
    category: 'feedback',
    description: 'Displays important messages with different severity levels (info, success, warning, error).',
    importPath: 'Alert',
    a11yFeatures: ['ARIA live regions', 'Role attribution', 'Keyboard accessible'],
    useCases: ['Form validation messages', 'System notifications', 'Status updates'],
    related: ['ErrorSummary'],
  },
  avatar: {
    id: 'avatar',
    name: 'Avatar',
    category: 'media',
    description: 'Displays user profile images or initials with customizable sizes.',
    importPath: 'Avatar',
    a11yFeatures: ['Alt text support', 'Semantic markup'],
    useCases: ['User profiles', 'Comments', 'Team member lists'],
  },
  badge: {
    id: 'badge',
    name: 'Badge',
    category: 'utility',
    description: 'Small status indicators for labeling and categorization.',
    importPath: 'Badge',
    a11yFeatures: ['Color contrast compliant', 'Screen reader friendly'],
    useCases: ['Status indicators', 'Tags', 'Notifications'],
  },
  chip: {
    id: 'chip',
    name: 'Chip',
    category: 'utility',
    description: 'Compact elements for filtering, selection, or input display.',
    importPath: 'Chip',
    supportsAsChild: true,
    a11yFeatures: ['Removable with keyboard', 'Focus management'],
    useCases: ['Filter pills', 'Selected items', 'Input tags'],
    related: ['Button'],
  },
  skeleton: {
    id: 'skeleton',
    name: 'Skeleton',
    category: 'utility',
    description: 'Loading placeholders that mimic the structure of content.',
    importPath: 'Skeleton',
    a11yFeatures: ['ARIA busy state', 'Screen reader announcements'],
    useCases: ['Content loading', 'Image placeholders', 'Form loading states'],
  },
  spinner: {
    id: 'spinner',
    name: 'Spinner',
    category: 'utility',
    description: 'Animated loading indicators for showing progress.',
    importPath: 'Spinner',
    a11yFeatures: ['ARIA live region', 'Descriptive text'],
    useCases: ['Button loading', 'Data fetching', 'Form submission'],
  },
  tooltip: {
    id: 'tooltip',
    name: 'Tooltip',
    category: 'utility',
    description: 'Contextual help text that appears on hover or focus.',
    importPath: 'Tooltip',
    a11yFeatures: ['Keyboard accessible', 'Delay timers', 'Focus trap'],
    useCases: ['Field descriptions', 'Icon explanations', 'Context help'],
  },

  // Navigation Components
  breadcrumbs: {
    id: 'breadcrumbs',
    name: 'Breadcrumbs',
    category: 'navigation',
    description: 'Hierarchical navigation trail showing the current page location.',
    importPath: 'Breadcrumbs',
    a11yFeatures: ['ARIA navigation landmarks', 'Keyboard navigation'],
    useCases: ['Site navigation', 'File system paths', 'Multi-step processes'],
  },
  link: {
    id: 'link',
    name: 'Link',
    category: 'navigation',
    description: 'Styled navigation links with consistent appearance.',
    importPath: 'Link',
    supportsAsChild: true,
    a11yFeatures: ['Focus visible', 'Screen reader announcements'],
    useCases: ['Internal navigation', 'External links', 'Action links'],
  },
  pagination: {
    id: 'pagination',
    name: 'Pagination',
    category: 'navigation',
    description: 'Navigation controls for paginated content.',
    importPath: 'Pagination',
    a11yFeatures: ['ARIA navigation labels', 'Page size announcements'],
    useCases: ['Data tables', 'Search results', 'Article listings'],
  },
  skipLink: {
    id: 'skipLink',
    name: 'SkipLink',
    category: 'navigation',
    description: 'Accessibility links for keyboard navigation to main content.',
    importPath: 'SkipLink',
    a11yFeatures: ['Skip to main content', 'Focus management'],
    useCases: ['Page accessibility', 'Keyboard navigation', 'Screen reader support'],
  },
  tabs: {
    id: 'tabs',
    name: 'Tabs',
    category: 'navigation',
    description: 'Tabbed interface for organizing content into sections.',
    importPath: 'Tabs',
    a11yFeatures: ['ARIA tab attributes', 'Keyboard navigation', 'Focus management'],
    useCases: ['Settings panels', 'Multi-page forms', 'Content organization'],
  },

  // Input Components
  button: {
    id: 'button',
    name: 'Button',
    category: 'input',
    description: 'Primary action element with multiple variants and sizes.',
    importPath: 'Button',
    supportsAsChild: true,
    a11yFeatures: ['Keyboard accessible', 'Focus visible', 'Disabled state'],
    useCases: ['Form submission', 'Dialog triggers', 'Navigation actions'],
    related: ['Link', 'Switch', 'ToggleGroup'],
  },
  checkbox: {
    id: 'checkbox',
    name: 'Checkbox',
    category: 'input',
    description: 'Binary selection input for multiple choices.',
    importPath: 'Checkbox',
    a11yFeatures: ['ARIA checked state', 'Keyboard navigation', 'Indeterminate state'],
    useCases: ['Multi-select options', 'Terms acceptance', 'Feature toggles'],
    related: ['Radio', 'Switch', 'Field'],
  },
  dropdown: {
    id: 'dropdown',
    name: 'Dropdown',
    category: 'input',
    description: 'Menu trigger with contextual actions or navigation.',
    importPath: 'Dropdown',
    a11yFeatures: ['ARIA menu attributes', 'Keyboard navigation', 'Focus trap'],
    useCases: ['Action menus', 'Navigation menus', 'Context menus'],
    related: ['Button', 'Select'],
  },
  errorSummary: {
    id: 'errorSummary',
    name: 'ErrorSummary',
    category: 'input',
    description: 'Collects and displays form validation errors.',
    importPath: 'ErrorSummary',
    a11yFeatures: ['Error links to fields', 'ARIA live regions', 'Focus management'],
    useCases: ['Form validation', 'Error reporting', 'Accessibility compliance'],
    related: ['Field', 'Alert'],
  },
  field: {
    id: 'field',
    name: 'Field',
    category: 'input',
    description: 'Form field wrapper with label, description, and error states.',
    importPath: 'Field',
    a11yFeatures: ['Label associations', 'Error descriptions', 'Required indicators'],
    useCases: ['Form layout', 'Input grouping', 'Validation states'],
    related: ['Input', 'Textarea', 'Select'],
  },
  fieldset: {
    id: 'fieldset',
    name: 'Fieldset',
    category: 'input',
    description: 'Groups related form fields with a common legend.',
    importPath: 'Fieldset',
    a11yFeatures: ['Field grouping', 'Legend associations'],
    useCases: ['Address forms', 'Payment details', 'Settings groups'],
    related: ['Field', 'Radio', 'Checkbox'],
  },
  input: {
    id: 'input',
    name: 'Input',
    category: 'input',
    description: 'Text input field with validation and formatting options.',
    importPath: 'Input',
    a11yFeatures: ['Input types', 'Validation attributes', 'Error states'],
    useCases: ['Text entry', 'Number input', 'Date/time input'],
    related: ['Field', 'Textfield', 'Textarea'],
  },
  radio: {
    id: 'radio',
    name: 'Radio',
    category: 'input',
    description: 'Single selection input from a group of options.',
    importPath: 'Radio',
    a11yFeatures: ['ARIA checked state', 'Group associations', 'Keyboard navigation'],
    useCases: ['Single choice options', 'Preference selection', 'Payment methods'],
    related: ['Checkbox', 'Switch', 'Fieldset'],
  },
  search: {
    id: 'search',
    name: 'Search',
    category: 'input',
    description: 'Search input with suggestions and autocomplete.',
    importPath: 'Search',
    a11yFeatures: ['ARIA autocomplete', 'Live regions', 'Keyboard navigation'],
    useCases: ['Site search', 'Data filtering', 'Autocomplete inputs'],
    related: ['Input', 'Suggestion'],
  },
  select: {
    id: 'select',
    name: 'Select',
    category: 'input',
    description: 'Dropdown selection from a list of options.',
    importPath: 'Select',
    a11yFeatures: ['ARIA attributes', 'Keyboard navigation', 'Multi-select support'],
    useCases: ['Option selection', 'Filter selection', 'Country picker'],
    related: ['Dropdown', 'Field'],
  },
  switch: {
    id: 'switch',
    name: 'Switch',
    category: 'input',
    description: 'Toggle switch for on/off binary states.',
    importPath: 'Switch',
    a11yFeatures: ['ARIA checked state', 'Keyboard toggle', 'State descriptions'],
    useCases: ['Feature toggles', 'Settings switches', 'Preferences'],
    related: ['Checkbox', 'Button', 'Field'],
  },
  textarea: {
    id: 'textarea',
    name: 'Textarea',
    category: 'input',
    description: 'Multi-line text input for longer content.',
    importPath: 'Textarea',
    a11yFeatures: ['Resize control', 'Character count', 'Validation'],
    useCases: ['Comments', 'Descriptions', 'Long text input'],
    related: ['Field', 'Input'],
  },
  textfield: {
    id: 'textfield',
    name: 'Textfield',
    category: 'input',
    description: 'Enhanced text input with icon and button support.',
    importPath: 'Textfield',
    a11yFeatures: ['Icon descriptions', 'Clear button', 'Input groups'],
    useCases: ['Search fields', 'Input with actions', 'Formatted inputs'],
    related: ['Input', 'Field', 'Search'],
  },
  toggleGroup: {
    id: 'toggleGroup',
    name: 'ToggleGroup',
    category: 'input',
    description: 'Group of toggle buttons for single or multiple selection.',
    importPath: 'ToggleGroup',
    a11yFeatures: ['ARIA pressed state', 'Group navigation', 'Multi-select mode'],
    useCases: ['Tool selection', 'View options', 'Format choices'],
    related: ['Button', 'Radio', 'Checkbox'],
  },

  // Layout Components
  card: {
    id: 'card',
    name: 'Card',
    category: 'layout',
    description: 'Container component for grouping related content.',
    importPath: 'Card',
    a11yFeatures: ['Semantic sections', 'Heading levels'],
    useCases: ['Content grouping', 'Dashboard widgets', 'Product cards'],
  },
  details: {
    id: 'details',
    name: 'Details',
    category: 'layout',
    description: 'Expandable/collapsible content section.',
    importPath: 'Details',
    a11yFeatures: ['ARIA expanded state', 'Keyboard toggle', 'Focus management'],
    useCases: ['FAQ sections', 'Advanced options', 'Content accordions'],
  },
  divider: {
    id: 'divider',
    name: 'Divider',
    category: 'layout',
    description: 'Visual separator for content sections.',
    importPath: 'Divider',
    a11yFeatures: ['Semantic separation', 'Color contrast'],
    useCases: ['Content sections', 'List separation', 'Visual breaks'],
  },
  list: {
    id: 'list',
    name: 'List',
    category: 'layout',
    description: 'Styled list components for consistent presentation.',
    importPath: 'List',
    a11yFeatures: ['List semantics', 'Nested lists', 'Keyboard navigation'],
    useCases: ['Data lists', 'Navigation lists', 'Content lists'],
  },
  table: {
    id: 'table',
    name: 'Table',
    category: 'layout',
    description: 'Data table with sorting, filtering, and pagination support.',
    importPath: 'Table',
    a11yFeatures: ['Table headers', 'Sort indicators', 'Row navigation'],
    useCases: ['Data grids', 'Reports', 'Comparison tables'],
  },

  // Typography Components
  tag: {
    id: 'tag',
    name: 'Tag',
    category: 'typography',
    description: 'Text styling component for emphasis and categorization.',
    importPath: 'Tag',
    a11yFeatures: ['Semantic markup', 'Color contrast'],
    useCases: ['Labels', 'Status text', 'Category indicators'],
  },

  // Other Components
  dialog: {
    id: 'dialog',
    name: 'Dialog',
    category: 'utility',
    description: 'Modal dialog for focused interactions and confirmations.',
    importPath: 'Dialog',
    a11yFeatures: ['Focus trap', 'ARIA attributes', 'Escape key', 'Backdrop click'],
    useCases: ['Confirmations', 'Form dialogs', 'Alert dialogs'],
  },
  popover: {
    id: 'popover',
    name: 'Popover',
    category: 'utility',
    description: 'Overlay container for contextual content and actions.',
    importPath: 'Popover',
    a11yFeatures: ['Focus management', 'Dismissal methods', 'Positioning'],
    useCases: ['Context menus', 'Tooltips with actions', 'Form helpers'],
    related: ['Tooltip', 'Dropdown'],
  },
  suggestion: {
    id: 'suggestion',
    name: 'Suggestion',
    category: 'utility',
    description: 'Autocomplete suggestion list for search and input fields.',
    importPath: 'Suggestion',
    a11yFeatures: ['ARIA attributes', 'Keyboard selection', 'Virtual scrolling'],
    useCases: ['Search autocomplete', 'Tag suggestions', 'Address autocomplete'],
    related: ['Search', 'Input', 'Select'],
  },
};

export const componentCategories = {
  feedback: ['alert', 'skeleton', 'spinner'],
  navigation: ['breadcrumbs', 'link', 'pagination', 'skipLink', 'tabs'],
  input: [
    'button', 'checkbox', 'dropdown', 'errorSummary', 'field', 'fieldset',
    'input', 'radio', 'search', 'select', 'switch', 'textarea', 'textfield', 'toggleGroup'
  ],
  layout: ['card', 'details', 'divider', 'list', 'table'],
  typography: ['tag'],
  media: ['avatar'],
  utility: ['badge', 'chip', 'tooltip', 'dialog', 'popover', 'suggestion'],
} as const;

export type ComponentCategory = keyof typeof componentCategories;
export type ComponentId = keyof typeof components;
