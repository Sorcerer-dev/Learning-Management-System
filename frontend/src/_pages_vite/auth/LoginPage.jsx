import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/ThemeContext';
import { useNavigate } from 'react-router-dom';
import { LogIn, AlertCircle, Eye, EyeOff, Clock, X } from 'lucide-react';

const LOGIN_HISTORY_KEY = 'ums_login_history';

// Helper to get login history from localStorage
const getLoginHistory = () => {
    try {
        const raw = localStorage.getItem(LOGIN_HISTORY_KEY);
        return raw ? JSON.parse(raw) : [];
    } catch {
        return [];
    }
};

// Helper to save a successful login to history
const saveToLoginHistory = (email, tagAccess) => {
    const history = getLoginHistory();
    // Remove existing entry for this email (so we can move it to top)
    const filtered = history.filter(h => h.email !== email);
    // Add to top with timestamp and tag
    filtered.unshift({ email, tagAccess, lastUsed: Date.now() });
    // Keep only last 20
    localStorage.setItem(LOGIN_HISTORY_KEY, JSON.stringify(filtered.slice(0, 20)));
};

// Helper to remove a single entry
const removeFromHistory = (email) => {
    const history = getLoginHistory().filter(h => h.email !== email);
    localStorage.setItem(LOGIN_HISTORY_KEY, JSON.stringify(history));
};

// Color map for role badges
const tagColors = {
    'Dean': { bg: 'bg-purple-500/20', text: 'text-purple-300', label: 'Admin' },
    'CoE': { bg: 'bg-purple-500/20', text: 'text-purple-300', label: 'Admin' },
    'HR': { bg: 'bg-teal-500/20', text: 'text-teal-300', label: 'HR' },
    'HOD': { bg: 'bg-blue-500/20', text: 'text-blue-300', label: 'Staff' },
    'Mentor': { bg: 'bg-blue-500/20', text: 'text-blue-300', label: 'Staff' },
    'Advisor': { bg: 'bg-blue-500/20', text: 'text-blue-300', label: 'Staff' },
    'Student': { bg: 'bg-emerald-500/20', text: 'text-emerald-300', label: 'Student' },
    'CR': { bg: 'bg-emerald-500/20', text: 'text-emerald-300', label: 'Student' },
};

