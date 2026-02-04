/**
 * useUsers Hook
 *
 * Fetch users from Convex backend.
 */

interface User {
    _id: string;
    email: string;
    name: string;
    role: string;
    status: string;
    createdAt: number;
}

interface UseUsersResult {
    users: User[];
    isLoading: boolean;
    error: Error | null;
}

export function useUsers(): UseUsersResult {
    // TODO: Implement with Convex query when users.list is available
    return {
        users: [],
        isLoading: false,
        error: null,
    };
}
