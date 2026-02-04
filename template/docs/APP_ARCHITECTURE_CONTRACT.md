# Xaheen Apps Architecture Contract

> This document is the authoritative contract for app types in Xaheen.
> All apps are thin consumers of the kernel via `@xaheen/sdk` and `platform-ui`.

---

## App Types (5 Total)

| App | Audience | Scope |
|-----|----------|-------|
| **backoffice** | Xala operators / platform super admins | Platform control plane |
| **dashboard** | Tenant admins, domain admins, caseworkers | Domain administration |
| **web** | Public users / authenticated end users | End-user experience |
| **docs** | Developers, auditors, customers | Documentation |
| **monitoring** | Ops, support, platform engineers | Observability |

---

## 1. backoffice

**Audience:** Xala operators / platform super admins  
**Scope:** Platform control plane (global)

### Owns
- Tenants (create, suspend, view)
- Module catalog + lifecycle per tenant
- Plans / billing status (Stripe/Vipps)
- Global integrations registry
- Governance (policies, feature flags)
- Evidence packs / verification status
- Platform-level audit & ops

### Does NOT
- ❌ Manage domain data (no DigiList objects/bookings)
- ❌ Act as end-user UI

> This app is **platform-wide**, not tenant-facing.

---

## 2. dashboard

**Audience:** Tenant admins, domain admins, caseworkers  
**Scope:** Domain administration, per tenant

### Example for DigiList
- Rental objects
- Bookings
- Availability rules
- Domain-specific settings

### Owns
- Domain data management
- Domain workflows
- Domain audit (filtered to tenant + domain)

### Does NOT
- ❌ Enable/disable modules (that's backoffice)
- ❌ Manage billing or global tenants
- ❌ Modify platform-wide configuration or module lifecycle
- ❌ Access other tenants than the active tenant

> Think of this as "the customer's admin UI for enabled modules".

---

## 3. web

**Audience:** Public users / authenticated end users  
**Scope:** End-user experience

### Example for DigiList
- Search & browse rental objects
- Booking flow
- Checkout
- "My bookings"

### Owns
- UX only
- Zero business logic
- No admin features

### Does NOT
- ❌ Admin operations
- ❌ Direct DB access

> This is what municipalities or customers link to from their websites.

---

## 4. docs

**Audience:** Developers, auditors, customers  
**Scope:** Documentation & transparency

### Owns
- Platform docs
- Domain docs
- API & SDK docs
- Compliance explanations
- (Optionally) auto-generated verification/evidence views

### Does NOT
- ❌ Mutate data
- ❌ Perform admin actions

> Read-only, but critical for trust and compliance.

---

## 5. monitoring

**Audience:** Ops, support, platform engineers  
**Scope:** Observability & health

### Owns
- Health status
- Metrics
- Outbox / DLQ viewer
- Webhook failures
- Rate limit usage
- Error summaries

### Does NOT
- ❌ Change business data
- ❌ Replace backoffice admin actions

> This app is about **seeing**, not doing.

---

## Permission & Entitlement Model

| App | Requires Module Enabled | Typical Permissions |
|-----|------------------------|---------------------|
| backoffice | ❌ (platform-level) | `platform.*` |
| dashboard | ✅ (per module) | `digilist.*` |
| web | ✅ (implicit) | `digilist.public` |
| docs | ❌ / optional | `docs.read` |
| monitoring | ❌ / limited | `ops.read` |

### Rules
- UI hides features based on permissions
- **Kernel enforces permissions regardless of UI**

---

## Mental Model

```
┌─────────────────────────────────────────────────────────┐
│                        Kernel                           │
│             decides what is allowed                     │
└─────────────────────────────────────────────────────────┘
                           │
┌─────────────────────────────────────────────────────────┐
│                         SDK                             │
│             defines how to call it                      │
└─────────────────────────────────────────────────────────┘
                           │
┌─────────────────────────────────────────────────────────┐
│                     platform-ui                         │
│             defines how it looks                        │
└─────────────────────────────────────────────────────────┘
                           │
┌─────────────────────────────────────────────────────────┐
│                         Apps                            │
│             decide who sees what                        │
└─────────────────────────────────────────────────────────┘
```

---

## Invariants (Never Violated)

No app ever:
- ❌ touches SQL
- ❌ talks to the database directly
- ❌ bypasses the SDK

### Source of Truth

- Authorization decisions are made **only** in the kernel.
- Apps may **read** permissions and entitlements for UX purposes,
  but must never assume enforcement.
- Any mismatch between UI state and kernel enforcement is a kernel bug,
  never an app workaround.

---

## Repo Layout

```
xalabase/
  apps/
    backoffice/       # Platform admin
    dashboard/        # Tenant domain admin
    web/              # End-user UX
    docs/             # Documentation
    monitoring/       # Observability
  packages/
    app-shell/        # Auth wrappers, tenant context, routing
    digilist-ui/      # Domain-specific UI (optional, thin)
  convex/             # Kernel (schema, functions)
  docs/               # Runbooks, specs
  scripts/            # Dev & CI scripts
```

---

## Domain App Rule

For any domain `<domain>`:

| Layer | Location |
|-------|----------|
| Kernel module | `<domain>` schema + functions + SDK |
| Admin UI | Implemented in `dashboard` |
| Public UI | Implemented in `web` |
| Backoffice | **Never** contains domain-specific UI |

This locks the mental model permanently.

---

## SDK Usage Contract

| App | Allowed SDK Namespaces |
|-----|------------------------|
| backoffice | `tenant`, `modules`, `billing`, `governance`, `ops` |
| dashboard | `<domain>.*`, `tenant` (read), `audit` (scoped) |
| web | `<domain>.public.*`, `auth` |
| docs | `docs.*`, `audit.read` (optional) |
| monitoring | `ops.*`, `audit.read`, `events.read` |

> This makes it trivial to enforce via linting later.

---

## Adding a New Domain

1. Add module to kernel (schema + functions + tests)
2. Enable module for tenant via `modules-enable`
3. Add domain pages to `dashboard` app
4. Add public pages to `web` app
5. Domain is live

---

## Companion Documents

| Document | Purpose |
|----------|---------|
| [UI_GUARDRAILS_CONTRACT.md](./UI_GUARDRAILS_CONTRACT.md) | UI implementation rules, component inventory, styling restrictions |
| [DOMAIN_BUNDLE_SPEC.md](./DOMAIN_BUNDLE_SPEC.md) | Module contract for domain bundles |
| [RUN_LOCAL.md](./RUN_LOCAL.md) | Local development runbook |
| [RUN_SELF_HOSTED.md](./RUN_SELF_HOSTED.md) | Staging/Production runbook |

---

## Ratification

> **Status:** APPROVED AS AUTHORITATIVE  
> **Date:** 2026-02-03  
> **Version:** 1.0

This document is the binding architecture contract for Xaheen apps.
Any violation requires explicit RFC and approval.
