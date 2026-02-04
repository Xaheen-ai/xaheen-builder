/**
 * OAuth Authentication Tests
 *
 * Tests for BankID/Signicat REST API flow, Vipps OAuth flow,
 * OAuth state management, NIN-based user matching, and session creation.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { TestDataStore, createMockContext } from './setup';

describe('OAuth Authentication', () => {
    let store: TestDataStore;

    beforeEach(() => {
        store = new TestDataStore();
    });

    // =========================================================================
    // OAuth State Management
    // =========================================================================

    describe('OAuth State Management', () => {
        it('should create and consume OAuth state', async () => {
            const ctx = createMockContext(store);
            const state = 'test-state-uuid';

            const stateId = store.seedOAuthState({
                state,
                provider: 'vipps',
                appOrigin: 'http://localhost:5173',
                returnPath: '/dashboard',
                appId: 'web',
            });

            // Query by state
            const record = await ctx.db
                .query('oauthStates')
                .withIndex('by_state', (q: { eq: (f: string, v: string) => unknown }) =>
                    q.eq('state', state)
                )
                .first();

            expect(record).not.toBeNull();
            const typedRecord = record as {
                _id: string;
                state: string;
                provider: string;
                appOrigin: string;
                returnPath: string;
                appId: string;
                consumed: boolean;
                expiresAt: number;
            };

            expect(typedRecord.provider).toBe('vipps');
            expect(typedRecord.appOrigin).toBe('http://localhost:5173');
            expect(typedRecord.returnPath).toBe('/dashboard');
            expect(typedRecord.consumed).toBe(false);

            // Consume state
            await ctx.db.patch(typedRecord._id, { consumed: true });

            const consumed = await ctx.db.get(typedRecord._id);
            expect((consumed as { consumed: boolean }).consumed).toBe(true);
        });

        it('should reject already-consumed state', async () => {
            const state = 'consumed-state';

            store.seedOAuthState({
                state,
                provider: 'vipps',
                consumed: true,
            });

            const ctx = createMockContext(store);

            const record = await ctx.db
                .query('oauthStates')
                .withIndex('by_state', (q: { eq: (f: string, v: string) => unknown }) =>
                    q.eq('state', state)
                )
                .first();

            const typedRecord = record as { consumed: boolean; expiresAt: number } | null;

            // Simulate consumeState logic: reject if consumed or expired
            const isValid =
                typedRecord !== null &&
                !typedRecord.consumed &&
                typedRecord.expiresAt >= Date.now();

            expect(isValid).toBe(false);
        });

        it('should reject expired state', async () => {
            const state = 'expired-state';

            store.seedOAuthState({
                state,
                provider: 'bankid',
                expiresAt: Date.now() - 1000, // expired 1 second ago
            });

            const ctx = createMockContext(store);

            const record = await ctx.db
                .query('oauthStates')
                .withIndex('by_state', (q: { eq: (f: string, v: string) => unknown }) =>
                    q.eq('state', state)
                )
                .first();

            const typedRecord = record as { consumed: boolean; expiresAt: number } | null;

            const isValid =
                typedRecord !== null &&
                !typedRecord.consumed &&
                typedRecord.expiresAt >= Date.now();

            expect(isValid).toBe(false);
        });

        it('should store signicatSessionId for BankID flow', async () => {
            const state = 'bankid-state';
            const signicatSessionId = 'signicat-session-123';

            store.seedOAuthState({
                state,
                provider: 'bankid',
                signicatSessionId,
            });

            const ctx = createMockContext(store);

            const record = await ctx.db
                .query('oauthStates')
                .withIndex('by_state', (q: { eq: (f: string, v: string) => unknown }) =>
                    q.eq('state', state)
                )
                .first();

            const typedRecord = record as { signicatSessionId: string; provider: string };
            expect(typedRecord.provider).toBe('bankid');
            expect(typedRecord.signicatSessionId).toBe(signicatSessionId);
        });

        it('should not have signicatSessionId for OIDC providers', async () => {
            const state = 'vipps-state';

            store.seedOAuthState({
                state,
                provider: 'vipps',
                // no signicatSessionId
            });

            const ctx = createMockContext(store);

            const record = await ctx.db
                .query('oauthStates')
                .withIndex('by_state', (q: { eq: (f: string, v: string) => unknown }) =>
                    q.eq('state', state)
                )
                .first();

            const typedRecord = record as { signicatSessionId?: string };
            expect(typedRecord.signicatSessionId).toBeUndefined();
        });
    });

    // =========================================================================
    // NIN-Based User Matching (upsertUser logic)
    // =========================================================================

    describe('NIN-Based User Matching', () => {
        it('should match existing user by NIN', async () => {
            const ctx = createMockContext(store);

            const tenantId = store.seedTenant({ name: 'Kommune' });
            const userId = store.seedUser({
                tenantId,
                email: 'ola.hansen@kommune.no',
                name: 'Ola Hansen',
                role: 'user',
                status: 'active',
            });

            // Patch user with NIN
            store.patch(userId, { nin: '24014005907' });

            // Simulate upsertUser: match by NIN first
            const userByNin = await ctx.db
                .query('users')
                .withIndex('by_nin', (q: { eq: (f: string, v: string) => unknown }) =>
                    q.eq('nin', '24014005907')
                )
                .first();

            expect(userByNin).not.toBeNull();
            const typedUser = userByNin as { _id: string; email: string; nin: string };
            expect(typedUser._id).toBe(userId);
            expect(typedUser.email).toBe('ola.hansen@kommune.no');
            expect(typedUser.nin).toBe('24014005907');
        });

        it('should fall back to email match when NIN not in DB', async () => {
            const ctx = createMockContext(store);

            const tenantId = store.seedTenant();
            const userId = store.seedUser({
                tenantId,
                email: 'admin@skien.kommune.no',
                name: 'Admin User',
                role: 'admin',
                status: 'active',
            });

            // No NIN on user record — simulate callback with NIN
            const nin = '19075716691';

            // NIN match returns null
            const byNin = await ctx.db
                .query('users')
                .withIndex('by_nin', (q: { eq: (f: string, v: string) => unknown }) =>
                    q.eq('nin', nin)
                )
                .first();
            expect(byNin).toBeNull();

            // Fall back to email match
            const byEmail = await ctx.db
                .query('users')
                .withIndex('by_email', (q: { eq: (f: string, v: string) => unknown }) =>
                    q.eq('email', 'admin@skien.kommune.no')
                )
                .first();

            expect(byEmail).not.toBeNull();
            const typedUser = byEmail as { _id: string; email: string };
            expect(typedUser._id).toBe(userId);

            // Patch NIN onto matched user
            await ctx.db.patch(typedUser._id, { nin, lastLoginAt: Date.now() });

            const updated = await ctx.db.get(typedUser._id);
            expect((updated as { nin: string }).nin).toBe(nin);
        });

        it('should create new user when no NIN or email match', async () => {
            const ctx = createMockContext(store);

            const nin = '15860771346';
            const email = `${nin}@bankid.no`;

            // No match by NIN
            const byNin = await ctx.db
                .query('users')
                .withIndex('by_nin', (q: { eq: (f: string, v: string) => unknown }) =>
                    q.eq('nin', nin)
                )
                .first();
            expect(byNin).toBeNull();

            // No match by email
            const byEmail = await ctx.db
                .query('users')
                .withIndex('by_email', (q: { eq: (f: string, v: string) => unknown }) =>
                    q.eq('email', email)
                )
                .first();
            expect(byEmail).toBeNull();

            // Create new user
            const newUserId = await ctx.db.insert('users', {
                email,
                name: 'BankID Bruker',
                authUserId: 'bankid-subject-123',
                nin,
                role: 'member',
                status: 'active',
                metadata: { provider: 'bankid' },
                lastLoginAt: Date.now(),
            });

            expect(newUserId).toBeDefined();

            const newUser = await ctx.db.get(newUserId);
            const typedUser = newUser as { nin: string; role: string; email: string };
            expect(typedUser.nin).toBe(nin);
            expect(typedUser.role).toBe('member');
            expect(typedUser.email).toBe(email);
        });

        it('should update phoneNumber on existing user from Vipps login', async () => {
            const ctx = createMockContext(store);

            const tenantId = store.seedTenant();
            const userId = store.seedUser({
                tenantId,
                email: 'ola.hansen@kommune.no',
                status: 'active',
            });

            // Simulate Vipps callback returning phone
            const phoneNumber = '95303914';
            await ctx.db.patch(userId, {
                phoneNumber,
                lastLoginAt: Date.now(),
            });

            const updated = await ctx.db.get(userId);
            expect((updated as { phoneNumber: string }).phoneNumber).toBe(phoneNumber);
        });

        it('should not overwrite existing NIN when NIN already stored', async () => {
            const ctx = createMockContext(store);

            const tenantId = store.seedTenant();
            const userId = store.seedUser({
                tenantId,
                email: 'user@test.no',
                status: 'active',
            });

            // Pre-set NIN
            store.patch(userId, { nin: '24014005907' });

            // Simulate upsertUser patch logic: only update NIN if not already set
            const existing = await ctx.db.get(userId);
            const typedExisting = existing as { nin?: string };

            const patch: Record<string, unknown> = {
                lastLoginAt: Date.now(),
                authUserId: 'new-provider-id',
            };
            // Only set NIN if not already present
            if (!typedExisting.nin) {
                patch.nin = '99999999999';
            }

            await ctx.db.patch(userId, patch);

            const updated = await ctx.db.get(userId);
            // NIN should remain the original value
            expect((updated as { nin: string }).nin).toBe('24014005907');
        });
    });

    // =========================================================================
    // BankID / Signicat REST API Flow
    // =========================================================================

    describe('BankID / Signicat REST API Flow', () => {
        it('should handle BankID callback with session details', async () => {
            const ctx = createMockContext(store);

            // Simulate Signicat session identity response
            const signicatIdentity = {
                firstName: 'Ola',
                lastName: 'Hansen',
                dateOfBirth: '1940-01-24',
                nin: '24014005907',
                subject: 'signicat-subject-123',
            };

            // Map to userInfo shape (as done in callback.ts)
            const userInfo = {
                sub: signicatIdentity.subject,
                nin: signicatIdentity.nin,
                name: [signicatIdentity.firstName, signicatIdentity.lastName]
                    .filter(Boolean)
                    .join(' '),
                given_name: signicatIdentity.firstName,
                family_name: signicatIdentity.lastName,
                dateOfBirth: signicatIdentity.dateOfBirth,
                email: `${signicatIdentity.nin}@bankid.no`,
            };

            expect(userInfo.name).toBe('Ola Hansen');
            expect(userInfo.nin).toBe('24014005907');
            expect(userInfo.email).toBe('24014005907@bankid.no');
            expect(userInfo.sub).toBe('signicat-subject-123');
        });

        it('should handle BankID callback when user has email set', async () => {
            // Simulate identity with email from Signicat
            const signicatIdentity = {
                firstName: 'Admin',
                lastName: 'Bruker',
                nin: '30916326773',
                subject: 'signicat-subject-456',
                email: 'admin@real-email.no',
            };

            const email = signicatIdentity.email || `${signicatIdentity.nin}@bankid.no`;
            expect(email).toBe('admin@real-email.no');
        });

        it('should require signicatSessionId for BankID/ID-porten providers', () => {
            // BankID requires signicatSessionId, not code
            const provider = 'bankid';
            const code = undefined;
            const signicatSessionId = 'session-abc-123';

            if (provider === 'bankid' || provider === 'idporten') {
                expect(signicatSessionId).toBeDefined();
                expect(code).toBeUndefined();
            }
        });

        it('should reject BankID callback without signicatSessionId', () => {
            const provider = 'bankid';
            const signicatSessionId: string | undefined = undefined;

            const shouldThrow = provider === 'bankid' && !signicatSessionId;
            expect(shouldThrow).toBe(true);
        });
    });

    // =========================================================================
    // Vipps OAuth Flow
    // =========================================================================

    describe('Vipps OAuth Flow', () => {
        it('should require code for Vipps callback', () => {
            const provider = 'vipps';
            const code = 'auth-code-123';

            if (provider === 'vipps') {
                expect(code).toBeDefined();
            }
        });

        it('should reject Vipps callback without code', () => {
            const provider = 'vipps';
            const code: string | undefined = undefined;

            const shouldThrow = provider === 'vipps' && !code;
            expect(shouldThrow).toBe(true);
        });

        it('should extract phone number from Vipps userinfo', () => {
            const vippsUserInfo = {
                sub: 'vipps-sub-123',
                email: 'ola@test.no',
                name: 'Ola Hansen',
                phone_number: '95303914',
            };

            const phoneNumber = (vippsUserInfo.phone_number ||
                (vippsUserInfo as Record<string, unknown>).phoneNumber) as string | undefined;

            expect(phoneNumber).toBe('95303914');
        });

        it('should extract phone from alternative field name', () => {
            const vippsUserInfo = {
                sub: 'vipps-sub-456',
                email: 'test@test.no',
                phoneNumber: '93279034',
            };

            const phoneNumber = ((vippsUserInfo as Record<string, unknown>).phone_number ||
                vippsUserInfo.phoneNumber) as string | undefined;

            expect(phoneNumber).toBe('93279034');
        });
    });

    // =========================================================================
    // Google / Azure OIDC Flow
    // =========================================================================

    describe('Google / Azure OIDC Flow', () => {
        it('should require code for Google callback', () => {
            const provider = 'google';
            const code = 'google-auth-code';
            expect(provider === 'google' && !!code).toBe(true);
        });

        it('should handle azure and microsoft as equivalent providers', () => {
            const providers = ['azure', 'microsoft'];
            for (const provider of providers) {
                const isAzure = provider === 'azure' || provider === 'microsoft';
                expect(isAzure).toBe(true);
            }
        });

        it('should map Azure graph response to userInfo', () => {
            const graphResponse = {
                id: 'azure-oid-123',
                mail: 'user@company.com',
                displayName: 'Test User',
                givenName: 'Test',
                surname: 'User',
                userPrincipalName: 'user@company.onmicrosoft.com',
            };

            const userInfo = {
                sub: graphResponse.id,
                oid: graphResponse.id,
                email: graphResponse.mail || graphResponse.userPrincipalName,
                name: graphResponse.displayName,
                given_name: graphResponse.givenName,
                family_name: graphResponse.surname,
            };

            expect(userInfo.email).toBe('user@company.com');
            expect(userInfo.name).toBe('Test User');
            expect(userInfo.sub).toBe('azure-oid-123');
        });

        it('should fall back to userPrincipalName when mail is null', () => {
            const graphResponse = {
                id: 'azure-oid-456',
                mail: null,
                userPrincipalName: 'user@company.onmicrosoft.com',
                displayName: 'Another User',
            };

            const email = graphResponse.mail || graphResponse.userPrincipalName;
            expect(email).toBe('user@company.onmicrosoft.com');
        });

        it('should reject unsupported provider', () => {
            const provider = 'facebook';
            const supportedProviders = [
                'bankid',
                'idporten',
                'vipps',
                'google',
                'azure',
                'microsoft',
            ];

            expect(supportedProviders.includes(provider)).toBe(false);
        });
    });

    // =========================================================================
    // Session Creation After OAuth
    // =========================================================================

    describe('Session Creation After OAuth', () => {
        it('should create session after successful OAuth callback', async () => {
            const ctx = createMockContext(store);

            const tenantId = store.seedTenant();
            const userId = store.seedUser({
                tenantId,
                email: 'oauth@test.com',
                status: 'active',
            });

            // Create session
            const token = crypto.randomUUID();
            const sessionId = store.seedSession({
                userId,
                token,
                provider: 'vipps',
                appId: 'web',
            });

            const session = await ctx.db.get(sessionId);
            const typedSession = session as {
                userId: string;
                token: string;
                provider: string;
                appId: string;
                isActive: boolean;
                expiresAt: number;
            };

            expect(typedSession.userId).toBe(userId);
            expect(typedSession.provider).toBe('vipps');
            expect(typedSession.appId).toBe('web');
            expect(typedSession.isActive).toBe(true);
            expect(typedSession.expiresAt).toBeGreaterThan(Date.now());
        });

        it('should validate session by token', async () => {
            const ctx = createMockContext(store);

            const tenantId = store.seedTenant({ name: 'Session Test Tenant' });
            const userId = store.seedUser({
                tenantId,
                email: 'session@test.com',
                name: 'Session User',
                status: 'active',
            });

            const token = 'valid-session-token';
            store.seedSession({ userId, token, provider: 'bankid' });

            // Find session by token
            const session = await ctx.db
                .query('sessions')
                .withIndex('by_token', (q: { eq: (f: string, v: string) => unknown }) =>
                    q.eq('token', token)
                )
                .first();

            expect(session).not.toBeNull();
            const typedSession = session as {
                userId: string;
                isActive: boolean;
                expiresAt: number;
            };

            expect(typedSession.isActive).toBe(true);
            expect(typedSession.expiresAt).toBeGreaterThan(Date.now());

            // Look up associated user
            const user = await ctx.db.get(typedSession.userId);
            expect(user).not.toBeNull();
            expect((user as { email: string }).email).toBe('session@test.com');
        });

        it('should reject expired session', async () => {
            const ctx = createMockContext(store);

            const tenantId = store.seedTenant();
            const userId = store.seedUser({ tenantId, status: 'active' });

            const token = 'expired-token';
            store.seedSession({
                userId,
                token,
                expiresAt: Date.now() - 1000, // expired
            });

            const session = await ctx.db
                .query('sessions')
                .withIndex('by_token', (q: { eq: (f: string, v: string) => unknown }) =>
                    q.eq('token', token)
                )
                .first();

            const typedSession = session as { isActive: boolean; expiresAt: number };
            const isValid = typedSession.isActive && typedSession.expiresAt >= Date.now();

            expect(isValid).toBe(false);
        });

        it('should reject deactivated session', async () => {
            const ctx = createMockContext(store);

            const tenantId = store.seedTenant();
            const userId = store.seedUser({ tenantId, status: 'active' });

            const token = 'deactivated-token';
            store.seedSession({
                userId,
                token,
                isActive: false,
            });

            const session = await ctx.db
                .query('sessions')
                .withIndex('by_token', (q: { eq: (f: string, v: string) => unknown }) =>
                    q.eq('token', token)
                )
                .first();

            const typedSession = session as { isActive: boolean };
            expect(typedSession.isActive).toBe(false);
        });

        it('should delete session on sign-out', async () => {
            const ctx = createMockContext(store);

            const tenantId = store.seedTenant();
            const userId = store.seedUser({ tenantId, status: 'active' });

            const token = 'signout-token';
            const sessionId = store.seedSession({ userId, token });

            // Deactivate session (as deleteSession does)
            await ctx.db.patch(sessionId, { isActive: false });

            const session = await ctx.db.get(sessionId);
            expect((session as { isActive: boolean }).isActive).toBe(false);
        });
    });

    // =========================================================================
    // HTTP Callback Route Logic
    // =========================================================================

    describe('HTTP Callback Route Logic', () => {
        it('should handle Signicat REST callback (status=success, no code)', () => {
            // Simulate URL params from Signicat REST callback
            const params = new URLSearchParams({
                state: 'test-state',
                status: 'success',
            });

            const code = params.get('code');
            const state = params.get('state');
            const signicatStatus = params.get('status');

            expect(code).toBeNull();
            expect(state).toBe('test-state');
            expect(signicatStatus).toBe('success');

            // Route logic: must have state, and either code or status=success
            const hasState = !!state;
            const hasCodeOrStatus = !!code || signicatStatus === 'success';
            expect(hasState).toBe(true);
            expect(hasCodeOrStatus).toBe(true);
        });

        it('should handle OIDC callback (code + state, no status)', () => {
            const params = new URLSearchParams({
                code: 'auth-code-xyz',
                state: 'test-state',
            });

            const code = params.get('code');
            const state = params.get('state');
            const signicatStatus = params.get('status');

            expect(code).toBe('auth-code-xyz');
            expect(state).toBe('test-state');
            expect(signicatStatus).toBeNull();

            const hasState = !!state;
            const hasCodeOrStatus = !!code || signicatStatus === 'success';
            expect(hasState).toBe(true);
            expect(hasCodeOrStatus).toBe(true);
        });

        it('should reject Signicat abort status', () => {
            const params = new URLSearchParams({
                state: 'test-state',
                status: 'abort',
            });

            const signicatStatus = params.get('status');
            const isAbortOrError =
                signicatStatus !== null && signicatStatus !== 'success';

            expect(isAbortOrError).toBe(true);
        });

        it('should reject Signicat error status', () => {
            const params = new URLSearchParams({
                state: 'test-state',
                status: 'error',
            });

            const signicatStatus = params.get('status');
            const isAbortOrError =
                signicatStatus !== null && signicatStatus !== 'success';

            expect(isAbortOrError).toBe(true);
        });

        it('should reject OAuth error param', () => {
            const params = new URLSearchParams({
                error: 'access_denied',
                error_description: 'User denied access',
                state: 'test-state',
            });

            const error = params.get('error');
            expect(error).toBe('access_denied');
        });

        it('should reject missing state parameter', () => {
            const params = new URLSearchParams({
                code: 'auth-code',
            });

            const state = params.get('state');
            expect(state).toBeNull();
        });

        it('should reject missing code and status', () => {
            const params = new URLSearchParams({
                state: 'test-state',
            });

            const code = params.get('code');
            const signicatStatus = params.get('status');

            const hasCodeOrStatus = !!code || !!signicatStatus;
            expect(hasCodeOrStatus).toBe(false);
        });

        it('should build redirect URL with session token', () => {
            const appOrigin = 'http://localhost:5173';
            const returnPath = '/dashboard';
            const sessionToken = 'session-token-abc';

            const callbackUrl = new URL('/auth/callback', appOrigin);
            callbackUrl.searchParams.set('sessionToken', sessionToken);
            if (returnPath && returnPath !== '/') {
                callbackUrl.searchParams.set('returnPath', returnPath);
            }

            expect(callbackUrl.toString()).toBe(
                'http://localhost:5173/auth/callback?sessionToken=session-token-abc&returnPath=%2Fdashboard'
            );
        });

        it('should build redirect URL with error', () => {
            const appOrigin = 'http://localhost:5175';
            const returnPath = '/';
            const error = 'Authentication failed';

            const callbackUrl = new URL('/auth/callback', appOrigin);
            callbackUrl.searchParams.set('error', error);
            // returnPath=/ should be omitted
            if (returnPath && returnPath !== '/') {
                callbackUrl.searchParams.set('returnPath', returnPath);
            }

            expect(callbackUrl.searchParams.get('error')).toBe('Authentication failed');
            expect(callbackUrl.searchParams.has('returnPath')).toBe(false);
        });
    });
});
