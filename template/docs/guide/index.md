# Introduction

Welcome to **Xaheen** - a production-ready, multi-tenant Backend-as-a-Service built on [Convex](https://convex.dev).

## What is Xaheen?

Xaheen provides the foundational infrastructure for building SaaS applications with:

- **Multi-tenant database kernel** with Convex access control
- **Enterprise authentication** with multiple OAuth providers
- **Flexible role-based access control** (RBAC)
- **Feature flags** for gradual rollouts
- **Billing integration** with Stripe and Vipps
- **GraphQL gateway** for unified API access
- **Policy versioning** for governance

## Architecture Overview

```
+---------------------------------------------------------+
|                    Client Apps                          |
|              (Web, Mobile, Desktop)                     |
+-----------------------+---------------------------------+
                        |
                        v
+---------------------------------------------------------+
|                  @xaheen/sdk                              |
|     TypeScript SDK with queries, mutations, realtime    |
+-----------------------+---------------------------------+
                        |
                        v
+---------------------------------------------------------+
|                 Convex Functions                        |
|  +-------+ +------+ +--------+ +---------+ +---------+ |
|  | RBAC  | | Auth | | Flags  | | Billing | | GraphQL | |
|  +-------+ +------+ +--------+ +---------+ +---------+ |
+-----------------------+---------------------------------+
                        |
                        v
+---------------------------------------------------------+
|                  Convex Database                        |
|  +--------------------------------------------------+  |
|  |    Tables with access control policies            |  |
|  |  tenants | users | roles | permissions | events  |  |
|  +--------------------------------------------------+  |
+---------------------------------------------------------+
```

## Key Features

### Multi-Tenancy

Every table includes a `tenant_id` field with access control policies ensuring complete data isolation between tenants.

### Authentication

OAuth 2.0 + PKCE support for:
- Microsoft (Azure AD)
- Google
- BankID (Norwegian eID)
- Vipps (Norwegian payment/identity)
- Feide (Norwegian education)

### RBAC

Hierarchical role-based access control:
- System permissions
- Tenant-scoped roles
- User-role bindings with expiration
- Denormalized permission views for fast lookups

### Feature Flags

Tenant-scoped feature flags:
- Boolean and JSON value support
- Real-time updates
- Client-side SDK integration

### Billing

Payment provider integration:
- Stripe webhooks
- Vipps recurring
- Computed entitlements
- Module-based access control

## Next Steps

- [Quick Start](/guide/quick-start) - Get up and running in minutes
- [Architecture](/guide/architecture) - Deep dive into the system design
- [API Reference](/api/) - Explore the Convex Functions
