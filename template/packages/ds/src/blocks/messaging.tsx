/**
 * Messaging Components
 * Reusable components for chat/messaging functionality
 */

import { useState, useRef, useEffect, type ReactNode, type KeyboardEvent } from 'react';
import { Button, Paragraph, Spinner } from '@digdir/designsystemet-react';

// =============================================================================
// Types
// =============================================================================

export interface ConversationItem {
  id: string;
  userName?: string;
  userAvatar?: string;
  subject?: string;
  lastMessage?: string;
  lastMessageTime?: string;
  unreadCount?: number;
  status?: 'active' | 'resolved' | 'pending';
  isOnline?: boolean;
  bookingId?: string;
}

export interface MessageItem {
  id: string;
  content: string;
  senderId: string;
  senderName?: string;
  createdAt: string;
  isRead?: boolean;
  isFromCurrentUser?: boolean;
}

// =============================================================================
// Icons (inline SVG)
// =============================================================================

function BellIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.73 21a2 2 0 0 1-3.46 0" />
    </svg>
  );
}

function SendIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="22" y1="2" x2="11" y2="13" />
      <polygon points="22 2 15 22 11 13 2 9 22 2" />
    </svg>
  );
}

function SearchIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  );
}

function CheckIcon({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

function DoubleCheckIcon({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polyline points="18 6 9 17 4 12" />
      <polyline points="22 6 13 17" />
    </svg>
  );
}

// =============================================================================
// NotificationBell
// =============================================================================

export interface NotificationBellProps {
  count?: number;
  onClick?: () => void;
  maxCount?: number;
}

/**
 * Notification bell with badge count
 */
export function NotificationBell({ count = 0, onClick, maxCount = 99 }: NotificationBellProps) {
  const displayCount = count > maxCount ? `${maxCount}+` : count;
  
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '40px',
        height: '40px',
        borderRadius: 'var(--ds-border-radius-md)',
        border: 'none',
        background: 'transparent',
        cursor: 'pointer',
        color: 'var(--ds-color-neutral-text-default)',
        transition: 'background-color 0.2s',
      }}
      aria-label={`Varsler (${count} uleste)`}
    >
      <BellIcon size={22} />
      {count > 0 && (
        <span
          style={{
            position: 'absolute',
            top: '4px',
            right: '4px',
            minWidth: '18px',
            height: '18px',
            padding: '0 5px',
            borderRadius: 'var(--ds-border-radius-full)',
            backgroundColor: 'var(--ds-color-danger-base-default)',
            color: 'white',
            fontSize: '11px',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {displayCount}
        </span>
      )}
    </button>
  );
}

// =============================================================================
// ConversationListItem
// =============================================================================

export interface ConversationListItemProps {
  conversation: ConversationItem;
  isSelected?: boolean;
  onClick?: () => void;
  formatTimeAgo?: (date: string) => string;
}

/**
 * Single conversation item in the list
 */
export function ConversationListItem({
  conversation,
  isSelected,
  onClick,
  formatTimeAgo = defaultFormatTimeAgo,
}: ConversationListItemProps) {
  const hasUnread = (conversation.unreadCount ?? 0) > 0;
  
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--ds-spacing-3)',
        padding: 'var(--ds-spacing-3) var(--ds-spacing-4)',
        width: '100%',
        border: 'none',
        background: isSelected 
          ? 'var(--ds-color-accent-surface-default)' 
          : 'transparent',
        cursor: 'pointer',
        textAlign: 'left',
        borderLeft: isSelected 
          ? '3px solid var(--ds-color-accent-base-default)' 
          : '3px solid transparent',
        transition: 'background-color 0.2s',
      }}
    >
      {/* Avatar */}
      <div style={{ position: 'relative', flexShrink: 0 }}>
        <div
          style={{
            width: '44px',
            height: '44px',
            borderRadius: 'var(--ds-border-radius-full)',
            backgroundColor: 'var(--ds-color-accent-surface-default)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--ds-color-accent-base-default)',
            fontWeight: 600,
            fontSize: 'var(--ds-font-size-md)',
          }}
        >
          {conversation.userAvatar || getInitials(conversation.userName)}
        </div>
        {conversation.isOnline && (
          <span
            style={{
              position: 'absolute',
              bottom: '2px',
              right: '2px',
              width: '10px',
              height: '10px',
              borderRadius: 'var(--ds-border-radius-full)',
              backgroundColor: 'var(--ds-color-success-base-default)',
              border: '2px solid var(--ds-color-neutral-background-default)',
            }}
          />
        )}
      </div>

      {/* Content */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span
            style={{
              fontWeight: hasUnread ? 600 : 500,
              color: 'var(--ds-color-neutral-text-default)',
              fontSize: 'var(--ds-font-size-sm)',
            }}
          >
            {conversation.userName || 'Ukjent'}
          </span>
          <span
            style={{
              fontSize: 'var(--ds-font-size-xs)',
              color: 'var(--ds-color-neutral-text-subtle)',
            }}
          >
            {conversation.lastMessageTime ? formatTimeAgo(conversation.lastMessageTime) : ''}
          </span>
        </div>
        <div
          style={{
            fontSize: 'var(--ds-font-size-xs)',
            color: hasUnread 
              ? 'var(--ds-color-neutral-text-default)' 
              : 'var(--ds-color-neutral-text-subtle)',
            fontWeight: hasUnread ? 500 : 400,
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            marginTop: '2px',
          }}
        >
          {conversation.lastMessage || conversation.subject || 'Ingen meldinger'}
        </div>
      </div>

      {/* Unread badge */}
      {hasUnread && (
        <span
          style={{
            minWidth: '20px',
            height: '20px',
            borderRadius: 'var(--ds-border-radius-full)',
            backgroundColor: 'var(--ds-color-accent-base-default)',
            color: 'white',
            fontSize: '11px',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '0 6px',
          }}
        >
          {conversation.unreadCount}
        </span>
      )}
    </button>
  );
}

