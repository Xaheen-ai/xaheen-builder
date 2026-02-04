import { action, internalAction } from "../_generated/server";
import { v } from "convex/values";
import { internal } from "../_generated/api";

/**
 * Stripe Webhook Handler
 * Migrated from: packages/platform/functions/billing-webhook-stripe
 */
export const stripeWebhook = action({
    args: {
        payload: v.string(),
        signature: v.string(),
    },
    handler: async (ctx, { payload, signature }) => {
        // Verify Stripe signature
        const stripeSecret = process.env.STRIPE_WEBHOOK_SECRET;
        if (!stripeSecret) {
            throw new Error("Stripe webhook secret not configured");
        }

        // In production, use Stripe SDK to verify signature
        // const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
        // const event = stripe.webhooks.constructEvent(payload, signature, stripeSecret);

        const event = JSON.parse(payload);

        switch (event.type) {
            case "checkout.session.completed":
                // Handle successful checkout
                console.log("Checkout completed:", event.data.object.id);
                break;

            case "customer.subscription.created":
                // Handle new subscription
                console.log("Subscription created:", event.data.object.id);
                break;

            case "customer.subscription.updated":
                // Handle subscription update
                console.log("Subscription updated:", event.data.object.id);
                break;

            case "customer.subscription.deleted":
                // Handle subscription cancellation
                console.log("Subscription deleted:", event.data.object.id);
                break;

            case "invoice.paid":
                // Handle successful payment
                console.log("Invoice paid:", event.data.object.id);
                break;

            case "invoice.payment_failed":
                // Handle failed payment
                console.log("Payment failed:", event.data.object.id);
                break;

            default:
                console.log("Unhandled event type:", event.type);
        }

        return { received: true };
    },
});

/**
 * Vipps Webhook Handler
 * Processes ePayment webhook events from Vipps.
 * Events: epayments.payment.created.v1, .authorized.v1, .captured.v1,
 *         .cancelled.v1, .refunded.v1, .aborted.v1, .expired.v1
 */
export const vippsWebhook = internalAction({
    args: {
        payload: v.any(),
        headers: v.any(),
    },
    handler: async (ctx, { payload, headers }) => {
        // Vipps ePayment webhook payload structure:
        // { msn, reference, pspReference, name, amount, state, paymentMethod, ... }
        const reference = payload.reference;
        const state = payload.state;

        if (!reference) {
            console.log("Vipps webhook: missing reference", payload);
            return { received: true };
        }

        let status: string;
        switch (state) {
            case "CREATED":
                status = "created";
                break;
            case "AUTHORIZED":
                status = "authorized";
                break;
            case "ABORTED":
            case "TERMINATED":
                status = "cancelled";
                break;
            case "EXPIRED":
                status = "failed";
                break;
            default:
                status = state ? state.toLowerCase() : "unknown";
        }

        // Update payment record
        await ctx.runMutation(internal.billing.vipps.updatePaymentStatus, {
            reference,
            status,
            externalId: payload.pspReference,
            capturedAmount: state === "AUTHORIZED" ? payload.amount?.value : undefined,
        });

        // If payment is authorized, update the associated booking status
        if (status === "authorized") {
            const payment = await ctx.runMutation(
                internal.billing.vipps.getPaymentByReference,
                { reference }
            );
            if (payment?.bookingId) {
                console.log(
                    `Vipps payment authorized for booking ${payment.bookingId}`
                );
            }
        }

        console.log(`Vipps webhook: ${reference} → ${status}`);
        return { received: true };
    },
});
