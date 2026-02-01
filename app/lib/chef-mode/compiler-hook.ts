/**
 * Chef Mode Compiler Hook
 * 
 * Provides compilation infrastructure for Chef DSL files.
 * Since the @xala/gazetteer-compiler package is local and not built,
 * we inline the necessary types and provide a simple implementation.
 */

// =============================================================================
// TYPES (inlined from @xala/gazetteer-compiler)
// =============================================================================

export type DiagnosticSeverity = "error" | "warning";

export interface SourceLocation {
    file: string;
    line: number;
    column: number;
}

export interface Diagnostic {
    code: string;
    severity: DiagnosticSeverity;
    message: string;
    hint?: string;
    location: SourceLocation;
}

export interface WidgetSpec {
    widgetId: string;
    type: string;
    props?: Record<string, unknown>;
    bindings?: Record<string, string>;
}

export interface WidgetSlots {
    header?: WidgetSpec[];
    aboveContent?: WidgetSpec[];
    content: WidgetSpec[];
    sidebar?: WidgetSpec[];
    footer?: WidgetSpec[];
}

export interface PageSpec {
    pageId: string;
    layoutType: "list" | "detail" | "form" | "wizard" | "dashboard";
    shellType?: "authenticated" | "public" | "minimal";
    controllerRefs?: string[];
    widgets: WidgetSlots;
    i18nRequiredKeys?: string[];
}

export interface CompilerResult {
    pageSpec: PageSpec | null;
    diagnostics: Diagnostic[];
    controllerRefs: string[];
}

// =============================================================================
// GUARDS
// =============================================================================

