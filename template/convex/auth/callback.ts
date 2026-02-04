import { action, internalAction, internalMutation } from "../_generated/server";
import { v } from "convex/values";
import { internal } from "../_generated/api";

/**
 * Handle OAuth callback from external providers.
 * Called by the HTTP router after consuming the oauthState.
 *
 * All providers use standard OIDC: code exchange → token → userinfo.
 */
export const handleCallback = internalAction({
    args: {
        code: v.optional(v.string()),
        state: v.string(),
        provider: v.string(),
        signicatSessionId: v.optional(v.string()),
    },
    handler: async (
        ctx,
        { code, provider, signicatSessionId: codeVerifier }
    ): Promise<{
        success: boolean;
        user: unknown;
        isNewUser: boolean;
    }> => {
        let userInfo: Record<string, unknown>;

        const siteUrl = process.env.CONVEX_SITE_URL;
        const redirectUri = `${siteUrl}/auth/callback`;

        switch (provider) {
            case "bankid":
            case "idporten": {
                // Standard OIDC: code exchange + userinfo via Signicat
                if (!code) throw new Error("Missing code for BankID callback");
                const tokenResponse = await exchangeBankidCode(code, redirectUri, codeVerifier);
                userInfo = await fetchBankidUserInfo(
                    tokenResponse.access_token as string
                );
                // Ensure NIN is extracted from Signicat-specific claims
                if (!userInfo.nin && userInfo["signicat.national_id"]) {
                    userInfo.nin = userInfo["signicat.national_id"];
                }
                // BankID may not return email — use NIN-based placeholder
                if (!userInfo.email && userInfo.nin) {
                    userInfo.email = `${userInfo.nin}@bankid.no`;
                }
                break;
            }

            case "vipps": {
                if (!code) throw new Error("Missing code for Vipps callback");
                const tokenResponse = await exchangeVippsCode(code, redirectUri);
                userInfo = await fetchVippsUserInfo(
                    tokenResponse.access_token as string
                );
                break;
            }

            case "google": {
                if (!code) throw new Error("Missing code for Google callback");
                const tokenResponse = await exchangeGoogleCode(code, redirectUri);
                userInfo = await fetchGoogleUserInfo(
                    tokenResponse.access_token as string
                );
                break;
            }

            case "azure":
            case "microsoft": {
                if (!code) throw new Error("Missing code for Azure callback");
                const tokenResponse = await exchangeAzureCode(code, redirectUri);
                userInfo = await fetchAzureUserInfo(
                    tokenResponse.access_token as string
                );
                break;
            }

            default:
                throw new Error(`Unsupported provider: ${provider}`);
        }

        // Extract NIN (national identity number) from BankID/ID-porten
        const nin = (userInfo.nin || userInfo["signicat.national_id"]) as string | undefined;
        // Extract phone number from Vipps
        const phoneNumber = (userInfo.phone_number || userInfo.phoneNumber) as string | undefined;

        // Create or update user in database
        const result = await ctx.runMutation(internal.auth.callback.upsertUser, {
            email: userInfo.email as string,
            name: (userInfo.name || userInfo.given_name) as string | undefined,
            provider,
            providerId: (userInfo.sub || userInfo.id || userInfo.oid) as string,
            nin,
            phoneNumber,
        });

        return {
            success: true,
            user: result.user,
            isNewUser: result.isNewUser,
        };
    },
});

// Internal mutation to create/update user
// Matches by NIN first (if available), then by email
export const upsertUser = internalMutation({
    args: {
        email: v.string(),
        name: v.optional(v.string()),
        provider: v.string(),
        providerId: v.string(),
        nin: v.optional(v.string()),
        phoneNumber: v.optional(v.string()),
    },
    handler: async (ctx, { email, name, provider, providerId, nin, phoneNumber }) => {
        // 1. Try match by NIN (most reliable identifier from BankID)
        let existingUser = null;
        if (nin) {
            existingUser = await ctx.db
                .query("users")
                .withIndex("by_nin", (q) => q.eq("nin", nin))
                .first();
        }

        // 2. Fall back to email match
        if (!existingUser) {
            existingUser = await ctx.db
                .query("users")
                .withIndex("by_email", (q) => q.eq("email", email))
                .first();
        }

        if (existingUser) {
            const patch: Record<string, unknown> = {
                lastLoginAt: Date.now(),
                authUserId: providerId,
            };
            if (nin && !existingUser.nin) patch.nin = nin;
            if (phoneNumber) patch.phoneNumber = phoneNumber;

            await ctx.db.patch(existingUser._id, patch);
            return { user: { ...existingUser, ...patch }, isNewUser: false };
        }

        // 3. Create new public user (no tenant — web/minside users see everything;
        //    backoffice tenant membership is managed explicitly via admin tools)
        const userId = await ctx.db.insert("users", {
            email,
            name,
            authUserId: providerId,
            nin,
            phoneNumber,
            role: "member",
            status: "active",
            metadata: { provider },
            lastLoginAt: Date.now(),
        });

        const user = await ctx.db.get(userId);
        return { user, isNewUser: true };
    },
});

