/**
 * @xala/gazetteer-compiler - Validator
 */

import type { Diagnostic, PageSpec } from "./types";

const VALID_LAYOUTS = new Set(["list", "detail", "form", "wizard", "dashboard"]);
const VALID_SHELLS = new Set(["authenticated", "public", "minimal"]);
const VALID_WIDGETS = new Set(["DashboardHeader", "StatsGrid", "FilterBar", "EntityTable", "DetailPanel", "Tabs", "DrawerForm", "ModalConfirm", "Timeline", "AuditLog", "EmptyState", "LoadingSkeleton", "CardGrid", "SearchInput", "ActionCard", "FormField", "FormSection", "WizardStep", "WizardNav"]);

export function validatePageSpec(pageSpec: PageSpec, filename: string): Diagnostic[] {
    const diagnostics: Diagnostic[] = [];

    if (!pageSpec.pageId || !/^[a-z][a-z0-9-]*$/.test(pageSpec.pageId)) {
        diagnostics.push({ code: "CHEF_E012", severity: "error", message: `Invalid pageId: "${pageSpec.pageId}".`, hint: "pageId must be lowercase alphanumeric with hyphens.", location: { file: filename, line: 1, column: 1 } });
    }

    if (!VALID_LAYOUTS.has(pageSpec.layoutType)) {
        diagnostics.push({ code: "CHEF_E012", severity: "error", message: `Invalid layoutType: "${pageSpec.layoutType}".`, hint: `Must be: ${Array.from(VALID_LAYOUTS).join(", ")}.`, location: { file: filename, line: 1, column: 1 } });
    }

    if (pageSpec.shellType && !VALID_SHELLS.has(pageSpec.shellType)) {
        diagnostics.push({ code: "CHEF_E012", severity: "error", message: `Invalid shellType: "${pageSpec.shellType}".`, hint: `Must be: ${Array.from(VALID_SHELLS).join(", ")}.`, location: { file: filename, line: 1, column: 1 } });
    }

    if (!pageSpec.widgets.content || pageSpec.widgets.content.length === 0) {
        diagnostics.push({ code: "CHEF_E012", severity: "error", message: "Page must have at least one content widget.", hint: "Add a Table, Section, or other content block.", location: { file: filename, line: 1, column: 1 } });
    }

    const allWidgets = [...(pageSpec.widgets.header ?? []), ...(pageSpec.widgets.aboveContent ?? []), ...(pageSpec.widgets.content ?? []), ...(pageSpec.widgets.sidebar ?? []), ...(pageSpec.widgets.footer ?? [])];
    for (const widget of allWidgets) {
        if (!widget.widgetId) diagnostics.push({ code: "CHEF_E012", severity: "error", message: "Widget missing widgetId.", hint: "Each widget must have a unique ID.", location: { file: filename, line: 1, column: 1 } });
        if (!VALID_WIDGETS.has(widget.type)) diagnostics.push({ code: "CHEF_E012", severity: "warning", message: `Unknown widget type: "${widget.type}".`, hint: "Check Gazetteer widget catalog.", location: { file: filename, line: 1, column: 1 } });
    }

    return diagnostics;
}
