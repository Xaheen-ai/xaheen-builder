import { stripIndents } from '../utils/stripIndent.js';
import type { SystemPromptOptions } from '../types.js';

/**
 * Planning Phase Prompt
 * 
 * Instructs the AI to follow a 2-step workflow:
 * 1. On FIRST request: Ask clarifying questions ONCE
 * 2. On SECOND message: Present plan and ask for approval
 * 3. On approval: Start building
 */
export function planningPhasePrompt(_options: SystemPromptOptions) {
  return stripIndents`
## Planning Workflow

Follow this workflow for new project requests:

### Step 1: First User Message → Ask Interactive Questions

When user requests a new app, output questions in this EXACT format so the UI can render them as clickable options:

\`\`\`
<!-- PLANNING_QUESTIONS
[
  {
    "id": "fields",
    "title": "What data fields should each item have?",
    "type": "multi",
    "options": [
      {"id": "title", "label": "Title", "recommended": true},
      {"id": "description", "label": "Description"},
      {"id": "priority", "label": "Priority", "recommended": true},
      {"id": "dueDate", "label": "Due Date"},
      {"id": "tags", "label": "Tags/Categories"}
    ]
  },
  {
    "id": "features",
    "title": "What features do you need?",
    "type": "multi",
    "options": [
      {"id": "create", "label": "Create items", "recommended": true},
      {"id": "edit", "label": "Edit items", "recommended": true},
      {"id": "delete", "label": "Delete items", "recommended": true},
      {"id": "filter", "label": "Filter/Search"},
      {"id": "sort", "label": "Sort by fields"}
    ]
  },
  {
    "id": "users",
    "title": "User mode?",
    "type": "single",
    "options": [
      {"id": "single", "label": "Single user", "recommended": true},
      {"id": "multi", "label": "Multi-user with auth"}
    ]
  },
  {
    "id": "i18n",
    "title": "Localization?",
    "type": "single",
    "options": [
      {"id": "none", "label": "English only", "recommended": true},
      {"id": "en_no", "label": "English + Norwegian"}
    ]
  }
]
-->
\`\`\`

**IMPORTANT**: Customize the questions based on the app type requested. The example above is for a task/todo app.

### Step 2: User Answers → Present Plan IMMEDIATELY (NO TOOLS!)

**CRITICAL RULES:**
1. After user answers OR clicks options, present a plan IMMEDIATELY
2. DO NOT ask more questions
3. ⛔ DO NOT try to read files, explore codebase, or use ANY tools
4. ⛔ DO NOT say "let me explore" or "let me check" - you have NO tool access yet
5. Generate the plan DIRECTLY from the user's requirements

If user says "recommended", "default", "all", or clicks "Use Recommended" → use the recommended options (marked with recommended: true) and present plan.

**Plan format** (generate this DIRECTLY from user requirements):
"""
## Implementation Plan

**Building**: [App name] with [key features based on selections]

### Features
- Feature 1 (based on user selections)
- Feature 2 (based on user selections)
- Feature 3 (based on user selections)

### Technical Approach
- Convex backend: Define schema, queries, mutations
- React frontend: Components for [main UI elements]
- Real-time sync via Convex hooks

### Tech Stack
- Convex backend with real-time sync
- React + Designsystemet UI
- [Localization if selected]

---
**Reply "go" to start building, or suggest changes.**
"""

### Step 3: User Approves → Build

When user says "go", "approved", "yes", "build it", "looks good" → start building immediately.

⚠️ NEVER ask more than ONE round of questions. After user responds ONCE, present the plan.
⚠️ NEVER try to use tools during planning phase - you will be blocked!
`;
}

/**
 * Check if a user message indicates approval to proceed
 */
export function isApprovalMessage(message: string): boolean {
  const approvalPatterns = [
    /\bapproved?\b/i,
    /\byes\b/i,
    /\bgo\b/i,           // "go" - primary approval keyword
    /\bgo ahead\b/i,
    /\bbuild it\b/i,
    /\bproceed\b/i,
    /\blooks good\b/i,
    /\blgtm\b/i,
    /\bstart build(ing)?\b/i,
    /\bimplement it\b/i,
    /\bdo it\b/i,
    /\blet'?s go\b/i,
  ];

  return approvalPatterns.some(pattern => pattern.test(message.trim()));
}

/**
 * Check if we're still in planning phase (user hasn't approved yet)
 * 
 * CRITICAL: Only check for approval AFTER AI has responded at least once.
 * The first user message should NEVER be treated as an approval.
 */
export function isStillPlanning(messages: Array<{ role: string; content: string }>): boolean {
  console.log('🔍 isStillPlanning check:', { messageCount: messages.length });

  if (messages.length === 0) {
    console.log('  → No messages, returning true (still planning)');
    return true;
  }

  // Count how many assistant responses there are
  const assistantMessages = messages.filter(m => m.role === 'assistant');
  console.log('  → Assistant message count:', assistantMessages.length);

  // If AI hasn't responded yet, we're definitely still in planning
  // This prevents "Let's build it now" from being treated as approval
  if (assistantMessages.length === 0) {
    console.log('  → No assistant messages yet, returning true (still planning)');
    return true;
  }

  // Check if the LAST assistant message contains a plan
  const lastAssistantMessage = assistantMessages[assistantMessages.length - 1];
  const aiPresentedPlan = containsPlan(lastAssistantMessage.content);
  console.log('  → AI presented plan?', aiPresentedPlan);
  console.log('  → Last assistant message preview:', lastAssistantMessage.content.substring(0, 100));

  // Only look for approval if AI has presented a plan
  if (!aiPresentedPlan) {
    // AI hasn't presented a plan yet, so we're still in planning
    // (AI might have asked questions, waiting for answers)
    console.log('  → No plan detected, returning true (still planning)');
    return true;
  }

  // AI has presented a plan - now check if user approved
  // Only check messages AFTER the plan was presented
  const lastAssistantIndex = messages.lastIndexOf(lastAssistantMessage);
  const messagesAfterPlan = messages.slice(lastAssistantIndex + 1);
  console.log('  → Messages after plan:', messagesAfterPlan.length);

  const hasApproval = messagesAfterPlan.some(
    msg => msg.role === 'user' && isApprovalMessage(msg.content)
  );
  console.log('  → User approved?', hasApproval);
  console.log('  → RESULT: isStillPlanning =', !hasApproval);

  return !hasApproval;
}

/**
 * Check if a message contains a plan that needs approval
 */
export function containsPlan(message: string): boolean {
  return (
    message.includes('## Implementation Plan') ||
    message.includes('### Steps') ||
    message.includes('### Technical Steps') ||
    message.includes('### Features') ||
    (message.includes('1.') && message.includes('2.') && message.includes('3.'))
  );
}
