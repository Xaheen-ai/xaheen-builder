/**
 * Diagnostics Panel Component
 */

import { memo } from "react";
import type { Diagnostic } from "~/lib/chef-mode/compiler-hook";
import { classNames } from "~/utils/classNames";

interface DiagnosticsPanelProps {
    diagnostics: Diagnostic[];
    onDiagnosticClick?: (diagnostic: Diagnostic) => void;
}

export const DiagnosticsPanel = memo(function DiagnosticsPanel({ diagnostics, onDiagnosticClick }: DiagnosticsPanelProps) {
    if (diagnostics.length === 0) {
        return (
            <div className="flex h-full items-center justify-center text-sm text-bolt-elements-textTertiary">
                No issues found
            </div>
        );
    }

    const errors = diagnostics.filter((d) => d.severity === "error");
    const warnings = diagnostics.filter((d) => d.severity === "warning");

    return (
        <div className="flex h-full flex-col bg-bolt-elements-background-depth-1">
            {/* Summary */}
            <div className="flex items-center gap-4 border-b border-bolt-elements-borderColor px-3 py-2">
                {errors.length > 0 && (
                    <div className="flex items-center gap-1 text-xs">
                        <span className="h-2 w-2 rounded-full bg-red-500" />
                        <span className="text-red-600 dark:text-red-400">
                            {errors.length} error{errors.length !== 1 ? "s" : ""}
                        </span>
                    </div>
                )}
                {warnings.length > 0 && (
                    <div className="flex items-center gap-1 text-xs">
                        <span className="h-2 w-2 rounded-full bg-yellow-500" />
                        <span className="text-yellow-600 dark:text-yellow-400">
                            {warnings.length} warning{warnings.length !== 1 ? "s" : ""}
                        </span>
                    </div>
                )}
            </div>

            {/* Diagnostics List */}
            <div className="flex-1 overflow-auto">
                {diagnostics.map((diagnostic, index) => (
                    <DiagnosticItem
                        key={index}
                        diagnostic={diagnostic}
                        onClick={() => onDiagnosticClick?.(diagnostic)}
                    />
                ))}
            </div>
        </div>
    );
});

interface DiagnosticItemProps {
    diagnostic: Diagnostic;
    onClick?: () => void;
}

function DiagnosticItem({ diagnostic, onClick }: DiagnosticItemProps) {
    const isError = diagnostic.severity === "error";

    return (
        <button
            className={classNames(
                "w-full border-b border-bolt-elements-borderColor px-3 py-2 text-left transition-colors",
                "hover:bg-bolt-elements-background-depth-2",
                onClick ? "cursor-pointer" : ""
            )}
            onClick={onClick}
        >
            <div className="flex items-start gap-2">
                <span
                    className={classNames(
                        "rounded px-1 py-0.5 text-xs font-medium",
                        isError
                            ? "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300"
                            : "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300"
                    )}
                >
                    {diagnostic.code}
                </span>
                <span className="flex-1 text-sm text-bolt-elements-textPrimary">{diagnostic.message}</span>
            </div>
            {diagnostic.hint && (
                <div className="mt-1 pl-12 text-xs text-bolt-elements-textSecondary">💡 {diagnostic.hint}</div>
            )}
            <div className="mt-1 pl-12 text-xs text-bolt-elements-textTertiary">
                {diagnostic.location.file.split("/").pop()}:{diagnostic.location.line}:{diagnostic.location.column}
            </div>
        </button>
    );
}

export function formatDiagnosticsSummary(diagnostics: Diagnostic[]): string {
    const errors = diagnostics.filter((d) => d.severity === "error").length;
    const warnings = diagnostics.filter((d) => d.severity === "warning").length;
    if (errors === 0 && warnings === 0) return "No issues";
    const parts: string[] = [];
    if (errors > 0) parts.push(`${errors} error${errors !== 1 ? "s" : ""}`);
    if (warnings > 0) parts.push(`${warnings} warning${warnings !== 1 ? "s" : ""}`);
    return parts.join(", ");
}
