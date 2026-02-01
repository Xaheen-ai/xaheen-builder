/**
 * Widget Registry for Chef Mode Preview
 */

const WIDGET_TYPES = [
    "DashboardHeader", "StatsGrid", "FilterBar", "EntityTable", "DetailPanel", "Tabs",
    "DrawerForm", "ModalConfirm", "Timeline", "AuditLog", "EmptyState", "LoadingSkeleton",
    "CardGrid", "SearchInput", "ActionCard", "FormField", "FormSection", "WizardStep", "WizardNav",
] as const;

type WidgetType = (typeof WIDGET_TYPES)[number];
type WidgetComponent = (props: Record<string, unknown>) => null;
type WidgetRegistry = Map<string, { component: WidgetComponent; propSchema: Record<string, unknown> }>;

function createPlaceholderWidget(_type: WidgetType): WidgetComponent {
    return function PlaceholderWidget(_props: Record<string, unknown>) { return null; };
}

export function buildWidgetRegistry(): WidgetRegistry {
    const registry: WidgetRegistry = new Map();
    for (const type of WIDGET_TYPES) {
        registry.set(type, { component: createPlaceholderWidget(type), propSchema: {} });
    }
    return registry;
}

export function isWidgetRegistered(registry: WidgetRegistry, type: string): boolean {
    return registry.has(type);
}

export function getRegisteredWidgets(registry: WidgetRegistry): string[] {
    return Array.from(registry.keys());
}

export function validateWidgetRegistry(registry: WidgetRegistry, widgetTypes: string[]): { valid: boolean; missing: string[] } {
    const missing = widgetTypes.filter((type) => !registry.has(type));
    return { valid: missing.length === 0, missing };
}
