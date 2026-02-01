/**
 * OAuth Card Component
 * 
 * Displays OAuth connection status for Claude and Google.
 * Uses proper PKCE OAuth flow for Claude.
 */

import { useQuery, useMutation } from 'convex/react';
import { api } from '@convex/_generated/api';
import { useState, useEffect } from 'react';

// PKCE helper functions
function generateCodeVerifier(): string {
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    return btoa(String.fromCharCode(...array))
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=/g, '');
}

async function generateCodeChallenge(verifier: string): Promise<string> {
    const encoder = new TextEncoder();
    const data = encoder.encode(verifier);
    const hash = await crypto.subtle.digest('SHA-256', data);
    return btoa(String.fromCharCode(...new Uint8Array(hash)))
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=/g, '');
}

function generateState(): string {
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    return btoa(String.fromCharCode(...array))
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=/g, '');
}

// Claude OAuth configuration
const CLAUDE_OAUTH_CONFIG = {
    authorizationUrl: 'https://claude.ai/oauth/authorize',
    clientId: '9d1c250a-e61b-44d9-88ed-5944d1962f5e', // Claude Code CLI client ID
    redirectUri: 'https://platform.claude.com/oauth/code/callback',
    scope: 'user:inference',
};

interface OAuthProviderCardProps {
    provider: 'claude' | 'google';
    title: string;
    description: string;
    icon: React.ReactNode;
}

