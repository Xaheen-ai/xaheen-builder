import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

// =============================================================================
// CONVEX SCHEMA - Full Xaheen Migration
// Migrated from: 4 PostgreSQL schemas (platform, domain, compliance, monitoring)
// Total tables: 35
// =============================================================================

export default defineSchema({
    // ===========================================================================
    // PLATFORM SCHEMA (5 tables)
    // ===========================================================================

    tenants: defineTable({
        name: v.string(),
        slug: v.string(),
        domain: v.optional(v.string()),
        settings: v.any(),
        status: v.union(
            v.literal("active"),
            v.literal("suspended"),
            v.literal("pending"),
            v.literal("deleted")
        ),
        seatLimits: v.any(),
        featureFlags: v.any(),
        enabledCategories: v.array(v.string()),
        deletedAt: v.optional(v.number()),
    })
        .index("by_slug", ["slug"])
        .index("by_domain", ["domain"])
        .index("by_status", ["status"]),

    organizations: defineTable({
        tenantId: v.id("tenants"),
        name: v.string(),
        slug: v.string(),
        description: v.optional(v.string()),
        type: v.string(),
        parentId: v.optional(v.id("organizations")),
        settings: v.any(),
        metadata: v.any(),
        status: v.union(
            v.literal("active"),
            v.literal("inactive"),
            v.literal("suspended"),
            v.literal("deleted")
        ),
        deletedAt: v.optional(v.number()),
    })
        .index("by_tenant", ["tenantId"])
        .index("by_slug", ["tenantId", "slug"])
        .index("by_parent", ["parentId"]),

    users: defineTable({
        authUserId: v.optional(v.string()), // Clerk/Auth user ID
        tenantId: v.optional(v.id("tenants")),
        organizationId: v.optional(v.id("organizations")),
        email: v.string(),
        name: v.optional(v.string()),
        displayName: v.optional(v.string()),
        avatarUrl: v.optional(v.string()),
        nin: v.optional(v.string()), // National identity number (fødselsnummer)
        phoneNumber: v.optional(v.string()), // Phone number (from Vipps)
        role: v.string(),
        status: v.union(
            v.literal("active"),
            v.literal("inactive"),
            v.literal("invited"),
            v.literal("suspended"),
            v.literal("deleted")
        ),
        demoToken: v.optional(v.string()),
        metadata: v.any(),
        deletedAt: v.optional(v.number()),
        lastLoginAt: v.optional(v.number()),
    })
        .index("by_email", ["email"])
        .index("by_authUserId", ["authUserId"])
        .index("by_nin", ["nin"])
        .index("by_tenant", ["tenantId"])
        .index("by_status", ["status"])
        .index("by_demoToken", ["demoToken"]),

    tenantUsers: defineTable({
        tenantId: v.id("tenants"),
        userId: v.id("users"),
        status: v.union(
            v.literal("active"),
            v.literal("invited"),
            v.literal("suspended"),
            v.literal("removed")
        ),
        invitedByUserId: v.optional(v.id("users")),
        invitedAt: v.optional(v.number()),
        joinedAt: v.optional(v.number()),
    })
        .index("by_tenant", ["tenantId"])
        .index("by_user", ["userId"])
        .index("by_tenant_user", ["tenantId", "userId"]),

    authDemoTokens: defineTable({
        key: v.string(),
        tenantId: v.id("tenants"),
        organizationId: v.optional(v.id("organizations")),
        userId: v.id("users"),
        tokenHash: v.string(),
        isActive: v.boolean(),
        expiresAt: v.optional(v.number()),
    })
        .index("by_key", ["key"])
        .index("by_user", ["userId"]),

    // RBAC Tables
    roles: defineTable({
        tenantId: v.id("tenants"),
        name: v.string(),
        description: v.optional(v.string()),
        permissions: v.array(v.string()),
        isDefault: v.boolean(),
        isSystem: v.boolean(),
    })
        .index("by_tenant", ["tenantId"])
        .index("by_name", ["tenantId", "name"]),

    userRoles: defineTable({
        userId: v.id("users"),
        roleId: v.id("roles"),
        tenantId: v.id("tenants"),
        assignedAt: v.number(),
    })
        .index("by_user", ["userId"])
        .index("by_role", ["roleId"])
        .index("by_tenant_user", ["tenantId", "userId"]),

    // ===========================================================================
    // DOMAIN SCHEMA (24 tables)
    // ===========================================================================

    // Resources (formerly rental_objects)
    resources: defineTable({
        tenantId: v.id("tenants"),
        organizationId: v.optional(v.id("organizations")),
        name: v.string(),
        slug: v.string(),
        description: v.optional(v.string()),
        categoryKey: v.string(), // Primary category: LOKALER, SPORT, ARRANGEMENT, TORG
        subcategoryKeys: v.optional(v.array(v.string())), // Multiple subcategories
        timeMode: v.string(),
        features: v.array(v.any()),
        ruleSetKey: v.optional(v.string()),
        status: v.string(),
        requiresApproval: v.boolean(),
        capacity: v.optional(v.number()),
        inventoryTotal: v.optional(v.number()),
        images: v.array(v.any()),
        pricing: v.any(),
        metadata: v.any(),
        // Booking mode settings
        allowSeasonRental: v.optional(v.boolean()), // Enable season/long-term rental requests
        allowRecurringBooking: v.optional(v.boolean()), // Enable recurring booking patterns
    })
        .index("by_tenant", ["tenantId"])
        .index("by_slug", ["tenantId", "slug"])
        .index("by_category", ["categoryKey"])
        .index("by_status", ["status"]),

    bookings: defineTable({
        tenantId: v.id("tenants"),
        resourceId: v.id("resources"),
        userId: v.id("users"),
        organizationId: v.optional(v.id("organizations")),
        status: v.string(),
        startTime: v.number(),
        endTime: v.number(),
        totalPrice: v.number(),
        currency: v.string(),
        notes: v.optional(v.string()),
        metadata: v.any(),
        version: v.number(),
        submittedAt: v.optional(v.number()),
        approvedBy: v.optional(v.id("users")),
        approvedAt: v.optional(v.number()),
        rejectionReason: v.optional(v.string()),
    })
        .index("by_tenant", ["tenantId"])
        .index("by_resource", ["resourceId"])
        .index("by_user", ["userId"])
        .index("by_status", ["status"])
        .index("by_organization", ["organizationId"])
        .index("by_time_range", ["resourceId", "startTime", "endTime"]),

    bookingConflicts: defineTable({
        tenantId: v.id("tenants"),
        resourceId: v.id("resources"),
        bookingId: v.id("bookings"),
        conflictingBookingId: v.id("bookings"),
        conflictType: v.string(),
        severity: v.string(),
        description: v.optional(v.string()),
        overlapStart: v.optional(v.number()),
        overlapEnd: v.optional(v.number()),
        resolvedAt: v.optional(v.number()),
        resolvedBy: v.optional(v.id("users")),
        resolution: v.optional(v.string()),
        resolutionNotes: v.optional(v.string()),
        metadata: v.any(),
    })
        .index("by_tenant", ["tenantId"])
        .index("by_resource", ["resourceId"])
        .index("by_booking", ["bookingId"]),

    allocations: defineTable({
        tenantId: v.id("tenants"),
        organizationId: v.optional(v.id("organizations")),
        resourceId: v.id("resources"),
        title: v.string(),
        startTime: v.number(),
        endTime: v.number(),
        status: v.string(),
        bookingId: v.optional(v.id("bookings")),
        userId: v.optional(v.id("users")),
        notes: v.optional(v.string()),
        recurring: v.any(),
        metadata: v.any(),
    })
        .index("by_tenant", ["tenantId"])
        .index("by_resource", ["resourceId"])
        .index("by_time", ["startTime", "endTime"]),

    blocks: defineTable({
        tenantId: v.id("tenants"),
        resourceId: v.id("resources"),
        title: v.string(),
        reason: v.optional(v.string()),
        startDate: v.number(),
        endDate: v.number(),
        allDay: v.boolean(),
        recurring: v.boolean(),
        recurrenceRule: v.optional(v.string()),
        visibility: v.string(),
        status: v.string(),
        createdBy: v.optional(v.id("users")),
    })
        .index("by_tenant", ["tenantId"])
        .index("by_resource", ["resourceId"])
        .index("by_time_range", ["startDate", "endDate"]),

    seasonalLeases: defineTable({
        tenantId: v.id("tenants"),
        resourceId: v.id("resources"),
        organizationId: v.id("organizations"),
        startDate: v.number(),
        endDate: v.number(),
        weekdays: v.array(v.number()),
        startTime: v.string(),
        endTime: v.string(),
        status: v.string(),
        totalPrice: v.number(),
        currency: v.string(),
        notes: v.optional(v.string()),
        metadata: v.any(),
    })
        .index("by_tenant", ["tenantId"])
        .index("by_resource", ["resourceId"])
        .index("by_organization", ["organizationId"]),

    pricingGroups: defineTable({
        tenantId: v.id("tenants"),
        name: v.string(),
        description: v.optional(v.string()),
        isDefault: v.boolean(),
        priority: v.number(),
        isActive: v.boolean(),
        metadata: v.any(),
    }).index("by_tenant", ["tenantId"]),

    orgPricingGroups: defineTable({
        tenantId: v.id("tenants"),
        organizationId: v.id("organizations"),
        pricingGroupId: v.id("pricingGroups"),
        discountPercent: v.optional(v.number()),
        validFrom: v.optional(v.number()),
        validUntil: v.optional(v.number()),
        isActive: v.boolean(),
        metadata: v.any(),
    })
        .index("by_tenant", ["tenantId"])
        .index("by_organization", ["organizationId"])
        .index("by_pricing_group", ["pricingGroupId"]),

    resourcePricing: defineTable({
        tenantId: v.id("tenants"),
        resourceId: v.id("resources"),
        pricingGroupId: v.optional(v.id("pricingGroups")),
        priceType: v.string(),
        basePrice: v.number(),
        currency: v.string(),
        minDuration: v.optional(v.number()),
        maxDuration: v.optional(v.number()),
        pricePerHour: v.optional(v.number()),
        pricePerDay: v.optional(v.number()),
        depositAmount: v.optional(v.number()),
        cleaningFee: v.optional(v.number()),
        rules: v.any(),
        isActive: v.boolean(),
        metadata: v.any(),
    })
        .index("by_tenant", ["tenantId"])
        .index("by_resource", ["resourceId"])
        .index("by_pricing_group", ["pricingGroupId"]),

    userPricingGroups: defineTable({
        tenantId: v.id("tenants"),
        userId: v.id("users"),
        pricingGroupId: v.id("pricingGroups"),
        validFrom: v.optional(v.number()),
        validUntil: v.optional(v.number()),
        isActive: v.boolean(),
        metadata: v.any(),
    })
        .index("by_tenant", ["tenantId"])
        .index("by_user", ["userId"])
        .index("by_pricing_group", ["pricingGroupId"]),

    amenityGroups: defineTable({
        tenantId: v.id("tenants"),
        name: v.string(),
        slug: v.string(),
        description: v.optional(v.string()),
        icon: v.optional(v.string()),
        displayOrder: v.number(),
        isActive: v.boolean(),
        metadata: v.any(),
    })
        .index("by_tenant", ["tenantId"])
        .index("by_slug", ["tenantId", "slug"]),

    amenities: defineTable({
        tenantId: v.id("tenants"),
        groupId: v.optional(v.id("amenityGroups")),
        name: v.string(),
        slug: v.string(),
        description: v.optional(v.string()),
        icon: v.optional(v.string()),
        displayOrder: v.number(),
        isHighlighted: v.boolean(),
        isActive: v.boolean(),
        metadata: v.any(),
    })
        .index("by_tenant", ["tenantId"])
        .index("by_group", ["groupId"])
        .index("by_slug", ["tenantId", "slug"]),

    resourceAmenities: defineTable({
        tenantId: v.id("tenants"),
        resourceId: v.id("resources"),
        amenityId: v.id("amenities"),
        quantity: v.number(),
        notes: v.optional(v.string()),
        isIncluded: v.boolean(),
        additionalCost: v.optional(v.number()),
        metadata: v.any(),
    })
        .index("by_tenant", ["tenantId"])
        .index("by_resource", ["resourceId"])
        .index("by_amenity", ["amenityId"]),

    addons: defineTable({
        tenantId: v.id("tenants"),
        name: v.string(),
        slug: v.string(),
        description: v.optional(v.string()),
        category: v.optional(v.string()),
        priceType: v.string(),
        price: v.number(),
        currency: v.string(),
        maxQuantity: v.optional(v.number()),
        requiresApproval: v.boolean(),
        leadTimeHours: v.optional(v.number()),
        icon: v.optional(v.string()),
        images: v.array(v.any()),
        displayOrder: v.number(),
        isActive: v.boolean(),
        metadata: v.any(),
    })
        .index("by_tenant", ["tenantId"])
        .index("by_slug", ["tenantId", "slug"])
        .index("by_category", ["tenantId", "category"]),

    bookingAddons: defineTable({
        tenantId: v.id("tenants"),
        bookingId: v.id("bookings"),
        addonId: v.id("addons"),
        quantity: v.number(),
        unitPrice: v.number(),
        totalPrice: v.number(),
        currency: v.string(),
        notes: v.optional(v.string()),
        status: v.string(),
        metadata: v.any(),
    })
        .index("by_tenant", ["tenantId"])
        .index("by_booking", ["bookingId"])
        .index("by_addon", ["addonId"]),

    resourceAddons: defineTable({
        tenantId: v.id("tenants"),
        resourceId: v.id("resources"),
        addonId: v.id("addons"),
        isRequired: v.boolean(),
        isRecommended: v.boolean(),
        customPrice: v.optional(v.number()),
        displayOrder: v.number(),
        isActive: v.boolean(),
        metadata: v.any(),
    })
        .index("by_tenant", ["tenantId"])
        .index("by_resource", ["resourceId"])
        .index("by_addon", ["addonId"]),

    custodyGrants: defineTable({
        tenantId: v.id("tenants"),
        resourceId: v.id("resources"),
        userId: v.id("users"),
        custodyType: v.string(),
        grantedBy: v.optional(v.id("users")),
        grantedAt: v.number(),
        expiresAt: v.optional(v.number()),
        notes: v.optional(v.string()),
        permissions: v.any(),
        isActive: v.boolean(),
        metadata: v.any(),
    })
        .index("by_tenant", ["tenantId"])
        .index("by_resource", ["resourceId"])
        .index("by_user", ["userId"]),

    custodySubgrants: defineTable({
        tenantId: v.id("tenants"),
        parentGrantId: v.id("custodyGrants"),
        resourceId: v.id("resources"),
        userId: v.id("users"),
        subgrantType: v.string(),
        grantedBy: v.id("users"),
        grantedAt: v.number(),
        expiresAt: v.optional(v.number()),
        notes: v.optional(v.string()),
        permissions: v.any(),
        isActive: v.boolean(),
        metadata: v.any(),
    })
        .index("by_tenant", ["tenantId"])
        .index("by_parent_grant", ["parentGrantId"])
        .index("by_resource", ["resourceId"])
        .index("by_user", ["userId"]),

    seasons: defineTable({
        tenantId: v.id("tenants"),
        name: v.string(),
        description: v.optional(v.string()),
        startDate: v.number(),
        endDate: v.number(),
        applicationStartDate: v.optional(v.number()),
        applicationEndDate: v.optional(v.number()),
        status: v.string(),
        type: v.string(),
        settings: v.any(),
        metadata: v.any(),
        isActive: v.boolean(),
    })
        .index("by_tenant", ["tenantId"])
        .index("by_status", ["status"])
        .index("by_dates", ["startDate", "endDate"]),

    priorityRules: defineTable({
        tenantId: v.id("tenants"),
        seasonId: v.optional(v.id("seasons")),
        name: v.string(),
        description: v.optional(v.string()),
        rules: v.array(v.any()),
        priority: v.number(),
        isActive: v.boolean(),
    })
        .index("by_tenant", ["tenantId"])
        .index("by_season", ["seasonId"]),

    seasonApplications: defineTable({
        tenantId: v.id("tenants"),
        seasonId: v.id("seasons"),
        userId: v.id("users"),
        organizationId: v.optional(v.id("organizations")),
        resourceId: v.optional(v.id("resources")),
        weekday: v.optional(v.number()),
        startTime: v.optional(v.string()),
        endTime: v.optional(v.string()),
        priority: v.number(),
        status: v.string(),
        applicantName: v.optional(v.string()),
        applicantEmail: v.optional(v.string()),
        applicantPhone: v.optional(v.string()),
        applicationData: v.any(),
        notes: v.optional(v.string()),
        rejectionReason: v.optional(v.string()),
        reviewedBy: v.optional(v.id("users")),
        reviewedAt: v.optional(v.number()),
        metadata: v.any(),
    })
        .index("by_tenant", ["tenantId"])
        .index("by_season", ["seasonId"])
        .index("by_user", ["userId"])
        .index("by_organization", ["organizationId"])
        .index("by_status", ["status"]),

    conversations: defineTable({
        tenantId: v.id("tenants"),
        userId: v.id("users"),
        bookingId: v.optional(v.id("bookings")),
        resourceId: v.optional(v.id("resources")),
        participants: v.array(v.id("users")),
        subject: v.optional(v.string()),
        status: v.string(),
        unreadCount: v.number(),
        lastMessageAt: v.optional(v.number()),
        metadata: v.any(),
    })
        .index("by_tenant", ["tenantId"])
        .index("by_user", ["userId"])
        .index("by_booking", ["bookingId"])
        .index("by_status", ["status"]),

    messages: defineTable({
        tenantId: v.id("tenants"),
        conversationId: v.id("conversations"),
        senderId: v.id("users"),
        senderType: v.string(),
        content: v.string(),
        messageType: v.string(),
        attachments: v.array(v.any()),
        readAt: v.optional(v.number()),
        metadata: v.any(),
        sentAt: v.number(),
    })
        .index("by_tenant", ["tenantId"])
        .index("by_conversation", ["conversationId"])
        .index("by_sender", ["senderId"]),

    categories: defineTable({
        tenantId: v.id("tenants"),
        parentId: v.optional(v.id("categories")),
        key: v.optional(v.string()),
        name: v.string(),
        slug: v.string(),
        description: v.optional(v.string()),
        icon: v.optional(v.string()),
        color: v.optional(v.string()),
        sortOrder: v.optional(v.number()),
        settings: v.any(),
        isActive: v.boolean(),
    })
        .index("by_tenant", ["tenantId"])
        .index("by_parent", ["parentId"])
        .index("by_slug", ["tenantId", "slug"])
        .index("by_key", ["tenantId", "key"]),

    favorites: defineTable({
        tenantId: v.id("tenants"),
        userId: v.id("users"),
        resourceId: v.id("resources"),
        notes: v.optional(v.string()),
        tags: v.array(v.string()),
        metadata: v.any(),
    })
        .index("by_tenant", ["tenantId"])
        .index("by_user", ["userId"])
        .index("by_resource", ["resourceId"])
        .index("by_user_resource", ["userId", "resourceId"]),

    // ===========================================================================
    // COMPLIANCE SCHEMA (2 tables)
    // ===========================================================================

    rentalAgreements: defineTable({
        tenantId: v.id("tenants"),
        bookingId: v.optional(v.id("bookings")),
        resourceId: v.id("resources"),
        userId: v.id("users"),
        agreementType: v.string(),
        agreementVersion: v.string(),
        agreementText: v.string(),
        isSigned: v.boolean(),
        signatureData: v.optional(v.any()),
        ipAddress: v.optional(v.string()),
        userAgent: v.optional(v.string()),
        metadata: v.any(),
        signedAt: v.optional(v.number()),
    })
        .index("by_booking", ["bookingId"])
        .index("by_user", ["userId", "signedAt"]),

    bookingAudit: defineTable({
        tenantId: v.id("tenants"),
        bookingId: v.id("bookings"),
        userId: v.optional(v.id("users")),
        action: v.string(),
        previousState: v.optional(v.any()),
        newState: v.optional(v.any()),
        reason: v.optional(v.string()),
        metadata: v.any(),
        timestamp: v.number(),
    })
        .index("by_booking", ["bookingId", "timestamp"])
        .index("by_action", ["action", "timestamp"]),

    // ===========================================================================
    // MONITORING SCHEMA (4 tables)
    // ===========================================================================

    bookingMetrics: defineTable({
        tenantId: v.id("tenants"),
        resourceId: v.optional(v.id("resources")),
        metricType: v.string(),
        period: v.string(),
        value: v.number(),
        count: v.optional(v.number()),
        metadata: v.any(),
        periodStart: v.number(),
        periodEnd: v.number(),
        calculatedAt: v.number(),
    })
        .index("by_type", ["metricType", "periodStart"])
        .index("by_resource", ["resourceId", "periodStart"]),

    availabilityMetrics: defineTable({
        tenantId: v.id("tenants"),
        resourceId: v.id("resources"),
        period: v.string(),
        totalSlots: v.number(),
        bookedSlots: v.number(),
        utilizationRate: v.number(),
        popularTimeSlots: v.array(v.any()),
        metadata: v.any(),
        periodStart: v.number(),
        periodEnd: v.number(),
        calculatedAt: v.number(),
    })
        .index("by_resource", ["resourceId", "periodStart"])
        .index("by_utilization", ["utilizationRate", "periodStart"]),

    reportSchedules: defineTable({
        tenantId: v.id("tenants"),
        name: v.string(),
        description: v.optional(v.string()),
        reportType: v.string(),
        cronExpression: v.string(),
        recipients: v.array(v.string()),
        filters: v.any(),
        format: v.string(),
        enabled: v.boolean(),
        lastRunAt: v.optional(v.number()),
        nextRunAt: v.optional(v.number()),
        createdBy: v.id("users"),
        metadata: v.any(),
    })
        .index("by_tenant", ["tenantId"])
        .index("by_enabled", ["tenantId", "enabled"])
        .index("by_next_run", ["nextRunAt"])
        .index("by_type", ["reportType"]),

    scheduledReports: defineTable({
        scheduleId: v.id("reportSchedules"),
        tenantId: v.id("tenants"),
        status: v.string(),
        startedAt: v.optional(v.number()),
        completedAt: v.optional(v.number()),
        fileUrl: v.optional(v.string()),
        fileSize: v.optional(v.string()),
        error: v.optional(v.string()),
        metadata: v.any(),
    })
        .index("by_schedule", ["scheduleId"])
        .index("by_tenant", ["tenantId"])
        .index("by_status", ["status"]),

    // ===========================================================================
    // DIGDIR EXTENSION TABLES (5 tables)
    // ===========================================================================

    // Reviews
    reviews: defineTable({
        tenantId: v.id("tenants"),
        resourceId: v.id("resources"),
        userId: v.id("users"),
        rating: v.number(),
        title: v.optional(v.string()),
        text: v.optional(v.string()),
        status: v.string(), // pending, approved, rejected, flagged
        moderatedBy: v.optional(v.id("users")),
        moderatedAt: v.optional(v.number()),
        moderationNote: v.optional(v.string()),
        metadata: v.optional(v.any()),
    })
        .index("by_tenant", ["tenantId"])
        .index("by_resource", ["resourceId"])
        .index("by_user", ["userId"])
        .index("by_status", ["tenantId", "status"]),

    // Notifications
    notifications: defineTable({
        tenantId: v.id("tenants"),
        userId: v.id("users"),
        type: v.string(), // booking_confirmed, booking_cancelled, message_received, etc.
        title: v.string(),
        body: v.optional(v.string()),
        link: v.optional(v.string()),
        readAt: v.optional(v.number()),
        metadata: v.optional(v.any()),
    })
        .index("by_tenant", ["tenantId"])
        .index("by_user", ["userId"])
        .index("by_user_unread", ["userId", "readAt"]),

    // Notification Preferences
    notificationPreferences: defineTable({
        tenantId: v.id("tenants"),
        userId: v.id("users"),
        channel: v.string(), // email, push, in_app
        category: v.string(), // bookings, messages, system
        enabled: v.boolean(),
    })
        .index("by_tenant", ["tenantId"])
        .index("by_user", ["userId"]),

    // Saved Filters
    savedFilters: defineTable({
        tenantId: v.id("tenants"),
        userId: v.id("users"),
        name: v.string(),
        type: v.string(), // listings, bookings, users
        filters: v.any(),
        isDefault: v.optional(v.boolean()),
    })
        .index("by_tenant", ["tenantId"])
        .index("by_user", ["userId"]),

    // Discount Codes
    discountCodes: defineTable({
        tenantId: v.id("tenants"),
        code: v.string(),
        description: v.optional(v.string()),
        discountType: v.string(), // percentage, fixed
        discountValue: v.number(),
        maxUses: v.optional(v.number()),
        currentUses: v.number(),
        validFrom: v.optional(v.number()),
        validUntil: v.optional(v.number()),
        status: v.string(), // active, expired, disabled
        metadata: v.optional(v.any()),
    })
        .index("by_tenant", ["tenantId"])
        .index("by_code", ["tenantId", "code"]),

    // ===========================================================================
    // PAYMENTS SCHEMA (1 table)
    // ===========================================================================

    payments: defineTable({
        tenantId: v.id("tenants"),
        bookingId: v.optional(v.id("bookings")),
        userId: v.optional(v.id("users")),
        provider: v.string(), // "vipps"
        reference: v.string(), // Our unique reference
        externalId: v.optional(v.string()), // Vipps payment ID
        amount: v.number(), // In minor units (øre)
        currency: v.string(), // "NOK"
        description: v.optional(v.string()),
        status: v.string(), // "created"|"authorized"|"captured"|"refunded"|"cancelled"|"failed"
        redirectUrl: v.optional(v.string()),
        capturedAmount: v.optional(v.number()),
        refundedAmount: v.optional(v.number()),
        metadata: v.optional(v.any()),
        createdAt: v.number(),
        updatedAt: v.number(),
    })
        .index("by_tenant", ["tenantId"])
        .index("by_booking", ["bookingId"])
        .index("by_reference", ["reference"])
        .index("by_status", ["tenantId", "status"]),

    // ===========================================================================
    // AUTH SCHEMA (2 tables)
    // ===========================================================================

    sessions: defineTable({
        userId: v.id("users"),
        token: v.string(),
        appId: v.optional(v.string()),
        provider: v.string(),
        expiresAt: v.number(),
        lastActiveAt: v.number(),
        isActive: v.boolean(),
    })
        .index("by_token", ["token"])
        .index("by_user", ["userId"]),

    oauthStates: defineTable({
        state: v.string(),
        provider: v.string(),
        appOrigin: v.string(),
        returnPath: v.string(),
        appId: v.string(),
        signicatSessionId: v.optional(v.string()), // Signicat REST API session ID
        createdAt: v.number(),
        expiresAt: v.number(),
        consumed: v.boolean(),
    }).index("by_state", ["state"]),
});
