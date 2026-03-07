import React, { createContext, useContext, useEffect, useState } from 'react';

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
    // role can be: 'admin', 'hr', 'staff', 'student'
    // In a real app, this would come from the auth state.
    // For Phase 1 frontend development, we'll store a mock role in localStorage.
    const [role, setRole] = useState(() => {
        return localStorage.getItem('mockRole') || 'student';
    });

    useEffect(() => {
        const root = window.document.documentElement;

        // Remove old theme classes
        root.classList.remove('theme-admin', 'theme-hr', 'theme-staff', 'theme-student');

        // Add new theme class based on role
        if (role) {
            root.classList.add(`theme-${role}`);
            localStorage.setItem('mockRole', role);
        }
    }, [role]);

    return (
        <ThemeContext.Provider value={{ role, setRole }}>
            {children}
        </ThemeContext.Provider>
    );
}

export function useTheme() {
    const context = useContext(ThemeContext);
    if (context === undefined) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
}
