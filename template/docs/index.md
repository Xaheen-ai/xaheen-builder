---
layout: home
hero:
  name: Xaheen
  text: Multi-Tenant Backend-as-a-Service
  tagline: Production-ready platform kernel powered by Convex
  actions:
    - theme: brand
      text: Get Started
      link: /guide/quick-start
    - theme: alt
      text: View on GitHub
      link: https://github.com/xala/xalabase

features:
  - icon: 🏢
    title: Multi-Tenant by Design
    details: Function-level tenant isolation with automatic context injection. One backend, many customers.
    
  - icon: 🔐
    title: Enterprise Auth
    details: OAuth 2.0 + PKCE with Microsoft, Google, BankID, Vipps, and Feide out of the box.
    
  - icon: 👥
    title: Flexible RBAC
    details: Roles, permissions, and hierarchies with tenant-specific customization.
    
  - icon: 🏳️
    title: Feature Flags
    details: Tenant-scoped flags for gradual rollouts and A/B testing.
    
  - icon: 💳
    title: Billing Ready
    details: Stripe and Vipps integration with computed entitlements.
    
  - icon: ⚡
    title: Real-time by Default
    details: Convex provides automatic real-time updates for all queries. No polling needed.
    
  - icon: 📋
    title: Policy Versioning
    details: Publish, rollback, and audit governance policies with full history.
    
  - icon: 🔄
    title: Optimistic Updates
    details: React hooks with built-in optimistic updates for instant UI feedback.
---

## Quick Example

```typescript
import { ConvexProvider } from '@xaheen/sdk';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../convex/_generated/api';

// Wrap your app with ConvexProvider
function App() {
  return (
    <ConvexProvider>
      <MyComponent />
    </ConvexProvider>
  );
}

// Use real-time queries and mutations
function MyComponent() {
  // Automatic real-time updates
  const resources = useQuery(api.domain.resources.list, { 
    tenantId, 
    status: 'published' 
  });

  // Mutations with optimistic updates
  const createBooking = useMutation(api.domain.bookings.create);

  return (
    <button onClick={() => createBooking({ resourceId, startTime, endTime })}>
      Book Now
    </button>
  );
}
```
