/**
 * Billing Functions Tests
 *
 * Tests for billing webhooks and payment processing.
 * User Stories: US-14.1, US-14.2
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { TestDataStore, createMockContext } from './setup';

describe('Billing Functions', () => {
    let store: TestDataStore;
    let tenantId: string;
    let ctx: any;

    beforeEach(() => {
        store = new TestDataStore();
        tenantId = store.seedTenant({ name: 'Billing Test Tenant' });
        ctx = createMockContext(store);
    });

    describe('Webhooks', () => {
        describe('handleStripeWebhook', () => {
            it('should process payment_intent.succeeded webhook', async () => {
                // Mock integration
                ctx.db.get.mockResolvedValue({
                    _id: 'int123',
                    type: 'stripe',
                    config: { webhookSecret: 'whsec_123' },
                    enabled: true,
                });

                // Mock booking
                ctx.db.query.mockReturnValue({
                    withIndex: vi.fn().mockReturnValue({
                        first: vi.fn().mockResolvedValue({
                            _id: 'booking123',
                            status: 'pending_payment',
                            totalPrice: 5000,
                            currency: 'NOK',
                        })
                    })
                });

                // Mock Stripe webhook verification
                const mockStripe = {
                    webhooks: {
                        constructEvent: vi.fn().mockReturnValue({
                            type: 'payment_intent.succeeded',
                            data: {
                                object: {
                                    id: 'pi_123',
                                    amount: 5000,
                                    currency: 'nok',
                                    metadata: { bookingId: 'booking123' },
                                },
                            },
                        }),
                    },
                };
                vi.doMock('stripe', () => mockStripe);

                const payload = JSON.stringify({
                    id: 'evt_123',
                    type: 'payment_intent.succeeded',
                    data: { object: { id: 'pi_123' } },
                });

                const modules = await import('../../convex/billing/webhooks');
                const result = await (modules as any).handleStripeWebhook(ctx, {
                    tenantId,
                    payload,
                    signature: 'stripe-signature',
                    headers: { 'stripe-signature': 'stripe-signature' },
                });

                expect(result.processed).toBe(true);
                expect(ctx.db.patch).toHaveBeenCalledWith('booking123', {
                    status: 'confirmed',
                    paymentId: 'pi_123',
                    paidAt: expect.any(Number),
                });
            });

            it('should process invoice.payment_succeeded webhook', async () => {
                // Mock integration
                ctx.db.get.mockResolvedValue({
                    _id: 'int123',
                    type: 'stripe',
                    config: { webhookSecret: 'whsec_123' },
                    enabled: true,
                });

                // Mock subscription
                ctx.db.query.mockReturnValue({
                    withIndex: vi.fn().mockReturnValue({
                        first: vi.fn().mockResolvedValue({
                            _id: 'sub123',
                            stripeSubscriptionId: 'sub_123',
                            status: 'active',
                        })
                    })
                });

                // Mock Stripe webhook
                const mockStripe = {
                    webhooks: {
                        constructEvent: vi.fn().mockReturnValue({
                            type: 'invoice.payment_succeeded',
                            data: {
                                object: {
                                    id: 'in_123',
                                    subscription: 'sub_123',
                                    amount_paid: 10000,
                                    currency: 'nok',
                                    period_end: Date.now() / 1000 + 30 * 24 * 60 * 60,
                                },
                            },
                        }),
                    },
                };
                vi.doMock('stripe', () => mockStripe);

                const payload = JSON.stringify({
                    id: 'evt_123',
                    type: 'invoice.payment_succeeded',
                });

                const modules = await import('../../convex/billing/webhooks');
                const result = await (modules as any).handleStripeWebhook(ctx, {
                    tenantId,
                    payload,
                    signature: 'stripe-signature',
                    headers: { 'stripe-signature': 'stripe-signature' },
                });

                expect(result.processed).toBe(true);
                expect(ctx.db.patch).toHaveBeenCalledWith('sub123', {
                    status: 'active',
                    currentPeriodEnd: expect.any(Number),
                });
            });

            it('should handle unknown webhook types', async () => {
                // Mock integration
                ctx.db.get.mockResolvedValue({
                    _id: 'int123',
                    type: 'stripe',
                    config: { webhookSecret: 'whsec_123' },
                    enabled: true,
                });

                // Mock Stripe webhook
                const mockStripe = {
                    webhooks: {
                        constructEvent: vi.fn().mockReturnValue({
                            type: 'unknown.event',
                            data: { object: {} },
                        }),
                    },
                };
                vi.doMock('stripe', () => mockStripe);

                const payload = JSON.stringify({
                    id: 'evt_123',
                    type: 'unknown.event',
                });

                const modules = await import('../../convex/billing/webhooks');
                const result = await (modules as any).handleStripeWebhook(ctx, {
                    tenantId,
                    payload,
                    signature: 'stripe-signature',
                    headers: { 'stripe-signature': 'stripe-signature' },
                });

                expect(result.processed).toBe(false);
                expect(result.reason).toBe('Unknown webhook type: unknown.event');
            });

            it('should handle invalid webhook signature', async () => {
                // Mock integration
                ctx.db.get.mockResolvedValue({
                    _id: 'int123',
                    type: 'stripe',
                    config: { webhookSecret: 'whsec_123' },
                    enabled: true,
                });

                // Mock Stripe webhook error
                const mockStripe = {
                    webhooks: {
                        constructEvent: vi.fn().mockImplementation(() => {
                            throw new Error('Invalid signature');
                        }),
                    },
                };
                vi.doMock('stripe', () => mockStripe);

                const modules = await import('../../convex/billing/webhooks');
                const result = await (modules as any).handleStripeWebhook(ctx, {
                    tenantId,
                    payload: 'invalid',
                    signature: 'invalid',
                    headers: {},
                });

                expect(result.processed).toBe(false);
                expect(result.error).toBe('Invalid signature');
            });
        });
    });

    describe('Payment Processing', () => {
        describe('createPaymentIntent', () => {
            it('should create Stripe payment intent', async () => {
                // Mock integration
                ctx.db.get.mockResolvedValue({
                    _id: 'int123',
                    type: 'stripe',
                    config: { secretKey: 'sk_test_123' },
                    enabled: true,
                });

                // Mock booking
                ctx.db.get.mockResolvedValue({
                    _id: 'booking123',
                    status: 'confirmed',
                    totalPrice: 5000,
                    currency: 'NOK',
                    userId: 'user123',
                });

                // Mock Stripe payment intent creation
                const mockStripe = {
                    paymentIntents: {
                        create: vi.fn().mockResolvedValue({
                            id: 'pi_123',
                            client_secret: 'pi_123_secret',
                            status: 'requires_payment_method',
                        }),
                    },
                };
                vi.doMock('stripe', () => mockStripe);

                const modules = await import('../../convex/billing/webhooks');
                const result = await (modules as any).createPaymentIntent(ctx, {
                    tenantId,
                    bookingId: 'booking123',
                });

                expect(result.paymentIntentId).toBe('pi_123');
                expect(result.clientSecret).toBe('pi_123_secret');
                expect(mockStripe.paymentIntents.create).toHaveBeenCalledWith({
                    amount: 5000,
                    currency: 'nok',
                    metadata: { bookingId: 'booking123', userId: 'user123' },
                });
            });

            it('should prevent payment for non-confirmed booking', async () => {
                // Mock integration
                ctx.db.get.mockResolvedValue({
                    _id: 'int123',
                    type: 'stripe',
                    enabled: true,
                });

                // Mock booking
                ctx.db.get.mockResolvedValue({
                    _id: 'booking123',
                    status: 'draft',
                });

                const modules = await import('../../convex/billing/webhooks');
                
                await expect((modules as any).createPaymentIntent(ctx, {
                    tenantId,
                    bookingId: 'booking123',
                })).rejects.toThrow('Booking must be confirmed to create payment');
            });
        });

        describe('refundPayment', () => {
            it('should create refund', async () => {
                // Mock integration
                ctx.db.get.mockResolvedValue({
                    _id: 'int123',
                    type: 'stripe',
                    config: { secretKey: 'sk_test_123' },
                    enabled: true,
                });

                // Mock booking
                ctx.db.get.mockResolvedValue({
                    _id: 'booking123',
                    paymentId: 'pi_123',
                    totalPrice: 5000,
                    currency: 'NOK',
                });

                // Mock Stripe refund creation
                const mockStripe = {
                    refunds: {
                        create: vi.fn().mockResolvedValue({
                            id: 're_123',
                            status: 'succeeded',
                            amount: 5000,
                        }),
                    },
                };
                vi.doMock('stripe', () => mockStripe);

                const modules = await import('../../convex/billing/webhooks');
                const result = await (modules as any).refundPayment(ctx, {
                    tenantId,
                    bookingId: 'booking123',
                    reason: 'Customer request',
                });

                expect(result.refundId).toBe('re_123');
                expect(result.status).toBe('succeeded');
                expect(ctx.db.patch).toHaveBeenCalledWith('booking123', {
                    refundId: 're_123',
                    refundedAt: expect.any(Number),
                    refundReason: 'Customer request',
                });
            });

            it('should prevent refund for unrefunded booking', async () => {
                // Mock integration
                ctx.db.get.mockResolvedValue({
                    _id: 'int123',
                    type: 'stripe',
                    enabled: true,
                });

                // Mock booking without payment
                ctx.db.get.mockResolvedValue({
                    _id: 'booking123',
                    paymentId: null,
                });

                const modules = await import('../../convex/billing/webhooks');
                
                await expect((modules as any).refundPayment(ctx, {
                    tenantId,
                    bookingId: 'booking123',
                })).rejects.toThrow('No payment found for this booking');
            });
        });
    });

    describe('Subscriptions', () => {
        describe('createSubscription', () => {
            it('should create subscription', async () => {
                // Mock integration
                ctx.db.get.mockResolvedValue({
                    _id: 'int123',
                    type: 'stripe',
                    config: { secretKey: 'sk_test_123' },
                    enabled: true,
                });

                // Mock price
                ctx.db.get.mockResolvedValue({
                    _id: 'price123',
                    stripePriceId: 'price_123',
                });

                // Mock customer
                ctx.db.query.mockReturnValue({
                    withIndex: vi.fn().mockReturnValue({
                        first: vi.fn().mockResolvedValue({
                            _id: 'cust123',
                            stripeCustomerId: 'cus_123',
                        })
                    })
                });

                // Mock Stripe subscription creation
                const mockStripe = {
                    subscriptions: {
                        create: vi.fn().mockResolvedValue({
                            id: 'sub_123',
                            status: 'active',
                            current_period_end: Date.now() / 1000 + 30 * 24 * 60 * 60,
                        }),
                    },
                };
                vi.doMock('stripe', () => mockStripe);

                ctx.db.insert.mockResolvedValue('sub123');

                const modules = await import('../../convex/billing/webhooks');
                const result = await (modules as any).createSubscription(ctx, {
                    tenantId,
                    userId: 'user123',
                    priceId: 'price123',
                });

                expect(result.id).toBe('sub123');
                expect(result.stripeSubscriptionId).toBe('sub_123');
                expect(ctx.db.insert).toHaveBeenCalledWith('subscriptions', expect.objectContaining({
                    tenantId,
                    userId: 'user123',
                    priceId: 'price123',
                    stripeSubscriptionId: 'sub_123',
                    status: 'active',
                }));
            });
        });

        describe('cancelSubscription', () => {
            it('should cancel subscription', async () => {
                // Mock integration
                ctx.db.get.mockResolvedValue({
                    _id: 'int123',
                    type: 'stripe',
                    config: { secretKey: 'sk_test_123' },
                    enabled: true,
                });

                // Mock subscription
                ctx.db.get.mockResolvedValue({
                    _id: 'sub123',
                    stripeSubscriptionId: 'sub_123',
                    status: 'active',
                });

                // Mock Stripe subscription cancellation
                const mockStripe = {
                    subscriptions: {
                        del: vi.fn().mockResolvedValue({
                            id: 'sub_123',
                            status: 'canceled',
                        }),
                    },
                };
                vi.doMock('stripe', () => mockStripe);

                const modules = await import('../../convex/billing/webhooks');
                await (modules as any).cancelSubscription(ctx, {
                    tenantId,
                    subscriptionId: 'sub123',
                });

                expect(ctx.db.patch).toHaveBeenCalledWith('sub123', {
                    status: 'canceled',
                    canceledAt: expect.any(Number),
                });
            });
        });
    });
});
