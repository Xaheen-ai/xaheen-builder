# Convex Functions Reference

> Complete reference for all Convex functions in Xaheen.
> **Total Functions:** 156 (59 queries, 93 mutations, 4 actions)

---

## Domain Functions

### Resources (`convex/domain/resources.ts`)

| Function | Type | Description |
|----------|------|-------------|
| `list` | Query | List resources with filters (tenant, category, status) |
| `get` | Query | Get resource by ID |
| `getBySlug` | Query | Get resource by slug within tenant |
| `create` | Mutation | Create new resource |
| `update` | Mutation | Update resource fields |
| `remove` | Mutation | Delete resource (soft delete) |
| `publish` | Mutation | Publish resource (make visible) |
| `unpublish` | Mutation | Unpublish resource (hide) |

```typescript
// Example usage
const resources = useQuery(api.domain.resources.list, {
  tenantId,
  categoryKey: 'LOKALER',
  status: 'published',
  limit: 20,
});
```

---

### Bookings (`convex/domain/bookings.ts`)

| Function | Type | Description |
|----------|------|-------------|
| `list` | Query | List bookings with filters |
| `get` | Query | Get booking by ID with related data |
| `create` | Mutation | Create new booking |
| `update` | Mutation | Update booking details |
| `approve` | Mutation | Approve pending booking |
| `reject` | Mutation | Reject booking with reason |
| `cancel` | Mutation | Cancel booking |
| `calendar` | Query | Get calendar view of bookings |

```typescript
// Create booking
const createBooking = useMutation(api.domain.bookings.create);
await createBooking({
  tenantId,
  resourceId,
  userId,
  startTime: Date.now(),
  endTime: Date.now() + 3600000,
  totalPrice: 500,
  currency: 'NOK',
});
```

---

### Blocks (`convex/domain/blocks.ts`)

| Function | Type | Description |
|----------|------|-------------|
| `list` | Query | List blocks for resource/tenant |
| `get` | Query | Get block by ID |
| `create` | Mutation | Create availability block |
| `update` | Mutation | Update block |
| `remove` | Mutation | Delete block |
| `checkAvailability` | Query | Check if time range is available |
| `getAvailableSlots` | Query | Get available time slots for a date |

```typescript
// Check availability before booking
const availability = useQuery(api.domain.blocks.checkAvailability, {
  resourceId,
  startTime,
  endTime,
});

if (availability?.isAvailable) {
  // Proceed with booking
}
```

---

### Categories (`convex/domain/categories.ts`)

| Function | Type | Description |
|----------|------|-------------|
| `list` | Query | List categories for tenant |
| `get` | Query | Get category with parent/children |
| `getByKey` | Query | Get category by key |
| `create` | Mutation | Create category |
| `update` | Mutation | Update category |
| `remove` | Mutation | Delete category |
| `getTree` | Query | Get hierarchical category tree |

---

### Amenities (`convex/domain/amenities.ts`)

| Function | Type | Description |
|----------|------|-------------|
| `listGroups` | Query | List amenity groups |
| `list` | Query | List amenities |
| `get` | Query | Get amenity with group |
| `createGroup` | Mutation | Create amenity group |
| `create` | Mutation | Create amenity |
| `update` | Mutation | Update amenity |
| `remove` | Mutation | Delete amenity |
| `listForResource` | Query | List amenities for resource |
| `addToResource` | Mutation | Add amenity to resource |
| `removeFromResource` | Mutation | Remove amenity from resource |

---

### Addons (`convex/domain/addons.ts`)

| Function | Type | Description |
|----------|------|-------------|
| `list` | Query | List addons for tenant |
| `get` | Query | Get addon by ID |
| `create` | Mutation | Create addon |
| `update` | Mutation | Update addon |
| `remove` | Mutation | Delete addon |
| `listForResource` | Query | List addons for resource |
| `addToResource` | Mutation | Add addon to resource |
| `removeFromResource` | Mutation | Remove addon from resource |

---

### Pricing (`convex/domain/pricing.ts`)

| Function | Type | Description |
|----------|------|-------------|
| `listGroups` | Query | List pricing groups |
| `createGroup` | Mutation | Create pricing group |
| `updateGroup` | Mutation | Update pricing group |
| `removeGroup` | Mutation | Delete pricing group |
| `listForResource` | Query | List pricing for resource |
| `create` | Mutation | Create resource pricing |
| `update` | Mutation | Update pricing |
| `remove` | Mutation | Delete pricing |
| `calculatePrice` | Query | Calculate booking price |

