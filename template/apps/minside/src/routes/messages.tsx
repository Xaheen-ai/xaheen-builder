import { useState, useRef, useEffect, useMemo, type ChangeEvent, type KeyboardEvent } from 'react';
import { Link } from 'react-router-dom';
import {
  Card,
  Heading,
  Paragraph,
  Button,
  Spinner,
  SearchIcon,
  SendIcon,
  MessageSquareIcon,
  OrganizationIcon,
  ClockIcon,
  MailIcon,
  PhoneIcon,
  CalendarIcon,
  CheckCircleIcon,
  HomeIcon,
} from '@xaheen/ds';
import { useConversations, useMessages, useSendMessage, type Conversation, type Message, formatTime } from '@xaheen/sdk';
import { useAuth } from '../hooks/useAuth';

// Time ago formatting
function formatTimeAgo(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);
  
  if (diffMins < 1) return 'Nå';
  if (diffMins < 60) return `${diffMins}m`;
  if (diffHours < 24) return `${diffHours}t`;
  if (diffDays < 7) return `${diffDays}d`;
  return date.toLocaleDateString('nb-NO', { day: 'numeric', month: 'short' });
}

// Date grouping
function formatMessageDate(dateStr: string): string {
  const date = new Date(dateStr);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  
  if (date.toDateString() === today.toDateString()) return 'I dag';
  if (date.toDateString() === yesterday.toDateString()) return 'I går';
  return date.toLocaleDateString('nb-NO', { weekday: 'long', day: 'numeric', month: 'long' });
}

type FilterType = 'all' | 'unread' | 'booking';

