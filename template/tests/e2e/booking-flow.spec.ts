/**
 * Booking Flow E2E Tests
 *
 * End-to-end tests for the complete booking user journey.
 * Uses Playwright to test the full flow from browsing to confirmation.
 */

import { test, expect } from '@playwright/test';

// Test configuration
const BASE_URL = process.env.TEST_BASE_URL || 'http://localhost:3000';
const TEST_TENANT_SLUG = process.env.TEST_TENANT_SLUG || 'demo';

test.describe('Booking Flow E2E', () => {
    test.describe('User Story: Browse and Book Resource', () => {
        test('US-4.1: Complete booking flow without approval', async ({ page }) => {
            // Step 1: Navigate to resources page
            await page.goto(`${BASE_URL}/${TEST_TENANT_SLUG}/resources`);
            await expect(page).toHaveURL(new RegExp(`/${TEST_TENANT_SLUG}/resources`));

            // Step 2: Browse available resources
            const resourceList = page.locator('[data-testid="resource-list"]');
            await expect(resourceList).toBeVisible();

            // Step 3: Select a resource
            const firstResource = page.locator('[data-testid="resource-card"]').first();
            await firstResource.click();

            // Step 4: View resource details
            await expect(page.locator('[data-testid="resource-detail"]')).toBeVisible();
            await expect(page.locator('[data-testid="book-button"]')).toBeVisible();

            // Step 5: Start booking process
            await page.click('[data-testid="book-button"]');

            // Step 6: Select date and time
            const datePicker = page.locator('[data-testid="date-picker"]');
            await expect(datePicker).toBeVisible();

            // Select tomorrow
            await page.click('[data-testid="date-next-day"]');

            // Select time slot
            await page.click('[data-testid="time-slot-available"]');

            // Step 7: Confirm booking
            await page.click('[data-testid="confirm-booking"]');

            // Step 8: Verify confirmation
            await expect(page.locator('[data-testid="booking-confirmation"]')).toBeVisible();
            await expect(page.locator('[data-testid="booking-status"]')).toHaveText(/confirmed/i);
        });

        test('US-4.1: Booking with approval requirement', async ({ page }) => {
            // Navigate to resource that requires approval
            await page.goto(`${BASE_URL}/${TEST_TENANT_SLUG}/resources/approval-required`);

            // Start booking
            await page.click('[data-testid="book-button"]');

            // Select date and time
            await page.click('[data-testid="date-next-day"]');
            await page.click('[data-testid="time-slot-available"]');

            // Confirm booking
            await page.click('[data-testid="confirm-booking"]');

            // Verify pending status
            await expect(page.locator('[data-testid="booking-status"]')).toHaveText(/pending/i);
            await expect(page.locator('[data-testid="approval-notice"]')).toBeVisible();
        });

        test('US-4.1: Booking conflict handling', async ({ page }) => {
            // Navigate to resource
            await page.goto(`${BASE_URL}/${TEST_TENANT_SLUG}/resources/busy-resource`);

            // Start booking
            await page.click('[data-testid="book-button"]');

            // Try to select already booked slot
            const bookedSlot = page.locator('[data-testid="time-slot-booked"]').first();
            await expect(bookedSlot).toHaveClass(/disabled|unavailable/);

            // Verify cannot select booked slot
            await bookedSlot.click({ force: true });
            await expect(page.locator('[data-testid="slot-unavailable-message"]')).toBeVisible();
        });
    });

    test.describe('User Story: Manage Bookings', () => {
        test('US-4.3: Cancel own booking', async ({ page }) => {
            // Login first
            await page.goto(`${BASE_URL}/login`);
            await page.fill('[data-testid="email-input"]', 'user@test.com');
            await page.fill('[data-testid="password-input"]', 'demo123');
            await page.click('[data-testid="login-button"]');

            // Navigate to my bookings
            await page.goto(`${BASE_URL}/${TEST_TENANT_SLUG}/my-bookings`);

            // Find active booking
            const activeBooking = page.locator('[data-testid="booking-card"][data-status="confirmed"]').first();
            await expect(activeBooking).toBeVisible();

            // Click cancel
            await activeBooking.locator('[data-testid="cancel-button"]').click();

            // Confirm cancellation
            await page.click('[data-testid="confirm-cancel"]');

            // Verify cancelled status
            await expect(page.locator('[data-testid="cancel-success"]')).toBeVisible();
        });

        test('US-4.4: View booking calendar', async ({ page }) => {
            await page.goto(`${BASE_URL}/${TEST_TENANT_SLUG}/calendar`);

            // Verify calendar loads
            const calendar = page.locator('[data-testid="booking-calendar"]');
            await expect(calendar).toBeVisible();

            // Verify bookings are displayed
            const bookingEvents = page.locator('[data-testid="calendar-event"]');
            await expect(bookingEvents.first()).toBeVisible();

            // Navigate to next week
            await page.click('[data-testid="calendar-next-week"]');

            // Verify calendar updates
            await expect(calendar).toBeVisible();
        });
    });

    test.describe('User Story: Admin Approval Workflow', () => {
        test('US-4.2: Approve pending booking', async ({ page }) => {
            // Login as admin
            await page.goto(`${BASE_URL}/login`);
            await page.fill('[data-testid="email-input"]', 'admin@test.com');
            await page.fill('[data-testid="password-input"]', 'demo123');
            await page.click('[data-testid="login-button"]');

            // Navigate to admin bookings
            await page.goto(`${BASE_URL}/${TEST_TENANT_SLUG}/admin/bookings?status=pending`);

            // Find pending booking
            const pendingBooking = page.locator('[data-testid="booking-row"][data-status="pending"]').first();
            await expect(pendingBooking).toBeVisible();

            // Approve booking
            await pendingBooking.locator('[data-testid="approve-button"]').click();

            // Confirm approval
            await page.click('[data-testid="confirm-approve"]');

            // Verify approved
            await expect(page.locator('[data-testid="approval-success"]')).toBeVisible();
        });

        test('US-4.2: Reject pending booking with reason', async ({ page }) => {
            // Login as admin
            await page.goto(`${BASE_URL}/login`);
            await page.fill('[data-testid="email-input"]', 'admin@test.com');
            await page.fill('[data-testid="password-input"]', 'demo123');
            await page.click('[data-testid="login-button"]');

            // Navigate to admin bookings
            await page.goto(`${BASE_URL}/${TEST_TENANT_SLUG}/admin/bookings?status=pending`);

            // Find pending booking
            const pendingBooking = page.locator('[data-testid="booking-row"][data-status="pending"]').first();

            // Reject booking
            await pendingBooking.locator('[data-testid="reject-button"]').click();

            // Enter rejection reason
            await page.fill('[data-testid="rejection-reason"]', 'Resource under maintenance');
            await page.click('[data-testid="confirm-reject"]');

            // Verify rejected
            await expect(page.locator('[data-testid="rejection-success"]')).toBeVisible();
        });
    });
});

