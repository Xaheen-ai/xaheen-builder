/**
 * Audit Provider Adapter
 *
 * Interface and implementation for audit logging.
 * All user actions (favorites, share, booking, contact) must be logged.
 * Uses @xaheen/sdk auditService for proper API integration.
 */

import { auditService } from '@xaheen/sdk';
import type { AuditEvent, AuditEventType } from '../types';

// =============================================================================
// Adapter Interface
// =============================================================================

export interface AuditProvider {
  /**
   * Log an audit event
   */
  log(event: Omit<AuditEvent, 'timestamp' | 'correlationId'>): Promise<void>;

  /**
   * Generate a correlation ID for tracking related events
   */
  generateCorrelationId(): string;
}

// =============================================================================
// Default Implementation
// =============================================================================

/**
 * Generate a UUID v4 for correlation tracking
 */
function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/**
 * SDK-based audit provider
 * Sends audit events through the @xaheen/sdk auditService
 */
class SdkAuditProvider implements AuditProvider {
  async log(event: Omit<AuditEvent, 'timestamp' | 'correlationId'>): Promise<void> {
    try {
      await auditService.create({
        action: event.type,
        resource: 'listing',
        resourceId: event.listingId,
        severity: 'info',
        userId: event.userId,
        metadata: {
          ...event.metadata,
          correlationId: this.generateCorrelationId(),
        },
      });
    } catch {
      // Silently fail audit logging to not disrupt user experience
      // The SDK will handle retries and error reporting internally
    }
  }

  generateCorrelationId(): string {
    return generateUUID();
  }
}

// =============================================================================
// Singleton Instance
// =============================================================================

let auditProviderInstance: AuditProvider | null = null;

export function getAuditProvider(): AuditProvider {
  if (!auditProviderInstance) {
    auditProviderInstance = new SdkAuditProvider();
  }
  return auditProviderInstance;
}

export function setAuditProvider(provider: AuditProvider): void {
  auditProviderInstance = provider;
}

// =============================================================================
// Convenience Functions
// =============================================================================

export async function logAuditEvent(
  type: AuditEventType,
  tenantId: string,
  listingId: string,
  userId?: string,
  metadata?: Record<string, unknown>
): Promise<void> {
  const provider = getAuditProvider();
  const event: Omit<AuditEvent, 'timestamp' | 'correlationId'> = {
    type,
    tenantId,
    listingId,
  };
  if (userId) {
    event.userId = userId;
  }
  if (metadata) {
    event.metadata = metadata;
  }
  await provider.log(event);
}

/**
 * Log an error event through the audit system
 */
export async function logError(
  action: string,
  resource: string,
  error: Error | string,
  metadata?: Record<string, unknown>
): Promise<void> {
  try {
    await auditService.logError(action, resource, error, metadata);
  } catch {
    // Silently fail to not disrupt user experience
  }
}

/**
 * Log a warning event through the audit system
 */
export async function logWarning(
  action: string,
  resource: string,
  message: string,
  metadata?: Record<string, unknown>
): Promise<void> {
  try {
    await auditService.logWarning(action, resource, message, metadata);
  } catch {
    // Silently fail to not disrupt user experience
  }
}

export { generateUUID };