```typescript
// Calculate price before booking
const price = useQuery(api.domain.pricing.calculatePrice, {
  resourceId,
  startTime,
  endTime,
  userId,
  addonIds: ['addon1', 'addon2'],
});

// Returns: { total: 750, currency: 'NOK', breakdown: {...} }
```

---

### Booking Addons (`convex/domain/bookingAddons.ts`)

| Function | Type | Description |
|----------|------|-------------|
| `listForBooking` | Query | List addons for booking |
| `addToBooking` | Mutation | Add addon to booking |
| `updateBookingAddon` | Mutation | Update booking addon |
| `removeFromBooking` | Mutation | Remove addon from booking |
| `approve` | Mutation | Approve pending addon |
| `reject` | Mutation | Reject addon |

---

### Audit (`convex/domain/audit.ts`)

| Function | Type | Description |
|----------|------|-------------|
| `listForBooking` | Query | List audit entries for booking |
| `listByAction` | Query | List audit entries by action type |
| `get` | Query | Get audit entry by ID |
| `create` | Mutation | Create audit entry |
| `getSummary` | Query | Get audit summary for tenant |

---

### Seasons (`convex/domain/seasons.ts`)

| Function | Type | Description |
|----------|------|-------------|
| `list` | Query | List seasons for tenant |
| `get` | Query | Get season with stats |
| `create` | Mutation | Create season |
| `update` | Mutation | Update season |
| `remove` | Mutation | Delete season |
| `publish` | Mutation | Open season for applications |
| `close` | Mutation | Close season |
| `listApplications` | Query | List applications for season |
| `submitApplication` | Mutation | Submit season application |
| `reviewApplication` | Mutation | Review (approve/reject) application |
| `listAllocations` | Query | List allocations for resource |
| `createAllocation` | Mutation | Create allocation |
| `updateAllocation` | Mutation | Update allocation |
| `removeAllocation` | Mutation | Delete allocation |
| `listLeases` | Query | List seasonal leases |
| `createLease` | Mutation | Create seasonal lease |
| `cancelLease` | Mutation | Cancel lease |

---

### Favorites (`convex/domain/favorites.ts`)

| Function | Type | Description |
|----------|------|-------------|
| `list` | Query | List user favorites |
| `isFavorite` | Query | Check if resource is favorited |
| `add` | Mutation | Add to favorites |
| `update` | Mutation | Update favorite |
| `remove` | Mutation | Remove from favorites |
| `toggle` | Mutation | Toggle favorite status |

---

## Platform Functions

### Tenants (`convex/tenants/index.ts`)

| Function | Type | Description |
|----------|------|-------------|
| `onboard` | Mutation | Create new tenant |
| `getSettings` | Query | Get tenant settings |
| `updateSettings` | Mutation | Update tenant settings |
| `getBySlug` | Query | Get tenant by slug |
| `getByDomain` | Query | Get tenant by domain |

---

### Organizations (`convex/organizations/index.ts`)

| Function | Type | Description |
|----------|------|-------------|
| `list` | Query | List organizations for tenant |
| `get` | Query | Get organization with parent/children |
| `getBySlug` | Query | Get organization by slug |
| `create` | Mutation | Create organization |
| `update` | Mutation | Update organization |
| `remove` | Mutation | Delete organization (soft delete) |
| `getTree` | Query | Get hierarchical organization tree |

---

### Users (`convex/users/index.ts`, `convex/users/mutations.ts`)

| Function | Type | Description |
|----------|------|-------------|
| `list` | Query | List users for tenant |
| `getByEmail` | Query | Get user by email |
| `me` | Query | Get current user |
| `create` | Mutation | Create user |
| `update` | Mutation | Update user |
| `invite` | Mutation | Invite user to tenant |
| `acceptInvitation` | Mutation | Accept tenant invitation |
| `suspend` | Mutation | Suspend user |
| `reactivate` | Mutation | Reactivate suspended user |
| `remove` | Mutation | Delete user (soft delete) |
| `removeFromTenant` | Mutation | Remove user from tenant |

---

### RBAC (`convex/rbac/index.ts`)

| Function | Type | Description |
|----------|------|-------------|
| `listRoles` | Query | List roles for tenant |
| `createRole` | Mutation | Create role |
| `listPermissions` | Query | List permissions for role |
| `assignPermission` | Mutation | Assign permission to role |
| `bindUserRole` | Mutation | Bind user to role |
| `getUserPermissions` | Query | Get user's permissions |

---

### Modules (`convex/modules/index.ts`)