export function MessagesPage() {
  const { user } = useAuth();
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<FilterType>('all');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Fetch conversations
  const { data: conversationsData, isLoading: loadingConversations } = useConversations();
  const conversations = conversationsData?.data ?? [];

  // Filter conversations
  const filteredConversations = useMemo(() => {
    let result = conversations;
    
    // Search filter
    if (searchQuery) {
      result = result.filter((c: Conversation) =>
        c.subject && c.subject.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    // Type filter
    if (filter === 'unread') {
      result = result.filter((c: Conversation) => (c.unreadCount ?? 0) > 0);
    }
    
    return result;
  }, [conversations, searchQuery, filter]);

  // Messages for selected conversation
  const { data: messagesData, isLoading: loadingMessages } = useMessages(selectedConversationId ?? '', {
    enabled: !!selectedConversationId,
  });
  const messages = messagesData?.data ?? [];

  const sendMessageMutation = useSendMessage();

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedConversationId) return;
    
    // Show typing indicator briefly
    setIsTyping(true);
    
    await sendMessageMutation.mutateAsync({
      conversationId: selectedConversationId,
      content: newMessage.trim(),
    });
    
    setNewMessage('');
    setIsTyping(false);
    inputRef.current?.focus();
  };

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  // Focus input
  useEffect(() => {
    if (selectedConversationId) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [selectedConversationId]);

  const selectedConversation = conversations.find((c: Conversation) => c.id === selectedConversationId);

  // Group messages by date
  const groupedMessages = useMemo(() => {
    return messages.reduce((groups: Record<string, Message[]>, message: Message) => {
      const dateKey = formatMessageDate(message.createdAt);
      if (!groups[dateKey]) groups[dateKey] = [];
      groups[dateKey].push(message);
      return groups;
    }, {});
  }, [messages]);

  // Stats
  const totalUnread = conversations.reduce((sum: number, c: Conversation) => sum + (c.unreadCount ?? 0), 0);

  return (
    <div style={{ 
      display: 'flex', 
      height: 'calc(100vh - 140px)',
      minHeight: '500px',
      gap: 'var(--ds-spacing-4)',
    }}>
      {/* Conversation List Panel */}
      <Card style={{ 
        width: '360px', 
        padding: 0, 
        overflow: 'hidden', 
        display: 'flex',
        flexDirection: 'column',
        flexShrink: 0,
      }}>
        {/* Header with Stats */}
        <div style={{ 
          padding: 'var(--ds-spacing-4)', 
          borderBottom: '1px solid var(--ds-color-neutral-border-subtle)',
          backgroundColor: 'var(--ds-color-neutral-background-subtle)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--ds-spacing-3)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--ds-spacing-2)' }}>
              <div style={{
                width: '32px',
                height: '32px',
                borderRadius: 'var(--ds-border-radius-md)',
                backgroundColor: 'var(--ds-color-brand-1-surface-default)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--ds-color-brand-1-base-default)',
              }}>
                <MessageSquareIcon />
              </div>
              <Heading level={2} data-size="sm" style={{ margin: 0 }}>
                Meldinger
              </Heading>
            </div>
            {totalUnread > 0 && (
              <div style={{
                padding: 'var(--ds-spacing-1) var(--ds-spacing-2)',
                borderRadius: 'var(--ds-border-radius-full)',
                backgroundColor: 'var(--ds-color-danger-surface-default)',
                color: 'var(--ds-color-danger-text-default)',
                fontSize: 'var(--ds-font-size-xs)',
                fontWeight: 'var(--ds-font-weight-semibold)',
              }}>
                {totalUnread} uleste
              </div>
            )}
          </div>
          
          {/* Search */}
          <div style={{ position: 'relative', marginBottom: 'var(--ds-spacing-3)' }}>
            {/* eslint-disable-next-line digdir/prefer-ds-components -- Custom search input with icon positioning */}
            <input
              type="text"
              placeholder="Søk etter samtaler..."
              value={searchQuery}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                padding: 'var(--ds-spacing-2) var(--ds-spacing-3)',
                paddingLeft: 'var(--ds-spacing-9)',
                border: '1px solid var(--ds-color-neutral-border-default)',
                borderRadius: 'var(--ds-border-radius-md)',
                fontSize: 'var(--ds-font-size-sm)',
                backgroundColor: 'var(--ds-color-neutral-background-default)',
              }}
            />
            <div style={{ 
              position: 'absolute', 
              left: 'var(--ds-spacing-3)', 
              top: '50%', 
              transform: 'translateY(-50%)', 
              color: 'var(--ds-color-neutral-text-subtle)',
            }}>
              <SearchIcon />
            </div>
          </div>

          {/* Filter Tabs */}
          <div style={{ display: 'flex', gap: 'var(--ds-spacing-2)' }}>
            {[
              { key: 'all' as FilterType, label: 'Alle', count: conversations.length },
              { key: 'unread' as FilterType, label: 'Uleste', count: totalUnread },
            ].map((tab) => (
              // eslint-disable-next-line digdir/prefer-ds-components -- Custom styled tab button
              <button
                key={tab.key}
                onClick={() => setFilter(tab.key)}
                style={{
                  flex: 1,
                  padding: 'var(--ds-spacing-2)',
                  border: 'none',
                  borderRadius: 'var(--ds-border-radius-md)',
                  backgroundColor: filter === tab.key 
                    ? 'var(--ds-color-brand-1-surface-default)' 
                    : 'transparent',
                  color: filter === tab.key 
                    ? 'var(--ds-color-brand-1-text-default)' 
                    : 'var(--ds-color-neutral-text-default)',
                  fontSize: 'var(--ds-font-size-sm)',
                  fontWeight: filter === tab.key ? 600 : 400,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 'var(--ds-spacing-1)',
                }} type="button"
              >
                {tab.label}
                <span style={{
                  fontSize: 'var(--ds-font-size-xs)',
                  opacity: 0.7,
                }}>
                  ({tab.count})
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Conversations List */}
        <div style={{ flex: 1, overflow: 'auto' }}>
          {loadingConversations ? (
            <div style={{ padding: 'var(--ds-spacing-8)', display: 'flex', justifyContent: 'center' }}>
              <Spinner aria-label="Laster samtaler..." data-size="md" />
            </div>
          ) : filteredConversations.length === 0 ? (
            <div style={{ 
              padding: 'var(--ds-spacing-8)', 
              textAlign: 'center',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 'var(--ds-spacing-3)',
            }}>
              <div style={{
                width: '56px',
                height: '56px',
                borderRadius: 'var(--ds-border-radius-full)',
                backgroundColor: 'var(--ds-color-neutral-surface-hover)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--ds-color-neutral-text-subtle)',
              }}>
                <MessageSquareIcon />
              </div>
              <Paragraph data-size="sm" style={{ color: 'var(--ds-color-neutral-text-default)', margin: 0 }}>
                {filter === 'unread' ? 'Ingen uleste meldinger' : 'Ingen samtaler'}
              </Paragraph>
            </div>
          ) : (
            filteredConversations.map((conversation: Conversation, index: number) => {
              const isSelected = selectedConversationId === conversation.id;
              const hasUnread = (conversation.unreadCount ?? 0) > 0;
              const lastMessageTime = conversation.updatedAt || conversation.createdAt;
              
              return (
                <div
                  key={conversation.id}
                  onClick={() => setSelectedConversationId(conversation.id)}
                  style={{
                    padding: 'var(--ds-spacing-3) var(--ds-spacing-4)',
                    cursor: 'pointer',
                    backgroundColor: isSelected 
                      ? 'var(--ds-color-brand-1-surface-default)' 
                      : hasUnread
                        ? 'var(--ds-color-accent-surface-default)'
                        : 'transparent',
                    borderLeft: isSelected 
                      ? '3px solid var(--ds-color-brand-1-base-default)' 
                      : '3px solid transparent',
                    borderBottom: '1px solid var(--ds-color-neutral-border-subtle)',
                    transition: 'background-color 150ms ease',
                  }}
                >
                  <div style={{ display: 'flex', gap: 'var(--ds-spacing-3)' }}>
                    {/* Avatar with status */}
                    <div style={{ position: 'relative', flexShrink: 0 }}>
                      <div style={{
                        width: '48px',
                        height: '48px',
                        borderRadius: 'var(--ds-border-radius-full)',
                        backgroundColor: 'var(--ds-color-brand-1-surface-default)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'var(--ds-color-brand-1-base-default)',
                      }}>
                        <OrganizationIcon />
                      </div>
                      {/* Online status */}
                      <div style={{
                        position: 'absolute',
                        bottom: '2px',
                        right: '2px',
                        width: '12px',
                        height: '12px',
                        borderRadius: 'var(--ds-border-radius-full)',
                        backgroundColor: index % 2 === 0 ? 'var(--ds-color-success-base-default)' : 'var(--ds-color-neutral-border-default)',
                        border: '2px solid var(--ds-color-neutral-contrast-default)',
                      }} />
                    </div>
                    
                    {/* Content */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 'var(--ds-spacing-2)' }}>
                        <Paragraph data-size="sm" style={{ 
                          margin: 0, 
                          fontWeight: hasUnread ? 700 : 500, 
                          color: 'var(--ds-color-neutral-text-default)',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}>
                          {String(conversation.subject || 'Ukjent avsender')}
                        </Paragraph>
                        <span style={{
                          fontSize: 'var(--ds-font-size-xs)',
                          color: 'var(--ds-color-neutral-text-subtle)',
                          whiteSpace: 'nowrap',
                        }}>
                          {lastMessageTime ? formatTimeAgo(lastMessageTime) : ''}
                        </span>
                      </div>
                      
                      {/* Preview with unread badge */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--ds-spacing-2)', marginTop: 'var(--ds-spacing-1)' }}>
                        <Paragraph
                          data-size="xs"
                          style={{
                            margin: 0,
                            flex: 1,
                            color: hasUnread 
                              ? 'var(--ds-color-neutral-text-default)' 
                              : 'var(--ds-color-neutral-text-subtle)',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                            fontWeight: hasUnread ? 500 : 400,
                          }}
                        >
                          {typeof conversation.lastMessage === 'object' && conversation.lastMessage !== null
                            ? String((conversation.lastMessage as { content?: string }).content || 'Ingen meldinger')
                            : String(conversation.lastMessage || 'Ingen meldinger')}
                        </Paragraph>
                        {hasUnread && (
                          <div style={{
                            minWidth: '20px',
                            height: '20px',
                            borderRadius: 'var(--ds-border-radius-full)',
                            backgroundColor: 'var(--ds-color-danger-base-default)',
                            color: 'var(--ds-color-neutral-contrast-default)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: 'var(--ds-font-size-xs)',
                            fontWeight: 'var(--ds-font-weight-bold)',
                          }}>
                            {conversation.unreadCount}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </Card>

      {/* Main Chat Area */}
      <Card style={{ 
        flex: 1, 
        padding: 0, 
        overflow: 'hidden', 
        display: 'flex',
        flexDirection: 'column',
      }}>
        {selectedConversation ? (
          <>
            {/* Chat Header */}
            <div style={{
              padding: 'var(--ds-spacing-3) var(--ds-spacing-4)',
              borderBottom: '1px solid var(--ds-color-neutral-border-subtle)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              backgroundColor: 'var(--ds-color-neutral-background-default)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--ds-spacing-3)' }}>
                <div style={{ position: 'relative' }}>
                  <div style={{
                    width: '44px',
                    height: '44px',
                    borderRadius: 'var(--ds-border-radius-full)',
                    backgroundColor: 'var(--ds-color-brand-1-surface-default)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--ds-color-brand-1-base-default)',
                  }}>
                    <OrganizationIcon />
                  </div>
                  <div style={{
                    position: 'absolute',
                    bottom: '2px',
                    right: '2px',
                    width: '10px',
                    height: '10px',
                    borderRadius: 'var(--ds-border-radius-full)',
                    backgroundColor: 'var(--ds-color-success-base-default)',
                    border: '2px solid var(--ds-color-neutral-contrast-default)',
                  }} />
                </div>
                
                <div>
                  <Heading level={3} data-size="sm" style={{ margin: 0 }}>
                    {String(selectedConversation.subject || 'Ukjent avsender')}
                  </Heading>
                  <Paragraph data-size="xs" style={{ margin: 0, color: 'var(--ds-color-success-text-default)' }}>
                    Aktiv nå
                  </Paragraph>
                </div>
              </div>

              {/* Header Actions */}
              <div style={{ display: 'flex', gap: 'var(--ds-spacing-2)' }}>
                <Button type="button" variant="tertiary" data-size="sm" aria-label={t('messages.call') || 'Call'}>
                  <PhoneIcon />
                </Button>
                <Button type="button" variant="tertiary" data-size="sm" aria-label={t('messages.schedule') || 'Schedule'}>
                  <CalendarIcon />
                </Button>
              </div>
            </div>

            {/* Messages Area */}
            <div style={{ 
              flex: 1, 
              overflow: 'auto', 
              padding: 'var(--ds-spacing-4)',
              backgroundColor: 'var(--ds-color-neutral-background-subtle)',
            }}>
              {loadingMessages ? (
                <div style={{ display: 'flex', justifyContent: 'center', padding: 'var(--ds-spacing-8)' }}>
                  <Spinner aria-label="Laster meldinger..." data-size="md" />
                </div>
              ) : messages.length === 0 ? (
                <div style={{ 
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 'var(--ds-spacing-3)',
                }}>
                  <div style={{
                    width: '64px',
                    height: '64px',
                    borderRadius: 'var(--ds-border-radius-full)',
                    backgroundColor: 'var(--ds-color-neutral-background-default)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--ds-color-neutral-text-subtle)',
                  }}>
                    <MessageSquareIcon />
                  </div>
                  <Paragraph style={{ color: 'var(--ds-color-neutral-text-default)', margin: 0 }}>
                    Ingen meldinger ennå
                  </Paragraph>
                  <Paragraph data-size="sm" style={{ color: 'var(--ds-color-neutral-text-subtle)', margin: 0 }}>
                    Si hei for å starte samtalen!
                  </Paragraph>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ds-spacing-5)' }}>
                  {Object.entries(groupedMessages).map(([date, dateMessages]) => (
                    <div key={date}>
                      {/* Date Separator */}
                      <div style={{ 
                        display: 'flex',
                        alignItems: 'center',
                        gap: 'var(--ds-spacing-3)',
                        marginBottom: 'var(--ds-spacing-4)',
                      }}>
                        <div style={{ flex: 1, height: '1px', backgroundColor: 'var(--ds-color-neutral-border-subtle)' }} />
                        <span style={{
                          color: 'var(--ds-color-neutral-text-subtle)',
                          fontSize: 'var(--ds-font-size-xs)',
                          fontWeight: 'var(--ds-font-weight-medium)',
                          textTransform: 'capitalize',
                        }}>
                          {date}
                        </span>
                        <div style={{ flex: 1, height: '1px', backgroundColor: 'var(--ds-color-neutral-border-subtle)' }} />
                      </div>
                      
                      {/* Messages */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ds-spacing-3)' }}>
                        {dateMessages.map((message: Message, msgIndex: number) => {
                          const isOwnMessage = message.senderId === user?.id;
                          const isLastInGroup = msgIndex === dateMessages.length - 1 || 
                            dateMessages[msgIndex + 1]?.senderId !== message.senderId;
                          
                          return (
                            <div
                              key={message.id}
                              style={{
                                display: 'flex',
                                flexDirection: isOwnMessage ? 'row-reverse' : 'row',
                                alignItems: 'flex-end',
                                gap: 'var(--ds-spacing-2)',
                              }}
                            >
                              {/* Avatar */}
                              {!isOwnMessage && isLastInGroup && (
                                <div style={{
                                  width: '32px',
                                  height: '32px',
                                  borderRadius: 'var(--ds-border-radius-full)',
                                  backgroundColor: 'var(--ds-color-brand-1-surface-default)',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  color: 'var(--ds-color-brand-1-base-default)',
                                  flexShrink: 0,
                                }}>
                                  <OrganizationIcon />
                                </div>
                              )}
                              {!isOwnMessage && !isLastInGroup && (
                                <div style={{ width: '32px' }} />
                              )}
                              
                              {/* Bubble */}
                              <div style={{
                                maxWidth: '65%',
                                padding: 'var(--ds-spacing-3) var(--ds-spacing-4)',
                                borderRadius: isOwnMessage 
                                  ? 'var(--ds-border-radius-lg) var(--ds-border-radius-lg) var(--ds-border-radius-sm) var(--ds-border-radius-lg)'
                                  : 'var(--ds-border-radius-lg) var(--ds-border-radius-lg) var(--ds-border-radius-lg) var(--ds-border-radius-sm)',
                                backgroundColor: isOwnMessage
                                  ? 'var(--ds-color-brand-1-base-default)'
                                  : 'var(--ds-color-neutral-background-default)',
                                color: isOwnMessage ? 'white' : 'var(--ds-color-neutral-text-default)',
                                boxShadow: 'var(--ds-shadow-small)',
                              }}>
                                <Paragraph data-size="sm" style={{ margin: 0, color: 'inherit', lineHeight: 'var(--ds-font-line-height-base)' }}>
                                  {String(message.content)}
                                </Paragraph>
                                <div style={{ 
                                  display: 'flex', 
                                  alignItems: 'center', 
                                  justifyContent: isOwnMessage ? 'flex-end' : 'flex-start',
                                  gap: 'var(--ds-spacing-1)',
                                  marginTop: 'var(--ds-spacing-1)',
                                }}>
                                  <span style={{ fontSize: 'var(--ds-font-size-xs)', opacity: 0.7 }}>
                                    {formatTime(message.createdAt)}
                                  </span>
                                  {isOwnMessage && (
                                    <CheckCircleIcon style={{ width: '12px', height: '12px', opacity: 0.7 }} />
                                  )}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                  
                  {/* Typing indicator */}
                  {isTyping && (
                    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 'var(--ds-spacing-2)' }}>
                      <div style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: 'var(--ds-border-radius-full)',
                        backgroundColor: 'var(--ds-color-brand-1-surface-default)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'var(--ds-color-brand-1-base-default)',
                      }}>
                        <OrganizationIcon />
                      </div>
                      <div style={{
                        padding: 'var(--ds-spacing-3) var(--ds-spacing-4)',
                        borderRadius: 'var(--ds-border-radius-lg)',
                        backgroundColor: 'var(--ds-color-neutral-background-default)',
                        boxShadow: 'var(--ds-shadow-small)',
                      }}>
                        <div style={{ display: 'flex', gap: 'var(--ds-spacing-1)' }}>
                          {[0, 1, 2].map((i) => (
                            <div
                              key={i}
                              style={{
                                width: '8px',
                                height: '8px',
                                borderRadius: 'var(--ds-border-radius-full)',
                                backgroundColor: 'var(--ds-color-neutral-text-subtle)',
                                animation: `pulse 1.4s ease-in-out ${i * 0.2}s infinite`,
                              }}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                  
                  <div ref={messagesEndRef} />
                </div>
              )}
            </div>

            {/* Message Input */}
            <div style={{
              padding: 'var(--ds-spacing-4)',
              backgroundColor: 'var(--ds-color-neutral-background-default)',
              borderTop: '1px solid var(--ds-color-neutral-border-subtle)',
            }}>
              <div style={{ 
                display: 'flex', 
                gap: 'var(--ds-spacing-3)',
                alignItems: 'center',
                backgroundColor: 'var(--ds-color-neutral-background-subtle)',
                borderRadius: 'var(--ds-border-radius-lg)',
                padding: 'var(--ds-spacing-2) var(--ds-spacing-3)',
                border: '1px solid var(--ds-color-neutral-border-default)',
              }}>
                {/* eslint-disable-next-line digdir/prefer-ds-components -- Message input with ref and custom behavior */}
                <input
                  ref={inputRef}
                  type="text"
                  placeholder="Skriv en melding..."
                  value={newMessage}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => setNewMessage(e.target.value)}
                  onKeyDown={(e: KeyboardEvent<HTMLInputElement>) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                  style={{
                    flex: 1,
                    padding: 'var(--ds-spacing-2)',
                    border: 'none',
                    fontSize: 'var(--ds-font-size-sm)',
                    backgroundColor: 'transparent',
                    outline: 'none',
                  }}
                />
                <Button
                  type="button"
                  variant="primary"
                  data-size="sm"
                  onClick={handleSendMessage}
                  disabled={!newMessage.trim() || sendMessageMutation.isPending}
                >
                  <SendIcon />
                  Send
                </Button>
              </div>
            </div>
          </>
        ) : (
          /* Empty State */
          <div style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 'var(--ds-spacing-4)',
            padding: 'var(--ds-spacing-8)',
            backgroundColor: 'var(--ds-color-neutral-background-subtle)',
          }}>
            <div style={{
              width: '80px',
              height: '80px',
              borderRadius: 'var(--ds-border-radius-full)',
              backgroundColor: 'var(--ds-color-neutral-background-default)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--ds-color-neutral-text-subtle)',
            }}>
              <MessageSquareIcon />
            </div>
            <Heading level={3} data-size="md" style={{ margin: 0, color: 'var(--ds-color-neutral-text-default)' }}>
              Velg en samtale
            </Heading>
            <Paragraph style={{ 
              color: 'var(--ds-color-neutral-text-subtle)', 
              margin: 0, 
              textAlign: 'center',
              maxWidth: '280px',
            }}>
              Klikk på en samtale i listen for å se og sende meldinger
            </Paragraph>
          </div>
        )}
      </Card>

      {/* Contact Info Panel */}
      {selectedConversation && (
        <Card style={{ 
          width: '280px', 
          padding: 0, 
          flexShrink: 0,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}>
          {/* Contact Header */}
          <div style={{ 
            padding: 'var(--ds-spacing-5)', 
            textAlign: 'center',
            borderBottom: '1px solid var(--ds-color-neutral-border-subtle)',
            backgroundColor: 'var(--ds-color-neutral-background-subtle)',
          }}>
            <div style={{
              width: '72px',
              height: '72px',
              borderRadius: 'var(--ds-border-radius-full)',
              backgroundColor: 'var(--ds-color-brand-1-surface-default)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--ds-color-brand-1-base-default)',
              margin: '0 auto var(--ds-spacing-3)',
            }}>
              <OrganizationIcon />
            </div>
            <Heading level={3} data-size="sm" style={{ margin: 0 }}>
              {String(selectedConversation.subject || 'Ukjent avsender')}
            </Heading>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 'var(--ds-spacing-1)',
              marginTop: 'var(--ds-spacing-2)',
              padding: 'var(--ds-spacing-1) var(--ds-spacing-2)',
              borderRadius: 'var(--ds-border-radius-full)',
              backgroundColor: 'var(--ds-color-success-surface-default)',
              color: 'var(--ds-color-success-text-default)',
              fontSize: 'var(--ds-font-size-xs)',
            }}>
              <div style={{
                width: '6px',
                height: '6px',
                borderRadius: 'var(--ds-border-radius-full)',
                backgroundColor: 'var(--ds-color-success-base-default)',
              }} />
              Aktiv bruker
            </div>
          </div>

          {/* Contact Details */}
          <div style={{ padding: 'var(--ds-spacing-4)', flex: 1, overflow: 'auto' }}>
            {/* Contact Info Section */}
            <div style={{ marginBottom: 'var(--ds-spacing-5)' }}>
              <Paragraph data-size="xs" style={{ 
                margin: 0, 
                marginBottom: 'var(--ds-spacing-2)', 
                fontWeight: 'var(--ds-font-weight-semibold)', 
                color: 'var(--ds-color-neutral-text-subtle)',
                textTransform: 'uppercase',
                letterSpacing: 'var(--ds-font-letter-spacing-normal)',
              }}>
                Kontakt
              </Paragraph>
              <div style={{ 
                display: 'flex', 
                flexDirection: 'column', 
                gap: 'var(--ds-spacing-2)',
                padding: 'var(--ds-spacing-3)',
                backgroundColor: 'var(--ds-color-neutral-background-subtle)',
                borderRadius: 'var(--ds-border-radius-md)',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--ds-spacing-2)' }}>
                  <MailIcon style={{ color: 'var(--ds-color-neutral-text-subtle)', flexShrink: 0 }} />
                  <Paragraph data-size="xs" style={{ margin: 0, color: 'var(--ds-color-neutral-text-default)' }}>
                    kontakt@utleier.no
                  </Paragraph>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--ds-spacing-2)' }}>
                  <PhoneIcon style={{ color: 'var(--ds-color-neutral-text-subtle)', flexShrink: 0 }} />
                  <Paragraph data-size="xs" style={{ margin: 0, color: 'var(--ds-color-neutral-text-default)' }}>
                    +47 123 45 678
                  </Paragraph>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div>
              <Paragraph data-size="xs" style={{ 
                margin: 0, 
                marginBottom: 'var(--ds-spacing-2)', 
                fontWeight: 'var(--ds-font-weight-semibold)', 
                color: 'var(--ds-color-neutral-text-subtle)',
                textTransform: 'uppercase',
                letterSpacing: 'var(--ds-font-letter-spacing-normal)',
              }}>
                Hurtigvalg
              </Paragraph>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ds-spacing-2)' }}>
                <Link to="/bookings" style={{ textDecoration: 'none' }}>
                  <Button type="button" variant="secondary" data-size="sm" style={{ width: '100%', justifyContent: 'flex-start' }}>
                    <CalendarIcon />
                    Se mine bookinger
                  </Button>
                </Link>
                <Link to="/calendar" style={{ textDecoration: 'none' }}>
                  <Button type="button" variant="secondary" data-size="sm" style={{ width: '100%', justifyContent: 'flex-start' }}>
                    <ClockIcon />
                    Åpne kalender
                  </Button>
                </Link>
                <Link to="/" style={{ textDecoration: 'none' }}>
                  <Button type="button" variant="secondary" data-size="sm" style={{ width: '100%', justifyContent: 'flex-start' }}>
                    <HomeIcon />
                    Gå til dashbord
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Typing animation CSS */}
      <style>{`
        @keyframes pulse {
          0%, 80%, 100% { opacity: 0.3; transform: scale(0.8); }
          40% { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>
  );
}
