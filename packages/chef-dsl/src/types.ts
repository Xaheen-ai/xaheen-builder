/**
 * @xala/chef-dsl - Type Definitions
 *
 * Core types for the Chef DSL. These types enforce the constrained
 * authoring model where all UI is declared via scaffolds and blocks.
 */

// =============================================================================
// BINDING TYPES
// =============================================================================

/**
 * Safe binding paths - ONLY these prefixes are allowed.
 * The compiler will reject any binding that doesn't match.
 */
export type BindingPrefix =
    | "vm"
    | "form"
    | "route.params"
    | "user"
    | "config"
    | "i18n";

/**
 * A binding expression that references runtime data.
 * Must start with an allowed prefix.
 */
export interface Binding {
    readonly __type: "binding";
    readonly path: string;
}

/**
 * A controller reference that the runtime will resolve.
 * Maps to Gazetteer's controllerRefs.
 */
export interface ControllerRef {
    readonly __type: "controllerRef";
    readonly controller: string;
}

/**
 * A navigation action to another route.
 */
export interface Navigation {
    readonly __type: "navigation";
    readonly routeId: string;
    readonly params?: Record<string, Binding | string>;
}

/**
 * A translation key reference.
 */
export interface TranslationKey {
    readonly __type: "translationKey";
    readonly key: string;
}

// =============================================================================
// LAYOUT TYPES
// =============================================================================

export type LayoutType = "list" | "detail" | "form" | "wizard" | "dashboard";

export type ShellType = "authenticated" | "public" | "minimal";

export type Intent = "primary" | "secondary" | "danger" | "ghost";

// =============================================================================
// BLOCK BASE TYPES
// =============================================================================

export interface BaseBlock {
    readonly __blockType: string;
}

// =============================================================================
// HEADER BLOCK
// =============================================================================

export interface HeaderBlockConfig {
    title: TranslationKey;
    subtitle?: TranslationKey;
    icon?: string;
    primaryAction?: ActionButtonConfig;
    secondaryActions?: ActionButtonConfig[];
}

export interface HeaderBlock extends BaseBlock {
    readonly __blockType: "Header";
    readonly config: HeaderBlockConfig;
}

// =============================================================================
// ACTION BUTTON
// =============================================================================

export interface ActionButtonConfig {
    id?: string;
    label: TranslationKey;
    intent?: Intent;
    icon?: string;
    onClick?: Navigation;
    confirm?: boolean | ConfirmConfig;
    disabled?: Binding;
}

export interface ConfirmConfig {
    title: TranslationKey;
    message: TranslationKey;
    confirmLabel?: TranslationKey;
    cancelLabel?: TranslationKey;
}

// =============================================================================
// TABLE BLOCK
// =============================================================================

export interface TableColumnConfig {
    key: string;
    label: TranslationKey;
    format?: "text" | "date" | "datetime" | "number" | "currency" | "boolean";
    variant?: "badge" | "link" | "avatar";
    width?: string;
    sortable?: boolean;
}

export interface TableRowActionConfig {
    id: string;
    label: TranslationKey;
    icon?: string;
    intent?: Intent;
    onClick?: Navigation;
    confirm?: boolean | ConfirmConfig;
    visible?: Binding;
}

export interface TableBlockConfig {
    data: Binding;
    loading?: Binding;
    rowKey: string;
    columns: TableColumnConfig[];
    rowActions?: TableRowActionConfig[];
    bulkActions?: ActionButtonConfig[];
    emptyState?: EmptyStateBlockConfig;
    pagination?: boolean;
}

export interface TableBlock extends BaseBlock {
    readonly __blockType: "Table";
    readonly config: TableBlockConfig;
}

// =============================================================================
// FILTER BLOCK
// =============================================================================

export interface FilterConfig {
    id: string;
    label: TranslationKey;
    type?: "select" | "multiselect" | "date" | "daterange";
    options?: Binding | Array<{ value: string; label: TranslationKey }>;
    binding: Binding;
}

export interface FilterBarBlockConfig {
    search?: {
        placeholder: TranslationKey;
        binding: Binding;
    };
    filters?: FilterConfig[];
}

export interface FilterBarBlock extends BaseBlock {
    readonly __blockType: "FilterBar";
    readonly config: FilterBarBlockConfig;
}

// =============================================================================
// SECTION BLOCK (for DetailPage)
// =============================================================================

export interface SectionFieldConfig {
    key: string;
    label: TranslationKey;
    value: Binding;
    format?: "text" | "date" | "datetime" | "number" | "currency" | "boolean";
    copyable?: boolean;
}

export interface SectionBlockConfig {
    id: string;
    title?: TranslationKey;
    collapsible?: boolean;
    fields: SectionFieldConfig[];
}

export interface SectionBlock extends BaseBlock {
    readonly __blockType: "Section";
    readonly config: SectionBlockConfig;
}

// =============================================================================
// STATS BLOCK (for DashboardPage)
// =============================================================================

export interface StatCardConfig {
    id: string;
    label: TranslationKey;
    value: Binding;
    format?: "number" | "currency" | "percentage";
    trend?: Binding;
    icon?: string;
}

export interface StatsBlockConfig {
    columns?: 2 | 3 | 4;
    items: StatCardConfig[];
}

export interface StatsBlock extends BaseBlock {
    readonly __blockType: "Stats";
    readonly config: StatsBlockConfig;
}

