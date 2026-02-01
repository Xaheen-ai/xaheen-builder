/**
 * @xala/gazetteer-compiler - Parser
 */

import type { Diagnostic, ParsedDSL, SourceLocation } from "./types";

function getLocation(source: string, offset: number, filename: string): SourceLocation {
    const lines = source.slice(0, offset).split("\n");
    return { file: filename, line: lines.length, column: (lines[lines.length - 1]?.length ?? 0) + 1 };
}

export function parseDSL(source: string, filename: string): { parsed: ParsedDSL | null; diagnostics: Diagnostic[] } {
    const diagnostics: Diagnostic[] = [];

    const defaultExportMatch = source.match(/export\s+default\s+(ListPage|DetailPage|FormPage|WizardPage|DashboardPage)\s*\(/);

    if (!defaultExportMatch) {
        const hasDefaultExport = /export\s+default\s+/.test(source);
        if (!hasDefaultExport) {
            diagnostics.push({ code: "CHEF_E010", severity: "error", message: "Missing default export.", hint: "Chef DSL files must export ListPage, DetailPage, FormPage, WizardPage, or DashboardPage.", location: { file: filename, line: 1, column: 1 } });
        } else {
            const exportMatch = source.match(/export\s+default\s+(\w+)/);
            const invalidName = exportMatch?.[1] ?? "unknown";
            diagnostics.push({ code: "CHEF_E011", severity: "error", message: `Invalid scaffold: "${invalidName}".`, hint: "Use ListPage, DetailPage, FormPage, WizardPage, or DashboardPage.", location: { file: filename, line: 1, column: 1 } });
        }
        return { parsed: null, diagnostics };
    }

    const scaffoldType = defaultExportMatch[1]!;

    const controllerRefs: string[] = [];
    const refPattern = /ref\s*\(\s*['"]([^'"]+)['"]\s*\)/g;
    let refMatch: RegExpExecArray | null;
    while ((refMatch = refPattern.exec(source)) !== null) {
        if (refMatch[1]) controllerRefs.push(refMatch[1]);
    }

    const bindings: Array<{ path: string; location: SourceLocation }> = [];
    const bindPattern = /bind\s*\(\s*['"]([^'"]+)['"]\s*\)/g;
    let bindMatch: RegExpExecArray | null;
    while ((bindMatch = bindPattern.exec(source)) !== null) {
        if (bindMatch[1]) bindings.push({ path: bindMatch[1], location: getLocation(source, bindMatch.index, filename) });
    }

    const i18nKeys: string[] = [];
    const keyPattern = /key\s*\(\s*['"]([^'"]+)['"]\s*\)/g;
    let keyMatch: RegExpExecArray | null;
    while ((keyMatch = keyPattern.exec(source)) !== null) {
        if (keyMatch[1]) i18nKeys.push(keyMatch[1]);
    }

    const idMatch = source.match(/id\s*:\s*['"]([^'"]+)['"]/);
    const pageId = idMatch?.[1] ?? "unknown-page";

    return { parsed: { scaffoldType, config: { id: pageId }, controllerRefs, bindings, i18nKeys }, diagnostics };
}
