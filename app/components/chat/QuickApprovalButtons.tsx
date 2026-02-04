/**
 * QuickApprovalButtons Component
 *
 * Shows "Build Now" and "Modify" buttons when AI presents a plan.
 * Allows users to approve with one click instead of typing "go".
 */

import { memo } from 'react';
import { motion } from 'framer-motion';

interface QuickApprovalButtonsProps {
    onApprove: () => void;
    onModify: () => void;
    isLoading?: boolean;
}

export const QuickApprovalButtons = memo(({
    onApprove,
    onModify,
    isLoading = false
}: QuickApprovalButtonsProps) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex gap-2 mt-4 pt-3 border-t border-bolt-elements-borderColor"
        >
            <button
                onClick={onApprove}
                disabled={isLoading}
                className="flex-1 px-4 py-2 text-sm font-medium bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
                <span>🚀</span>
                <span>Build Now</span>
            </button>
            <button
                onClick={onModify}
                disabled={isLoading}
                className="px-4 py-2 text-sm text-bolt-elements-textSecondary hover:text-bolt-elements-textPrimary border border-bolt-elements-borderColor rounded-lg transition-colors disabled:opacity-50"
            >
                ✏️ Modify
            </button>
        </motion.div>
    );
});

QuickApprovalButtons.displayName = 'QuickApprovalButtons';

/**
 * Check if a message contains a plan that needs approval
 */
export function detectPlanInMessage(content: string): boolean {
    return (
        content.includes('## Implementation Plan') ||
        content.includes('### Features') ||
        content.includes('### Tech Stack') ||
        (content.includes('Reply') && (content.includes('"go"') || content.includes("'go'")))
    );
}
