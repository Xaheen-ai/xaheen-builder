/**
 * PlanApproval Component
 * 
 * Displays the AI's plan as a checklist and provides approve/modify buttons
 * for user approval before execution begins.
 */

import { memo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export interface PlanItem {
    description: string;
    type: 'create' | 'edit' | 'delete' | 'command' | 'info';
    path?: string;
}

export interface Plan {
    title: string;
    summary: string;
    items: PlanItem[];
}

interface PlanApprovalProps {
    plan: Plan;
    onApprove: () => void;
    onModify: (feedback: string) => void;
    onReject: () => void;
    isLoading?: boolean;
}

const getItemIcon = (type: PlanItem['type']): string => {
    switch (type) {
        case 'create': return '📄';
        case 'edit': return '✏️';
        case 'delete': return '🗑️';
        case 'command': return '⚡';
        case 'info': return 'ℹ️';
        default: return '•';
    }
};

const getItemColor = (type: PlanItem['type']): string => {
    switch (type) {
        case 'create': return 'text-green-400';
        case 'edit': return 'text-blue-400';
        case 'delete': return 'text-red-400';
        case 'command': return 'text-yellow-400';
        case 'info': return 'text-gray-400';
        default: return 'text-gray-400';
    }
};

export const PlanApproval = memo(({
    plan,
    onApprove,
    onModify,
    onReject,
    isLoading = false
}: PlanApprovalProps) => {
    const [showFeedback, setShowFeedback] = useState(false);
    const [feedback, setFeedback] = useState('');

    const handleModify = () => {
        if (feedback.trim()) {
            onModify(feedback);
            setFeedback('');
            setShowFeedback(false);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-bolt-elements-background-depth-2 rounded-lg border border-bolt-elements-borderColor p-4 my-4"
        >
            {/* Header */}
            <div className="flex items-center gap-2 mb-3">
                <span className="text-xl">📋</span>
                <h3 className="text-lg font-semibold text-bolt-elements-textPrimary">
                    {plan.title || 'Implementation Plan'}
                </h3>
            </div>

            {/* Summary */}
            <p className="text-sm text-bolt-elements-textSecondary mb-4">
                {plan.summary}
            </p>

            {/* Plan Items Checklist */}
            <div className="space-y-2 mb-4">
                {plan.items.map((item, index) => (
                    <div
                        key={index}
                        className="flex items-start gap-2 text-sm"
                    >
                        <span className="flex-shrink-0 w-6 text-center">
                            {getItemIcon(item.type)}
                        </span>
                        <div className="flex-1">
                            <span className={getItemColor(item.type)}>
                                {item.description}
                            </span>
                            {item.path && (
                                <code className="ml-2 text-xs bg-bolt-elements-background-depth-3 px-1 py-0.5 rounded">
                                    {item.path}
                                </code>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {/* Feedback Input */}
            <AnimatePresence>
                {showFeedback && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mb-4"
                    >
                        <textarea
                            value={feedback}
                            onChange={(e) => setFeedback(e.target.value)}
                            placeholder="Describe the changes you'd like..."
                            className="w-full p-2 bg-bolt-elements-background-depth-3 border border-bolt-elements-borderColor rounded-lg text-sm text-bolt-elements-textPrimary resize-none"
                            rows={3}
                        />
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Action Buttons */}
            <div className="flex gap-2 justify-end">
                <button
                    onClick={onReject}
                    disabled={isLoading}
                    className="px-4 py-2 text-sm text-bolt-elements-textSecondary hover:text-bolt-elements-textPrimary border border-bolt-elements-borderColor rounded-lg transition-colors disabled:opacity-50"
                >
                    Cancel
                </button>

                {showFeedback ? (
                    <>
                        <button
                            onClick={() => setShowFeedback(false)}
                            className="px-4 py-2 text-sm text-bolt-elements-textSecondary hover:text-bolt-elements-textPrimary border border-bolt-elements-borderColor rounded-lg transition-colors"
                        >
                            Back
                        </button>
                        <button
                            onClick={handleModify}
                            disabled={!feedback.trim() || isLoading}
                            className="px-4 py-2 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50"
                        >
                            Send Feedback
                        </button>
                    </>
                ) : (
                    <>
                        <button
                            onClick={() => setShowFeedback(true)}
                            disabled={isLoading}
                            className="px-4 py-2 text-sm text-bolt-elements-textSecondary hover:text-bolt-elements-textPrimary border border-bolt-elements-borderColor rounded-lg transition-colors disabled:opacity-50"
                        >
                            Modify
                        </button>
                        <button
                            onClick={onApprove}
                            disabled={isLoading}
                            className="px-4 py-2 text-sm bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors disabled:opacity-50"
                        >
                            {isLoading ? 'Building...' : 'Approve & Build'}
                        </button>
                    </>
                )}
            </div>
        </motion.div>
    );
});

PlanApproval.displayName = 'PlanApproval';

/**
 * Parse plan text from AI response into structured format
 */
export function parsePlanFromText(text: string): Plan | null {
    try {
        // Look for structured plan format in the text
        const lines = text.split('\n');
        const items: PlanItem[] = [];
        let title = 'Implementation Plan';
        let summary = '';

        let inPlanSection = false;

        for (const line of lines) {
            const trimmed = line.trim();

            // Look for title line (starts with # or "Plan:")
            if (trimmed.startsWith('# ') || trimmed.startsWith('## ')) {
                title = trimmed.replace(/^#+\s*/, '');
                inPlanSection = true;
                continue;
            }

            // Look for numbered list items
            const listMatch = trimmed.match(/^(\d+\.|[-*])\s+(.+)$/);
            if (listMatch && inPlanSection) {
                const content = listMatch[2];

                // Determine item type based on keywords
                let type: PlanItem['type'] = 'info';
                if (/create|add|new/i.test(content)) type = 'create';
                else if (/edit|update|modify|change/i.test(content)) type = 'edit';
                else if (/delete|remove/i.test(content)) type = 'delete';
                else if (/run|command|deploy|install/i.test(content)) type = 'command';

                // Extract file path if present
                const pathMatch = content.match(/`([^`]+\.[a-z]+)`/i);

                items.push({
                    description: content.replace(/`[^`]+`/g, '').trim(),
                    type,
                    path: pathMatch?.[1],
                });
            }

            // Capture summary text before the list
            if (!inPlanSection && trimmed && !trimmed.startsWith('#')) {
                summary += (summary ? ' ' : '') + trimmed;
            }
        }

        if (items.length === 0) {
            return null;
        }

        return { title, summary, items };
    } catch {
        return null;
    }
}
