import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/ThemeContext';
import {
    Users,
    BookOpen,
    CalendarCheck,
    BarChart3,
    Settings,
    LogOut,
    GraduationCap,
    UserPlus
} from 'lucide-react';

const Sidebar = ({ isOpen, setIsOpen }) => {
    const { role, logout } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login', { replace: true });
    };

    const getNavLinks = () => {
        switch (role) {
            case 'admin':
                return [
                    { name: 'Dashboard', path: '/admin', icon: <BarChart3 className="w-5 h-5" /> },
                    { name: 'Analytics', path: '/admin/analytics', icon: <BookOpen className="w-5 h-5" /> },
                    { name: 'Result Publication', path: '/admin/results', icon: <CalendarCheck className="w-5 h-5" /> },
                    { name: 'Settings', path: '/admin/settings', icon: <Settings className="w-5 h-5" /> },
                ];
            case 'hr':
                return [
                    { name: 'Dashboard', path: '/hr', icon: <BarChart3 className="w-5 h-5" /> },
                    { name: 'Student Onboarding', path: '/hr/students', icon: <UserPlus className="w-5 h-5" /> },
                    { name: 'Student Management', path: '/hr/student-management', icon: <GraduationCap className="w-5 h-5" /> },
                    { name: 'Staff Management', path: '/hr/staff', icon: <Users className="w-5 h-5" /> },
                ];
            case 'staff':
                return [
                    { name: 'Dashboard', path: '/staff', icon: <BarChart3 className="w-5 h-5" /> },
                    { name: 'Mentor Group', path: '/staff/students', icon: <Users className="w-5 h-5" /> },
                    { name: 'Class Attendance', path: '/staff/attendance', icon: <CalendarCheck className="w-5 h-5" /> },
                    { name: 'Marks Entry', path: '/staff/marks', icon: <BookOpen className="w-5 h-5" /> },
                ];
            case 'student':
            default:
                return [
                    { name: 'Dashboard', path: '/student', icon: <BarChart3 className="w-5 h-5" /> },
                    { name: 'My Attendance', path: '/student/attendance', icon: <CalendarCheck className="w-5 h-5" /> },
                    { name: 'Results', path: '/student/results', icon: <BookOpen className="w-5 h-5" /> },
                    { name: 'Settings', path: '/student/settings', icon: <Settings className="w-5 h-5" /> },
                ];
        }
    };

    const navLinks = getNavLinks();

    return (
        <aside
            className={`
        fixed inset-y-0 left-0 z-40 w-64 bg-sidebar text-sidebar-foreground 
        transition-transform duration-300 ease-in-out lg:static lg:translate-x-0
        flex flex-col border-r border-sidebar-border shadow-lg
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}
        >
            <div className="h-16 flex items-center justify-center border-b border-sidebar-border shrink-0 px-6">
                <h1 className="text-xl font-bold tracking-wider uppercase">UMS Portal</h1>
            </div>

            <div className="flex-1 overflow-y-auto py-6 px-4 space-y-2">
                {navLinks.map((link) => {
                    const isActive = location.pathname === link.path;
                    return (
                        <Link
                            key={link.path}
                            to={link.path}
                            onClick={() => setIsOpen(false)}
                            className={`
                flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200
                ${isActive
                                    ? 'bg-sidebar-accent text-sidebar-foreground font-bold shadow-sm'
                                    : 'hover:bg-sidebar-accent/50 text-sidebar-foreground/80 hover:text-sidebar-foreground'
                                }
              `}
                        >
                            {link.icon}
                            <span>{link.name}</span>
                        </Link>
                    );
                })}
            </div>

            <div className="p-4 border-t border-sidebar-border shrink-0">
                <button
                    onClick={handleLogout}
                    className="flex items-center space-x-3 px-4 py-3 w-full rounded-lg hover:bg-red-500/20 text-sidebar-foreground/80 hover:text-red-500 transition-colors"
                >
                    <LogOut className="w-5 h-5" />
                    <span>Logout</span>
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;
