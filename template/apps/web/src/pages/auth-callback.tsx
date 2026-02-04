/**
 * OAuth Callback Page — Web App
 *
 * Receives sessionToken from URL params after OAuth redirect,
 * validates the session, stores it, and reloads into the app.
 */
import { useOAuthCallback } from '@xaheen/sdk';

export function AuthCallbackPage() {
  const { isProcessing, error } = useOAuthCallback({
    appId: 'web',
    onSuccess: (returnPath) => {
      // Full page reload so auth state re-initializes with the stored session
      window.location.href = returnPath || '/';
    },
    onError: (err) => {
      window.location.href = `/login?error=${encodeURIComponent(err)}`;
    },
  });

  if (error) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <h2>Innlogging feilet</h2>
        <p>{error}</p>
        <a href="/login">Prøv igjen</a>
      </div>
    );
  }

  if (isProcessing) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <p>Logger inn...</p>
      </div>
    );
  }

  return null;
}
