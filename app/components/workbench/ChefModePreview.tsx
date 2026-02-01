/**
 * Chef Mode Preview Component
 */

import { memo, useMemo } from "react";
import type { PageSpec, Diagnostic } from "~/lib/chef-mode/compiler-hook";
import { generateMockData, createMockViewModel } from "~/lib/chef-mode/mock-controllers";

interface ChefModePreviewProps {
    pageSpec: PageSpec | null;
    diagnostics: Diagnostic[];
    isCompiling: boolean;
}

export const ChefModePreview = memo(function ChefModePreview({ pageSpec, diagnostics, isCompiling }: ChefModePreviewProps) {
    const mockData = useMemo(() => {
        if (!pageSpec) return null;
        return createMockViewModel(generateMockData(pageSpec));
    }, [pageSpec]);

    if (isCompiling) {
        return (
            <div className="flex h-full items-center justify-center bg-bolt-elements-background-depth-1">
                <div className="text-bolt-elements-textSecondary">Compiling...</div>
            </div>
        );
    }

    if (!pageSpec) {
        const errors = diagnostics.filter((d) => d.severity === "error");
        return (
            <div className="flex h-full flex-col bg-bolt-elements-background-depth-1 p-4">
                <div className="mb-4 text-lg font-medium text-bolt-elements-textPrimary">Compilation Failed</div>
                <div className="space-y-2">
                    {errors.map((error, index) => (
                        <div key={index} className="rounded-md border border-red-200 bg-red-50 p-3 text-sm dark:border-red-900 dark:bg-red-950">
                            <div className="font-medium text-red-700 dark:text-red-400">[{error.code}] {error.message}</div>
                            {error.hint && <div className="mt-1 text-red-600 dark:text-red-500">💡 {error.hint}</div>}
                            <div className="mt-1 text-xs text-red-500">{error.location.file}:{error.location.line}:{error.location.column}</div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="flex h-full flex-col bg-bolt-elements-background-depth-1">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-bolt-elements-borderColor bg-bolt-elements-background-depth-2 px-4 py-2">
                <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-green-500" />
                    <span className="text-sm font-medium text-bolt-elements-textPrimary">{pageSpec.pageId}</span>
                </div>
                <div className="flex items-center gap-2">
                    <span className="rounded bg-bolt-elements-background-depth-3 px-2 py-0.5 text-xs text-bolt-elements-textSecondary">
                        {pageSpec.layoutType}
                    </span>
                    <span className="rounded bg-bolt-elements-background-depth-3 px-2 py-0.5 text-xs text-bolt-elements-textSecondary">
                        {pageSpec.shellType}
                    </span>
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-auto p-4">
                {pageSpec.widgets.header?.map((widget) => (
                    <WidgetPreview key={widget.widgetId} widget={widget} data={mockData} />
                ))}
                {pageSpec.widgets.aboveContent?.map((widget) => (
                    <WidgetPreview key={widget.widgetId} widget={widget} data={mockData} />
                ))}
                <div className="space-y-4">
                    {pageSpec.widgets.content.map((widget) => (
                        <WidgetPreview key={widget.widgetId} widget={widget} data={mockData} />
                    ))}
                </div>
                {pageSpec.widgets.footer?.map((widget) => (
                    <WidgetPreview key={widget.widgetId} widget={widget} data={mockData} />
                ))}
            </div>

            {/* Warnings */}
            {diagnostics.filter((d) => d.severity === "warning").length > 0 && (
                <div className="border-t border-yellow-200 bg-yellow-50 p-2 dark:border-yellow-900 dark:bg-yellow-950">
                    <div className="text-xs text-yellow-700 dark:text-yellow-400">
                        ⚠️ {diagnostics.filter((d) => d.severity === "warning").length} warning(s)
                    </div>
                </div>
            )}

            {/* Controller Refs */}
            {pageSpec.controllerRefs && pageSpec.controllerRefs.length > 0 && (
                <div className="border-t border-bolt-elements-borderColor bg-bolt-elements-background-depth-2 p-2">
                    <div className="text-xs text-bolt-elements-textSecondary">
                        Controllers: {pageSpec.controllerRefs.join(", ")}
                    </div>
                </div>
            )}
        </div>
    );
});

interface WidgetPreviewProps {
    widget: { widgetId: string; type: string; props?: Record<string, unknown>; bindings?: Record<string, string> };
    data: Record<string, unknown> | null;
}

function WidgetPreview({ widget, data }: WidgetPreviewProps) {
    const resolvedProps = useMemo(() => {
        if (!widget.bindings || !data) return widget.props ?? {};
        const resolved: Record<string, unknown> = { ...widget.props };
        for (const [key, path] of Object.entries(widget.bindings)) {
            resolved[key] = resolvePath(data, path.replace(/^vm\./, ""));
        }
        return resolved;
    }, [widget, data]);

    return (
        <div className="rounded-lg border border-bolt-elements-borderColor bg-bolt-elements-background-depth-2 p-3 mb-2">
            <div className="mb-2 flex items-center justify-between">
                <span className="text-xs font-medium text-bolt-elements-textPrimary">{widget.type}</span>
                <span className="text-xs text-bolt-elements-textTertiary">{widget.widgetId}</span>
            </div>
            {Object.keys(resolvedProps).length > 0 && (
                <details className="text-xs text-bolt-elements-textSecondary">
                    <summary className="cursor-pointer hover:text-bolt-elements-textPrimary">Props</summary>
                    <pre className="mt-1 overflow-auto rounded bg-bolt-elements-background-depth-1 p-2 text-xs">
                        {JSON.stringify(resolvedProps, null, 2)}
                    </pre>
                </details>
            )}
        </div>
    );
}

function resolvePath(obj: Record<string, unknown>, path: string): unknown {
    const parts = path.split(".");
    let current: unknown = obj;
    for (const part of parts) {
        if (current === null || current === undefined || typeof current !== "object") return undefined;
        current = (current as Record<string, unknown>)[part];
    }
    return current;
}
