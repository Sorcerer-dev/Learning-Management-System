import React, { createContext, useContext, useEffect, useState } from 'react';

const API_URL = import.meta.env.VITE_API_URL;
const AuthContext = createContext();

// Helper to decode the JWT on the frontend
const decodeToken = (token) => {
    try {
        const payloadBase64 = token.split('.')[1];
        // Decode base64 URL safe string
        const decodedJson = atob(payloadBase64.replace(/-/g, '+').replace(/_/g, '/'));
        return JSON.parse(decodedJson);
    } catch (error) {
        console.error("Token decoding failed:", error);
        return null;
    }
};

// Maps backend tagAccess to frontend routing/theme role
const getRoleFromTag = (tagAccess) => {
    if (!tagAccess) return 'student';
    const roleMap = {
        'Admin': 'admin',
        'Dean': 'admin',
        'CoE': 'admin',
        'HR': 'hr',
        'HOD': 'staff',
        'Mentor': 'staff',
        'Advisor': 'staff',
        'Student': 'student',
        'CR': 'student',
        'Staff': 'staff'
    };
    
    // Process comma-separated tags
    const tags = tagAccess.split(',').map(t => t.trim());
    for (const tag of tags) {
        if (roleMap[tag]) return roleMap[tag];
    }
    return 'student'; // Fallback
};

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(() => localStorage.getItem('ums_token'));
    const [role, setRole] = useState(() => localStorage.getItem('ums_role') || 'student');
    const [loading, setLoading] = useState(true);

    // Apply theme class instantly whenever role changes
    useEffect(() => {
        const root = window.document.documentElement;
        // Remove all previous themes
        root.classList.remove('theme-admin', 'theme-hr', 'theme-staff', 'theme-student');

        // Force update the theme context colors (Teal, Blue, Purple, Green)
        if (role) {
            root.classList.add(`theme-${role}`);
            localStorage.setItem('ums_role', role);
        }
    }, [role]);

    // On mount, verify token if it exists
    useEffect(() => {
        const restoreSession = async () => {
            if (!token) {
                setLoading(false);
                return;
            }

            try {
                // Decode token to verify we have the role immediately
                const decodedUser = decodeToken(token);
                if (decodedUser) {
                    const mappedRole = getRoleFromTag(decodedUser.tagAccess);
                    setRole(mappedRole);
                    setUser({ ...decodedUser, name: decodedUser.email }); // Fallback name until fetch
                }

                // Call backend for full profile data (including joined table data)
                const res = await fetch(`${API_URL}/api/auth/me`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });

                if (res.ok) {
                    const data = await res.json();
                    setUser(data.user);
                } else {
                    logout(); // Expired or Invalid remotely
                }
            } catch (err) {
                console.error("Session restore failed:", err);
            } finally {
                setLoading(false);
            }
        };

        restoreSession();
    }, [token]);

    const login = async (email, password) => {
        const res = await fetch(`${API_URL}/api/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
        });

        const data = await res.json();

        if (!res.ok) {
            throw new Error(data.error || 'Login failed');
        }

        // Store the JWT 
        localStorage.setItem('ums_token', data.token);
        setToken(data.token);

        // Decode the token to set the userRole in the state
        const decodedUser = decodeToken(data.token);

        if (!decodedUser || !decodedUser.tagAccess) {
            throw new Error('Invalid token layout from backend');
        }

        // Determine the role based on tagAccess
        const mappedRole = getRoleFromTag(decodedUser.tagAccess);

        // This triggers the useEffect above to force the ThemeContext update
        setRole(mappedRole);
        setUser(decodedUser);

        return { role: mappedRole }; // Return role so login page knows where to redirect
    };

    const logout = () => {
        localStorage.removeItem('ums_token');
        localStorage.removeItem('ums_role');
        setToken(null);
        setUser(null);
        setRole('student');
    };

    // Re-fetch user data from backend (used after profile completion)
    const refreshUser = async () => {
        if (!token) return;
        try {
            const res = await fetch(`${API_URL}/api/auth/me`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setUser(data.user);
            }
        } catch (err) {
            console.error('Failed to refresh user:', err);
        }
    };

    return (
        <AuthContext.Provider value={{ user, token, role, setRole, loading, login, logout, refreshUser, isAuthenticated: !!token }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}

export const useTheme = useAuth; // Backwards compatibility variable export
