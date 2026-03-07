import React from 'react';
import { useTheme } from '../../context/ThemeContext';
import { Menu, Bell, Search, UserCircle } from 'lucide-react';

const Navbar = ({ toggleSidebar }) => {
    const { role } = useTheme();

    const getRoleDisplayName = () => {
        switch (role) {
            case 'admin': return 'Principal / CoE';
            case 'hr': return 'HR Admin';
            case 'staff': return 'HOD / Mentor';
            case 'student': return 'Student';
            default: return 'User';
        }
    };

    return (
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 lg:px-6 shrink-0 shadow-sm z-10 w-full relative">
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
                <div className="hidden md:flex items-center text-gray-400 bg-gray-100 rounded-lg px-3 py-2 w-64 lg:w-96 focus-within:ring-2 focus-within:ring-primary focus-within:bg-white transition-all">
                    <Search className="w-4 h-4 mr-2" />
                    <input
                        type="text"
                        placeholder="Search student, staff, or report..."
                        className="bg-transparent border-none outline-none text-sm w-full text-gray-700"
                    />
                </div>
            </div>

            <div className="flex items-center space-x-4">
                {/* Notifications */}
                <button className="p-2 text-gray-500 hover:text-gray-700 relative rounded-full hover:bg-gray-100 transition-colors">
                    <Bell className="w-5 h-5" />
                    <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
                </button>

                {/* User Profile */}
                <div className="flex items-center pl-4 border-l border-gray-200">
                    <div className="hidden md:block mr-3 text-right">
                        <p className="text-sm font-semibold text-gray-700 leading-tight">Demo User</p>
                        <div className="flex items-center justify-end mt-0.5">
                            <span className="w-2 h-2 rounded-full bg-primary mr-1.5 shadow-sm"></span>
                            <p className="text-xs text-gray-500 capitalize font-medium">{getRoleDisplayName()}</p>
                        </div>
                    </div>
                    <UserCircle className="w-8 h-8 text-primary opacity-80" />
                </div>
            </div>
        </header>
    );
};

export default Navbar;