const LoginPage = () => {
    const { login } = useAuth();
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    // Autocomplete state
    const [showDropdown, setShowDropdown] = useState(false);
    const [filteredHistory, setFilteredHistory] = useState([]);
    const dropdownRef = useRef(null);
    const inputRef = useRef(null);

    // Filter history based on current email input
    useEffect(() => {
        const history = getLoginHistory();
        if (email.trim() === '') {
            setFilteredHistory(history);
        } else {
            const query = email.toLowerCase();
            setFilteredHistory(
                history.filter(h => h.email.toLowerCase().includes(query))
            );
        }
    }, [email]);

    // Close dropdown on outside click
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target) &&
                inputRef.current && !inputRef.current.contains(e.target)) {
                setShowDropdown(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const selectHistoryItem = (item) => {
        setEmail(item.email);
        setShowDropdown(false);
        // Focus password field after selection
        setTimeout(() => {
            document.getElementById('password-input')?.focus();
        }, 50);
    };

    const handleRemoveHistory = (e, historyEmail) => {
        e.stopPropagation();
        removeFromHistory(historyEmail);
        setFilteredHistory(prev => prev.filter(h => h.email !== historyEmail));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const data = await login(email, password);

            // Save successful login to history (get tagAccess from decoded token)
            const storedToken = localStorage.getItem('ums_token');
            if (storedToken) {
                try {
                    const payload = JSON.parse(atob(storedToken.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')));
                    saveToLoginHistory(email, payload.tagAccess || 'Student');
                } catch {
                    saveToLoginHistory(email, 'Student');
                }
            }

            navigate(`/${data.role}`, { replace: true });
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const history = getLoginHistory();

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4">
            {/* Background decorations */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-40 -right-40 w-80 h-80 rounded-full bg-indigo-500/10 blur-3xl"></div>
                <div className="absolute -bottom-40 -left-40 w-80 h-80 rounded-full bg-teal-500/10 blur-3xl"></div>
            </div>

            <div className="w-full max-w-md relative z-10">
                {/* Logo / Header */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-white/10 backdrop-blur-sm rounded-2xl mb-4 border border-white/20 shadow-xl">
                        <span className="text-3xl">🎓</span>
                    </div>
                    <h1 className="text-3xl font-extrabold text-white tracking-tight">UMS Portal</h1>
                    <p className="text-slate-400 mt-2 font-medium">University Management System</p>
                </div>

                {/* Login Card */}
                <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-2xl">
                    <h2 className="text-xl font-bold text-white mb-6">Sign in to your account</h2>

                    {error && (
                        <div className="mb-6 bg-red-500/10 border border-red-500/30 text-red-300 rounded-xl p-4 flex items-center gap-3 text-sm font-medium animate-in slide-in-from-top-2 duration-200">
                            <AlertCircle className="w-5 h-5 shrink-0" />
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div className="relative">
                            <label className="block text-sm font-bold text-slate-300 mb-2">Email Address</label>
                            <input
                                ref={inputRef}
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                onFocus={() => setShowDropdown(true)}
                                className="w-full bg-white/5 border border-white/10 text-white rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all placeholder:text-slate-500"
                                placeholder="Start typing to see recent logins..."
                                required
                                autoComplete="off"
                            />

                            {/* Autocomplete Dropdown */}
                            {showDropdown && filteredHistory.length > 0 && (
                                <div
                                    ref={dropdownRef}
                                    className="absolute top-full left-0 right-0 mt-2 bg-slate-800 border border-white/10 rounded-xl shadow-2xl overflow-hidden z-50 animate-in slide-in-from-top-2 duration-150"
                                >
                                    <div className="px-3 py-2 border-b border-white/5">
                                        <p className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                                            <Clock className="w-3 h-3" />
                                            Recent Logins
                                        </p>
                                    </div>
                                    <div className="max-h-48 overflow-y-auto">
                                        {filteredHistory.map((item) => {
                                            const colors = tagColors[item.tagAccess] || tagColors['Student'];
                                            return (
                                                <div
                                                    key={item.email}
                                                    onClick={() => selectHistoryItem(item)}
                                                    className="px-4 py-3 flex items-center justify-between hover:bg-white/5 cursor-pointer transition-colors group"
                                                >
                                                    <div className="flex items-center gap-3 min-w-0">
                                                        <span className="text-sm text-white font-medium truncate">{item.email}</span>
                                                        <span className={`text-xs font-bold px-2 py-0.5 rounded-full shrink-0 ${colors.bg} ${colors.text}`}>
                                                            {colors.label}
                                                        </span>
                                                    </div>
                                                    <button
                                                        onClick={(e) => handleRemoveHistory(e, item.email)}
                                                        className="p-1 text-slate-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all shrink-0"
                                                        title="Remove from history"
                                                    >
                                                        <X className="w-3.5 h-3.5" />
                                                    </button>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-slate-300 mb-2">Password</label>
                            <div className="relative">
                                <input
                                    id="password-input"
                                    type={showPassword ? 'text' : 'password'}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full bg-white/5 border border-white/10 text-white rounded-xl px-4 py-3 pr-12 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all placeholder:text-slate-500"
                                    placeholder="••••••••"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
                                >
                                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className={`w-full py-3.5 rounded-xl font-bold text-white transition-all flex items-center justify-center gap-2 shadow-lg
                                ${loading
                                    ? 'bg-indigo-500/50 cursor-wait'
                                    : 'bg-indigo-600 hover:bg-indigo-500 hover:-translate-y-0.5 hover:shadow-indigo-500/30 active:translate-y-0'
                                }
                            `}
                        >
                            {loading ? (
                                <>
                                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Signing in...
                                </>
                            ) : (
                                <>
                                    <LogIn className="w-5 h-5" />
                                    Sign In
                                </>
                            )}
                        </button>
                    </form>
                </div>

                {/* Hint for first-time users */}
                {history.length === 0 && (
                    <div className="mt-6 bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-5">
                        <p className="text-sm font-bold text-slate-300 mb-2">💡 Smart Login</p>
                        <p className="text-xs text-slate-400 font-medium">
                            After your first login, your email will be saved locally. Next time, just start typing and select from the dropdown!
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default LoginPage;
