/**
 * @xala/gazetteer-compiler - Type Definitions
 */

export type DiagnosticCode =
    | "CHEF_E001" | "CHEF_E002" | "CHEF_E003" | "CHEF_E004"
    | "CHEF_E005" | "CHEF_E006" | "CHEF_E007" | "CHEF_E008"
    | "CHEF_E009" | "CHEF_E010" | "CHEF_E011" | "CHEF_E012"
    | "CHEF_W001" | "CHEF_W002";

export type DiagnosticSeverity = "error" | "warning";

export interface SourceLocation {
    file: string;
    line: number;
    column: number;
    endLine?: number;
    endColumn?: number;
}

export interface Diagnostic {
    code: DiagnosticCode;
    severity: DiagnosticSeverity;
    message: string;
    hint?: string;
    location: SourceLocation;
}

export interface CompilerOptions {
    filename?: string;
    strictMode?: boolean;
    mockControllers?: boolean;
}

export interface CompilerResult {
    pageSpec: PageSpec | null;
    diagnostics: Diagnostic[];
    controllerRefs: string[];
}

export interface PageSpec {
    $schema?: string;
    schemaVersion?: string;
    specVersion?: string;
    pageId: string;
    layoutType: "list" | "detail" | "form" | "wizard" | "dashboard";
    shellType?: "authenticated" | "public" | "minimal";
    controllerRefs?: string[];
    widgets: WidgetSlots;
    behaviors?: PageBehaviors;
    dialogs?: Record<string, DialogSpec>;
    formSpec?: FormSpec;
    i18nRequiredKeys?: string[];
}

export interface WidgetSlots {
    header?: WidgetSpec[];
    aboveContent?: WidgetSpec[];
    content: WidgetSpec[];
    sidebar?: WidgetSpec[];
    belowContent?: WidgetSpec[];
    footer?: WidgetSpec[];
    overlays?: WidgetSpec[];
}

export interface WidgetSpec {
    widgetId: string;
    type: string;
    props?: Record<string, unknown>;
    bindings?: Record<string, string>;
    events?: Record<string, string>;
    visibility?: { permission?: string; role?: string; condition?: string };
    animationPreset?: string;
}

export interface PageBehaviors {
    actions?: ActionSpec[];
    navigation?: NavigationBehavior;
    lifecycle?: LifecycleBehavior;
}

export interface ActionSpec {
    actionId: string;
    labelKey?: string;
    intent?: "primary" | "secondary" | "danger";
    behavior?: ActionBehavior;
}

export interface ActionBehavior {
    type: "navigate" | "submit" | "confirm" | "custom";
    routeId?: string;
    params?: Record<string, string>;
    confirmTitle?: string;
    confirmMessage?: string;
}

export interface NavigationBehavior {
    defaultBack?: { strategy: "history" | "route"; routeId?: string };
    afterAction?: Array<{ on: string; goTo: { strategy: string; routeId?: string } }>;
}

export interface LifecycleBehavior {
    onEnter?: string[];
    onExit?: string[];
    pollingInterval?: number;
    subscriptions?: string[];
}

export interface DialogSpec {
    titleKey?: string;
    type: "form" | "confirm" | "content";
    size?: "small" | "medium" | "large";
    fields?: Array<{ id: string; type: string; labelKey: string; required?: boolean }>;
    actions?: Array<{ actionId: string; labelKey: string; intent?: string }>;
}

export interface FormSpec {
    formId: string;
    fields: Array<{ fieldId: string; type: string; labelKey: string; required?: boolean; validation?: string }>;
    submission: { action: string; method?: string };
}

export interface ParsedDSL {
    scaffoldType: string;
    config: unknown;
    controllerRefs: string[];
    bindings: Array<{ path: string; location: SourceLocation }>;
    i18nKeys: string[];
}