test.describe('Resource Management E2E', () => {
    test.describe('User Story: Admin Resource Management', () => {
        test.beforeEach(async ({ page }) => {
            // Login as admin
            await page.goto(`${BASE_URL}/login`);
            await page.fill('[data-testid="email-input"]', 'admin@test.com');
            await page.fill('[data-testid="password-input"]', 'demo123');
            await page.click('[data-testid="login-button"]');
        });

        test('US-3.1: Create new resource', async ({ page }) => {
            // Navigate to admin resources
            await page.goto(`${BASE_URL}/${TEST_TENANT_SLUG}/admin/resources`);

            // Click create new
            await page.click('[data-testid="create-resource-button"]');

            // Fill form
            await page.fill('[data-testid="resource-name"]', 'New Meeting Room');
            await page.fill('[data-testid="resource-slug"]', 'new-meeting-room');
            await page.selectOption('[data-testid="resource-category"]', 'LOKALER');
            await page.fill('[data-testid="resource-capacity"]', '10');
            await page.fill('[data-testid="resource-description"]', 'A new meeting room for testing');

            // Save as draft
            await page.click('[data-testid="save-draft-button"]');

            // Verify created
            await expect(page.locator('[data-testid="save-success"]')).toBeVisible();
            await expect(page).toHaveURL(new RegExp('/admin/resources/'));
        });

        test('US-3.2: Publish resource', async ({ page }) => {
            // Navigate to draft resource
            await page.goto(`${BASE_URL}/${TEST_TENANT_SLUG}/admin/resources/draft-resource`);

            // Verify draft status
            await expect(page.locator('[data-testid="resource-status"]')).toHaveText(/draft/i);

            // Click publish
            await page.click('[data-testid="publish-button"]');

            // Confirm publish
            await page.click('[data-testid="confirm-publish"]');

            // Verify published
            await expect(page.locator('[data-testid="resource-status"]')).toHaveText(/published/i);
        });

        test('US-3.3: Filter resources by category', async ({ page }) => {
            await page.goto(`${BASE_URL}/${TEST_TENANT_SLUG}/admin/resources`);

            // Select category filter
            await page.selectOption('[data-testid="category-filter"]', 'SPORT');

            // Verify filtered results
            const resources = page.locator('[data-testid="resource-row"]');
            const count = await resources.count();

            for (let i = 0; i < count; i++) {
                const category = resources.nth(i).locator('[data-testid="resource-category"]');
                await expect(category).toHaveText(/SPORT/i);
            }
        });
    });
});