// =============================================================================
// ConversationList
// =============================================================================

export interface ConversationListProps {
  conversations: ConversationItem[];
  selectedId?: string | null;
  onSelect?: (id: string) => void;
  isLoading?: boolean;
  searchPlaceholder?: string;
  emptyMessage?: string;
  formatTimeAgo?: (date: string) => string;
  filterTabs?: { id: string; label: string; count?: number }[];
  activeFilter?: string;
  onFilterChange?: (filterId: string) => void;
}

/**
 * List of conversations with search and filters
 */
export function ConversationList({
  conversations,
  selectedId,
  onSelect,
  isLoading,
  searchPlaceholder = 'Søk i samtaler...',
  emptyMessage = 'Ingen samtaler',
  formatTimeAgo = defaultFormatTimeAgo,
  filterTabs,
  activeFilter,
  onFilterChange,
}: ConversationListProps) {
  const [searchQuery, setSearchQuery] = useState('');
  
  const filteredConversations = searchQuery
    ? conversations.filter(c =>
        c.userName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.subject?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : conversations;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Search */}
      <div style={{ padding: 'var(--ds-spacing-4)', borderBottom: '1px solid var(--ds-color-neutral-border-subtle)' }}>
        <div
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
          <SearchIcon size={16} />
          <input
            type="text"
            placeholder={searchPlaceholder}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              flex: 1,
              border: 'none',
              background: 'none',
              outline: 'none',
              fontSize: 'var(--ds-font-size-sm)',
              color: 'var(--ds-color-neutral-text-default)',
            }}
          />
        </div>
      </div>

      {/* Filter tabs */}
      {filterTabs && filterTabs.length > 0 && (
        <div
          style={{
            display: 'flex',
            gap: 'var(--ds-spacing-2)',
            padding: 'var(--ds-spacing-3) var(--ds-spacing-4)',
            borderBottom: '1px solid var(--ds-color-neutral-border-subtle)',
            overflowX: 'auto',
          }}
        >
          {filterTabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => onFilterChange?.(tab.id)}
              style={{
                padding: 'var(--ds-spacing-1) var(--ds-spacing-3)',
                borderRadius: 'var(--ds-border-radius-full)',
                border: 'none',
                fontSize: 'var(--ds-font-size-xs)',
                fontWeight: 500,
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                backgroundColor: activeFilter === tab.id
                  ? 'var(--ds-color-accent-base-default)'
                  : 'var(--ds-color-neutral-surface-default)',
                color: activeFilter === tab.id
                  ? 'white'
                  : 'var(--ds-color-neutral-text-default)',
              }}
            >
              {tab.label}
              {tab.count !== undefined && tab.count > 0 && (
                <span style={{ marginLeft: '4px', opacity: 0.8 }}>({tab.count})</span>
              )}
            </button>
          ))}
        </div>
      )}

      {/* Conversation list */}
      <div style={{ flex: 1, overflowY: 'auto' }}>
        {isLoading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: 'var(--ds-spacing-8)' }}>
            <Spinner aria-label="Laster samtaler..." />
          </div>
        ) : filteredConversations.length === 0 ? (
          <div style={{ padding: 'var(--ds-spacing-8)', textAlign: 'center' }}>
            <Paragraph style={{ color: 'var(--ds-color-neutral-text-subtle)', margin: 0 }}>
              {emptyMessage}
            </Paragraph>
          </div>
        ) : (
          filteredConversations.map((conversation) => (
            <ConversationListItem
              key={conversation.id}
              conversation={conversation}
              isSelected={selectedId === conversation.id}
              onClick={() => onSelect?.(conversation.id)}
              formatTimeAgo={formatTimeAgo}
            />
          ))
        )}
      </div>
    </div>
  );
}

