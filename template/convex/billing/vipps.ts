import { action, internalAction, internalMutation, query } from "../_generated/server";
import { v } from "convex/values";
import { internal } from "../_generated/api";

// =============================================================================
// Vipps ePayment Integration
// Docs: https://developer.vippsmobilepay.com/docs/APIs/epayment-api/
// =============================================================================

const VIPPS_API_BASE =
    "https://apitest.vipps.no";

// =============================================================================
// Access Token (internal — cached per-request)
// =============================================================================

async function getAccessToken(): Promise<string> {
    const clientId = process.env.VIPPS_CLIENT_ID!;
    const clientSecret = process.env.VIPPS_CLIENT_SECRET!;
    const subscriptionKey = process.env.VIPPS_SUBSCRIPTION_KEY!;
    const msn = process.env.VIPPS_MSN!;

    const response = await fetch(`${VIPPS_API_BASE}/accesstoken/get`, {
        method: "POST",
        headers: {
            client_id: clientId,
            client_secret: clientSecret,
            "Ocp-Apim-Subscription-Key": subscriptionKey,
            "Merchant-Serial-Number": msn,
        },
    });

    if (!response.ok) {
        const text = await response.text();
        throw new Error(`Vipps access token failed (${response.status}): ${text}`);
    }

    const data = await response.json();
    return data.access_token;
}

// =============================================================================
// Create Payment (action — called from SDK)
// =============================================================================

export const createPayment = action({
    args: {
        tenantId: v.id("tenants"),
        bookingId: v.optional(v.id("bookings")),
        userId: v.optional(v.id("users")),
        amount: v.number(), // In minor units (øre)
        currency: v.optional(v.string()),
        description: v.string(),
        returnUrl: v.string(),
    },
    handler: async (ctx, args) => {
        const currency = args.currency || "NOK";
        const reference = `xala-${args.bookingId || "direct"}-${Date.now()}`;

        const accessToken = await getAccessToken();
        const msn = process.env.VIPPS_MSN!;
        const subscriptionKey = process.env.VIPPS_SUBSCRIPTION_KEY!;

        const payload = {
            amount: {
                currency,
                value: args.amount,
            },
            paymentMethod: {
                type: "WALLET",
            },
            reference,
            returnUrl: `${args.returnUrl}?reference=${encodeURIComponent(reference)}`,
            userFlow: "WEB_REDIRECT",
            paymentDescription: args.description,
        };

        const response = await fetch(`${VIPPS_API_BASE}/epayment/v1/payments`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${accessToken}`,
                "Ocp-Apim-Subscription-Key": subscriptionKey,
                "Merchant-Serial-Number": msn,
                "Idempotency-Key": reference,
            },
            body: JSON.stringify(payload),
        });

        if (!response.ok) {
            const text = await response.text();
            throw new Error(`Vipps createPayment failed (${response.status}): ${text}`);
        }

        const result = await response.json();

        // Store payment record
        await ctx.runMutation(internal.billing.vipps.insertPayment, {
            tenantId: args.tenantId,
            bookingId: args.bookingId,
            userId: args.userId,
            provider: "vipps",
            reference,
            externalId: result.reference,
            amount: args.amount,
            currency,
            description: args.description,
            status: "created",
            redirectUrl: result.redirectUrl,
        });

        return {
            reference,
            redirectUrl: result.redirectUrl,
        };
    },
});

// =============================================================================
// Get Payment Status (query — reads local DB)
// =============================================================================

export const getPaymentStatus = query({
    args: {
        reference: v.string(),
    },
    handler: async (ctx, { reference }) => {
        const payment = await ctx.db
            .query("payments")
            .withIndex("by_reference", (q) => q.eq("reference", reference))
            .first();

        return payment;
    },
});

// =============================================================================
// Sync Payment Status (action — polls Vipps and updates local)
// =============================================================================

export const syncPaymentStatus = action({
    args: {
        reference: v.string(),
    },
    handler: async (ctx, { reference }) => {
        const accessToken = await getAccessToken();
        const subscriptionKey = process.env.VIPPS_SUBSCRIPTION_KEY!;
        const msn = process.env.VIPPS_MSN!;

        const response = await fetch(
            `${VIPPS_API_BASE}/epayment/v1/payments/${encodeURIComponent(reference)}`,
            {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    "Ocp-Apim-Subscription-Key": subscriptionKey,
                    "Merchant-Serial-Number": msn,
                },
            }
        );

        if (!response.ok) {
            const text = await response.text();
            throw new Error(`Vipps getPayment failed (${response.status}): ${text}`);
        }

        const vippsPayment = await response.json();
        const status = mapVippsState(vippsPayment.state);

        await ctx.runMutation(internal.billing.vipps.updatePaymentStatus, {
            reference,
            status,
            externalId: vippsPayment.pspReference,
        });

        return { reference, status, vippsState: vippsPayment.state };
    },
});

// =============================================================================
// Capture Payment (action)
// =============================================================================

export const capturePayment = action({
    args: {
        reference: v.string(),
        amount: v.optional(v.number()),
    },
    handler: async (ctx, { reference, amount }) => {
        const accessToken = await getAccessToken();
        const subscriptionKey = process.env.VIPPS_SUBSCRIPTION_KEY!;
        const msn = process.env.VIPPS_MSN!;

        // If no amount specified, get full amount from our record
        let captureAmount = amount;
        if (!captureAmount) {
            const payment = await ctx.runMutation(internal.billing.vipps.getPaymentByReference, {
                reference,
            });
            if (!payment) throw new Error(`Payment not found: ${reference}`);
            captureAmount = payment.amount;
        }

        const response = await fetch(
            `${VIPPS_API_BASE}/epayment/v1/payments/${encodeURIComponent(reference)}/capture`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${accessToken}`,
                    "Ocp-Apim-Subscription-Key": subscriptionKey,
                    "Merchant-Serial-Number": msn,
                    "Idempotency-Key": `capture-${reference}-${Date.now()}`,
                },
                body: JSON.stringify({
                    modificationAmount: {
                        currency: "NOK",
                        value: captureAmount,
                    },
                }),
            }
        );

        if (!response.ok) {
            const text = await response.text();
            throw new Error(`Vipps capture failed (${response.status}): ${text}`);
        }

        await ctx.runMutation(internal.billing.vipps.updatePaymentStatus, {
            reference,
            status: "captured",
            capturedAmount: captureAmount,
        });

        return { success: true };
    },
});

