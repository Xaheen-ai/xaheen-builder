# Architecture Overview

Xaheen is built on a 3-plane architecture:

## Control Plane (Kernel)

The Convex-powered kernel provides:

- **Tenant Management** - Multi-tenant isolation with RLS
- **Authentication** - Auth orchestrator with multiple providers
- **Authorization** - RBAC and capability-based permissions
- **Billing** - Entitlements and usage tracking
- **Audit** - Full audit trail
- **Modules** - Domain module lifecycle

## Domain Plane

Each domain module (e.g., DigiList) lives in isolation:

- Schema: `<domain>.*` tables
- Functions: Convex functions in `convex/<domain>/*`
- SDK: Namespaced under `sdk.<domain>.*`

## Experience Plane

5 thin apps consume the kernel:

| App | Purpose | Audience |
|-----|---------|----------|
| backoffice | Platform admin | Super admins |
| dashboard | Tenant admin | Tenant operators |
| web | End-user | Public |
| docs | Documentation | Developers |
| monitoring | Ops dashboard | Engineers |

See [App Architecture Contract](/architecture/contracts) for details.
