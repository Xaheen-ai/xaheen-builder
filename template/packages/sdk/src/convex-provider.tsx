/**
 * Xaheen SDK - Convex Provider
 *
 * Wraps the app with ConvexProvider for React hooks.
 * Accepts an optional `url` prop; falls back to VITE_CONVEX_URL.
 */

import React from "react";
import { ConvexProvider, ConvexReactClient } from "convex/react";

interface XalaConvexProviderProps {
    url?: string;
    children: React.ReactNode;
}

let client: ConvexReactClient | null = null;

function getClient(url: string): ConvexReactClient {
    if (!client) {
        client = new ConvexReactClient(url);
    }
    return client;
}

export function XalaConvexProvider({ url, children }: XalaConvexProviderProps) {
    const convexUrl = url || import.meta.env.VITE_CONVEX_URL;
    if (!convexUrl) {
        throw new Error("VITE_CONVEX_URL not set and no url prop provided");
    }
    return (
        <ConvexProvider client={getClient(convexUrl)}>
            {children}
        </ConvexProvider>
    );
}

export { ConvexProvider };