// =============================================================================
// MessageBubble
// =============================================================================

export interface MessageBubbleProps {
  message: MessageItem;
  isFromCurrentUser?: boolean;
  showReadReceipt?: boolean;
}

/**
 * Single message bubble
 */
export function MessageBubble({ message, isFromCurrentUser, showReadReceipt }: MessageBubbleProps) {
  const fromMe = isFromCurrentUser ?? message.isFromCurrentUser;
  
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: fromMe ? 'flex-end' : 'flex-start',
        marginBottom: 'var(--ds-spacing-2)',
      }}
    >
      <div
        style={{
          maxWidth: '70%',
          padding: 'var(--ds-spacing-3) var(--ds-spacing-4)',
          borderRadius: fromMe
            ? 'var(--ds-border-radius-lg) var(--ds-border-radius-lg) var(--ds-border-radius-sm) var(--ds-border-radius-lg)'
            : 'var(--ds-border-radius-lg) var(--ds-border-radius-lg) var(--ds-border-radius-lg) var(--ds-border-radius-sm)',
          backgroundColor: fromMe
            ? 'var(--ds-color-accent-base-default)'
            : 'var(--ds-color-neutral-surface-default)',
          color: fromMe ? 'white' : 'var(--ds-color-neutral-text-default)',
        }}
      >
        <Paragraph data-size="sm" style={{ margin: 0, whiteSpace: 'pre-wrap' }}>
          {message.content}
        </Paragraph>
        <div
          style={{
            display: 'flex',
            justifyContent: 'flex-end',
            alignItems: 'center',
            gap: '4px',
            marginTop: 'var(--ds-spacing-1)',
          }}
        >
          <span
            style={{
              fontSize: '10px',
              opacity: 0.7,
            }}
          >
            {formatMessageTime(message.createdAt)}
          </span>
          {showReadReceipt && fromMe && (
            <span style={{ opacity: 0.7 }}>
              {message.isRead ? <DoubleCheckIcon /> : <CheckIcon />}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

// =============================================================================
// ChatThread
// =============================================================================

export interface ChatThreadProps {
  messages: MessageItem[];
  currentUserId?: string;
  isLoading?: boolean;
  onSendMessage?: (content: string) => void;
  isSending?: boolean;
  placeholder?: string;
  emptyMessage?: string;
  showDateSeparators?: boolean;
  showReadReceipts?: boolean;
  header?: ReactNode;
}

/**
 * Complete chat thread with messages and input
 */
export function ChatThread({
  messages,
  currentUserId,
  isLoading,
  onSendMessage,
  isSending,
  placeholder = 'Skriv en melding...',
  emptyMessage = 'Ingen meldinger ennå',
  showDateSeparators = true,
  showReadReceipts = true,
  header,
}: ChatThreadProps) {
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = () => {
    if (inputValue.trim() && onSendMessage) {
      onSendMessage(inputValue.trim());
      setInputValue('');
      inputRef.current?.focus();
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Group messages by date
  const groupedMessages = showDateSeparators ? groupMessagesByDate(messages) : { today: messages };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Header */}
      {header && (
        <div style={{ borderBottom: '1px solid var(--ds-color-neutral-border-subtle)' }}>
          {header}
        </div>
      )}

      {/* Messages */}
      <div style={{ flex: 1, overflowY: 'auto', padding: 'var(--ds-spacing-4)' }}>
        {isLoading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: 'var(--ds-spacing-8)' }}>
            <Spinner aria-label="Laster meldinger..." />
          </div>
        ) : messages.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 'var(--ds-spacing-8)' }}>
            <Paragraph style={{ color: 'var(--ds-color-neutral-text-subtle)', margin: 0 }}>
              {emptyMessage}
            </Paragraph>
          </div>
        ) : (
          Object.entries(groupedMessages).map(([date, msgs]) => (
            <div key={date}>
              {showDateSeparators && (
                <div
                  style={{
                    textAlign: 'center',
                    margin: 'var(--ds-spacing-4) 0',
                  }}
                >
                  <span
                    style={{
                      padding: 'var(--ds-spacing-1) var(--ds-spacing-3)',
                      backgroundColor: 'var(--ds-color-neutral-surface-default)',
                      borderRadius: 'var(--ds-border-radius-full)',
                      fontSize: 'var(--ds-font-size-xs)',
                      color: 'var(--ds-color-neutral-text-subtle)',
                    }}
                  >
                    {date}
                  </span>
                </div>
              )}
              {msgs.map((message) => (
                <MessageBubble
                  key={message.id}
                  message={message}
                  {...(currentUserId && { isFromCurrentUser: message.senderId === currentUserId })}
                  showReadReceipt={showReadReceipts}
                />
              ))}
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      {onSendMessage && (
        <div
          style={{
            padding: 'var(--ds-spacing-4)',
            borderTop: '1px solid var(--ds-color-neutral-border-subtle)',
            backgroundColor: 'var(--ds-color-neutral-background-subtle)',
          }}
        >
          <div
            style={{
              display: 'flex',
              gap: 'var(--ds-spacing-2)',
              alignItems: 'center',
            }}
          >
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={placeholder}
              disabled={isSending}
              style={{
                flex: 1,
                padding: 'var(--ds-spacing-3)',
                borderRadius: 'var(--ds-border-radius-md)',
                border: '1px solid var(--ds-color-neutral-border-default)',
                fontSize: 'var(--ds-font-size-sm)',
                outline: 'none',
              }}
            />
            <Button
              type="button"
              variant="primary"
              onClick={handleSend}
              disabled={!inputValue.trim() || isSending}
              aria-label="Send melding"
            >
              <SendIcon size={18} />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

// =============================================================================
// Helpers
// =============================================================================

function getInitials(name?: string): string {
  if (!name) return '?';
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

function defaultFormatTimeAgo(dateStr: string): string {
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

function formatMessageTime(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleTimeString('nb-NO', { hour: '2-digit', minute: '2-digit' });
}

function groupMessagesByDate(messages: MessageItem[]): Record<string, MessageItem[]> {
  const groups: Record<string, MessageItem[]> = {};
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  messages.forEach((message) => {
    const date = new Date(message.createdAt);
    let key: string;

    if (date.toDateString() === today.toDateString()) {
      key = 'I dag';
    } else if (date.toDateString() === yesterday.toDateString()) {
      key = 'I går';
    } else {
      key = date.toLocaleDateString('nb-NO', { weekday: 'long', day: 'numeric', month: 'long' });
    }

    if (!groups[key]) groups[key] = [];
    groups[key]!.push(message);
  });

  return groups;
}