| Function | Type | Description |
|----------|------|-------------|
| `catalog` | Query | Get module catalog |
| `list` | Query | List installed modules for tenant |
| `install` | Mutation | Install module for tenant |
| `uninstall` | Mutation | Uninstall module |
| `enable` | Mutation | Enable installed module |
| `disable` | Mutation | Disable module |

---

## Compliance Functions

### Consent & GDPR (`convex/compliance/index.ts`)

| Function | Type | Description |
|----------|------|-------------|
| `getConsent` | Query | Get user consent status |
| `updateConsent` | Mutation | Update consent preferences |
| `submitDSAR` | Mutation | Submit data subject access request |
| `getPolicy` | Query | Get active policy |
| `publishPolicy` | Mutation | Publish new policy version |
| `policyHistory` | Query | Get policy version history |
| `rollbackPolicy` | Mutation | Rollback to previous policy |

---

## Integration Functions

### Integrations (`convex/integrations/index.ts`)

| Function | Type | Description |
|----------|------|-------------|
| `list` | Query | List all integrations |
| `getConfig` | Query | Get integration config (secrets hidden) |
| `configure` | Mutation | Configure integration |
| `disable` | Mutation | Disable integration |
| `remove` | Mutation | Remove integration config |
| `testConnection` | Action | Test integration connection |
| `sync` | Action | Sync integration data |
| `registerWebhook` | Mutation | Register webhook endpoint |
| `listWebhooks` | Query | List registered webhooks |
| `deleteWebhook` | Mutation | Delete webhook |

---

## Notification Functions

### Notifications (`convex/notifications/index.ts`)

| Function | Type | Description |
|----------|------|-------------|
| `list` | Query | List user notifications |
| `getUnreadCount` | Query | Get unread notification count |
| `create` | Mutation | Create notification |
| `markAsRead` | Mutation | Mark notification as read |
| `markAllAsRead` | Mutation | Mark all as read |
| `remove` | Mutation | Delete notification |
| `deleteAllRead` | Mutation | Delete all read notifications |
| `sendBookingNotification` | Mutation | Send booking notification |

---

## Messaging Functions

### Conversations (`convex/messaging/index.ts`)

| Function | Type | Description |
|----------|------|-------------|
| `listConversations` | Query | List user conversations |
| `getConversation` | Query | Get conversation with messages |
| `createConversation` | Mutation | Create conversation |
| `sendMessage` | Mutation | Send message |
| `markAsRead` | Mutation | Mark messages as read |
| `closeConversation` | Mutation | Close conversation |
| `reopenConversation` | Mutation | Reopen conversation |
| `addParticipant` | Mutation | Add participant |
| `removeParticipant` | Mutation | Remove participant |
| `deleteMessage` | Mutation | Delete message (soft) |

---

## Monitoring Functions

### Metrics & Reports (`convex/monitoring/index.ts`)

| Function | Type | Description |
|----------|------|-------------|
| `getBookingMetrics` | Query | Get booking metrics |
| `getAvailabilityMetrics` | Query | Get availability metrics |
| `calculateBookingMetrics` | Mutation | Calculate and store metrics |
| `calculateAvailabilityMetrics` | Mutation | Calculate availability metrics |
| `listReportSchedules` | Query | List report schedules |
| `createReportSchedule` | Mutation | Create report schedule |
| `updateReportSchedule` | Mutation | Update report schedule |
| `deleteReportSchedule` | Mutation | Delete report schedule |
| `getDashboardSummary` | Query | Get dashboard summary |

---

## Billing Functions

### Webhooks (`convex/billing/webhooks.ts`)

| Function | Type | Description |
|----------|------|-------------|
| `stripeWebhook` | Action | Handle Stripe webhook |
| `vippsWebhook` | Action | Handle Vipps webhook |

---

## Authentication Functions

### Auth (`convex/auth/password.ts`)

| Function | Type | Description |
|----------|------|-------------|
| `signInWithPassword` | Mutation | Sign in with email/password |
| `signInAsDemo` | Mutation | Sign in as demo user |
| `getRandomDemoUser` | Query | Get random demo user |

---

## Function Naming Conventions

- **Queries**: Read-only operations, auto-update in React
- **Mutations**: Write operations, modify database
- **Actions**: External API calls, side effects

All functions follow the pattern:
```
api.<domain>.<entity>.<operation>
```

Examples:
- `api.domain.resources.list`
- `api.domain.bookings.create`
- `api.tenants.getSettings`
- `api.rbac.listRoles`
