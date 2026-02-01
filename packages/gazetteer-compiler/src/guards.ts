/**
 * @xala/gazetteer-compiler - Guard Checks
 */

import type { Diagnostic, DiagnosticCode, SourceLocation } from "./types";

interface GuardRule {
    code: DiagnosticCode;
    pattern: RegExp;
    message: string;
    hint: string;
}

const ALLOWED_IMPORTS = new Set(["@xala/chef-dsl", "@xala/chef-dsl/blocks"]);

const GUARD_RULES: GuardRule[] = [
    { code: "CHEF_E001", pattern: /<[A-Z][a-zA-Z0-9]*[\s/>]/g, message: "JSX syntax is not allowed in Chef DSL files.", hint: "Use DSL block functions instead of JSX." },
    { code: "CHEF_E002", pattern: /<(div|span|p|a|button|input|form|ul|li|table|tr|td|th|img|h[1-6])\b/gi, message: "Raw HTML elements are not allowed.", hint: "Use DSL blocks which compile to Gazetteer widgets." },
    { code: "CHEF_E003", pattern: /className\s*=/g, message: "Tailwind/className is not allowed.", hint: "Styling is handled by the Gazetteer runtime." },
    { code: "CHEF_E004", pattern: /style\s*=\s*(\{|")/g, message: "Inline CSS is not allowed.", hint: "Styling is handled by the Gazetteer runtime." },
    { code: "CHEF_E008", pattern: /\b(fetch|axios|XMLHttpRequest)\s*\(/g, message: "Network calls are not allowed.", hint: "Use ref() for data dependencies." },
];

const FORBIDDEN_IMPORT_PATTERNS: Array<{ code: DiagnosticCode; pattern: RegExp; message: string; hint: string }> = [
    { code: "CHEF_E005", pattern: /import\s+.*from\s+['"]@xala-technologies\/(platform|sdk)['"]/g, message: "Direct SDK imports are not allowed.", hint: "Use ref() instead." },
    { code: "CHEF_E006", pattern: /import\s+.*from\s+['"]@digilist\//g, message: "Domain imports are not allowed.", hint: "Chef DSL files must be domain-agnostic." },
];

function getLocationFromOffset(source: string, offset: number): { line: number; column: number } {
    const lines = source.slice(0, offset).split("\n");
    return { line: lines.length, column: (lines[lines.length - 1]?.length ?? 0) + 1 };
}

export function checkGuards(source: string, filename: string): Diagnostic[] {
    const diagnostics: Diagnostic[] = [];

    for (const rule of GUARD_RULES) {
        rule.pattern.lastIndex = 0;
        let match: RegExpExecArray | null;
        while ((match = rule.pattern.exec(source)) !== null) {
            const { line, column } = getLocationFromOffset(source, match.index);
            diagnostics.push({ code: rule.code, severity: "error", message: rule.message, hint: rule.hint, location: { file: filename, line, column } });
        }
    }

    for (const rule of FORBIDDEN_IMPORT_PATTERNS) {
        rule.pattern.lastIndex = 0;
        let match: RegExpExecArray | null;
        while ((match = rule.pattern.exec(source)) !== null) {
            const { line, column } = getLocationFromOffset(source, match.index);
            diagnostics.push({ code: rule.code, severity: "error", message: rule.message, hint: rule.hint, location: { file: filename, line, column } });
        }
    }

    const importPattern = /import\s+.*from\s+['"]([^'"]+)['"]/g;
    let match: RegExpExecArray | null;
    while ((match = importPattern.exec(source)) !== null) {
        const importSource = match[1];
        if (importSource && !ALLOWED_IMPORTS.has(importSource)) {
            const alreadyCaught = diagnostics.some((d) => (d.code === "CHEF_E005" || d.code === "CHEF_E006") && d.location.line === getLocationFromOffset(source, match!.index).line);
            if (!alreadyCaught) {
                const { line, column } = getLocationFromOffset(source, match.index);
                diagnostics.push({ code: "CHEF_E007", severity: "error", message: `Import "${importSource}" is not allowed.`, hint: "Only @xala/chef-dsl imports are allowed.", location: { file: filename, line, column } });
            }
        }
    }

    return diagnostics;
}

export function validateBinding(path: string, location: SourceLocation): Diagnostic | null {
    const ALLOWED_PREFIXES = ["vm.", "form.", "route.params.", "user.", "config.", "i18n."];
    const isValid = ALLOWED_PREFIXES.some((prefix) => path.startsWith(prefix));
    if (!isValid) {
        return { code: "CHEF_E009", severity: "error", message: `Invalid binding path: "${path}".`, hint: `Must start with: ${ALLOWED_PREFIXES.join(", ")}`, location };
    }
    return null;
}
