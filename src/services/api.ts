import { User, PomodoroSession, Friend } from '../types';

const API_URL = 'https://laucve1.dreamhosters.com/backend/api';

// Auth Services
export const authService = {
    async register(username: string, email: string, password: string): Promise<User> {
        const response = await fetch(`${API_URL}/register.php`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username, email, password }),
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message);
        return data.user;
    },

    async login(email: string, password: string): Promise<User> {
        const response = await fetch(`${API_URL}/login.php`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password }),
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message);
        return data.user;
    },

    async resetPassword(email: string, currentPassword: string, newPassword: string): Promise<void> {
        const response = await fetch(`${API_URL}/reset_password.php`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                email,
                current_password: currentPassword,
                new_password: newPassword,
            }),
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message);
    },
};

// Pomodoro Session Services
export const sessionService = {
    async createSession(session: Omit<PomodoroSession, 'id'>): Promise<PomodoroSession> {
        const response = await fetch(`${API_URL}/create_session.php`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(session),
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message);
        return data.session;
    },

    async getSessions(userId: number): Promise<PomodoroSession[]> {
        const response = await fetch(`${API_URL}/get_sessions.php?user_id=${userId}`);
        const data = await response.json();
        if (!response.ok) throw new Error(data.message);
        return data.sessions;
    },
};

// Friend Services
export const friendService = {
    async addFriend(userId: number, friendUsername: string): Promise<Friend> {
        const response = await fetch(`${API_URL}/friend_actions.php?action=add`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                user_id: userId,
                friend_username: friendUsername,
            }),
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message);
        return data.friend;
    },

    async acceptFriend(userId: number, friendId: number): Promise<Friend> {
        const response = await fetch(`${API_URL}/friend_actions.php?action=accept`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                user_id: userId,
                friend_id: friendId,
            }),
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message);
        return data.friend;
    },

    async removeFriend(userId: number, friendId: number): Promise<void> {
        const response = await fetch(`${API_URL}/friend_actions.php?action=remove`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                user_id: userId,
                friend_id: friendId,
            }),
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message);
    },

    async getFriends(userId: number): Promise<Friend[]> {
        const response = await fetch(`${API_URL}/friend_actions.php?action=list&user_id=${userId}`);
        const data = await response.json();
        if (!response.ok) throw new Error(data.message);
        return data;
    },
};

// New service for Pomodoro Sessions
export const pomodoroSessionService = {
    createSession: async (sessionData: { user_id: number; start_time: string; end_time: string; duration: number; is_completed: boolean }) => {
        try {
            const response = await fetch(`${API_URL}/create_session.php`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(sessionData),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to create pomodoro session');
            }

            return await response.json();
        } catch (error) {
            console.error('Error creating pomodoro session:', error);
            throw error;
        }
    },
    // Add other pomodoro session related functions here if needed
};