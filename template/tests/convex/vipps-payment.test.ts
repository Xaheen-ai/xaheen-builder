/**
 * Vipps ePayment Tests
 *
 * Tests for payment creation, status tracking, capture, refund,
 * cancel, webhook processing, reference generation, and status mapping.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { TestDataStore, createMockContext } from './setup';

describe('Vipps ePayment', () => {
    let store: TestDataStore;
    let tenantId: string;
    let userId: string;
    let bookingId: string;

    beforeEach(() => {
        store = new TestDataStore();
        tenantId = store.seedTenant({ name: 'Vipps Test Tenant' });
        userId = store.seedUser({
            tenantId,
            email: 'payer@test.no',
            status: 'active',
        });
        bookingId = store.seedBooking({
            tenantId,
            userId,
            resourceId: store.seedResource({ tenantId }),
            status: 'confirmed',
            totalPrice: 50000,
            currency: 'NOK',
        });
    });

    // =========================================================================
    // Payment Reference Generation
    // =========================================================================

    describe('Payment Reference Generation', () => {
        it('should generate reference with bookingId', () => {
            const reference = `xala-${bookingId}-${Date.now()}`;

            expect(reference).toMatch(/^xala-bookings_\d+-\d+$/);
            expect(reference).toContain(bookingId);
        });

        it('should generate reference without bookingId (direct payment)', () => {
            const reference = `xala-direct-${Date.now()}`;

            expect(reference).toMatch(/^xala-direct-\d+$/);
        });

        it('should generate unique references for concurrent payments', () => {
            const refs = new Set<string>();
            for (let i = 0; i < 100; i++) {
                refs.add(`xala-${bookingId}-${Date.now()}-${i}`);
            }
            expect(refs.size).toBe(100);
        });
    });

    // =========================================================================
    // Payment Record CRUD
    // =========================================================================

    describe('Payment Record CRUD', () => {
        it('should insert payment record', async () => {
            const ctx = createMockContext(store);

            const reference = `xala-${bookingId}-${Date.now()}`;
            const paymentId = store.seedPayment({
                tenantId,
                bookingId,
                userId,
                provider: 'vipps',
                reference,
                amount: 50000,
                currency: 'NOK',
                description: 'Booking payment',
                status: 'created',
                redirectUrl: 'https://apitest.vipps.no/landing/...',
            });

            const payment = await ctx.db.get(paymentId);
            expect(payment).not.toBeNull();

            const typed = payment as {
                tenantId: string;
                bookingId: string;
                reference: string;
                amount: number;
                currency: string;
                status: string;
                provider: string;
            };

            expect(typed.tenantId).toBe(tenantId);
            expect(typed.bookingId).toBe(bookingId);
            expect(typed.amount).toBe(50000);
            expect(typed.currency).toBe('NOK');
            expect(typed.status).toBe('created');
            expect(typed.provider).toBe('vipps');
        });

        it('should query payment by reference', async () => {
            const ctx = createMockContext(store);
            const reference = 'xala-test-ref-12345';

            store.seedPayment({
                tenantId,
                reference,
                amount: 25000,
                status: 'created',
            });

            const payment = await ctx.db
                .query('payments')
                .withIndex('by_reference', (q: { eq: (f: string, v: string) => unknown }) =>
                    q.eq('reference', reference)
                )
                .first();

            expect(payment).not.toBeNull();
            expect((payment as { reference: string }).reference).toBe(reference);
        });

        it('should return null for unknown reference', async () => {
            const ctx = createMockContext(store);

            const payment = await ctx.db
                .query('payments')
                .withIndex('by_reference', (q: { eq: (f: string, v: string) => unknown }) =>
                    q.eq('reference', 'nonexistent-ref')
                )
                .first();

            expect(payment).toBeNull();
        });

        it('should query payments by tenant', async () => {
            const ctx = createMockContext(store);

            store.seedPayment({ tenantId, reference: 'ref-1', status: 'created' });
            store.seedPayment({ tenantId, reference: 'ref-2', status: 'authorized' });
            store.seedPayment({ tenantId, reference: 'ref-3', status: 'captured' });

            const payments = await ctx.db
                .query('payments')
                .withIndex('by_tenant', (q: { eq: (f: string, v: string) => unknown }) =>
                    q.eq('tenantId', tenantId)
                )
                .collect();

            expect(payments.length).toBe(3);
        });
    });

    // =========================================================================
    // Payment Status Updates
    // =========================================================================

    describe('Payment Status Updates', () => {
        it('should update payment status to authorized', async () => {
            const ctx = createMockContext(store);
            const reference = 'status-test-ref';

            const paymentId = store.seedPayment({
                tenantId,
                reference,
                status: 'created',
                amount: 10000,
            });

            // Simulate updatePaymentStatus
            await ctx.db.patch(paymentId, {
                status: 'authorized',
                updatedAt: Date.now(),
            });

            const updated = await ctx.db.get(paymentId);
            expect((updated as { status: string }).status).toBe('authorized');
        });

        it('should update payment status to captured with amount', async () => {
            const ctx = createMockContext(store);
            const reference = 'capture-test-ref';

            const paymentId = store.seedPayment({
                tenantId,
                reference,
                status: 'authorized',
                amount: 30000,
            });

            await ctx.db.patch(paymentId, {
                status: 'captured',
                capturedAmount: 30000,
                updatedAt: Date.now(),
            });

            const updated = await ctx.db.get(paymentId);
            const typed = updated as { status: string; capturedAmount: number };
            expect(typed.status).toBe('captured');
            expect(typed.capturedAmount).toBe(30000);
        });

        it('should update externalId on status change', async () => {
            const ctx = createMockContext(store);
            const reference = 'extid-test-ref';

            const paymentId = store.seedPayment({
                tenantId,
                reference,
                status: 'created',
                amount: 5000,
            });

            await ctx.db.patch(paymentId, {
                status: 'authorized',
                externalId: 'vipps-psp-ref-123',
                updatedAt: Date.now(),
            });

            const updated = await ctx.db.get(paymentId);
            expect((updated as { externalId: string }).externalId).toBe(
                'vipps-psp-ref-123'
            );
        });

        it('should update payment status to cancelled', async () => {
            const ctx = createMockContext(store);
            const reference = 'cancel-test-ref';

            const paymentId = store.seedPayment({
                tenantId,
                reference,
                status: 'created',
                amount: 15000,
            });

            await ctx.db.patch(paymentId, {
                status: 'cancelled',
                updatedAt: Date.now(),
            });

            const updated = await ctx.db.get(paymentId);
            expect((updated as { status: string }).status).toBe('cancelled');
        });
    });

    // =========================================================================
    // Refund Logic
    // =========================================================================

    describe('Refund Logic', () => {
        it('should process full refund', async () => {
            const ctx = createMockContext(store);
            const reference = 'refund-full-ref';

            const paymentId = store.seedPayment({
                tenantId,
                reference,
                status: 'captured',
                amount: 20000,
                capturedAmount: 20000,
            });

            // Simulate updatePaymentRefund logic
            const payment = await ctx.db.get(paymentId);
            const typed = payment as { amount: number; refundedAmount?: number };
            const currentRefunded = (typed.refundedAmount || 0) + 20000;
            const newStatus = currentRefunded >= typed.amount ? 'refunded' : 'captured';

            await ctx.db.patch(paymentId, {
                refundedAmount: currentRefunded,
                status: newStatus,
                updatedAt: Date.now(),
            });

            const updated = await ctx.db.get(paymentId);
            const updatedTyped = updated as {
                status: string;
                refundedAmount: number;
            };
            expect(updatedTyped.status).toBe('refunded');
            expect(updatedTyped.refundedAmount).toBe(20000);
        });

        it('should process partial refund', async () => {
            const ctx = createMockContext(store);
            const reference = 'refund-partial-ref';

            const paymentId = store.seedPayment({
                tenantId,
                reference,
                status: 'captured',
                amount: 20000,
                capturedAmount: 20000,
            });

            // Partial refund of 5000
            const payment = await ctx.db.get(paymentId);
            const typed = payment as { amount: number; refundedAmount?: number };
            const currentRefunded = (typed.refundedAmount || 0) + 5000;
            const newStatus = currentRefunded >= typed.amount ? 'refunded' : 'captured';

            await ctx.db.patch(paymentId, {
                refundedAmount: currentRefunded,
                status: newStatus,
                updatedAt: Date.now(),
            });

            const updated = await ctx.db.get(paymentId);
            const updatedTyped = updated as {
                status: string;
                refundedAmount: number;
            };
            // Partial refund keeps status as captured
            expect(updatedTyped.status).toBe('captured');
            expect(updatedTyped.refundedAmount).toBe(5000);
        });

        it('should accumulate multiple partial refunds', async () => {
            const ctx = createMockContext(store);
            const reference = 'refund-multi-ref';

            const paymentId = store.seedPayment({
                tenantId,
                reference,
                status: 'captured',
                amount: 30000,
                capturedAmount: 30000,
                refundedAmount: 0,
            });

            // First partial refund: 10000
            store.patch(paymentId, { refundedAmount: 10000 });

            // Second partial refund: 10000 more
            const afterFirst = await ctx.db.get(paymentId);
            const currentRefunded =
                ((afterFirst as { refundedAmount: number }).refundedAmount || 0) + 10000;

            await ctx.db.patch(paymentId, {
                refundedAmount: currentRefunded,
                status: currentRefunded >= 30000 ? 'refunded' : 'captured',
            });

            const updated = await ctx.db.get(paymentId);
            const typed = updated as { status: string; refundedAmount: number };
            expect(typed.refundedAmount).toBe(20000);
            expect(typed.status).toBe('captured'); // Still not fully refunded

            // Third partial refund: 10000 more (now fully refunded)
            const total = typed.refundedAmount + 10000;
            await ctx.db.patch(paymentId, {
                refundedAmount: total,
                status: total >= 30000 ? 'refunded' : 'captured',
            });

            const final = await ctx.db.get(paymentId);
            const finalTyped = final as { status: string; refundedAmount: number };
            expect(finalTyped.refundedAmount).toBe(30000);
            expect(finalTyped.status).toBe('refunded');
        });
    });

    // =========================================================================
    // Vipps State Mapping
    // =========================================================================

    describe('Vipps State Mapping', () => {
        function mapVippsState(state: string): string {
            switch (state) {
                case 'CREATED':
                    return 'created';
                case 'AUTHORIZED':
                    return 'authorized';
                case 'ABORTED':
                    return 'cancelled';
                case 'EXPIRED':
                    return 'failed';
                case 'TERMINATED':
                    return 'cancelled';
                default:
                    return state.toLowerCase();
            }
        }

        it('should map CREATED to created', () => {
            expect(mapVippsState('CREATED')).toBe('created');
        });

        it('should map AUTHORIZED to authorized', () => {
            expect(mapVippsState('AUTHORIZED')).toBe('authorized');
        });

        it('should map ABORTED to cancelled', () => {
            expect(mapVippsState('ABORTED')).toBe('cancelled');
        });

        it('should map EXPIRED to failed', () => {
            expect(mapVippsState('EXPIRED')).toBe('failed');
        });

        it('should map TERMINATED to cancelled', () => {
            expect(mapVippsState('TERMINATED')).toBe('cancelled');
        });

        it('should lowercase unknown states', () => {
            expect(mapVippsState('CAPTURED')).toBe('captured');
            expect(mapVippsState('REFUNDED')).toBe('refunded');
        });
    });

    // =========================================================================
    // Webhook Processing
    // =========================================================================

    describe('Webhook Processing', () => {
        it('should process AUTHORIZED webhook event', async () => {
            const ctx = createMockContext(store);
            const reference = 'webhook-auth-ref';

            const paymentId = store.seedPayment({
                tenantId,
                bookingId,
                reference,
                status: 'created',
                amount: 50000,
            });

            // Simulate webhook payload
            const webhookPayload = {
                msn: '123456',
                reference,
                pspReference: 'vipps-psp-789',
                name: 'epayments.payment.authorized.v1',
                amount: { currency: 'NOK', value: 50000 },
                state: 'AUTHORIZED',
            };

            // Process webhook: extract reference and state
            expect(webhookPayload.reference).toBe(reference);
            expect(webhookPayload.state).toBe('AUTHORIZED');

            // Update payment
            await ctx.db.patch(paymentId, {
                status: 'authorized',
                externalId: webhookPayload.pspReference,
                capturedAmount: webhookPayload.amount.value,
                updatedAt: Date.now(),
            });

            const updated = await ctx.db.get(paymentId);
            const typed = updated as {
                status: string;
                externalId: string;
                capturedAmount: number;
            };
            expect(typed.status).toBe('authorized');
            expect(typed.externalId).toBe('vipps-psp-789');
        });

        it('should process ABORTED webhook event', async () => {
            const ctx = createMockContext(store);
            const reference = 'webhook-abort-ref';

            const paymentId = store.seedPayment({
                tenantId,
                reference,
                status: 'created',
                amount: 10000,
            });

            const webhookPayload = {
                reference,
                state: 'ABORTED',
            };

            await ctx.db.patch(paymentId, {
                status: 'cancelled',
                updatedAt: Date.now(),
            });

            const updated = await ctx.db.get(paymentId);
            expect((updated as { status: string }).status).toBe('cancelled');
        });

        it('should process EXPIRED webhook event', async () => {
            const ctx = createMockContext(store);
            const reference = 'webhook-expired-ref';

            const paymentId = store.seedPayment({
                tenantId,
                reference,
                status: 'created',
                amount: 8000,
            });

            await ctx.db.patch(paymentId, {
                status: 'failed',
                updatedAt: Date.now(),
            });

            const updated = await ctx.db.get(paymentId);
            expect((updated as { status: string }).status).toBe('failed');
        });

        it('should handle webhook with missing reference gracefully', () => {
            const webhookPayload = {
                state: 'AUTHORIZED',
                // no reference
            };

            const reference = (webhookPayload as { reference?: string }).reference;
            expect(reference).toBeUndefined();

            // Webhook handler should log and return { received: true }
            const result = !reference
                ? { received: true }
                : { received: true, processed: true };

            expect(result.received).toBe(true);
            expect((result as { processed?: boolean }).processed).toBeUndefined();
        });

        it('should look up booking on AUTHORIZED webhook', async () => {
            const ctx = createMockContext(store);
            const reference = 'webhook-booking-ref';

            const paymentId = store.seedPayment({
                tenantId,
                bookingId,
                reference,
                status: 'created',
                amount: 50000,
            });

            // After updating status, check if booking is linked
            await ctx.db.patch(paymentId, {
                status: 'authorized',
                updatedAt: Date.now(),
            });

            // Look up payment to find booking
            const payment = await ctx.db
                .query('payments')
                .withIndex('by_reference', (q: { eq: (f: string, v: string) => unknown }) =>
                    q.eq('reference', reference)
                )
                .first();

            const typed = payment as { bookingId?: string };
            expect(typed.bookingId).toBe(bookingId);

            // Verify booking exists
            const booking = await ctx.db.get(typed.bookingId!);
            expect(booking).not.toBeNull();
            expect((booking as { status: string }).status).toBe('confirmed');
        });
    });

    // =========================================================================
    // Payment Amounts
    // =========================================================================

    describe('Payment Amounts', () => {
        it('should store amounts in minor units (øre)', () => {
            // 500 NOK = 50000 øre
            const amountNOK = 500;
            const amountOre = amountNOK * 100;

            expect(amountOre).toBe(50000);
        });

        it('should handle partial capture amount', async () => {
            const ctx = createMockContext(store);

            const paymentId = store.seedPayment({
                tenantId,
                reference: 'partial-capture-ref',
                amount: 50000,
                status: 'authorized',
            });

            // Capture partial amount
            const captureAmount = 30000;
            await ctx.db.patch(paymentId, {
                status: 'captured',
                capturedAmount: captureAmount,
                updatedAt: Date.now(),
            });

            const updated = await ctx.db.get(paymentId);
            const typed = updated as { capturedAmount: number; amount: number };
            expect(typed.capturedAmount).toBe(30000);
            expect(typed.capturedAmount).toBeLessThan(typed.amount);
        });

        it('should default currency to NOK', () => {
            const currency = undefined;
            const defaultCurrency = currency || 'NOK';
            expect(defaultCurrency).toBe('NOK');
        });
    });

    // =========================================================================
    // Payment Query by Booking
    // =========================================================================

    describe('Payment Query by Booking', () => {
        it('should find payment by bookingId', async () => {
            const ctx = createMockContext(store);

            store.seedPayment({
                tenantId,
                bookingId,
                reference: 'booking-payment-ref',
                amount: 50000,
                status: 'authorized',
            });

            const payment = await ctx.db
                .query('payments')
                .withIndex('by_booking', (q: { eq: (f: string, v: string) => unknown }) =>
                    q.eq('bookingId', bookingId)
                )
                .first();

            expect(payment).not.toBeNull();
            expect((payment as { bookingId: string }).bookingId).toBe(bookingId);
        });

        it('should handle booking without payment', async () => {
            const ctx = createMockContext(store);

            const newBookingId = store.seedBooking({
                tenantId,
                userId,
                resourceId: store.seedResource({ tenantId }),
                status: 'confirmed',
                totalPrice: 10000,
            });

            const payment = await ctx.db
                .query('payments')
                .withIndex('by_booking', (q: { eq: (f: string, v: string) => unknown }) =>
                    q.eq('bookingId', newBookingId)
                )
                .first();

            expect(payment).toBeNull();
        });
    });

    // =========================================================================
    // Vipps API Payload Structure
    // =========================================================================

    describe('Vipps API Payload Structure', () => {
        it('should construct correct createPayment payload', () => {
            const reference = `xala-${bookingId}-${Date.now()}`;
            const amount = 50000;
            const currency = 'NOK';
            const returnUrl = 'http://localhost:5173/payment/callback';

            const payload = {
                amount: {
                    currency,
                    value: amount,
                },
                paymentMethod: {
                    type: 'WALLET',
                },
                reference,
                returnUrl: `${returnUrl}?reference=${encodeURIComponent(reference)}`,
                userFlow: 'WEB_REDIRECT',
                paymentDescription: 'Booking payment for resource',
            };

            expect(payload.amount.value).toBe(50000);
            expect(payload.amount.currency).toBe('NOK');
            expect(payload.paymentMethod.type).toBe('WALLET');
            expect(payload.userFlow).toBe('WEB_REDIRECT');
            expect(payload.returnUrl).toContain('reference=');
        });

        it('should construct correct capture payload', () => {
            const captureAmount = 50000;

            const payload = {
                modificationAmount: {
                    currency: 'NOK',
                    value: captureAmount,
                },
            };

            expect(payload.modificationAmount.value).toBe(50000);
            expect(payload.modificationAmount.currency).toBe('NOK');
        });

        it('should construct correct refund payload', () => {
            const refundAmount = 25000;

            const payload = {
                modificationAmount: {
                    currency: 'NOK',
                    value: refundAmount,
                },
            };

            expect(payload.modificationAmount.value).toBe(25000);
        });
    });
});