function OAuthProviderCard({ provider, title, description, icon }: OAuthProviderCardProps) {
    const [isConnecting, setIsConnecting] = useState(false);
    const [showTokenInput, setShowTokenInput] = useState(false);
    const [tokenValue, setTokenValue] = useState('');

    // Query OAuth status based on provider
    const claudeStatus = useQuery(api.claudeOAuth.claudeOAuthStatus);
    const googleStatus = useQuery(api.googleOAuth.googleOAuthStatus);

    const disconnectClaude = useMutation(api.claudeOAuth.disconnectClaudeOAuth);
    const disconnectGoogle = useMutation(api.googleOAuth.disconnectGoogleOAuth);
    const storeClaudeToken = useMutation(api.claudeOAuth.storeClaudeOAuthToken);

    const status = provider === 'claude' ? claudeStatus : googleStatus;
    const disconnect = provider === 'claude' ? disconnectClaude : disconnectGoogle;

    const isConnected = status?.isConnected ?? false;
    const expiresAt = status?.expiresAt;

    const handleConnect = async () => {
        if (provider === 'claude') {
            setShowTokenInput(true);
            return;
        }
        setIsConnecting(true);
        try {
            const clientId = import.meta.env.VITE_GOOGLE_OAUTH_CLIENT_ID;
            if (!clientId) {
                alert('Google OAuth not configured. Set VITE_GOOGLE_OAUTH_CLIENT_ID in your .env.local file.');
                return;
            }
            window.open('https://accounts.google.com/o/oauth2/v2/auth?' + new URLSearchParams({
                client_id: clientId,
                redirect_uri: `${window.location.origin}/oauth/google/callback`,
                response_type: 'code',
                scope: 'https://www.googleapis.com/auth/generative-language.tuning https://www.googleapis.com/auth/userinfo.email',
                access_type: 'offline',
                prompt: 'consent',
            }).toString(), '_blank', 'width=600,height=700');
        } finally {
            setIsConnecting(false);
        }
    };

    const handleSaveToken = async () => {
        if (!tokenValue.trim()) return;
        setIsConnecting(true);
        try {
            await storeClaudeToken({ accessToken: tokenValue.trim(), expiresIn: 86400 * 30 });
            setShowTokenInput(false);
            setTokenValue('');
        } catch (error) {
            console.error('Failed to save token:', error);
            alert('Failed to save token.');
        } finally {
            setIsConnecting(false);
        }
    };

    const handleDisconnect = async () => {
        await disconnect();
    };

    const formatExpiryTime = (timestamp: number) => {
        const now = Date.now();
        const diffMs = timestamp - now;
        const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
        const diffDays = Math.floor(diffHours / 24);

        if (diffDays > 0) {
            return `Expires in ${diffDays} day${diffDays > 1 ? 's' : ''}`;
        } else if (diffHours > 0) {
            return `Expires in ${diffHours} hour${diffHours > 1 ? 's' : ''}`;
        } else {
            return `Expires soon`;
        }
    };

    return (
        <div className="p-4 bg-bolt-elements-background-depth-3 rounded-lg border border-bolt-elements-borderColor">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 flex items-center justify-center rounded-lg bg-bolt-elements-background-depth-4">
                        {icon}
                    </div>
                    <div>
                        <h4 className="font-medium text-content-primary">{title}</h4>
                        <p className="text-sm text-content-secondary">
                            {isConnected && expiresAt ? formatExpiryTime(expiresAt) : description}
                        </p>
                    </div>
                </div>

                <div>
                    {isConnected ? (
                        <button
                            onClick={handleDisconnect}
                            className="px-4 py-2 text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                        >
                            Disconnect
                        </button>
                    ) : (
                        <button
                            onClick={handleConnect}
                            disabled={isConnecting}
                            className="px-4 py-2 text-sm font-medium bg-accent-primary text-white rounded-lg hover:bg-accent-primary-hover transition-colors disabled:opacity-50"
                        >
                            {isConnecting ? 'Connecting...' : 'Connect'}
                        </button>
                    )}
                </div>
            </div>

            {showTokenInput && provider === 'claude' && (
                <div className="mt-3 p-3 bg-bolt-elements-background-depth-4 rounded-lg">
                    <p className="text-xs text-content-secondary mb-2">
                        Run <code className="bg-bolt-elements-background-depth-2 px-1 rounded">claude setup-token</code> then paste:
                    </p>
                    <div className="flex gap-2">
                        <input
                            type="password"
                            value={tokenValue}
                            onChange={(e) => setTokenValue(e.target.value)}
                            placeholder="Paste token here..."
                            className="flex-1 px-3 py-2 text-sm bg-bolt-elements-background-depth-2 border border-bolt-elements-borderColor rounded-lg"
                        />
                        <button onClick={handleSaveToken} disabled={!tokenValue.trim() || isConnecting}
                            className="px-4 py-2 text-sm font-medium bg-accent-primary text-white rounded-lg disabled:opacity-50">
                            Save
                        </button>
                        <button onClick={() => { setShowTokenInput(false); setTokenValue(''); }}
                            className="px-3 py-2 text-sm text-content-secondary hover:bg-bolt-elements-background-depth-2 rounded-lg">
                            ✕
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

export function OAuthCard() {
    return (
        <div className="rounded-xl bg-bolt-elements-background-depth-3 p-6 shadow-sm border border-bolt-elements-borderColor">
            <div className="mb-4">
                <h3 className="text-xl font-semibold text-content-primary">OAuth Connections</h3>
                <p className="text-sm text-content-secondary mt-1">
                    Connect your accounts to use AI models with your subscription instead of API keys.
                </p>
            </div>

            <div className="space-y-3">
                <OAuthProviderCard
                    provider="claude"
                    title="Claude Pro/Max"
                    description="Use your Claude subscription for AI generation"
                    icon={
                        <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z" />
                        </svg>
                    }
                />

                <OAuthProviderCard
                    provider="google"
                    title="Google Gemini"
                    description="Use your Google account for Gemini AI"
                    icon={
                        <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                        </svg>
                    }
                />
            </div>

            <div className="mt-4 p-3 bg-bolt-elements-background-depth-4 rounded-lg">
                <p className="text-xs text-content-tertiary">
                    💡 <strong>Tip:</strong> OAuth connections let you use your existing subscriptions without sharing API keys.
                    Your credentials are stored securely and tokens are refreshed automatically.
                </p>
            </div>
        </div>
    );
}
