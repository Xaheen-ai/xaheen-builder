/**
 * Listing Details Adapters
 *
 * Export all adapter interfaces and implementations.
 */

export {
  type AuditProvider,
  getAuditProvider,
  setAuditProvider,
  logAuditEvent,
  generateUUID,
} from './auditProvider';

export {
  type FavoritesProvider,
  getFavoritesProvider,
  setFavoritesProvider,
  useFavorites,
  type UseFavoritesResult,
} from './favoritesProvider';

export {
  type ShareMedium,
  type ShareData,
  type ShareResult,
  buildShareUrl,
  isNativeShareAvailable,
  shareNative,
  shareCopyLink,
  shareEmail,
  shareWhatsApp,
  shareFacebook,
  shareTwitter,
  shareLinkedIn,
  shareWithAudit,
} from './shareTracker';

export {
  type RealtimeClient,
  type RealtimeEventHandler,
  getRealtimeClient,
  setRealtimeClient,
  useRealtimeUpdates,
  type UseRealtimeResult,
} from './realtimeClient';
