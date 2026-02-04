/* eslint-disable digdir/prefer-ds-components, digdir/require-interactive-labels -- Complex messaging interface */

import { useState, useEffect, useRef, useMemo, type ChangeEvent, type KeyboardEvent } from 'react';
import {
  Card,
  Heading,
  Paragraph,
  Button,
  Badge,
  Spinner,
  Select,
  SendIcon,
  SearchIcon,
  MessageSquareIcon,
  UserIcon,
  CheckCircleIcon,
  MailIcon,
  PhoneIcon,
  CalendarIcon,
  PaperclipIcon,
  XIcon,
} from '@xaheen/ds';
import {
  useConversations,
  useMessages,
  useSendMessage,
  useMarkMessagesRead,
  useResolveConversation,
  useReopenConversation,
  useAssignConversation,
  useUsers,
  formatTime,
  type Conversation,
  type Message,
} from '@xaheen/sdk';

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

type FilterType = 'all' | 'unread' | 'active' | 'resolved';

export function MessagesPage() {
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const [messageInput, setMessageInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<FilterType>('all');
  const [attachedFiles, setAttachedFiles] = useState<File[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch conversations from API
  const { data: conversationsData, isLoading: isLoadingConversations } = useConversations();
  const conversations = conversationsData?.data ?? [];

  // Fetch messages for selected conversation
  const { data: messagesData, isLoading: isLoadingMessages } = useMessages(
    selectedConversationId!,
    { enabled: !!selectedConversationId }
  );
  const messages = messagesData?.data ?? [];

  // Mutations
  const sendMessage = useSendMessage();
  const markAsRead = useMarkMessagesRead();
  const resolveConversation = useResolveConversation();
  const reopenConversation = useReopenConversation();
  const assignConversation = useAssignConversation();

  // Fetch saksbehandlere for assignment
  const { data: usersData } = useUsers({ role: 'saksbehandler' });
  const saksbehandlere = usersData?.data ?? [];

  // Filter conversations
  const filteredConversations = useMemo(() => {
    let result = conversations;

    if (searchQuery) {
      result = result.filter((c) =>
        (c.userName && c.userName.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (c.subject && c.subject.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    if (filter === 'unread') {
      result = result.filter((c) => (c.unreadCount ?? 0) > 0);
    } else if (filter === 'active') {
      result = result.filter((c) => c.status === 'active');
    } else if (filter === 'resolved') {
      result = result.filter((c) => c.status === 'resolved');
    }

    return result;
  }, [conversations, searchQuery, filter]);

  // Stats
  const unreadTotal = conversations.reduce((sum, c) => sum + (c.unreadCount || 0), 0);
  const activeCount = conversations.filter((c) => c.status === 'active').length;

  // Auto-select first conversation
  useEffect(() => {
    if (conversations.length > 0 && !selectedConversationId) {
      const firstConversation = conversations[0];
      if (firstConversation) {
        setSelectedConversationId(firstConversation.id);
      }
    }
  }, [conversations, selectedConversationId]);

  // Mark messages as read when conversation is selected
  useEffect(() => {
    if (selectedConversationId) {
      const conversation = conversations.find((c: Conversation) => c.id === selectedConversationId);
      if (conversation && (conversation.unreadCount ?? 0) > 0) {
        markAsRead.mutate(selectedConversationId);
      }
    }
  }, [selectedConversationId, conversations]);

  // Auto-scroll to newest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Focus input when conversation selected
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

  const handleSendMessage = () => {
    if (!messageInput.trim() || !selectedConversationId) return;

    sendMessage.mutate(
      {
        conversationId: selectedConversationId,
        content: messageInput.trim(),
      },
      {
        onSuccess: () => {
          setMessageInput('');
          inputRef.current?.focus();
        },
      }
    );
  };

  const handleKeyPress = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleFileSelect = (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      setAttachedFiles(Array.from(files));
    }
  };

  const handleRemoveFile = (index: number) => {
    setAttachedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleResolveToggle = async () => {
    if (!selectedConversationId) return;

    if (selectedConversation?.status === 'active') {
      await resolveConversation.mutateAsync(selectedConversationId);
    } else {
      await reopenConversation.mutateAsync(selectedConversationId);
    }
  };

  const handleAssign = async (userId: string) => {
    if (!selectedConversationId) return;
    await assignConversation.mutateAsync({
      conversationId: selectedConversationId,
      userId: userId || undefined,
    });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ds-spacing-4)', height: 'calc(100vh - 160px)' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--ds-spacing-3)' }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: 'var(--ds-border-radius-md)',
              backgroundColor: 'var(--ds-color-brand-1-surface-default)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--ds-color-brand-1-base-default)',
            }}>
              <MessageSquareIcon />
            </div>
            <div>
              <Heading level={1} data-size="lg" style={{ margin: 0 }}>
                Meldinger
              </Heading>
              <Paragraph data-size="sm" style={{ margin: 0, color: 'var(--ds-color-neutral-text-subtle)' }}>
                Kommunikasjon med brukere og organisasjoner
              </Paragraph>
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 'var(--ds-spacing-3)' }}>
          {unreadTotal > 0 && (
            <Badge data-color="danger" data-size="md">
              {unreadTotal} uleste
            </Badge>
          )}
          <Badge data-color="success" data-size="md">
            {activeCount} aktive
          </Badge>
        </div>
      </div>

      {/* Main Content */}
      <div style={{ display: 'flex', gap: 'var(--ds-spacing-4)', flex: 1, minHeight: 0 }}>
        {/* Conversation List */}
        <Card style={{ width: '380px', padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column', flexShrink: 0 }}>
          {/* Search & Filter */}
          <div style={{ padding: 'var(--ds-spacing-4)', borderBottom: '1px solid var(--ds-color-neutral-border-subtle)', backgroundColor: 'var(--ds-color-neutral-background-subtle)' }}>
            {/* Search */}
            <div style={{ position: 'relative', marginBottom: 'var(--ds-spacing-3)' }}>
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
            <div style={{ display: 'flex', gap: 'var(--ds-spacing-1)' }}>
              {[
                { key: 'all' as FilterType, label: 'Alle' },
                { key: 'unread' as FilterType, label: 'Uleste' },
                { key: 'active' as FilterType, label: 'Aktive' },
                { key: 'resolved' as FilterType, label: 'Løst' },
              ].map((tab) => (
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
                    fontSize: 'var(--ds-font-size-xs)',
                    fontWeight: filter === tab.key ? 600 : 400,
                    cursor: 'pointer',
                  }} type="button"
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Conversations */}
          <div style={{ flex: 1, overflow: 'auto' }}>
            {isLoadingConversations ? (
              <div style={{ padding: 'var(--ds-spacing-8)', display: 'flex', justifyContent: 'center' }}>
                <Spinner aria-label="Laster samtaler..." data-data-size="md" />
              </div>
            ) : filteredConversations.length === 0 ? (
              <div style={{ padding: 'var(--ds-spacing-8)', textAlign: 'center' }}>
                <div style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: 'var(--ds-border-radius-full)',
                  backgroundColor: 'var(--ds-color-neutral-surface-hover)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--ds-color-neutral-text-subtle)',
                  margin: '0 auto var(--ds-spacing-3)',
                }}>
                  <MessageSquareIcon />
                </div>
                <Paragraph style={{ color: 'var(--ds-color-neutral-text-subtle)', margin: 0 }}>
                  {searchQuery ? 'Ingen samtaler funnet' : 'Ingen samtaler ennå'}
                </Paragraph>
              </div>
            ) : (
              filteredConversations.map((conversation: Conversation) => {
                const isSelected = selectedConversationId === conversation.id;
                const hasUnread = (conversation.unreadCount ?? 0) > 0;
                const lastMessageTime = conversation.updatedAt || conversation.lastMessageAt || conversation.createdAt;
                
                return (
                  <div
                    key={conversation.id}
                    onClick={() => setSelectedConversationId(conversation.id)}
                    style={{
                      padding: 'var(--ds-spacing-3) var(--ds-spacing-4)',
                      borderBottom: '1px solid var(--ds-color-neutral-border-subtle)',
                      cursor: 'pointer',
                      backgroundColor: isSelected 
                        ? 'var(--ds-color-brand-1-surface-default)' 
                        : hasUnread
                          ? 'var(--ds-color-accent-surface-default)'
                          : 'transparent',
                      borderLeft: isSelected 
                        ? '3px solid var(--ds-color-brand-1-base-default)' 
                        : '3px solid transparent',
                    }}
                  >
                    <div style={{ display: 'flex', gap: 'var(--ds-spacing-3)' }}>
                      {/* Avatar */}
                      <div style={{ position: 'relative', flexShrink: 0 }}>
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
                          <UserIcon />
                        </div>
                        <div style={{
                          position: 'absolute',
                          bottom: '2px',
                          right: '2px',
                          width: '10px',
                          height: '10px',
                          borderRadius: 'var(--ds-border-radius-full)',
                          backgroundColor: conversation.status === 'active'
                            ? 'var(--ds-color-success-base-default)'
                            : 'var(--ds-color-neutral-border-default)',
                          border: '2px solid var(--ds-color-neutral-background-default)',
                        }} />
                      </div>
                      
                      {/* Content */}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                          <Paragraph data-size="sm" style={{ 
                            margin: 0, 
                            fontWeight: hasUnread ? 700 : 500,
                            color: 'var(--ds-color-neutral-text-default)',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                          }}>
                            {String(conversation.userName || conversation.subject || 'Ukjent bruker')}
                          </Paragraph>
                          <span style={{ fontSize: 'var(--ds-font-size-body-xs)', color: 'var(--ds-color-neutral-text-subtle)', whiteSpace: 'nowrap' }}>
                            {lastMessageTime ? formatTimeAgo(lastMessageTime) : ''}
                          </span>
                        </div>
                        
                        {conversation.bookingId && (
                          <Paragraph data-size="xs" style={{ margin: 0, marginTop: '2px', color: 'var(--ds-color-brand-1-text-default)' }}>
                            Booking: {String(conversation.bookingId).slice(0, 8)}...
                          </Paragraph>
                        )}
                        
                        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--ds-spacing-2)', marginTop: 'var(--ds-spacing-1)' }}>
                          <Paragraph
                            data-size="xs"
                            style={{
                              margin: 0,
                              flex: 1,
                              color: 'var(--ds-color-neutral-text-subtle)',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                            }}
                          >
                            {typeof conversation.lastMessage === 'object' && conversation.lastMessage !== null
                              ? String((conversation.lastMessage as { content?: string }).content || 'Ingen meldinger')
                              : String(conversation.lastMessage || 'Ingen meldinger')}
                          </Paragraph>
                          {hasUnread && (
                            <Badge data-color="danger" data-size="sm">
                              {conversation.unreadCount}
                            </Badge>
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

        {/* Chat Area */}
        <Card style={{ flex: 1, padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          {selectedConversation ? (
            <>
              {/* Header */}
              <div style={{
                padding: 'var(--ds-spacing-3) var(--ds-spacing-4)',
                borderBottom: '1px solid var(--ds-color-neutral-border-subtle)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
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
                      <UserIcon />
                    </div>
                    <div style={{
                      position: 'absolute',
                      bottom: '2px',
                      right: '2px',
                      width: '10px',
                      height: '10px',
                      borderRadius: 'var(--ds-border-radius-full)',
                      backgroundColor: selectedConversation.status === 'active'
                        ? 'var(--ds-color-success-base-default)'
                        : 'var(--ds-color-neutral-border-default)',
                      border: '2px solid var(--ds-color-neutral-background-default)',
                    }} />
                  </div>
                  <div>
                    <Heading level={3} data-size="sm" style={{ margin: 0 }}>
                      {String(selectedConversation.userName || selectedConversation.subject || 'Ukjent bruker')}
                    </Heading>
                    <Paragraph data-size="xs" style={{ margin: 0, color: selectedConversation.status === 'active' ? 'var(--ds-color-success-text-default)' : 'var(--ds-color-neutral-text-subtle)' }}>
                      {selectedConversation.status === 'active' ? 'Aktiv samtale' : 'Løst'}
                    </Paragraph>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 'var(--ds-spacing-2)' }}>
                  <Badge 
                    data-color={selectedConversation.status === 'active' ? 'success' : 'neutral'} 
                    data-size="sm"
                  >
                    {selectedConversation.status === 'active' ? 'Aktiv' : 'Løst'}
                  </Badge>
                </div>
              </div>

              {/* Messages */}
              <div style={{ 
                flex: 1, 
                overflow: 'auto', 
                padding: 'var(--ds-spacing-4)', 
                backgroundColor: 'var(--ds-color-neutral-background-subtle)',
              }}>
                {isLoadingMessages ? (
                  <div style={{ display: 'flex', justifyContent: 'center', padding: 'var(--ds-spacing-8)' }}>
                    <Spinner aria-label="Laster meldinger..." data-data-size="md" />
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
                      Svar på brukerens henvendelse
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
                        
                        {/* Messages for this date */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ds-spacing-3)' }}>
                          {dateMessages.map((message: Message) => {
                            const isAdmin = message.sender === 'admin' || message.senderId === 'admin';
                            
                            return (
                              <div
                                key={message.id}
                                style={{
                                  display: 'flex',
                                  flexDirection: isAdmin ? 'row-reverse' : 'row',
                                  alignItems: 'flex-end',
                                  gap: 'var(--ds-spacing-2)',
                                }}
                              >
                                {/* Avatar */}
                                {!isAdmin && (
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
                                    <UserIcon />
                                  </div>
                                )}
                                
                                {/* Bubble */}
                                <div style={{
                                  maxWidth: '65%',
                                  padding: 'var(--ds-spacing-3) var(--ds-spacing-4)',
                                  borderRadius: isAdmin 
                                    ? 'var(--ds-border-radius-lg) var(--ds-border-radius-lg) var(--ds-border-radius-sm) var(--ds-border-radius-lg)'
                                    : 'var(--ds-border-radius-lg) var(--ds-border-radius-lg) var(--ds-border-radius-lg) var(--ds-border-radius-sm)',
                                  backgroundColor: isAdmin
                                    ? 'var(--ds-color-brand-1-base-default)'
                                    : 'var(--ds-color-neutral-background-default)',
                                  color: isAdmin ? 'var(--ds-color-neutral-contrast-default)' : 'var(--ds-color-neutral-text-default)',
                                  boxShadow: 'var(--ds-shadow-xs)',
                                }}>
                                  {!isAdmin && (
                                    <Paragraph data-size="xs" style={{ margin: 0, marginBottom: 'var(--ds-spacing-1)', fontWeight: 'var(--ds-font-weight-semibold)', color: 'inherit', opacity: 0.8 }}>
                                      {String(message.senderName || 'Bruker')}
                                    </Paragraph>
                                  )}
                                  <Paragraph data-size="sm" style={{ margin: 0, color: 'inherit', lineHeight: 'var(--ds-font-line-height-md)' }}>
                                    {String(message.content)}
                                  </Paragraph>
                                  <div style={{ 
                                    display: 'flex', 
                                    alignItems: 'center', 
                                    justifyContent: isAdmin ? 'flex-end' : 'flex-start',
                                    gap: 'var(--ds-spacing-1)',
                                    marginTop: 'var(--ds-spacing-1)',
                                  }}>
                                    <span style={{ fontSize: 'var(--ds-font-size-body-xs)', opacity: 0.7 }}>
                                      {formatTime(message.createdAt)}
                                    </span>
                                    {isAdmin && (
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
                    <div ref={messagesEndRef} />
                  </div>
                )}
              </div>

              {/* Input */}
              <div style={{
                padding: 'var(--ds-spacing-4)',
                borderTop: '1px solid var(--ds-color-neutral-border-subtle)',
                backgroundColor: 'var(--ds-color-neutral-background-default)',
              }}>
                {/* Attached Files Display */}
                {attachedFiles.length > 0 && (
                  <div style={{ marginBottom: 'var(--ds-spacing-3)', display: 'flex', flexWrap: 'wrap', gap: 'var(--ds-spacing-2)' }}>
                    {attachedFiles.map((file, index) => (
                      <div
                        key={index}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 'var(--ds-spacing-2)',
                          padding: 'var(--ds-spacing-2) var(--ds-spacing-3)',
                          backgroundColor: 'var(--ds-color-neutral-surface-default)',
                          borderRadius: 'var(--ds-border-radius-md)',
                          border: '1px solid var(--ds-color-neutral-border-default)',
                        }}
                      >
                        <PaperclipIcon style={{ color: 'var(--ds-color-neutral-text-subtle)', fontSize: 'var(--ds-font-size-sm)' }} />
                        <Paragraph data-size="xs" style={{ margin: 0 }}>
                          {file.name}
                        </Paragraph>
                        <button
                          onClick={() => handleRemoveFile(index)}
                          style={{
                            border: 'none',
                            background: 'none',
                            cursor: 'pointer',
                            padding: '2px',
                            display: 'flex',
                            alignItems: 'center',
                          }} type="button"
                        >
                          <XIcon style={{ fontSize: 'var(--ds-font-size-sm)', color: 'var(--ds-color-neutral-text-subtle)' }} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                <div style={{
                  display: 'flex',
                  gap: 'var(--ds-spacing-3)',
                  alignItems: 'center',
                  backgroundColor: 'var(--ds-color-neutral-background-subtle)',
                  borderRadius: 'var(--ds-border-radius-lg)',
                  padding: 'var(--ds-spacing-2) var(--ds-spacing-3)',
                  border: '1px solid var(--ds-color-neutral-border-default)',
                }}>
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    onChange={handleFileSelect}
                    style={{ display: 'none' }}
                  />
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    style={{
                      border: 'none',
                      background: 'none',
                      cursor: 'pointer',
                      padding: 'var(--ds-spacing-1)',
                      display: 'flex',
                      alignItems: 'center',
                      color: 'var(--ds-color-neutral-text-subtle)',
                    }}
                    title="Legg til vedlegg" type="button"
                  >
                    <PaperclipIcon />
                  </button>
                  <input
                    ref={inputRef}
                    type="text"
                    placeholder="Skriv et svar..."
                    value={messageInput}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => setMessageInput(e.target.value)}
                    onKeyDown={handleKeyPress}
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
                    disabled={!messageInput.trim() || sendMessage.isPending}
                  >
                    <SendIcon />
                    {sendMessage.isPending ? 'Sender...' : 'Send'}
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 'var(--ds-spacing-4)', backgroundColor: 'var(--ds-color-neutral-background-subtle)' }}>
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
              <Paragraph style={{ color: 'var(--ds-color-neutral-text-subtle)', margin: 0, textAlign: 'center', maxWidth: '280px' }}>
                {isLoadingConversations ? 'Laster samtaler...' : 'Klikk på en samtale for å svare brukeren'}
              </Paragraph>
            </div>
          )}
        </Card>

        {/* User Info Panel */}
        {selectedConversation && (
          <Card style={{ width: '280px', padding: 0, flexShrink: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            {/* User Header */}
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
                <UserIcon />
              </div>
              <Heading level={3} data-size="sm" style={{ margin: 0 }}>
                {String(selectedConversation.userName || selectedConversation.subject || 'Ukjent bruker')}
              </Heading>
              <Badge 
                data-color={selectedConversation.status === 'active' ? 'success' : 'neutral'} 
                data-size="sm"
                style={{ marginTop: 'var(--ds-spacing-2)' }}
              >
                {selectedConversation.status === 'active' ? 'Aktiv bruker' : 'Inaktiv'}
              </Badge>
            </div>

            {/* Details */}
            <div style={{ padding: 'var(--ds-spacing-4)', flex: 1, overflow: 'auto' }}>
              {/* User Info */}
              <div style={{ marginBottom: 'var(--ds-spacing-5)' }}>
                <Paragraph data-size="xs" style={{ 
                  margin: 0, 
                  marginBottom: 'var(--ds-spacing-2)', 
                  fontWeight: 'var(--ds-font-weight-semibold)', 
                  color: 'var(--ds-color-neutral-text-subtle)',
                  textTransform: 'uppercase',
                  letterSpacing: 'var(--ds-font-letter-spacing-sm)',
                }}>
                  Brukerinformasjon
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
                      {String(selectedConversation.userEmail || 'Ikke oppgitt')}
                    </Paragraph>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--ds-spacing-2)' }}>
                    <PhoneIcon style={{ color: 'var(--ds-color-neutral-text-subtle)', flexShrink: 0 }} />
                    <Paragraph data-size="xs" style={{ margin: 0, color: 'var(--ds-color-neutral-text-default)' }}>
                      {String(selectedConversation.userPhone || 'Ikke oppgitt')}
                    </Paragraph>
                  </div>
                </div>
              </div>

              {/* Related Booking */}
              {selectedConversation.bookingId && (
                <div style={{ marginBottom: 'var(--ds-spacing-5)' }}>
                  <Paragraph data-size="xs" style={{ 
                    margin: 0, 
                    marginBottom: 'var(--ds-spacing-2)', 
                    fontWeight: 'var(--ds-font-weight-semibold)', 
                    color: 'var(--ds-color-neutral-text-subtle)',
                    textTransform: 'uppercase',
                    letterSpacing: 'var(--ds-font-letter-spacing-sm)',
                  }}>
                    Tilknyttet booking
                  </Paragraph>
                  <div style={{ 
                    padding: 'var(--ds-spacing-3)',
                    backgroundColor: 'var(--ds-color-neutral-background-subtle)',
                    borderRadius: 'var(--ds-border-radius-md)',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--ds-spacing-2)' }}>
                      <CalendarIcon style={{ color: 'var(--ds-color-neutral-text-subtle)', flexShrink: 0 }} />
                      <Paragraph data-size="xs" style={{ margin: 0, color: 'var(--ds-color-neutral-text-default)' }}>
                        {String(selectedConversation.bookingId)}
                      </Paragraph>
                    </div>
                  </div>
                </div>
              )}

              {/* Assignment */}
              <div style={{ marginBottom: 'var(--ds-spacing-5)' }}>
                <Paragraph data-size="xs" style={{
                  margin: 0,
                  marginBottom: 'var(--ds-spacing-2)',
                  fontWeight: 'var(--ds-font-weight-semibold)',
                  color: 'var(--ds-color-neutral-text-subtle)',
                  textTransform: 'uppercase',
                  letterSpacing: 'var(--ds-font-letter-spacing-sm)',
                }}>
                  Tildeling
                </Paragraph>
                <Select
                  value={selectedConversation.assignedTo || ''}
                  onChange={(e) => handleAssign(e.target.value)}
                  style={{ width: '100%' }}
                >
                  <option value="">Ikke tildelt</option>
                  {saksbehandlere.map(user => (
                    <option key={user.id} value={user.id}>
                      {user.name}
                    </option>
                  ))}
                </Select>
              </div>

              {/* Quick Actions */}
              <div>
                <Paragraph data-size="xs" style={{
                  margin: 0,
                  marginBottom: 'var(--ds-spacing-2)',
                  fontWeight: 'var(--ds-font-weight-semibold)',
                  color: 'var(--ds-color-neutral-text-subtle)',
                  textTransform: 'uppercase',
                  letterSpacing: 'var(--ds-font-letter-spacing-sm)',
                }}>
                  Handlinger
                </Paragraph>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ds-spacing-2)' }}>
                  <Button type="button" variant="secondary" data-data-size="sm" style={{ width: '100%', justifyContent: 'flex-start' }}>
                    <CalendarIcon />
                    Se booking
                  </Button>
                  <Button
                    type="button"
                    variant={selectedConversation.status === 'active' ? 'secondary' : 'primary'}
                    data-size="sm"
                    style={{ width: '100%', justifyContent: 'flex-start' }}
                    onClick={handleResolveToggle}
                    disabled={resolveConversation.isPending || reopenConversation.isPending}
                  >
                    <CheckCircleIcon />
                    {selectedConversation.status === 'active' ? 'Marker som løst' : 'Gjenåpne'}
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
