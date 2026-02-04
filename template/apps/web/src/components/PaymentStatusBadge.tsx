/**
 * PaymentStatusBadge Component
 *
 * Displays payment status for bookings with color-coded badges.
 * Re-exported from @xaheen/ds design system.
 *
 * Usage:
 * ```tsx
 * import { PaymentStatusBadge } from './components/PaymentStatusBadge';
 *
 * <PaymentStatusBadge status="paid" />
 * <PaymentStatusBadge status="unpaid" size="md" />
 * <PaymentStatusBadge status="partial" />
 * <PaymentStatusBadge status="refunded" />
 * ```
 *
 * Status values:
 * - 'paid': Payment completed successfully (green)
 * - 'unpaid': Payment not yet made (yellow)
 * - 'partial': Partial payment received (yellow)
 * - 'refunded': Payment has been refunded (gray)
 *
 * @see packages/ds/src/blocks/StatusBadges.tsx for implementation
 */

// Re-export from design system - DO NOT create custom UI components in apps
export { PaymentStatusBadge } from '@xaheen/ds';
export type { PaymentStatusBadgeProps, PaymentStatusType } from '@xaheen/ds';
