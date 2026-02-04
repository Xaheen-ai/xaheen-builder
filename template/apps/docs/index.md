---
layout: home

hero:
  name: Xaheen
  text: Backend-as-a-Service Platform
  tagline: Multi-tenant Convex-powered platform for building SaaS applications
  actions:
    - theme: brand
      text: Get Started
      link: /sdk/
    - theme: alt
      text: Architecture
      link: /architecture/

features:
  - icon: 🏗️
    title: Multi-Tenant Kernel
    details: Convex-powered control plane with access control, tenant isolation, and module lifecycle management.
  - icon: 📱
    title: 5-App Architecture
    details: Backoffice, Dashboard, Web, Docs, and Monitoring apps with clear separation of concerns.
  - icon: 🔐
    title: SDK-First
    details: All apps interact with the kernel through a type-safe SDK, never touching SQL directly.
  - icon: 🎨
    title: Platform-UI
    details: Unified design system ensuring consistency across all applications.
---

## Quick Start

```bash
# Clone the repository
git clone https://github.com/xala-technologies/xalabase.git
cd xalabase

# Install dependencies
pnpm install

# Start Convex dev server
npx convex dev

# Run migrations
./scripts/setup-local.sh

# Start development
pnpm dev
```

## Architecture Overview

Xaheen follows a 3-plane architecture:

1. **Control Plane** - Convex kernel with tenant management, auth, billing
2. **Domain Plane** - Module-scoped business logic (e.g., DigiList)
3. **Experience Plane** - 5 thin apps consuming the kernel via SDK