const FORBIDDEN_PATTERNS: Array<{ pattern: RegExp; code: string; message: string; hint: string }> = [
    { pattern: /<[A-Z][a-zA-Z0-9]*[\s/>]/g, code: "CHEF_E001", message: "JSX syntax is not allowed", hint: "Use DSL block functions" },
    { pattern: /<(div|span|p|a|button|input|form)\b/gi, code: "CHEF_E002", message: "Raw HTML elements are not allowed", hint: "Use DSL blocks" },
    { pattern: /className\s*=/g, code: "CHEF_E003", message: "Tailwind/className is not allowed", hint: "Styling is handled by Gazetteer" },
    { pattern: /style\s*=\s*(\{|")/g, code: "CHEF_E004", message: "Inline CSS is not allowed", hint: "Styling is handled by Gazetteer" },
];

function checkGuards(source: string, filename: string): Diagnostic[] {
    const diagnostics: Diagnostic[] = [];

    for (const rule of FORBIDDEN_PATTERNS) {
        rule.pattern.lastIndex = 0;
        let match: RegExpExecArray | null;
        while ((match = rule.pattern.exec(source)) !== null) {
            const lines = source.slice(0, match.index).split("\n");
            diagnostics.push({
                code: rule.code,
                severity: "error",
                message: rule.message,
                hint: rule.hint,
                location: { file: filename, line: lines.length, column: (lines[lines.length - 1]?.length ?? 0) + 1 },
            });
        }
    }

    return diagnostics;
}

// =============================================================================
// PARSER
// =============================================================================

const SCAFFOLD_REGEX = /export\s+default\s+(ListPage|DetailPage|FormPage|WizardPage|DashboardPage)\s*\(/;
const LAYOUT_MAP: Record<string, PageSpec["layoutType"]> = {
    ListPage: "list", DetailPage: "detail", FormPage: "form", WizardPage: "wizard", DashboardPage: "dashboard",
};

function parse(source: string, filename: string): { pageSpec: PageSpec | null; diagnostics: Diagnostic[]; controllerRefs: string[] } {
    const diagnostics: Diagnostic[] = [];

    const scaffoldMatch = source.match(SCAFFOLD_REGEX);
    if (!scaffoldMatch) {
        diagnostics.push({
            code: "CHEF_E010",
            severity: "error",
            message: "Missing or invalid default export",
            hint: "Export ListPage, DetailPage, FormPage, WizardPage, or DashboardPage",
            location: { file: filename, line: 1, column: 1 },
        });
        return { pageSpec: null, diagnostics, controllerRefs: [] };
    }

    const scaffoldType = scaffoldMatch[1]!;
    const layoutType = LAYOUT_MAP[scaffoldType] ?? "list";

    // Extract page ID
    const idMatch = source.match(/id\s*:\s*['"]([^'"]+)['"]/);
    const pageId = idMatch?.[1] ?? "unknown-page";

    // Extract controller refs
    const controllerRefs: string[] = [];
    const refPattern = /ref\s*\(\s*['"]([^'"]+)['"]\s*\)/g;
    let refMatch: RegExpExecArray | null;
    while ((refMatch = refPattern.exec(source)) !== null) {
        if (refMatch[1]) controllerRefs.push(refMatch[1]);
    }

    // Extract i18n keys
    const i18nKeys: string[] = [];
    const keyPattern = /key\s*\(\s*['"]([^'"]+)['"]\s*\)/g;
    let keyMatch: RegExpExecArray | null;
    while ((keyMatch = keyPattern.exec(source)) !== null) {
        if (keyMatch[1]) i18nKeys.push(keyMatch[1]);
    }

    // Build minimal PageSpec
    const pageSpec: PageSpec = {
        pageId,
        layoutType,
        shellType: "authenticated",
        controllerRefs: controllerRefs.length > 0 ? controllerRefs : undefined,
        widgets: { content: [{ widgetId: "main-content", type: "Placeholder", props: { scaffoldType } }] },
        i18nRequiredKeys: i18nKeys.length > 0 ? i18nKeys : undefined,
    };

    return { pageSpec, diagnostics, controllerRefs };
}

// =============================================================================
// COMPILER
// =============================================================================

export function compile(source: string, options: { filename?: string } = {}): CompilerResult {
    const filename = options.filename ?? "unknown.chef.ts";
    const diagnostics: Diagnostic[] = [];

    // Run guards
    const guardDiagnostics = checkGuards(source, filename);
    diagnostics.push(...guardDiagnostics);

    if (guardDiagnostics.some(d => d.severity === "error")) {
        return { pageSpec: null, diagnostics, controllerRefs: [] };
    }

    // Parse and transform
    const result = parse(source, filename);
    diagnostics.push(...result.diagnostics);

    return {
        pageSpec: result.pageSpec,
        diagnostics,
        controllerRefs: result.controllerRefs,
    };
}

// =============================================================================
// UTILITIES
// =============================================================================

export function isChefFile(filePath: string): boolean {
    return filePath.endsWith(".chef.ts");
}

export function compileChefFile(source: string, filePath: string): CompilerResult {
    return compile(source, { filename: filePath });
}

interface CompileState {
    pageSpec: PageSpec | null;
    diagnostics: Diagnostic[];
    isCompiling: boolean;
    lastCompileTime: number;
}

export function createDebouncedCompiler(delayMs = 300) {
    let timeoutId: ReturnType<typeof setTimeout> | null = null;
    let state: CompileState = { pageSpec: null, diagnostics: [], isCompiling: false, lastCompileTime: 0 };

    const compileDebounced = (source: string, filePath: string, onComplete: (result: CompilerResult) => void): void => {
        if (timeoutId) clearTimeout(timeoutId);
        state.isCompiling = true;

        timeoutId = setTimeout(() => {
            const result = compileChefFile(source, filePath);
            state = { pageSpec: result.pageSpec, diagnostics: result.diagnostics, isCompiling: false, lastCompileTime: Date.now() };
            onComplete(result);
            timeoutId = null;
        }, delayMs);
    };

    const cancel = (): void => {
        if (timeoutId) { clearTimeout(timeoutId); timeoutId = null; state.isCompiling = false; }
    };

    const getState = (): Readonly<CompileState> => state;

    return { compile: compileDebounced, cancel, getState };
}
