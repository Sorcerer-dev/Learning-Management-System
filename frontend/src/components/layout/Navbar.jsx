import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../context/ThemeContext';
import { Menu, Bell, Search, UserCircle, ChevronDown, Settings, LogOut, Moon, Sun } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Navbar = ({ toggleSidebar }) => {
    const { role, user, darkMode, toggleDarkMode } = useAuth();

    const getRoleDisplayName = () => {
        switch (role) {
            case 'admin': return 'Principal / CoE';
            case 'hr': return 'HR Admin';
            case 'staff': return 'HOD / Mentor';
            case 'student': return 'Student';
            default: return 'User';
        }
    };

    const navigate = useNavigate();
    const { logout } = useAuth();
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const dropdownRef = useRef(null);

    // Close dropdown strictly when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsProfileOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <header className="h-16 bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-800 flex items-center justify-between px-4 lg:px-6 shrink-0 shadow-sm z-10 w-full relative transition-colors duration-300">
            {/* Absolute colored top bar representing the theme for extra flair (optional but nice) */}
            <div className="absolute top-0 left-0 w-full h-1 bg-primary"></div>

            <div className="flex items-center">
                <button
                    onClick={toggleSidebar}
                    className="p-2 -ml-2 mr-4 text-gray-500 hover:text-gray-700 lg:hidden focus:outline-none rounded-md hover:bg-gray-100"
                >
                    <Menu className="w-6 h-6" />
                </button>

                {/* Search placeholder */}
                <div className="hidden md:flex items-center text-gray-400 bg-gray-100 dark:bg-slate-800 rounded-lg px-3 py-2 w-64 lg:w-96 focus-within:ring-2 focus-within:ring-primary focus-within:bg-white dark:focus-within:bg-slate-700 transition-all">
                    <Search className="w-4 h-4 mr-2" />
                    <input
                        type="text"
                        placeholder="Search student, staff, or report..."
                        className="bg-transparent border-none outline-none text-sm w-full text-gray-700 dark:text-gray-200"
                    />
                </div>
            </div>

            <div className="flex items-center space-x-4">
                {/* Dark Mode Toggle */}
                <button
                    onClick={toggleDarkMode}
                    className="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 rounded-full hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
                    title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
                >
                    {darkMode ? <Sun className="w-5 h-5 text-amber-500" /> : <Moon className="w-5 h-5" />}
                </button>

                {/* Notifications */}
                <button className="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 relative rounded-full hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors">
                    <Bell className="w-5 h-5" />
                    <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full border border-white dark:border-slate-900"></span>
                </button>

                {/* User Profile */}
                <div className="relative" ref={dropdownRef}>
                    <button
                        onClick={() => setIsProfileOpen(!isProfileOpen)}
                        className="flex items-center pl-4 border-l border-gray-200 dark:border-slate-800 hover:bg-gray-50 dark:hover:bg-slate-800/50 p-2 rounded-lg transition-colors focus:outline-none"
                    >
                        <div className="hidden md:block mr-3 text-right">
                            <p className="text-sm font-semibold text-gray-700 dark:text-gray-200 leading-tight">{user?.name || 'User'}</p>
                            <div className="flex items-center justify-end mt-0.5">
                                <span className="w-2 h-2 rounded-full bg-primary mr-1.5 shadow-sm"></span>
                                <p className="text-xs text-gray-500 dark:text-gray-400 capitalize font-medium">{getRoleDisplayName()}</p>
                            </div>
                        </div>
                        <UserCircle className="w-8 h-8 text-primary opacity-80" />
                        <ChevronDown className="w-4 h-4 text-gray-400 ml-2 hidden md:block" />
                    </button>

                    {/* Dropdown Menu */}
                    {isProfileOpen && (
                        <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-900 rounded-xl shadow-lg border border-gray-100 dark:border-slate-800 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                            <div className="px-4 py-3 border-b border-gray-50 dark:border-slate-800 md:hidden text-center">
                                <p className="text-sm font-bold text-gray-800 dark:text-gray-200">{user?.name || 'User'}</p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">{user?.email}</p>
                            </div>
                            <div className="p-2">
                                <button
                                    onClick={() => { setIsProfileOpen(false); navigate(`/${role}/profile`); }}
                                    className="w-full flex items-center gap-2 px-3 py-2.5 text-sm text-gray-700 dark:text-gray-300 font-medium hover:text-primary hover:bg-primary/5 rounded-lg transition-colors"
                                >
                                    <Settings className="w-4 h-4" /> Profile Settings
                                </button>
                                <button
                                    onClick={() => { setIsProfileOpen(false); logout(); }}
                                    className="w-full flex items-center gap-2 px-3 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors mt-1"
                                >
                                    <LogOut className="w-4 h-4" /> Log Out
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
};

export default Navbar;

