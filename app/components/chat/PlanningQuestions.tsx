/**
 * PlanningQuestions Component
 *
 * Interactive question cards with clickable options for the planning phase.
 * Users can select options instead of typing answers.
 */

import { memo, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export interface QuestionOption {
    id: string;
    label: string;
    description?: string;
    recommended?: boolean;
}

export interface PlanningQuestion {
    id: string;
    title: string;
    type: 'single' | 'multi';
    options: QuestionOption[];
}

interface PlanningQuestionsProps {
    questions: PlanningQuestion[];
    onSubmit: (selections: Record<string, string[]>) => void;
    onUseDefaults: () => void;
    onSkip?: () => void;
    isLoading?: boolean;
}

export const PlanningQuestions = memo(({
    questions,
    onSubmit,
    onUseDefaults,
    onSkip,
    isLoading = false
}: PlanningQuestionsProps) => {
    const [selections, setSelections] = useState<Record<string, string[]>>({});

    const handleOptionClick = useCallback((questionId: string, optionId: string, type: 'single' | 'multi') => {
        setSelections(prev => {
            const currentSelections = prev[questionId] || [];

            if (type === 'single') {
                // Single select - replace selection
                return { ...prev, [questionId]: [optionId] };
            } else {
                // Multi select - toggle
                const isSelected = currentSelections.includes(optionId);
                if (isSelected) {
                    return { ...prev, [questionId]: currentSelections.filter(id => id !== optionId) };
                } else {
                    return { ...prev, [questionId]: [...currentSelections, optionId] };
                }
            }
        });
    }, []);

    const handleSubmit = useCallback(() => {
        onSubmit(selections);
    }, [selections, onSubmit]);

    const isOptionSelected = (questionId: string, optionId: string) => {
        return (selections[questionId] || []).includes(optionId);
    };

    const hasSelections = Object.values(selections).some(arr => arr.length > 0);

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-bolt-elements-background-depth-2 rounded-lg border border-bolt-elements-borderColor p-4 my-4"
        >
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <span className="text-xl">❓</span>
                    <h3 className="text-lg font-semibold text-bolt-elements-textPrimary">
                        Quick Questions
                    </h3>
                </div>
                <button
                    onClick={onUseDefaults}
                    disabled={isLoading}
                    className="px-3 py-1 text-xs bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 rounded-full transition-colors disabled:opacity-50"
                >
                    ✨ Use Recommended
                </button>
            </div>

            {/* Questions */}
            <div className="space-y-4 mb-4">
                {questions.map((question, qIndex) => (
                    <motion.div
                        key={question.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: qIndex * 0.1 }}
                        className="space-y-2"
                    >
                        <div className="flex items-center gap-2">
                            <span className="text-xs font-medium text-bolt-elements-textSecondary">
                                {qIndex + 1}.
                            </span>
                            <span className="text-sm font-medium text-bolt-elements-textPrimary">
                                {question.title}
                            </span>
                            <span className="text-xs text-bolt-elements-textSecondary">
                                ({question.type === 'multi' ? 'Select all that apply' : 'Choose one'})
                            </span>
                        </div>

                        <div className="flex flex-wrap gap-2 ml-4">
                            {question.options.map((option) => {
                                const isSelected = isOptionSelected(question.id, option.id);
                                return (
                                    <button
                                        key={option.id}
                                        onClick={() => handleOptionClick(question.id, option.id, question.type)}
                                        disabled={isLoading}
                                        className={`
                      px-3 py-1.5 text-sm rounded-lg border transition-all
                      ${isSelected
                                                ? 'bg-green-600/20 border-green-500 text-green-400'
                                                : 'bg-bolt-elements-background-depth-3 border-bolt-elements-borderColor text-bolt-elements-textSecondary hover:border-bolt-elements-textSecondary'
                                            }
                      disabled:opacity-50
                    `}
                                    >
                                        <span className="flex items-center gap-1.5">
                                            {question.type === 'multi' && (
                                                <span className={`w-4 h-4 rounded border flex items-center justify-center text-xs ${isSelected ? 'bg-green-600 border-green-600' : 'border-current'
                                                    }`}>
                                                    {isSelected && '✓'}
                                                </span>
                                            )}
                                            {option.label}
                                            {option.recommended && (
                                                <span className="text-xs text-yellow-500">★</span>
                                            )}
                                        </span>
                                    </button>
                                );
                            })}
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 justify-end pt-2 border-t border-bolt-elements-borderColor">
                {onSkip && (
                    <button
                        onClick={onSkip}
                        disabled={isLoading}
                        className="px-4 py-2 text-sm text-bolt-elements-textSecondary hover:text-bolt-elements-textPrimary border border-bolt-elements-borderColor rounded-lg transition-colors disabled:opacity-50"
                    >
                        Skip & Build Now
                    </button>
                )}
                <button
                    onClick={handleSubmit}
                    disabled={!hasSelections || isLoading}
                    className="px-4 py-2 text-sm bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2"
                >
                    Continue →
                </button>
            </div>
        </motion.div>
    );
});

PlanningQuestions.displayName = 'PlanningQuestions';

/**
 * Parse planning questions from AI response
 * Looks for <!-- PLANNING_QUESTIONS [...] --> format
 */
export function parsePlanningQuestions(text: string): PlanningQuestion[] | null {
    try {
        const match = text.match(/<!--\s*PLANNING_QUESTIONS\s*([\s\S]*?)\s*-->/);
        if (!match) return null;

        const jsonStr = match[1].trim();
        const questions = JSON.parse(jsonStr) as PlanningQuestion[];

        // Validate structure
        if (!Array.isArray(questions) || questions.length === 0) return null;

        return questions;
    } catch {
        return null;
    }
}

/**
 * Format user selections as a natural language response
 */
export function formatSelectionsAsMessage(
    questions: PlanningQuestion[],
    selections: Record<string, string[]>
): string {
    const parts: string[] = [];

    for (const question of questions) {
        const selected = selections[question.id] || [];
        if (selected.length === 0) continue;

        const selectedLabels = selected
            .map(id => question.options.find(o => o.id === id)?.label)
            .filter(Boolean);

        if (selectedLabels.length > 0) {
            parts.push(`${question.title}: ${selectedLabels.join(', ')}`);
        }
    }

    return parts.length > 0
        ? `Here are my choices:\n${parts.map(p => `- ${p}`).join('\n')}`
        : 'Use recommended defaults for all options';
}

/**
 * Get default selections (recommended options)
 */
export function getDefaultSelections(questions: PlanningQuestion[]): Record<string, string[]> {
    const selections: Record<string, string[]> = {};

    for (const question of questions) {
        const recommended = question.options
            .filter(o => o.recommended)
            .map(o => o.id);

        if (recommended.length > 0) {
            selections[question.id] = recommended;
        } else if (question.type === 'single' && question.options.length > 0) {
            // For single-select with no recommended, pick first
            selections[question.id] = [question.options[0].id];
        }
    }

    return selections;
}