// =============================================================================
// CARD BLOCK
// =============================================================================

export interface CardBlockConfig {
    id: string;
    title: TranslationKey;
    description?: TranslationKey;
    icon?: string;
    actions?: ActionButtonConfig[];
    onClick?: Navigation;
}

export interface CardBlock extends BaseBlock {
    readonly __blockType: "Card";
    readonly config: CardBlockConfig;
}

// =============================================================================
// TABS BLOCK
// =============================================================================

export interface TabConfig {
    id: string;
    label: TranslationKey;
    icon?: string;
    content: WidgetBlock[];
}

export interface TabsBlockConfig {
    tabs: TabConfig[];
    defaultTab?: string;
}

export interface TabsBlock extends BaseBlock {
    readonly __blockType: "Tabs";
    readonly config: TabsBlockConfig;
}

// =============================================================================
// TIMELINE BLOCK
// =============================================================================

export interface TimelineBlockConfig {
    events: Binding;
    emptyState?: EmptyStateBlockConfig;
}

export interface TimelineBlock extends BaseBlock {
    readonly __blockType: "Timeline";
    readonly config: TimelineBlockConfig;
}

// =============================================================================
// EMPTY STATE BLOCK
// =============================================================================

export interface EmptyStateBlockConfig {
    icon?: string;
    title: TranslationKey;
    description?: TranslationKey;
    action?: ActionButtonConfig;
}

export interface EmptyStateBlock extends BaseBlock {
    readonly __blockType: "EmptyState";
    readonly config: EmptyStateBlockConfig;
}

// =============================================================================
// FORM BLOCKS
// =============================================================================

export type FieldType =
    | "text"
    | "email"
    | "password"
    | "number"
    | "date"
    | "datetime"
    | "select"
    | "multiselect"
    | "checkbox"
    | "radio"
    | "textarea"
    | "file";

export interface FormFieldConfig {
    id: string;
    type: FieldType;
    label: TranslationKey;
    placeholder?: TranslationKey;
    required?: boolean;
    disabled?: Binding;
    options?: Binding | Array<{ value: string; label: TranslationKey }>;
    validation?: string;
}

export interface FormFieldBlock extends BaseBlock {
    readonly __blockType: "FormField";
    readonly config: FormFieldConfig;
}

export interface FormSectionConfig {
    id: string;
    title?: TranslationKey;
    description?: TranslationKey;
    fields: FormFieldBlock[];
}

export interface FormSectionBlock extends BaseBlock {
    readonly __blockType: "FormSection";
    readonly config: FormSectionConfig;
}

// =============================================================================
// WIZARD BLOCKS
// =============================================================================

export interface WizardStepConfig {
    id: string;
    title: TranslationKey;
    description?: TranslationKey;
    fields: FormFieldBlock[];
    validation?: string;
}

export interface WizardStepBlock extends BaseBlock {
    readonly __blockType: "WizardStep";
    readonly config: WizardStepConfig;
}

export interface WizardNavConfig {
    nextLabel?: TranslationKey;
    prevLabel?: TranslationKey;
    submitLabel: TranslationKey;
    cancelLabel?: TranslationKey;
}

export interface WizardNavBlock extends BaseBlock {
    readonly __blockType: "WizardNav";
    readonly config: WizardNavConfig;
}

// =============================================================================
// WIDGET BLOCK UNION
// =============================================================================

export type WidgetBlock =
    | HeaderBlock
    | TableBlock
    | FilterBarBlock
    | SectionBlock
    | StatsBlock
    | CardBlock
    | TabsBlock
    | TimelineBlock
    | EmptyStateBlock
    | FormFieldBlock
    | FormSectionBlock
    | WizardStepBlock
    | WizardNavBlock;

// =============================================================================
// SCAFFOLD CONFIGS
// =============================================================================

export interface ListPageConfig {
    id: string;
    shell?: ShellType;
    data: Record<string, ControllerRef>;
    header: HeaderBlock;
    filters?: FilterBarBlock[];
    table: TableBlock;
    actions?: ActionButtonConfig[];
}

export interface DetailPageConfig {
    id: string;
    shell?: ShellType;
    data: Record<string, ControllerRef>;
    header: HeaderBlock;
    sections: SectionBlock[];
    sidebar?: WidgetBlock[];
    actions?: ActionButtonConfig[];
}

export interface FormPageConfig {
    id: string;
    shell?: ShellType;
    data: Record<string, ControllerRef>;
    header: HeaderBlock;
    schema: string;
    sections: FormSectionBlock[];
    submit: ActionButtonConfig;
    cancel?: ActionButtonConfig;
}

export interface WizardPageConfig {
    id: string;
    shell?: ShellType;
    data: Record<string, ControllerRef>;
    header: HeaderBlock;
    steps: WizardStepBlock[];
    navigation: WizardNavBlock;
    onComplete?: Navigation;
}

export interface DashboardPageConfig {
    id: string;
    shell?: ShellType;
    data: Record<string, ControllerRef>;
    header: HeaderBlock;
    stats?: StatsBlock;
    widgets: WidgetBlock[];
}

// =============================================================================
// PAGE SPEC (Compiled Output)
// =============================================================================

export interface PageConfig {
    readonly __scaffoldType: string;
    readonly config:
    | ListPageConfig
    | DetailPageConfig
    | FormPageConfig
    | WizardPageConfig
    | DashboardPageConfig;
}
