/**
 * Booking Workflow E2E Tests
 *
 * End-to-end tests for the complete booking user journey.
 * Uses Playwright to test the actual UI.
 */

import { test, expect } from '@playwright/test';

test.describe('Booking Workflow', () => {
    test.beforeEach(async ({ page }) => {
        // Login as test user
        await page.goto('/auth/login');
        await page.fill('[data-testid="email"]', 'test@example.com');
        await page.fill('[data-testid="password"]', 'test-password');
        await page.click('[data-testid="login-button"]');
        await page.waitForURL('/dashboard');
    });

    test('complete booking flow', async ({ page }) => {
        // 1. Navigate to resources
        await page.click('[data-testid="nav-resources"]');
        await page.waitForURL('/resources');

        // 2. Search for meeting room
        await page.fill('[data-testid="search-input"]', 'Meeting Room');
        await page.waitForTimeout(500);

        // 3. Click on first resource
        await page.click('[data-testid="resource-card"]:first-child');
        await page.waitForURL('/resources/*');

        // 4. Check availability
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        const dateStr = tomorrow.toISOString().split('T')[0];
        
        await page.fill('[data-testid="date-picker"]', dateStr);
        await page.click('[data-testid="check-availability"]');

        // 5. Select time slot
        await page.waitForSelector('[data-testid="time-slot"]');
        await page.click('[data-testid="time-slot"]:first-child');

        // 6. Configure booking
        await page.fill('[data-testid="booking-notes"]', 'Team meeting');
        
        // Add addon if available
        const addonExists = await page.locator('[data-testid="addon-checkbox"]').isVisible();
        if (addonExists) {
            await page.check('[data-testid="addon-checkbox"]:first-child');
        }

        // 7. Review and confirm
        await page.click('[data-testid="proceed-to-payment"]');
        await page.waitForSelector('[data-testid="booking-summary"]');

        // Verify summary details
        await expect(page.locator('[data-testid="resource-name"]')).toBeVisible();
        await expect(page.locator('[data-testid="booking-date"]')).toContainText(dateStr);
        await expect(page.locator('[data-testid="total-price"]')).toBeVisible();

        // 8. Confirm booking
        await page.click('[data-testid="confirm-booking"]');
        
        // 9. Verify success
        await page.waitForSelector('[data-testid="booking-success"]');
        await expect(page.locator('[data-testid="booking-reference"]')).toBeVisible();
        
        // 10. Navigate to my bookings
        await page.click('[data-testid="nav-bookings"]');
        await page.waitForURL('/bookings');

        // 11. Verify booking appears
        await expect(page.locator('[data-testid="booking-card"]')).toHaveCount(1);
        await expect(page.locator('[data-testid="booking-status"]')).toContainText('pending');
    });

    test('booking with unavailable time shows error', async ({ page }) => {
        // Navigate to resource
        await page.goto('/resources/meeting-room-a');

        // Select past date
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const dateStr = yesterday.toISOString().split('T')[0];
        
        await page.fill('[data-testid="date-picker"]', dateStr);
        await page.click('[data-testid="check-availability"]');

        // Verify error message
        await expect(page.locator('[data-testid="availability-error"]')).toBeVisible();
        await expect(page.locator('[data-testid="time-slot"]')).toHaveCount(0);
    });

    test('booking approval workflow for admin', async ({ page }) => {
        // Login as admin
        await page.goto('/auth/login');
        await page.fill('[data-testid="email"]', 'admin@example.com');
        await page.fill('[data-testid="password"]', 'admin-password');
        await page.click('[data-testid="login-button"]');

        // Navigate to pending bookings
        await page.click('[data-testid="nav-bookings"]');
        await page.click('[data-testid="filter-pending"]');

        // Approve first booking
        await page.click('[data-testid="booking-card"]:first-child');
        await page.click('[data-testid="approve-booking"]');
        
        // Add approval note
        await page.fill('[data-testid="approval-note"]', 'Approved for team event');
        await page.click('[data-testid="confirm-approve"]');

        // Verify booking approved
        await expect(page.locator('[data-testid="booking-status"]')).toContainText('confirmed');
        await expect(page.locator('[data-testid="approval-timestamp"]')).toBeVisible();
    });

    test('seasonal application flow', async ({ page }) => {
        // Navigate to seasonal bookings
        await page.click('[data-testid="nav-seasonal"]');
        await page.waitForURL('/seasonal');

        // Select active season
        await page.click('[data-testid="season-card"]:first-child');

        // Fill application form
        await page.selectOption('[data-testid="resource-select"]', 'meeting-room-a');
        await page.selectOption('[data-testid="weekday-select"]', '1'); // Monday
        await page.fill('[data-testid="start-time"]', '09:00');
        await page.fill('[data-testid="end-time"]', '11:00');
        await page.fill('[data-testid="application-notes"]', 'Weekly team meeting');

        // Submit application
        await page.click('[data-testid="submit-application"]');

        // Verify submission
        await expect(page.locator('[data-testid="application-success"]')).toBeVisible();
        await expect(page.locator('[data-testid="application-status"]')).toContainText('pending');

        // Check applications list
        await page.click('[data-testid="my-applications"]');
        await expect(page.locator('[data-testid="application-card"]')).toHaveCount(1);
    });

    test('favorites management', async ({ page }) => {
        // Navigate to resources
        await page.goto('/resources');

        // Add first resource to favorites
        await page.click('[data-testid="resource-card"]:first-child [data-testid="favorite-button"]');
        await expect(page.locator('[data-testid="favorite-button"]:first-child')).toHaveClass(/favorited/);

        // Navigate to favorites
        await page.click('[data-testid="nav-favorites"]');
        await page.waitForURL('/favorites');

        // Verify resource in favorites
        await expect(page.locator('[data-testid="favorite-card"]')).toHaveCount(1);

        // Remove from favorites
        await page.click('[data-testid="favorite-card"] [data-testid="favorite-button"]');
        await expect(page.locator('[data-testid="favorite-card"]')).toHaveCount(0);
    });

    test('booking cancellation', async ({ page }) => {
        // Create a booking first
        await page.goto('/resources/meeting-room-a');
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        const dateStr = tomorrow.toISOString().split('T')[0];
        
        await page.fill('[data-testid="date-picker"]', dateStr);
        await page.click('[data-testid="check-availability"]');
        await page.click('[data-testid="time-slot"]:first-child');
        await page.click('[data-testid="proceed-to-payment"]');
        await page.click('[data-testid="confirm-booking"]');
        await page.waitForSelector('[data-testid="booking-success"]');

        // Navigate to my bookings
        await page.click('[data-testid="nav-bookings"]');
        await page.click('[data-testid="booking-card"]:first-child');

        // Cancel booking
        await page.click('[data-testid="cancel-booking"]');
        await page.fill('[data-testid="cancellation-reason"]', 'Schedule conflict');
        await page.click('[data-testid="confirm-cancel"]');

        // Verify cancellation
        await expect(page.locator('[data-testid="booking-status"]')).toContainText('cancelled');
        await expect(page.locator('[data-testid="cancellation-timestamp"]')).toBeVisible();
    });

    test('notifications for booking updates', async ({ page }) => {
        // Start with notification bell
        const notificationBell = page.locator('[data-testid="notification-bell"]');
        await expect(notificationBell).toBeVisible();

        // Create booking
        await page.goto('/resources/meeting-room-a');
        await page.click('[data-testid="check-availability"]');
        await page.click('[data-testid="time-slot"]:first-child');
        await page.click('[data-testid="proceed-to-payment"]');
        await page.click('[data-testid="confirm-booking"]');

        // Check for notification
        await notificationBell.click();
        await expect(page.locator('[data-testid="notification-item"]')).toHaveCount(1);
        await expect(page.locator('[data-testid="notification-item"]')).toContainText('Booking confirmed');

        // Mark as read
        await page.click('[data-testid="notification-item"]');
        await expect(page.locator('[data-testid="notification-item"]')).toHaveClass(/read/);

        // Close notifications
        await page.keyboard.press('Escape');
    });
});
