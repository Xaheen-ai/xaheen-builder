/**
 * @xala/gazetteer-compiler - Transformer
 */

import type { PageSpec, WidgetSlots, ParsedDSL, WidgetSpec } from "./types";

const LAYOUT_MAP: Record<string, PageSpec["layoutType"]> = {
    ListPage: "list", DetailPage: "detail", FormPage: "form", WizardPage: "wizard", DashboardPage: "dashboard",
};

const WIDGET_MAP: Record<string, string> = {
    Header: "DashboardHeader", Table: "EntityTable", FilterBar: "FilterBar", Section: "DetailPanel",
    Stats: "StatsGrid", Card: "ActionCard", Tabs: "Tabs", Timeline: "Timeline", EmptyState: "EmptyState",
    FormField: "FormField", FormSection: "FormSection", WizardStep: "WizardStep", WizardNav: "WizardNav",
};

function generateWidgetId(blockType: string, index: number): string {
    return `${blockType.toLowerCase()}-${index}`;
}

function transformBlock(block: { __blockType: string; config: Record<string, unknown> }, index: number): WidgetSpec {
    const widgetType = WIDGET_MAP[block.__blockType] ?? block.__blockType;
    const widgetId = (block.config["id"] as string) ?? generateWidgetId(block.__blockType, index);
    const bindings: Record<string, string> = {};
    const props: Record<string, unknown> = {};

    for (const [key, value] of Object.entries(block.config)) {
        if (typeof value === "object" && value !== null && (value as Record<string, unknown>)["__type"] === "binding") {
            bindings[key] = (value as { path: string }).path;
        } else if (typeof value === "object" && value !== null && (value as Record<string, unknown>)["__type"] === "translationKey") {
            props[key.endsWith("Key") ? key : `${key}Key`] = (value as { key: string }).key;
        } else if (key !== "id") {
            props[key] = value;
        }
    }

    const spec: WidgetSpec = { widgetId, type: widgetType };
    if (Object.keys(props).length > 0) spec.props = props;
    if (Object.keys(bindings).length > 0) spec.bindings = bindings;
    return spec;
}

export function transform(parsed: ParsedDSL): PageSpec {
    const layoutType = LAYOUT_MAP[parsed.scaffoldType] ?? "list";
    const config = parsed.config as Record<string, unknown>;
    const widgets: WidgetSlots = { content: [] };

    if (config["header"]) widgets.header = [transformBlock(config["header"] as { __blockType: string; config: Record<string, unknown> }, 0)];

    switch (parsed.scaffoldType) {
        case "ListPage":
            if (Array.isArray(config["filters"])) widgets.aboveContent = (config["filters"] as Array<unknown>).map((f, i) => transformBlock(f as { __blockType: string; config: Record<string, unknown> }, i));
            if (config["table"]) widgets.content = [transformBlock(config["table"] as { __blockType: string; config: Record<string, unknown> }, 0)];
            break;
        case "DetailPage":
            if (Array.isArray(config["sections"])) widgets.content = (config["sections"] as Array<unknown>).map((s, i) => transformBlock(s as { __blockType: string; config: Record<string, unknown> }, i));
            break;
        case "FormPage":
            if (Array.isArray(config["sections"])) widgets.content = (config["sections"] as Array<unknown>).map((s, i) => transformBlock(s as { __blockType: string; config: Record<string, unknown> }, i));
            break;
        case "WizardPage":
            if (Array.isArray(config["steps"])) widgets.content = (config["steps"] as Array<unknown>).map((s, i) => transformBlock(s as { __blockType: string; config: Record<string, unknown> }, i));
            if (config["navigation"]) widgets.footer = [transformBlock(config["navigation"] as { __blockType: string; config: Record<string, unknown> }, 0)];
            break;
        case "DashboardPage":
            if (config["stats"]) widgets.content.push(transformBlock(config["stats"] as { __blockType: string; config: Record<string, unknown> }, 0));
            if (Array.isArray(config["widgets"])) widgets.content.push(...(config["widgets"] as Array<unknown>).map((w, i) => transformBlock(w as { __blockType: string; config: Record<string, unknown> }, i + 1)));
            break;
    }

    return {
        pageId: (config["id"] as string) ?? "unknown-page",
        layoutType,
        shellType: (config["shell"] as PageSpec["shellType"]) ?? "authenticated",
        controllerRefs: parsed.controllerRefs.length > 0 ? parsed.controllerRefs : undefined,
        widgets,
        i18nRequiredKeys: parsed.i18nKeys.length > 0 ? parsed.i18nKeys : undefined,
    };
}