// ============================================================================
// OIDC Token Exchange Helpers (BankID/Signicat, Vipps, Google, Azure)
// ============================================================================

async function exchangeBankidCode(
    code: string,
    redirectUri: string,
    codeVerifier?: string
): Promise<Record<string, unknown>> {
    const clientId = process.env.BANKID_CLIENT_ID!;
    const clientSecret = process.env.BANKID_CLIENT_SECRET!;
    const basicAuth = btoa(`${clientId}:${clientSecret}`);

    const body: Record<string, string> = {
        grant_type: "authorization_code",
        code,
        redirect_uri: redirectUri,
    };
    if (codeVerifier) {
        body.code_verifier = codeVerifier;
    }

    const response = await fetch(
        process.env.BANKID_TOKEN_URL ||
            "https://digilist.sandbox.signicat.com/auth/open/connect/token",
        {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
                Authorization: `Basic ${basicAuth}`,
            },
            body: new URLSearchParams(body),
        }
    );

    if (!response.ok) {
        const text = await response.text();
        throw new Error(`BankID token exchange failed (${response.status}): ${text}`);
    }

    return response.json();
}

async function fetchBankidUserInfo(
    accessToken: string
): Promise<Record<string, unknown>> {
    const response = await fetch(
        process.env.BANKID_USERINFO_URL ||
            "https://digilist.sandbox.signicat.com/auth/open/connect/userinfo",
        { headers: { Authorization: `Bearer ${accessToken}` } }
    );

    if (!response.ok) {
        const text = await response.text();
        throw new Error(`BankID userinfo failed (${response.status}): ${text}`);
    }

    return response.json();
}

async function exchangeVippsCode(
    code: string,
    redirectUri: string
): Promise<Record<string, unknown>> {
    const clientId = process.env.VIPPS_CLIENT_ID!;
    const clientSecret = process.env.VIPPS_CLIENT_SECRET!;
    const basicAuth = btoa(`${clientId}:${clientSecret}`);

    const response = await fetch(
        process.env.VIPPS_TOKEN_URL ||
            "https://apitest.vipps.no/access-management-1.0/access/oauth2/token",
        {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
                Authorization: `Basic ${basicAuth}`,
            },
            body: new URLSearchParams({
                grant_type: "authorization_code",
                code,
                redirect_uri: redirectUri,
            }),
        }
    );
    return response.json();
}

async function fetchVippsUserInfo(
    accessToken: string
): Promise<Record<string, unknown>> {
    const response = await fetch(
        process.env.VIPPS_USERINFO_URL ||
            "https://apitest.vipps.no/vipps-userinfo-api/userinfo",
        { headers: { Authorization: `Bearer ${accessToken}` } }
    );
    return response.json();
}

async function exchangeGoogleCode(
    code: string,
    redirectUri: string
): Promise<Record<string, unknown>> {
    const response = await fetch("https://oauth2.googleapis.com/token", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
            grant_type: "authorization_code",
            code,
            client_id: process.env.GOOGLE_CLIENT_ID!,
            client_secret: process.env.GOOGLE_CLIENT_SECRET!,
            redirect_uri: redirectUri,
        }),
    });
    return response.json();
}

async function fetchGoogleUserInfo(
    accessToken: string
): Promise<Record<string, unknown>> {
    const response = await fetch(
        "https://www.googleapis.com/oauth2/v2/userinfo",
        { headers: { Authorization: `Bearer ${accessToken}` } }
    );
    return response.json();
}

async function exchangeAzureCode(
    code: string,
    redirectUri: string
): Promise<Record<string, unknown>> {
    const tenantId = process.env.AZURE_TENANT_ID || "common";
    const response = await fetch(
        `https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/token`,
        {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: new URLSearchParams({
                grant_type: "authorization_code",
                code,
                client_id: process.env.AZURE_CLIENT_ID!,
                client_secret: process.env.AZURE_CLIENT_SECRET!,
                redirect_uri: redirectUri,
            }),
        }
    );
    return response.json();
}

async function fetchAzureUserInfo(
    accessToken: string
): Promise<Record<string, unknown>> {
    const response = await fetch("https://graph.microsoft.com/v1.0/me", {
        headers: { Authorization: `Bearer ${accessToken}` },
    });
    const data = await response.json();
    return {
        sub: data.id,
        oid: data.id,
        email: data.mail || data.userPrincipalName,
        name: data.displayName,
        given_name: data.givenName,
        family_name: data.surname,
    };
}
