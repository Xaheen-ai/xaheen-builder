/**
 * Messaging Functions Tests
 *
 * Tests for conversations and messages management.
 * User Stories: US-12.1, US-12.2
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { TestDataStore, createMockContext } from './setup';

describe('Messaging Functions', () => {
    let store: TestDataStore;
    let tenantId: string;
    let userId: string;
    let ctx: any;

    beforeEach(() => {
        store = new TestDataStore();
        tenantId = store.seedTenant({ name: 'Messaging Test Tenant' });
        userId = store.seedUser({ 
            tenantId, 
            name: 'Test User',
            email: 'test@example.com'
        });
        ctx = createMockContext(store);
    });

    describe('Conversations', () => {
        describe('list', () => {
            it('should list conversations for user', async () => {
                const mockQuery = {
                    withIndex: vi.fn().mockReturnValue({
                        collect: vi.fn().mockResolvedValue([
                            { 
                                _id: 'conv1', 
                                type: 'direct',
                                participantIds: [userId, 'user2'],
                                lastMessageAt: Date.now(),
                            },
                            { 
                                _id: 'conv2', 
                                type: 'group',
                                participantIds: [userId, 'user2', 'user3'],
                                lastMessageAt: Date.now() - 3600000,
                            },
                        ])
                    })
                };
                
                ctx.db.query.mockReturnValue(mockQuery);

                // Mock participants
                ctx.db.get
                    .mockResolvedValueOnce({ _id: 'user2', name: 'User 2' })
                    .mockResolvedValueOnce({ _id: 'user2', name: 'User 2' })
                    .mockResolvedValueOnce({ _id: 'user3', name: 'User 3' });

                const modules = await import('../../convex/messaging/index');
                const result = await (modules as any).list(ctx, { userId });

                expect(result).toHaveLength(2);
                expect(result[0].type).toBe('direct');
                expect(result[0].participants).toHaveLength(2);
                expect(result[1].type).toBe('group');
                expect(result[1].participants).toHaveLength(3);
            });
        });

        describe('get', () => {
            it('should get conversation with participants', async () => {
                ctx.db.get.mockResolvedValue({
                    _id: 'conv123',
                    type: 'direct',
                    participantIds: [userId, 'user2'],
                    metadata: { subject: 'Project Discussion' },
                });

                // Mock participants
                ctx.db.get
                    .mockResolvedValueOnce({ _id: userId, name: 'Test User' })
                    .mockResolvedValueOnce({ _id: 'user2', name: 'User 2' });

                const modules = await import('../../convex/messaging/index');
                const result = await (modules as any).get(ctx, { id: 'conv123' });

                expect(result).toBeDefined();
                expect(result.type).toBe('direct');
                expect(result.participants).toHaveLength(2);
                expect(result.metadata.subject).toBe('Project Discussion');
            });

            it('should throw if conversation not found', async () => {
                ctx.db.get.mockResolvedValue(null);

                const modules = await import('../../convex/messaging/index');
                
                await expect((modules as any).get(ctx, { id: 'nonexistent' })).rejects.toThrow('Conversation not found');
            });
        });

        describe('create', () => {
            it('should create direct conversation', async () => {
                ctx.db.insert.mockResolvedValue('conv123');
                ctx.db.query.mockReturnValue({
                    withIndex: vi.fn().mockReturnValue({
                        first: vi.fn().mockResolvedValue(null)
                    })
                });

                const modules = await import('../../convex/messaging/index');
                const result = await (modules as any).create(ctx, {
                    tenantId,
                    type: 'direct',
                    participantIds: [userId, 'user2'],
                });

                expect(result.id).toBe('conv123');
                expect(ctx.db.insert).toHaveBeenCalledWith('conversations', expect.objectContaining({
                    tenantId,
                    type: 'direct',
                    participantIds: [userId, 'user2'],
                }));
            });

            it('should prevent duplicate direct conversations', async () => {
                ctx.db.query.mockReturnValue({
                    withIndex: vi.fn().mockReturnValue({
                        first: vi.fn().mockResolvedValue({ _id: 'existing' })
                    })
                });

                const modules = await import('../../convex/messaging/index');
                
                await expect((modules as any).create(ctx, {
                    tenantId,
                    type: 'direct',
                    participantIds: [userId, 'user2'],
                })).rejects.toThrow('Direct conversation already exists');
            });
        });

        describe('addParticipant', () => {
            it('should add participant to conversation', async () => {
                ctx.db.get.mockResolvedValue({
                    _id: 'conv123',
                    type: 'group',
                    participantIds: [userId, 'user2'],
                });

                const modules = await import('../../convex/messaging/index');
                await (modules as any).addParticipant(ctx, {
                    conversationId: 'conv123',
                    userId: 'user3',
                });

                expect(ctx.db.patch).toHaveBeenCalledWith('conv123', {
                    participantIds: [userId, 'user2', 'user3'],
                });
            });

            it('should prevent adding to direct conversation', async () => {
                ctx.db.get.mockResolvedValue({
                    _id: 'conv123',
                    type: 'direct',
                });

                const modules = await import('../../convex/messaging/index');
                
                await expect((modules as any).addParticipant(ctx, {
                    conversationId: 'conv123',
                    userId: 'user3',
                })).rejects.toThrow('Cannot add participants to direct conversation');
            });
        });

        describe('removeParticipant', () => {
            it('should remove participant from conversation', async () => {
                ctx.db.get.mockResolvedValue({
                    _id: 'conv123',
                    type: 'group',
                    participantIds: [userId, 'user2', 'user3'],
                });

                const modules = await import('../../convex/messaging/index');
                await (modules as any).removeParticipant(ctx, {
                    conversationId: 'conv123',
                    userId: 'user2',
                });

                expect(ctx.db.patch).toHaveBeenCalledWith('conv123', {
                    participantIds: [userId, 'user3'],
                });
            });
        });
    });

    describe('Messages', () => {
        describe('list', () => {
            it('should list messages in conversation', async () => {
                const mockQuery = {
                    withIndex: vi.fn().mockReturnValue({
                        collect: vi.fn().mockResolvedValue([
                            { 
                                _id: 'msg1', 
                                conversationId: 'conv123',
                                senderId: userId,
                                content: 'Hello!',
                                timestamp: Date.now() - 3600000,
                            },
                            { 
                                _id: 'msg2', 
                                conversationId: 'conv123',
                                senderId: 'user2',
                                content: 'Hi there!',
                                timestamp: Date.now() - 1800000,
                            },
                        ])
                    })
                };
                
                ctx.db.query.mockReturnValue(mockQuery);

                // Mock senders
                ctx.db.get
                    .mockResolvedValueOnce({ _id: userId, name: 'Test User' })
                    .mockResolvedValueOnce({ _id: 'user2', name: 'User 2' });

                const modules = await import('../../convex/messaging/index');
                const result = await (modules as any).listMessages(ctx, { 
                    conversationId: 'conv123'
                });

                expect(result).toHaveLength(2);
                expect(result[0].content).toBe('Hello!');
                expect(result[0].sender.name).toBe('Test User');
                expect(result[1].content).toBe('Hi there!');
                expect(result[1].sender.name).toBe('User 2');
            });
        });

        describe('send', () => {
            it('should send message', async () => {
                // Mock conversation
                ctx.db.get.mockResolvedValueOnce({
                    _id: 'conv123',
                    participantIds: [userId, 'user2'],
                });

                ctx.db.insert.mockResolvedValue('msg123');

                const modules = await import('../../convex/messaging/index');
                const result = await (modules as any).send(ctx, {
                    tenantId,
                    conversationId: 'conv123',
                    senderId: userId,
                    content: 'Hello everyone!',
                    type: 'text',
                });

                expect(result.id).toBe('msg123');
                expect(ctx.db.insert).toHaveBeenCalledWith('messages', expect.objectContaining({
                    tenantId,
                    conversationId: 'conv123',
                    senderId: userId,
                    content: 'Hello everyone!',
                    type: 'text',
                }));

                // Update conversation last message
                expect(ctx.db.patch).toHaveBeenCalledWith('conv123', {
                    lastMessageAt: expect.any(Number),
                    lastMessagePreview: 'Hello everyone!',
                });
            });

            it('should validate sender is participant', async () => {
                // Mock conversation without sender
                ctx.db.get.mockResolvedValueOnce({
                    _id: 'conv123',
                    participantIds: ['user2', 'user3'],
                });

                const modules = await import('../../convex/messaging/index');
                
                await expect((modules as any).send(ctx, {
                    tenantId,
                    conversationId: 'conv123',
                    senderId: userId,
                    content: 'Hello!',
                })).rejects.toThrow('Sender is not a participant in this conversation');
            });
        });

        describe('markAsRead', () => {
            it('should mark messages as read', async () => {
                const mockQuery = {
                    withIndex: vi.fn().mockReturnValue({
                        collect: vi.fn().mockResolvedValue([
                            { _id: 'msg1', senderId: 'user2' },
                            { _id: 'msg2', senderId: 'user2' },
                        ])
                    })
                };
                
                ctx.db.query.mockReturnValue(mockQuery);

                const modules = await import('../../convex/messaging/index');
                await (modules as any).markAsRead(ctx, {
                    conversationId: 'conv123',
                    userId,
                });

                expect(ctx.db.patch).toHaveBeenCalledWith('msg1', {
                    readAt: expect.any(Number),
                });
                expect(ctx.db.patch).toHaveBeenCalledWith('msg2', {
                    readAt: expect.any(Number),
                });
            });
        });

        describe('edit', () => {
            it('should edit message', async () => {
                ctx.db.get.mockResolvedValue({
                    _id: 'msg123',
                    senderId: userId,
                    content: 'Original message',
                    timestamp: Date.now() - 3600000,
                });

                const modules = await import('../../convex/messaging/index');
                await (modules as any).edit(ctx, {
                    messageId: 'msg123',
                    content: 'Updated message',
                });

                expect(ctx.db.patch).toHaveBeenCalledWith('msg123', {
                    content: 'Updated message',
                    edited: true,
                    editedAt: expect.any(Number),
                });
            });

            it('should prevent editing old messages', async () => {
                ctx.db.get.mockResolvedValue({
                    _id: 'msg123',
                    senderId: userId,
                    timestamp: Date.now() - 2 * 60 * 60 * 1000, // 2 hours ago
                });

                const modules = await import('../../convex/messaging/index');
                
                await expect((modules as any).edit(ctx, {
                    messageId: 'msg123',
                    content: 'Updated',
                })).rejects.toThrow('Cannot edit messages older than 1 hour');
            });
        });

        describe('delete', () => {
            it('should delete message', async () => {
                ctx.db.get.mockResolvedValue({
                    _id: 'msg123',
                    senderId: userId,
                });

                const messaging = await import('../../convex/messaging/index');
                await (messaging as any).deleteMessage(ctx, { messageId: 'msg123' });

                expect(ctx.db.delete).toHaveBeenCalledWith('msg123');
            });

            it('should allow admin to delete any message', async () => {
                ctx.db.get.mockResolvedValue({
                    _id: 'msg123',
                    senderId: 'user2', // Different from current user
                });

                // Mock user as admin
                ctx.db.get.mockResolvedValueOnce({
                    _id: userId,
                    roles: ['admin'],
                });

                const messaging = await import('../../convex/messaging/index');
                await (messaging as any).deleteMessage(ctx, { 
                    messageId: 'msg123',
                    userId,
                });

                expect(ctx.db.delete).toHaveBeenCalledWith('msg123');
            });
        });
    });

    describe('Unread Counts', () => {
        describe('getUnreadCount', () => {
            it('should get unread message count', async () => {
                const mockQuery = {
                    withIndex: vi.fn().mockReturnValue({
                        collect: vi.fn().mockResolvedValue([
                            { _id: 'conv1', participantIds: [userId, 'user2'] },
                            { _id: 'conv2', participantIds: [userId, 'user3'] },
                        ])
                    })
                };
                
                ctx.db.query.mockReturnValue(mockQuery);

                // Mock unread messages
                const messageQuery = {
                    withIndex: vi.fn().mockReturnValue({
                        filter: vi.fn().mockReturnValue({
                            collect: vi.fn().mockResolvedValue([
                                { _id: 'msg1', senderId: 'user2' },
                                { _id: 'msg2', senderId: 'user3' },
                                { _id: 'msg3', senderId: userId }, // Own message
                            ])
                        })
                    })
                };
                
                ctx.db.query.mockReturnValue(messageQuery);

                const modules = await import('../../convex/messaging/index');
                const result = await (modules as any).getUnreadCount(ctx, { userId });

                expect(result.total).toBe(2); // Only messages from others
            });
        });
    });
});
