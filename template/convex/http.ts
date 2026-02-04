import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { internal } from "./_generated/api";

const http = httpRouter();

/**
 * OAuth callback endpoint.
 *
 * All providers use standard OIDC: receives ?code=&state= after authentication.
 */
http.route({
    path: "/auth/callback",
    method: "GET",
    handler: httpAction(async (ctx, request) => {
        const url = new URL(request.url);
        const code = url.searchParams.get("code");
        const state = url.searchParams.get("state");
        const error = url.searchParams.get("error");

        // Handle OAuth errors (returned by provider)
        if (error) {
            const errorDesc =
                url.searchParams.get("error_description") || error;

            // Need state to redirect back to the correct app
            if (state) {
                const oauthState = await ctx.runMutation(
                    internal.auth.oauthStates.consumeState,
                    { state }
                );
                if (oauthState) {
                    return redirectToApp(
                        oauthState.appOrigin,
                        oauthState.returnPath,
                        undefined,
                        errorDesc
                    );
                }
            }

            return new Response(
                `<html><body><h1>Authentication Error</h1><p>${errorDesc}</p><p><a href="/">Go back</a></p></body></html>`,
                {
                    status: 400,
                    headers: { "Content-Type": "text/html" },
                }
            );
        }

        if (!state || !code) {
            return new Response("Missing code or state parameter", {
                status: 400,
            });
        }

        // Consume the OAuth state to get provider + app origin
        const oauthState = await ctx.runMutation(
            internal.auth.oauthStates.consumeState,
            { state }
        );

        if (!oauthState) {
            return new Response(
                `<html><body><h1>Invalid or Expired State</h1><p>The authentication request has expired. Please try again.</p><p><a href="/">Go back</a></p></body></html>`,
                {
                    status: 400,
                    headers: { "Content-Type": "text/html" },
                }
            );
        }

        try {
            const result = await ctx.runAction(
                internal.auth.callback.handleCallback,
                {
                    code,
                    state,
                    provider: oauthState.provider,
                    // signicatSessionId field is reused to store PKCE code_verifier
                    signicatSessionId: oauthState.signicatSessionId,
                }
            );

            if (!result.success || !result.user) {
                return redirectToApp(
                    oauthState.appOrigin,
                    oauthState.returnPath,
                    undefined,
                    "Authentication failed"
                );
            }

            // Create session
            const user = result.user as { _id: string };
            const sessionToken: string = await ctx.runMutation(
                internal.auth.sessions.createSession,
                {
                    userId: user._id as any,
                    provider: oauthState.provider,
                    appId: oauthState.appId,
                }
            );

            // Redirect to app's auth callback page
            return redirectToApp(
                oauthState.appOrigin,
                oauthState.returnPath,
                sessionToken
            );
        } catch (e) {
            const errorMsg =
                e instanceof Error ? e.message : "Unknown error occurred";
            return redirectToApp(
                oauthState.appOrigin,
                oauthState.returnPath,
                undefined,
                errorMsg
            );
        }
    }),
});

function redirectToApp(
    appOrigin: string,
    returnPath: string,
    sessionToken?: string,
    error?: string
): Response {
    const callbackUrl = new URL("/auth/callback", appOrigin);
    if (sessionToken) {
        callbackUrl.searchParams.set("sessionToken", sessionToken);
    }
    if (returnPath && returnPath !== "/") {
        callbackUrl.searchParams.set("returnPath", returnPath);
    }
    if (error) {
        callbackUrl.searchParams.set("error", error);
    }

    return new Response(null, {
        status: 302,
        headers: { Location: callbackUrl.toString() },
    });
}

/**
 * Vipps ePayment webhook endpoint.
 * Receives payment status updates from Vipps.
 */
http.route({
    path: "/webhooks/vipps",
    method: "POST",
    handler: httpAction(async (ctx, request) => {
        try {
            const payload = await request.json();
            const headers: Record<string, string> = {};
            request.headers.forEach((value, key) => {
                headers[key] = value;
            });

            await ctx.runAction(internal.billing.webhooks.vippsWebhook, {
                payload,
                headers,
            });

            return new Response(JSON.stringify({ received: true }), {
                status: 200,
                headers: { "Content-Type": "application/json" },
            });
        } catch (e) {
            console.error("Vipps webhook error:", e);
            return new Response(
                JSON.stringify({ error: "Webhook processing failed" }),
                {
                    status: 500,
                    headers: { "Content-Type": "application/json" },
                }
            );
        }
    }),
});

export default http;
