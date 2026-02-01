/**
 * @xala/gazetteer-compiler
 */

import { checkGuards, validateBinding } from "./guards";
import { parseDSL } from "./parser";
import { transform } from "./transformer";
import { validatePageSpec } from "./validator";
import { formatDiagnostic, formatDiagnostics, formatDiagnosticsAsJSON } from "./diagnostics";
import type { CompilerOptions, CompilerResult, Diagnostic, PageSpec } from "./types";

export function compile(source: string, options: CompilerOptions = {}): CompilerResult {
    const filename = options.filename ?? "unknown.chef.ts";
    const diagnostics: Diagnostic[] = [];

    const guardDiagnostics = checkGuards(source, filename);
    diagnostics.push(...guardDiagnostics);
    if (guardDiagnostics.some((d) => d.severity === "error")) {
        return { pageSpec: null, diagnostics, controllerRefs: [] };
    }

    const { parsed, diagnostics: parseDiagnostics } = parseDSL(source, filename);
    diagnostics.push(...parseDiagnostics);
    if (!parsed) return { pageSpec: null, diagnostics, controllerRefs: [] };

    for (const binding of parsed.bindings) {
        const bindingError = validateBinding(binding.path, binding.location);
        if (bindingError) diagnostics.push(bindingError);
    }

    if (diagnostics.some((d) => d.code === "CHEF_E009")) {
        return { pageSpec: null, diagnostics, controllerRefs: parsed.controllerRefs };
    }

    const pageSpec = transform(parsed);
    const validationDiagnostics = validatePageSpec(pageSpec, filename);
    diagnostics.push(...validationDiagnostics);

    const hasErrors = diagnostics.some((d) => d.severity === "error");
    if (options.strictMode && diagnostics.some((d) => d.severity === "warning")) {
        return { pageSpec: null, diagnostics, controllerRefs: parsed.controllerRefs };
    }

    return { pageSpec: hasErrors ? null : pageSpec, diagnostics, controllerRefs: parsed.controllerRefs };
}

export function validate(source: string, options: CompilerOptions = {}): { valid: boolean; diagnostics: Diagnostic[] } {
    const result = compile(source, options);
    return { valid: result.pageSpec !== null, diagnostics: result.diagnostics };
}

export type { CompilerOptions, CompilerResult, Diagnostic, DiagnosticCode, DiagnosticSeverity, SourceLocation, PageSpec, WidgetSpec, WidgetSlots } from "./types";
export { formatDiagnostic, formatDiagnostics, formatDiagnosticsAsJSON };
