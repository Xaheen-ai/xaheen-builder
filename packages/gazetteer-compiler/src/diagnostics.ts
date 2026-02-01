/**
 * @xala/gazetteer-compiler - Diagnostics Formatter
 */

import type { Diagnostic } from "./types";

export function formatDiagnostic(diagnostic: Diagnostic, useColors = true): string {
    const severityLabel = diagnostic.severity === "error" ? "error" : "warning";
    const location = `${diagnostic.location.file}:${diagnostic.location.line}:${diagnostic.location.column}`;
    const lines = [`${severityLabel}[${diagnostic.code}]: ${diagnostic.message}`, `  --> ${location}`];
    if (diagnostic.hint) lines.push(`  hint: ${diagnostic.hint}`);
    return lines.join("\n");
}

export function formatDiagnostics(diagnostics: Diagnostic[], useColors = true): string {
    if (diagnostics.length === 0) return "";
    const formatted = diagnostics.map((d) => formatDiagnostic(d, useColors));
    const errorCount = diagnostics.filter((d) => d.severity === "error").length;
    const warningCount = diagnostics.filter((d) => d.severity === "warning").length;
    const summary = `\nCompilation ${errorCount > 0 ? "failed" : "completed"}: ${errorCount} error(s), ${warningCount} warning(s)`;
    return [...formatted, summary].join("\n\n");
}

export function formatDiagnosticsAsJSON(diagnostics: Diagnostic[]): string {
    return JSON.stringify({ errors: diagnostics.filter((d) => d.severity === "error"), warnings: diagnostics.filter((d) => d.severity === "warning") }, null, 2);
}
