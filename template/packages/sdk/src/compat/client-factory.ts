/**
 * Compatibility shim for @digilist/client-sdk client-factory.
 * Convex uses a provider model, so these are all no-ops.
 */

export interface ApiClientConfig {
  baseUrl?: string;
  tenantId?: string;
  token?: string;
}

let _config: ApiClientConfig = {};
let _initialized = false;

export function initializeClient(config: ApiClientConfig): void {
  _config = config;
  _initialized = true;
}

export function getClient(): ApiClientConfig {
  return _config;
}

export function getClientConfig(): ApiClientConfig {
  return _config;
}

export function updateClientConfig(config: Partial<ApiClientConfig>): void {
  _config = { ..._config, ...config };
}

export function setAuthToken(token: string): void {
  _config.token = token;
}

export function clearAuthToken(): void {
  delete _config.token;
}

export function setTenantId(tenantId: string): void {
  _config.tenantId = tenantId;
}

export function isClientInitialized(): boolean {
  return _initialized;
}

export function createClient(config: ApiClientConfig): ApiClientConfig {
  _config = config;
  _initialized = true;
  return _config;
}

export function resetClient(): void {
  _config = {};
  _initialized = false;
}

export function isUsingMockData(): boolean {
  return false;
}

// ---------------------------------------------------------------------------
// Service stubs (imperative API — digdir apps used these for direct calls)
// ---------------------------------------------------------------------------

/**
 * Stub organization service for components that call organizationService.*
 * directly (e.g. MemberManagement). These will be replaced with Convex
 * mutations once the org management Convex functions are fully wired.
 */
/**
 * Stub audit service for components that call auditService.* directly.
 */
export const auditService = {
  log: async (_event: string, _data?: Record<string, unknown>) => {
    console.warn('[auditService.log] stub — wire to Convex mutation');
  },
  track: async (_event: string, _data?: Record<string, unknown>) => {
    console.warn('[auditService.track] stub — wire to Convex mutation');
  },
  create: async (_event: string, _data?: Record<string, unknown>) => {
    console.warn('[auditService.create] stub — wire to Convex mutation');
  },
  logError: async (_event: string, _category?: string, _error?: unknown, _data?: Record<string, unknown>) => {
    console.warn('[auditService.logError] stub — wire to Convex mutation');
  },
  logWarning: async (_event: string, _category?: string, _data?: Record<string, unknown>) => {
    console.warn('[auditService.logWarning] stub — wire to Convex mutation');
  },
};

/**
 * Stub booking service for components that call bookingService.* directly.
 */
export const bookingService = {
  create: async (_data: Record<string, unknown>) => {
    console.warn('[bookingService.create] stub — wire to Convex mutation');
    return { id: '' };
  },
  cancel: async (_id: string) => {
    console.warn('[bookingService.cancel] stub — wire to Convex mutation');
  },
  confirm: async (_id: string) => {
    console.warn('[bookingService.confirm] stub — wire to Convex mutation');
  },
};

export const organizationService = {
  addMember: async (_orgId: string, _data: { userId: string; role: string }) => {
    console.warn('[organizationService.addMember] stub — wire to Convex mutation');
  },
  removeMember: async (_orgId: string, _memberId: string) => {
    console.warn('[organizationService.removeMember] stub — wire to Convex mutation');
  },
  updateMember: async (_orgId: string, _memberId: string, _data: { role: string }) => {
    console.warn('[organizationService.updateMember] stub — wire to Convex mutation');
  },
};
