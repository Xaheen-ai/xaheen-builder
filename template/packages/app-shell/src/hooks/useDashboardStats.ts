/**
 * useDashboardStats Hook
 *
 * Fetch dashboard statistics from Convex backend.
 */

interface DashboardStats {
    totalBookings: number;
    totalResources: number;
    totalUsers: number;
    revenueThisMonth: number;
    bookingsToday: number;
    pendingApprovals: number;
}

interface UseDashboardStatsResult {
    stats: DashboardStats | null;
    isLoading: boolean;
    error: Error | null;
}

export function useDashboardStats(): UseDashboardStatsResult {
    // TODO: Implement with Convex query when dashboard stats endpoint is available
    return {
        stats: {
            totalBookings: 0,
            totalResources: 0,
            totalUsers: 0,
            revenueThisMonth: 0,
            bookingsToday: 0,
            pendingApprovals: 0,
        },
        isLoading: false,
        error: null,
    };
}
