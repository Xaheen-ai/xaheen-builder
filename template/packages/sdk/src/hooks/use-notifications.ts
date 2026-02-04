/**
 * Xaheen SDK - Notification Hooks (Tier 2)
 *
 * React hooks for in-app notifications, push subscriptions, and
 * notification preferences. All stubs until Convex notification
 * functions are implemented.
 *
 * Queries:  { data, isLoading, error }
 * Mutations: { mutate, mutateAsync, isLoading, error, isSuccess }
 */

import { useQuery as useConvexQuery, useMutation as useConvexMutation } from "convex/react";
import { api } from "../convex-api";
import { useState } from "react";

// =============================================================================
// Query Key Factory (inert -- kept for future React Query migration)
// =============================================================================

export const notificationKeys = {
  all: ["notifications"] as const,
  list: (params?: Record<string, unknown>) => [...notificationKeys.all, "list", params] as const,
  my: (params?: Record<string, unknown>) => [...notificationKeys.all, "my", params] as const,
  unreadCount: () => [...notificationKeys.all, "unread-count"] as const,
  templates: () => [...notificationKeys.all, "templates"] as const,
  push: () => [...notificationKeys.all, "push"] as const,
  pushSubscriptions: () => [...notificationKeys.all, "push", "subscriptions"] as const,
  preferences: () => [...notificationKeys.all, "preferences"] as const,
  permission: () => [...notificationKeys.all, "push", "permission"] as const,
};

// =============================================================================
// Types
// =============================================================================

export interface Notification {
  id: string;
  tenantId: string;
  userId: string;
  type: string;
  title: string;
  body: string;
  readAt?: string;
  actionUrl?: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
}

export interface NotificationTemplate {
  id: string;
  type: string;
  titleTemplate: string;
  bodyTemplate: string;
  channels: string[];
}

export interface PushSubscription {
  id: string;
  userId: string;
  endpoint: string;
  provider: "web" | "fcm" | "apns";
  createdAt: string;
}

export interface NotificationPreferences {
  email: boolean;
  push: boolean;
  inApp: boolean;
  categories: Record<string, { email: boolean; push: boolean; inApp: boolean }>;
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
// Notification Query Hooks
// =============================================================================

/**
 * Get all notifications (admin view).
 * Stub: returns empty array until Convex notification functions exist.
 */
export function useNotifications(params?: { type?: string; limit?: number; cursor?: string }) {
  return useStubQuery<Notification[]>([]);
}

/**
 * Get current user's notifications.
 * Stub: returns empty array until Convex notification functions exist.
 */
export function useMyNotifications(params?: { unreadOnly?: boolean; limit?: number; cursor?: string }) {
  return useStubQuery<Notification[]>([]);
}

/**
 * Get unread notification count for the current user.
 * Stub: returns 0 until Convex notification functions exist.
 */
export function useNotificationUnreadCount() {
  return useStubQuery<{ count: number }>({ count: 0 });
}

/**
 * Get notification templates (admin view).
 * Stub: returns empty array until Convex notification functions exist.
 */
export function useNotificationTemplates() {
  return useStubQuery<NotificationTemplate[]>([]);
}

// =============================================================================
// Notification Mutation Hooks
// =============================================================================

/**
 * Mark a single notification as read.
 * Stub: returns noop mutation until Convex notification functions exist.
 */
export function useMarkNotificationRead() {
  return useStubMutation<{ id: string }, { success: boolean }>();
}

/**
 * Mark all notifications as read for the current user.
 * Stub: returns noop mutation until Convex notification functions exist.
 */
export function useMarkAllNotificationsRead() {
  return useStubMutation<void, { success: boolean }>();
}

/**
 * Delete a notification.
 * Stub: returns noop mutation until Convex notification functions exist.
 */
export function useDeleteNotification() {
  return useStubMutation<{ id: string }, { success: boolean }>();
}

// =============================================================================
// Push Notification Query Hooks
// =============================================================================

/**
 * Get push subscriptions for the current user.
 * Stub: returns empty array until push infrastructure exists.
 */
export function usePushSubscriptions() {
  return useStubQuery<PushSubscription[]>([]);
}

/**
 * Get notification preferences for the current user.
 * Stub: returns default preferences until Convex functions exist.
 */
export function useNotificationPreferences() {
  return useStubQuery<NotificationPreferences>({
    email: true,
    push: true,
    inApp: true,
    categories: {},
  });
}

/**
 * Get current push permission status from the browser.
 * Stub: returns "default" until push infrastructure exists.
 */
export function usePushPermission() {
  return useStubQuery<"granted" | "denied" | "default">("default");
}

// =============================================================================
// Push Notification Mutation Hooks
// =============================================================================

/**
 * Register a new push subscription.
 * Stub: returns noop mutation until push infrastructure exists.
 */
export function useRegisterPushSubscription() {
  return useStubMutation<
    { endpoint: string; keys: { p256dh: string; auth: string } },
    { id: string }
  >();
}

/**
 * Unsubscribe from push notifications.
 * Stub: returns noop mutation until push infrastructure exists.
 */
export function useUnsubscribePush() {
  return useStubMutation<void, { success: boolean }>();
}

/**
 * Delete a specific push subscription by ID.
 * Stub: returns noop mutation until push infrastructure exists.
 */
export function useDeletePushSubscription() {
  return useStubMutation<{ id: string }, { success: boolean }>();
}

/**
 * Update notification preferences for the current user.
 * Stub: returns noop mutation until Convex functions exist.
 */
export function useUpdateNotificationPreferences() {
  return useStubMutation<Partial<NotificationPreferences>, { success: boolean }>();
}

/**
 * Send a test push notification to the current user.
 * Stub: returns noop mutation until push infrastructure exists.
 */
export function useTestPushNotification() {
  return useStubMutation<void, { success: boolean }>();
}

/**
 * Combined push subscription flow: request permission, subscribe, register.
 * Stub: returns noop mutation until push infrastructure exists.
 */
export function usePushSubscriptionFlow() {
  return useStubMutation<void, { subscribed: boolean; permission: string }>();
}
