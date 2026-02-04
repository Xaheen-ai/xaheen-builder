/**
 * Xaheen SDK - Conversation Hooks (Tier 2)
 *
 * React hooks for messaging / conversation functionality.
 * Stubs that return React Query-compatible shapes until Convex
 * messaging functions are implemented.
 *
 * Queries:  { data, isLoading, error }
 * Mutations: { mutate, mutateAsync, isLoading, error, isSuccess }
 */

import { useQuery as useConvexQuery, useMutation as useConvexMutation } from "convex/react";
import { api } from "../convex-api";
import { useState } from "react";

// =============================================================================
// Query Key Factory (inert — kept for future React Query migration)
// =============================================================================

export const conversationKeys = {
  all: ["conversations"] as const,
  list: (params?: Record<string, unknown>) => [...conversationKeys.all, "list", params] as const,
  detail: (id: string) => [...conversationKeys.all, "detail", id] as const,
  messages: (conversationId: string) => [...conversationKeys.all, "messages", conversationId] as const,
  unreadCount: () => [...conversationKeys.all, "unread-count"] as const,
};

// =============================================================================
// Types
// =============================================================================

export interface Conversation {
  id: string;
  tenantId: string;
  subject: string;
  status: "open" | "resolved" | "closed";
  participantIds: string[];
  assigneeId?: string;
  lastMessageAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  senderType: "user" | "admin" | "system";
  content: string;
  readAt?: string;
  createdAt: string;
}

export interface CreateConversationInput {
  tenantId: string;
  subject: string;
  participantIds: string[];
  initialMessage?: string;
}

export interface SendMessageInput {
  conversationId: string;
  content: string;
  senderType?: "user" | "admin";
}

// =============================================================================
// Stub helpers
// =============================================================================

function useStubQuery<T>(emptyValue: T): { data: { data: T }; isLoading: false; error: null } {
  return { data: { data: emptyValue }, isLoading: false, error: null };
}

function useStubMutation<TArgs = void, TResult = void>(): {
  mutate: (args: TArgs) => void;
  mutateAsync: (args: TArgs) => Promise<TResult>;
  isLoading: false;
  error: null;
  isSuccess: false;
} {
  return {
    mutate: (_args: TArgs) => {},
    mutateAsync: (_args: TArgs) => Promise.resolve(undefined as unknown as TResult),
    isLoading: false,
    error: null,
    isSuccess: false,
  };
}

// =============================================================================
// Query Hooks
// =============================================================================

/**
 * Fetch all conversations for the current user / tenant.
 * Stub: returns empty array until Convex messaging functions exist.
 */
export function useConversations(params?: { status?: string; limit?: number }) {
  // TODO: wire to api.messaging.index.list when it exists
  return useStubQuery<Conversation[]>([]);
}

/**
 * Fetch a single conversation by ID.
 * Stub: returns null until Convex messaging functions exist.
 */
export function useConversation(id: string | undefined) {
  return useStubQuery<Conversation | null>(null);
}

/**
 * Fetch messages for a conversation.
 * Stub: returns empty array until Convex messaging functions exist.
 */
export function useMessages(conversationId: string | undefined, params?: { limit?: number; cursor?: string }) {
  return useStubQuery<Message[]>([]);
}

/**
 * Get unread message count across all conversations.
 * Stub: returns 0 until Convex messaging functions exist.
 */
export function useUnreadCount() {
  return useStubQuery<number>(0);
}

// =============================================================================
// Mutation Hooks
// =============================================================================

/**
 * Create a new conversation.
 * Stub: returns noop mutation until Convex messaging functions exist.
 */
export function useCreateConversation() {
  return useStubMutation<CreateConversationInput, { id: string }>();
}

/**
 * Send a message to a conversation.
 * Stub: returns noop mutation until Convex messaging functions exist.
 */
export function useSendMessage() {
  return useStubMutation<SendMessageInput, { id: string }>();
}

/**
 * Mark all messages in a conversation as read.
 * Stub: returns noop mutation until Convex messaging functions exist.
 */
export function useMarkMessagesRead() {
  return useStubMutation<{ conversationId: string }, { success: boolean }>();
}

/**
 * Resolve / close a conversation.
 * Stub: returns noop mutation until Convex messaging functions exist.
 */
export function useResolveConversation() {
  return useStubMutation<{ conversationId: string }, { success: boolean }>();
}

/**
 * Reopen a previously resolved conversation.
 * Stub: returns noop mutation until Convex messaging functions exist.
 */
export function useReopenConversation() {
  return useStubMutation<{ conversationId: string }, { success: boolean }>();
}

/**
 * Assign a conversation to a user / admin.
 * Stub: returns noop mutation until Convex messaging functions exist.
 */
export function useAssignConversation() {
  return useStubMutation<{ conversationId: string; assigneeId: string }, { success: boolean }>();
}