test.describe('Authentication E2E', () => {
    test('US-2.1: Login with email and password', async ({ page }) => {
        await page.goto(`${BASE_URL}/login`);

        // Fill credentials
        await page.fill('[data-testid="email-input"]', 'user@test.com');
        await page.fill('[data-testid="password-input"]', 'demo123');

        // Submit
        await page.click('[data-testid="login-button"]');

        // Verify redirected to dashboard
        await expect(page).toHaveURL(new RegExp('/dashboard'));
        await expect(page.locator('[data-testid="user-menu"]')).toBeVisible();
    });

    test('US-2.1: Invalid credentials shows error', async ({ page }) => {
        await page.goto(`${BASE_URL}/login`);

        // Fill invalid credentials
        await page.fill('[data-testid="email-input"]', 'wrong@test.com');
        await page.fill('[data-testid="password-input"]', 'wrongpassword');

        // Submit
        await page.click('[data-testid="login-button"]');

        // Verify error message
        await expect(page.locator('[data-testid="login-error"]')).toBeVisible();
        await expect(page.locator('[data-testid="login-error"]')).toHaveText(/invalid/i);
    });

    test('US-2.2: Demo login', async ({ page }) => {
        await page.goto(`${BASE_URL}/login`);

        // Click demo login
        await page.click('[data-testid="demo-login-button"]');

        // Verify logged in
        await expect(page).toHaveURL(new RegExp('/dashboard'));
        await expect(page.locator('[data-testid="demo-mode-banner"]')).toBeVisible();
    });
});

test.describe('Tenant Onboarding E2E', () => {
    test('US-1.1: Register new tenant', async ({ page }) => {
        await page.goto(`${BASE_URL}/register`);

        // Fill registration form
        await page.fill('[data-testid="company-name"]', 'Test Company AS');
        await page.fill('[data-testid="company-slug"]', 'test-company');
        await page.fill('[data-testid="admin-email"]', 'admin@testcompany.com');
        await page.fill('[data-testid="admin-name"]', 'Test Admin');

        // Submit
        await page.click('[data-testid="register-button"]');

        // Verify success
        await expect(page.locator('[data-testid="registration-success"]')).toBeVisible();

        // Verify redirected to setup
        await expect(page).toHaveURL(new RegExp('/setup'));
    });

    test('US-1.1: Duplicate slug shows error', async ({ page }) => {
        await page.goto(`${BASE_URL}/register`);

        // Fill with existing slug
        await page.fill('[data-testid="company-name"]', 'Another Company');
        await page.fill('[data-testid="company-slug"]', 'demo'); // Existing slug
        await page.fill('[data-testid="admin-email"]', 'admin@another.com');

        // Submit
        await page.click('[data-testid="register-button"]');

        // Verify error
        await expect(page.locator('[data-testid="slug-error"]')).toBeVisible();
        await expect(page.locator('[data-testid="slug-error"]')).toHaveText(/already exists/i);
    });
});
