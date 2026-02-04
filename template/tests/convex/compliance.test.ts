/**
 * Compliance Functions Tests
 *
 * Tests for GDPR compliance, consent management, and DSAR requests.
 * User Stories: US-10.1, US-10.2
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { TestDataStore, createMockContext } from './setup';

describe('Compliance Functions', () => {
    let store: TestDataStore;
    let tenantId: string;
    let userId: string;
    let ctx: any;

    beforeEach(() => {
        store = new TestDataStore();
        tenantId = store.seedTenant({ name: 'Compliance Test Tenant' });
        userId = store.seedUser({ 
            tenantId, 
            name: 'Test User',
            email: 'test@example.com'
        });
        ctx = createMockContext(store);
    });

    describe('Consent Management', () => {
        describe('recordConsent', () => {
            it('should record user consent', async () => {
                ctx.db.insert.mockResolvedValue('consent123');

                const modules = await import('../../convex/compliance/index');
                const result = await (modules as any).recordConsent(ctx, {
                    tenantId,
                    userId,
                    consentType: 'data_processing',
                    granted: true,
                    ipAddress: '192.168.1.1',
                    userAgent: 'Mozilla/5.0...',
                });

                expect(result.id).toBe('consent123');
                expect(ctx.db.insert).toHaveBeenCalledWith('consentRecords', expect.objectContaining({
                    tenantId,
                    userId,
                    consentType: 'data_processing',
                    granted: true,
                    ipAddress: '192.168.1.1',
                    userAgent: 'Mozilla/5.0...',
                }));
            });

            it('should auto-generate timestamp', async () => {
                const beforeTime = Date.now();
                
                ctx.db.insert.mockResolvedValue('consent123');

                const modules = await import('../../convex/compliance/index');
                await (modules as any).recordConsent(ctx, {
                    tenantId,
                    userId,
                    consentType: 'marketing',
                    granted: false,
                });

                const insertCall = ctx.db.insert.mock.calls[0];
                const timestamp = insertCall[1].timestamp;

                expect(timestamp).toBeGreaterThanOrEqual(beforeTime);
                expect(timestamp).toBeLessThanOrEqual(Date.now());
            });
        });

        describe('getConsentStatus', () => {
            it('should get current consent status for user', async () => {
                const mockQuery = {
                    withIndex: vi.fn().mockReturnValue({
                        filter: vi.fn().mockReturnValue({
                            collect: vi.fn().mockResolvedValue([
                                { consentType: 'data_processing', granted: true, timestamp: Date.now() },
                                { consentType: 'marketing', granted: false, timestamp: Date.now() - 86400000 },
                            ])
                        })
                    })
                };
                
                ctx.db.query.mockReturnValue(mockQuery);

                const modules = await import('../../convex/compliance/index');
                const result = await (modules as any).getConsentStatus(ctx, { userId });

                expect(result.data_processing.granted).toBe(true);
                expect(result.marketing.granted).toBe(false);
                expect(result.data_processing.timestamp).toBeGreaterThan(result.marketing.timestamp);
            });

            it('should return false for unknown consent types', async () => {
                const mockQuery = {
                    withIndex: vi.fn().mockReturnValue({
                        filter: vi.fn().mockReturnValue({
                            collect: vi.fn().mockResolvedValue([])
                        })
                    })
                };
                
                ctx.db.query.mockReturnValue(mockQuery);

                const modules = await import('../../convex/compliance/index');
                const result = await (modules as any).getConsentStatus(ctx, { userId });

                expect(result.data_processing).toBeUndefined();
                expect(result.marketing).toBeUndefined();
            });
        });

        describe('withdrawConsent', () => {
            it('should withdraw user consent', async () => {
                ctx.db.insert.mockResolvedValue('consent123');

                const modules = await import('../../convex/compliance/index');
                const result = await (modules as any).withdrawConsent(ctx, {
                    tenantId,
                    userId,
                    consentType: 'marketing',
                    reason: 'No longer interested',
                });

                expect(result.id).toBe('consent123');
                expect(ctx.db.insert).toHaveBeenCalledWith('consentRecords', expect.objectContaining({
                    consentType: 'marketing',
                    granted: false,
                    reason: 'No longer interested',
                }));
            });
        });
    });

    describe('DSAR Requests', () => {
        describe('submitDSAR', () => {
            it('should submit DSAR request', async () => {
                ctx.db.insert.mockResolvedValue('dsar123');

                const modules = await import('../../convex/compliance/index');
                const result = await (modules as any).submitDSAR(ctx, {
                    tenantId,
                    userId,
                    requestType: 'data_export',
                    requestedData: ['bookings', 'profile'],
                });

                expect(result.id).toBe('dsar123');
                expect(ctx.db.insert).toHaveBeenCalledWith('dsarRequests', expect.objectContaining({
                    tenantId,
                    userId,
                    requestType: 'data_export',
                    status: 'pending',
                    requestedData: ['bookings', 'profile'],
                }));
            });

            it('should assign reference number', async () => {
                ctx.db.insert.mockResolvedValue('dsar123');

                const modules = await import('../../convex/compliance/index');
                const result = await (modules as any).submitDSAR(ctx, {
                    tenantId,
                    userId,
                    requestType: 'data_deletion',
                });

                const insertCall = ctx.db.insert.mock.calls[0];
                const referenceNumber = insertCall[1].referenceNumber;

                expect(referenceNumber).toMatch(/^DSAR-\d{4}-\d{6}$/);
            });
        });

        describe('processDSAR', () => {
            it('should process DSAR request', async () => {
                ctx.db.get.mockResolvedValue({
                    _id: 'dsar123',
                    status: 'pending',
                    requestType: 'data_export',
                });

                const modules = await import('../../convex/compliance/index');
                await (modules as any).processDSAR(ctx, {
                    id: 'dsar123',
                    status: 'completed',
                    processedBy: 'admin123',
                    notes: 'Data exported and sent via secure email',
                    resultUrl: 'https://secure.example.com/export/dsar123.zip',
                });

                expect(ctx.db.patch).toHaveBeenCalledWith('dsar123', {
                    status: 'completed',
                    processedBy: 'admin123',
                    processedAt: expect.any(Number),
                    notes: 'Data exported and sent via secure email',
                    resultUrl: 'https://secure.example.com/export/dsar123.zip',
                });
            });

            it('should prevent processing already completed request', async () => {
                ctx.db.get.mockResolvedValue({
                    _id: 'dsar123',
                    status: 'completed',
                });

                const modules = await import('../../convex/compliance/index');
                
                await expect((modules as any).processDSAR(ctx, {
                    id: 'dsar123',
                    status: 'completed',
                })).rejects.toThrow('DSAR request already processed');
            });
        });
    });

    describe('Policy Management', () => {
        describe('publishPolicy', () => {
            it('should publish privacy policy', async () => {
                ctx.db.insert.mockResolvedValue('policy123');

                const modules = await import('../../convex/compliance/index');
                const result = await (modules as any).publishPolicy(ctx, {
                    tenantId,
                    policyType: 'privacy_policy',
                    version: '2.0',
                    content: 'This is our updated privacy policy...',
                    effectiveDate: Date.now() + 86400000,
                });

                expect(result.id).toBe('policy123');
                expect(ctx.db.insert).toHaveBeenCalledWith('policies', expect.objectContaining({
                    tenantId,
                    policyType: 'privacy_policy',
                    version: '2.0',
                    status: 'published',
                }));
            });

            it('should archive previous versions', async () => {
                // Mock existing policy
                const mockQuery = {
                    withIndex: vi.fn().mockReturnValue({
                        filter: vi.fn().mockReturnValue({
                            collect: vi.fn().mockResolvedValue([
                                { _id: 'policy1', status: 'published' },
                            ])
                        })
                    })
                };
                
                ctx.db.query.mockReturnValue(mockQuery);
                ctx.db.insert.mockResolvedValue('policy123');

                const modules = await import('../../convex/compliance/index');
                await (modules as any).publishPolicy(ctx, {
                    tenantId,
                    policyType: 'privacy_policy',
                    version: '2.0',
                    content: 'New policy',
                });

                expect(ctx.db.patch).toHaveBeenCalledWith('policy1', {
                    status: 'archived',
                });
            });
        });

        describe('getActivePolicy', () => {
            it('should get active policy version', async () => {
                const mockQuery = {
                    withIndex: vi.fn().mockReturnValue({
                        filter: vi.fn().mockReturnValue({
                            first: vi.fn().mockResolvedValue({
                                _id: 'policy123',
                                policyType: 'privacy_policy',
                                version: '2.0',
                                content: 'Current privacy policy',
                                effectiveDate: Date.now() - 86400000,
                            })
                        })
                    })
                };
                
                ctx.db.query.mockReturnValue(mockQuery);

                const modules = await import('../../convex/compliance/index');
                const result = await (modules as any).getActivePolicy(ctx, { 
                    tenantId,
                    policyType: 'privacy_policy'
                });

                expect(result).toBeDefined();
                expect(result.version).toBe('2.0');
                expect(result.content).toBe('Current privacy policy');
            });

            it('should return null if no active policy', async () => {
                const mockQuery = {
                    withIndex: vi.fn().mockReturnValue({
                        filter: vi.fn().mockReturnValue({
                            first: vi.fn().mockResolvedValue(null)
                        })
                    })
                };
                
                ctx.db.query.mockReturnValue(mockQuery);

                const modules = await import('../../convex/compliance/index');
                const result = await (modules as any).getActivePolicy(ctx, { 
                    tenantId,
                    policyType: 'privacy_policy'
                });

                expect(result).toBeNull();
            });
        });

        describe('getPolicyHistory', () => {
            it('should get policy version history', async () => {
                const mockQuery = {
                    withIndex: vi.fn().mockReturnValue({
                        collect: vi.fn().mockResolvedValue([
                            { _id: 'policy3', version: '3.0', status: 'draft', createdAt: Date.now() },
                            { _id: 'policy2', version: '2.0', status: 'published', createdAt: Date.now() - 86400000 },
                            { _id: 'policy1', version: '1.0', status: 'archived', createdAt: Date.now() - 172800000 },
                        ])
                    })
                };
                
                ctx.db.query.mockReturnValue(mockQuery);

                const modules = await import('../../convex/compliance/index');
                const result = await (modules as any).getPolicyHistory(ctx, { 
                    tenantId,
                    policyType: 'privacy_policy'
                });

                expect(result).toHaveLength(3);
                expect(result[0].version).toBe('3.0');
                expect(result[1].version).toBe('2.0');
                expect(result[2].version).toBe('1.0');
            });
        });
    });

    describe('Access Logs', () => {
        describe('logAccess', () => {
            it('should log data access', async () => {
                ctx.db.insert.mockResolvedValue('log123');

                const modules = await import('../../convex/compliance/index');
                const result = await (modules as any).logAccess(ctx, {
                    tenantId,
                    userId: 'user123',
                    resourceType: 'booking',
                    resourceId: 'booking123',
                    action: 'view',
                    ipAddress: '192.168.1.1',
                });

                expect(result.id).toBe('log123');
                expect(ctx.db.insert).toHaveBeenCalledWith('accessLogs', expect.objectContaining({
                    tenantId,
                    userId: 'user123',
                    resourceType: 'booking',
                    resourceId: 'booking123',
                    action: 'view',
                    ipAddress: '192.168.1.1',
                }));
            });
        });

        describe('getAccessLogs', () => {
            it('should get access logs for user', async () => {
                const mockQuery = {
                    withIndex: vi.fn().mockReturnValue({
                        collect: vi.fn().mockResolvedValue([
                            {
                                _id: 'log1',
                                userId: 'user123',
                                resourceType: 'booking',
                                action: 'view',
                                timestamp: Date.now() - 3600000,
                            },
                            {
                                _id: 'log2',
                                userId: 'user123',
                                resourceType: 'profile',
                                action: 'update',
                                timestamp: Date.now() - 1800000,
                            },
                        ])
                    })
                };
                
                ctx.db.query.mockReturnValue(mockQuery);

                const modules = await import('../../convex/compliance/index');
                const result = await (modules as any).getAccessLogs(ctx, { 
                    tenantId,
                    userId: 'user123'
                });

                expect(result).toHaveLength(2);
                expect(result[0].action).toBe('view');
                expect(result[1].action).toBe('update');
            });
        });
    });
});
