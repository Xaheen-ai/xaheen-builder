# SDK Installation

Install the Xaheen SDK in your project.

## npm

```bash
npm install @xaheen/sdk convex convex-react
```

## pnpm

```bash
pnpm add @xaheen/sdk convex convex-react
```

## Requirements

- Node.js 20+
- React 18+ (for hooks)
- `convex` 1.x (peer dependency)

## Basic Setup

```typescript
import { ConvexProvider } from '@xaheen/sdk';
import { ConvexReactClient } from 'convex/react';

const convex = new ConvexReactClient(import.meta.env.VITE_CONVEX_URL);

function App() {
  return (
    <ConvexProvider client={convex}>
      <YourApp />
    </ConvexProvider>
  );
}
```

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `VITE_CONVEX_URL` | Yes | Convex deployment URL |

## Using SDK Hooks

```typescript
import { useConvexResources, useConvexBookings } from '@xaheen/sdk';

function ResourceList({ tenantId }) {
  const { resources, isLoading } = useConvexResources({ 
    tenantId, 
    status: 'published' 
  });

  if (isLoading) return <Spinner />;
  return resources.map(r => <ResourceCard key={r.id} resource={r} />);
}
```

## Using Convex Directly

```typescript
import { useQuery, useMutation } from 'convex/react';
import { api } from '../convex/_generated/api';

function BookingForm({ tenantId, resourceId }) {
  const availability = useQuery(api.domain.blocks.checkAvailability, {
    resourceId,
    startTime: Date.now(),
    endTime: Date.now() + 3600000,
  });

  const createBooking = useMutation(api.domain.bookings.create);

  return (
    <button 
      disabled={!availability?.isAvailable}
      onClick={() => createBooking({ tenantId, resourceId, userId, startTime, endTime })}
    >
      Book Now
    </button>
  );
}
```

## TypeScript

Full type definitions included:

```typescript
import type { 
  Resource,
  Booking,
  User,
  Tenant,
  BookingStatus,
  ResourceStatus,
} from '@xaheen/sdk';
```

## Next Steps

- [Hooks Reference](/sdk/hooks) - React hooks for resources, bookings, auth
- [API Types](/sdk/types) - TypeScript type definitions
- [Convex Functions](/api) - Full API reference
