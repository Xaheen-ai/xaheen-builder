/**
 * Integration Functions Tests
 *
 * Tests for external service integrations and webhooks.
 * User Stories: US-11.1, US-11.2
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { TestDataStore, createMockContext } from './setup';

describe('Integration Functions', () => {
    let store: TestDataStore;
    let tenantId: string;
    let ctx: any;

    beforeEach(() => {
        store = new TestDataStore();
        tenantId = store.seedTenant({ name: 'Integration Test Tenant' });
        ctx = createMockContext(store);
    });

    describe('list', () => {
        it('should list integrations for tenant', async () => {
            const mockQuery = {
                withIndex: vi.fn().mockReturnValue({
                    collect: vi.fn().mockResolvedValue([
                        { 
                            _id: 'int1', 
                            type: 'stripe',
                            name: 'Stripe Payment',
                            enabled: true,
                            config: { secretKey: 'sk_test_...' }
                        },
                        { 
                            _id: 'int2', 
                            type: 'sendgrid',
                            name: 'SendGrid Email',
                            enabled: false,
                            config: { apiKey: 'SG.test' }
                        },
                    ])
                })
            };
            
            ctx.db.query.mockReturnValue(mockQuery);

            const modules = await import('../../convex/integrations/index');
            const result = await (modules as any).list(ctx, { tenantId });

            expect(result).toHaveLength(2);
            expect(result[0].type).toBe('stripe');
            expect(result[0].enabled).toBe(true);
            expect(result[1].type).toBe('sendgrid');
            expect(result[1].enabled).toBe(false);
        });
    });

    describe('get', () => {
        it('should get integration by ID', async () => {
            ctx.db.get.mockResolvedValue({
                _id: 'int123',
                type: 'stripe',
                name: 'Stripe Payment',
                enabled: true,
                config: { secretKey: 'sk_test_123' },
                metadata: { webhookSecret: 'whsec_123' },
            });

            const modules = await import('../../convex/integrations/index');
            const result = await (modules as any).get(ctx, { id: 'int123' });

            expect(result).toBeDefined();
            expect(result.type).toBe('stripe');
            expect(result.config.secretKey).toBe('sk_test_123');
        });

        it('should throw if integration not found', async () => {
            ctx.db.get.mockResolvedValue(null);

            const modules = await import('../../convex/integrations/index');
            
            await expect((modules as any).get(ctx, { id: 'nonexistent' })).rejects.toThrow('Integration not found');
        });
    });

    describe('configure', () => {
        it('should configure new integration', async () => {
            ctx.db.insert.mockResolvedValue('int123');

            const modules = await import('../../convex/integrations/index');
            const result = await (modules as any).configure(ctx, {
                tenantId,
                type: 'stripe',
                name: 'Stripe Payment',
                config: {
                    secretKey: 'sk_test_123',
                    webhookSecret: 'whsec_123',
                },
                metadata: { accountId: 'acct_123' },
            });

            expect(result.id).toBe('int123');
            expect(ctx.db.insert).toHaveBeenCalledWith('integrations', expect.objectContaining({
                tenantId,
                type: 'stripe',
                name: 'Stripe Payment',
                enabled: false, // Disabled by default
            }));
        });

        it('should update existing integration', async () => {
            ctx.db.query.mockReturnValue({
                withIndex: vi.fn().mockReturnValue({
                    first: vi.fn().mockResolvedValue({
                        _id: 'int123',
                        type: 'stripe',
                        config: { secretKey: 'sk_test_old' },
                    })
                })
            });

            const modules = await import('../../convex/integrations/index');
            await (modules as any).configure(ctx, {
                tenantId,
                type: 'stripe',
                config: { secretKey: 'sk_test_new' },
            });

            expect(ctx.db.patch).toHaveBeenCalledWith('int123', {
                config: { secretKey: 'sk_test_new' },
            });
        });
    });

    describe('enable', () => {
        it('should enable integration', async () => {
            ctx.db.get.mockResolvedValue({
                _id: 'int123',
                type: 'stripe',
                enabled: false,
                config: { secretKey: 'sk_test_123' },
            });

            const modules = await import('../../convex/integrations/index');
            await (modules as any).enable(ctx, { id: 'int123' });

            expect(ctx.db.patch).toHaveBeenCalledWith('int123', {
                enabled: true,
                enabledAt: expect.any(Number),
            });
        });

        it('should validate required config before enabling', async () => {
            ctx.db.get.mockResolvedValue({
                _id: 'int123',
                type: 'stripe',
                enabled: false,
                config: {}, // Missing required keys
            });

            const modules = await import('../../convex/integrations/index');
            
            await expect((modules as any).enable(ctx, { id: 'int123' })).rejects.toThrow(
                'Missing required configuration: secretKey'
            );
        });
    });

    describe('disable', () => {
        it('should disable integration', async () => {
            ctx.db.get.mockResolvedValue({
                _id: 'int123',
                type: 'stripe',
                enabled: true,
            });

            const modules = await import('../../convex/integrations/index');
            await (modules as any).disable(ctx, { id: 'int123' });

            expect(ctx.db.patch).toHaveBeenCalledWith('int123', {
                enabled: false,
                disabledAt: expect.any(Number),
            });
        });
    });

    describe('remove', () => {
        it('should remove integration', async () => {
            ctx.db.get.mockResolvedValue({
                _id: 'int123',
                type: 'stripe',
                enabled: false,
            });

            const modules = await import('../../convex/integrations/index');
            await (modules as any).remove(ctx, { id: 'int123' });

            expect(ctx.db.delete).toHaveBeenCalledWith('int123');
        });

        it('should prevent removing enabled integration', async () => {
            ctx.db.get.mockResolvedValue({
                _id: 'int123',
                enabled: true,
            });

            const modules = await import('../../convex/integrations/index');
            
            await expect((modules as any).remove(ctx, { id: 'int123' })).rejects.toThrow(
                'Cannot remove enabled integration'
            );
        });
    });

    describe('testConnection', () => {
        it('should test Stripe connection', async () => {
            ctx.db.get.mockResolvedValue({
                _id: 'int123',
                type: 'stripe',
                config: { secretKey: 'sk_test_123' },
                enabled: false,
            });

            // Mock Stripe API call
            const mockStripe = {
                accounts: {
                    retrieve: vi.fn().mockResolvedValue({ id: 'acct_123' }),
                },
            };
            vi.doMock('stripe', () => mockStripe);

            const modules = await import('../../convex/integrations/index');
            const result = await (modules as any).testConnection(ctx, { id: 'int123' });

            expect(result.success).toBe(true);
            expect(result.details.accountId).toBe('acct_123');
        });

        it('should handle connection failure', async () => {
            ctx.db.get.mockResolvedValue({
                _id: 'int123',
                type: 'stripe',
                config: { secretKey: 'sk_invalid' },
                enabled: false,
            });

            // Mock Stripe API error
            const mockStripe = {
                accounts: {
                    retrieve: vi.fn().mockRejectedValue(new Error('Invalid API key')),
                },
            };
            vi.doMock('stripe', () => mockStripe);

            const modules = await import('../../convex/integrations/index');
            const result = await (modules as any).testConnection(ctx, { id: 'int123' });

            expect(result.success).toBe(false);
            expect(result.error).toBe('Invalid API key');
        });
    });

    describe('syncData', () => {
        it('should sync data from integration', async () => {
            ctx.db.get.mockResolvedValue({
                _id: 'int123',
                type: 'stripe',
                enabled: true,
                config: { secretKey: 'sk_test_123' },
            });

            const modules = await import('../../convex/integrations/index');
            const result = await (modules as any).syncData(ctx, {
                id: 'int123',
                syncType: 'customers',
                options: { limit: 100 },
            });

            expect(result.id).toBeDefined();
            expect(result.status).toBe('running');
            expect(ctx.db.insert).toHaveBeenCalledWith('integrationSyncs', expect.objectContaining({
                integrationId: 'int123',
                syncType: 'customers',
                status: 'running',
            }));
        });
    });

    describe('Webhooks', () => {
        describe('createWebhook', () => {
            it('should create webhook endpoint', async () => {
                ctx.db.insert.mockResolvedValue('webhook123');

                const modules = await import('../../convex/integrations/index');
                const result = await (modules as any).createWebhook(ctx, {
                    tenantId,
                    integrationId: 'int123',
                    eventType: 'payment_intent.succeeded',
                    endpointUrl: 'https://example.com/webhook/stripe',
                    secret: 'whsec_123',
                });

                expect(result.id).toBe('webhook123');
                expect(ctx.db.insert).toHaveBeenCalledWith('webhooks', expect.objectContaining({
                    tenantId,
                    integrationId: 'int123',
                    eventType: 'payment_intent.succeeded',
                    endpointUrl: 'https://example.com/webhook/stripe',
                    enabled: true,
                }));
            });
        });

        describe('processWebhook', () => {
            it('should process Stripe webhook', async () => {
                const mockWebhook = {
                    _id: 'webhook123',
                    integrationId: 'int123',
                    eventType: 'payment_intent.succeeded',
                    secret: 'whsec_123',
                    enabled: true,
                };

                ctx.db.get.mockResolvedValue(mockWebhook);

                // Mock Stripe webhook verification
                const mockStripe = {
                    webhooks: {
                        constructEvent: vi.fn().mockReturnValue({
                            type: 'payment_intent.succeeded',
                            data: { object: { id: 'pi_123', amount: 5000 } },
                        }),
                    },
                };
                vi.doMock('stripe', () => mockStripe);

                const payload = JSON.stringify({
                    id: 'evt_123',
                    type: 'payment_intent.succeeded',
                    data: { object: { id: 'pi_123', amount: 5000 } },
                });

                const signature = 'stripe-signature';

                const modules = await import('../../convex/integrations/index');
                const result = await (modules as any).processWebhook(ctx, {
                    webhookId: 'webhook123',
                    payload,
                    signature,
                    headers: { 'stripe-signature': signature },
                });

                expect(result.processed).toBe(true);
                expect(ctx.db.insert).toHaveBeenCalledWith('webhookEvents', expect.objectContaining({
                    webhookId: 'webhook123',
                    eventType: 'payment_intent.succeeded',
                    processed: true,
                }));
            });

            it('should handle invalid webhook signature', async () => {
                const mockWebhook = {
                    _id: 'webhook123',
                    secret: 'whsec_123',
                };

                ctx.db.get.mockResolvedValue(mockWebhook);

                // Mock Stripe webhook verification error
                const mockStripe = {
                    webhooks: {
                        constructEvent: vi.fn().mockImplementation(() => {
                            throw new Error('Invalid signature');
                        }),
                    },
                };
                vi.doMock('stripe', () => mockStripe);

                const modules = await import('../../convex/integrations/index');
                const result = await (modules as any).processWebhook(ctx, {
                    webhookId: 'webhook123',
                    payload: 'invalid',
                    signature: 'invalid',
                    headers: {},
                });

                expect(result.processed).toBe(false);
                expect(result.error).toBe('Invalid signature');
            });
        });

        describe('listWebhookEvents', () => {
            it('should list webhook events', async () => {
                const mockQuery = {
                    withIndex: vi.fn().mockReturnValue({
                        collect: vi.fn().mockResolvedValue([
                            {
                                _id: 'event1',
                                webhookId: 'webhook123',
                                eventType: 'payment_intent.succeeded',
                                processed: true,
                                timestamp: Date.now() - 3600000,
                            },
                            {
                                _id: 'event2',
                                webhookId: 'webhook123',
                                eventType: 'payment_intent.failed',
                                processed: false,
                                error: 'Processing failed',
                                timestamp: Date.now() - 1800000,
                            },
                        ])
                    })
                };
                
                ctx.db.query.mockReturnValue(mockQuery);

                const modules = await import('../../convex/integrations/index');
                const result = await (modules as any).listWebhookEvents(ctx, { 
                    webhookId: 'webhook123'
                });

                expect(result).toHaveLength(2);
                expect(result[0].eventType).toBe('payment_intent.succeeded');
                expect(result[0].processed).toBe(true);
                expect(result[1].eventType).toBe('payment_intent.failed');
                expect(result[1].processed).toBe(false);
            });
        });
    });
});