// =============================================================================
// Refund Payment (action)
// =============================================================================

export const refundPayment = action({
    args: {
        reference: v.string(),
        amount: v.number(),
        reason: v.optional(v.string()),
    },
    handler: async (ctx, { reference, amount, reason }) => {
        const accessToken = await getAccessToken();
        const subscriptionKey = process.env.VIPPS_SUBSCRIPTION_KEY!;
        const msn = process.env.VIPPS_MSN!;

        const response = await fetch(
            `${VIPPS_API_BASE}/epayment/v1/payments/${encodeURIComponent(reference)}/refund`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${accessToken}`,
                    "Ocp-Apim-Subscription-Key": subscriptionKey,
                    "Merchant-Serial-Number": msn,
                    "Idempotency-Key": `refund-${reference}-${Date.now()}`,
                },
                body: JSON.stringify({
                    modificationAmount: {
                        currency: "NOK",
                        value: amount,
                    },
                }),
            }
        );

        if (!response.ok) {
            const text = await response.text();
            throw new Error(`Vipps refund failed (${response.status}): ${text}`);
        }

        await ctx.runMutation(internal.billing.vipps.updatePaymentRefund, {
            reference,
            refundedAmount: amount,
        });

        return { success: true };
    },
});

// =============================================================================
// Cancel Payment (action)
// =============================================================================

export const cancelPayment = action({
    args: {
        reference: v.string(),
    },
    handler: async (ctx, { reference }) => {
        const accessToken = await getAccessToken();
        const subscriptionKey = process.env.VIPPS_SUBSCRIPTION_KEY!;
        const msn = process.env.VIPPS_MSN!;

        const response = await fetch(
            `${VIPPS_API_BASE}/epayment/v1/payments/${encodeURIComponent(reference)}/cancel`,
            {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${accessToken}`,
                    "Ocp-Apim-Subscription-Key": subscriptionKey,
                    "Merchant-Serial-Number": msn,
                    "Idempotency-Key": `cancel-${reference}-${Date.now()}`,
                },
            }
        );

        if (!response.ok) {
            const text = await response.text();
            throw new Error(`Vipps cancel failed (${response.status}): ${text}`);
        }

        await ctx.runMutation(internal.billing.vipps.updatePaymentStatus, {
            reference,
            status: "cancelled",
        });

        return { success: true };
    },
});

// =============================================================================
// Internal Mutations (DB operations)
// =============================================================================

export const insertPayment = internalMutation({
    args: {
        tenantId: v.id("tenants"),
        bookingId: v.optional(v.id("bookings")),
        userId: v.optional(v.id("users")),
        provider: v.string(),
        reference: v.string(),
        externalId: v.optional(v.string()),
        amount: v.number(),
        currency: v.string(),
        description: v.optional(v.string()),
        status: v.string(),
        redirectUrl: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const now = Date.now();
        return ctx.db.insert("payments", {
            ...args,
            createdAt: now,
            updatedAt: now,
        });
    },
});

export const updatePaymentStatus = internalMutation({
    args: {
        reference: v.string(),
        status: v.string(),
        externalId: v.optional(v.string()),
        capturedAmount: v.optional(v.number()),
    },
    handler: async (ctx, { reference, status, externalId, capturedAmount }) => {
        const payment = await ctx.db
            .query("payments")
            .withIndex("by_reference", (q) => q.eq("reference", reference))
            .first();

        if (!payment) return;

        const patch: Record<string, unknown> = {
            status,
            updatedAt: Date.now(),
        };
        if (externalId) patch.externalId = externalId;
        if (capturedAmount !== undefined) patch.capturedAmount = capturedAmount;

        await ctx.db.patch(payment._id, patch);
    },
});

export const updatePaymentRefund = internalMutation({
    args: {
        reference: v.string(),
        refundedAmount: v.number(),
    },
    handler: async (ctx, { reference, refundedAmount }) => {
        const payment = await ctx.db
            .query("payments")
            .withIndex("by_reference", (q) => q.eq("reference", reference))
            .first();

        if (!payment) return;

        const currentRefunded = (payment.refundedAmount || 0) + refundedAmount;
        const newStatus = currentRefunded >= payment.amount ? "refunded" : "captured";

        await ctx.db.patch(payment._id, {
            refundedAmount: currentRefunded,
            status: newStatus,
            updatedAt: Date.now(),
        });
    },
});

export const getPaymentByReference = internalMutation({
    args: {
        reference: v.string(),
    },
    handler: async (ctx, { reference }) => {
        return ctx.db
            .query("payments")
            .withIndex("by_reference", (q) => q.eq("reference", reference))
            .first();
    },
});

// =============================================================================
// Helpers
// =============================================================================

function mapVippsState(state: string): string {
    switch (state) {
        case "CREATED":
            return "created";
        case "AUTHORIZED":
            return "authorized";
        case "ABORTED":
            return "cancelled";
        case "EXPIRED":
            return "failed";
        case "TERMINATED":
            return "cancelled";
        default:
            return state.toLowerCase();
    }
}
