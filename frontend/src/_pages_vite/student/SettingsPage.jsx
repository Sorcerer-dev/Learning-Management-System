import React, { useState } from 'react';
import { useAuth } from '../../context/ThemeContext';
import { toast } from 'sonner';
import { Loader2, KeyRound, UserCircle, ShieldCheck } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL;

const SettingsPage = () => {
    const { user, token } = useAuth();
    const [loading, setLoading] = useState(false);
    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });

    const studentName = user?.studentProfile?.name || user?.name || user?.email || 'Student';
    const regNo = user?.studentProfile?.regNo || user?.regNo || '—';
    const dob = user?.studentProfile?.dob ? new Date(user.studentProfile.dob).toLocaleDateString() : '—';
    const bloodGroup = user?.studentProfile?.bloodGroup || '—';
    const phone = user?.studentProfile?.phone || '—';
    const address = user?.studentProfile?.address || '—';
    const parentContact = user?.studentProfile?.parentContact || '—';


    const handlePasswordChange = (e) => {
        setPasswordData({ ...passwordData, [e.target.name]: e.target.value });
    };

    const handlePasswordSubmit = async (e) => {
        e.preventDefault();

        if (passwordData.newPassword !== passwordData.confirmPassword) {
            toast.error("New passwords do not match");
            return;
        }

        if (passwordData.newPassword.length < 8) {
            toast.error("Password must be at least 8 characters long");
            return;
        }

        setLoading(true);

        try {
            const res = await fetch(`${API_URL}/api/auth/change-password`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    currentPassword: passwordData.currentPassword,
                    newPassword: passwordData.newPassword
                })
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || 'Failed to change password');
            }

            toast.success('Password updated successfully');
            setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });

        } catch (err) {
            toast.error(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto py-6 space-y-8 animate-in fade-in duration-300">
            <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Account Settings</h1>
                <p className="text-gray-500">View your profile details and manage your security preferences.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Profile Details (Read Only) */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white rounded-xl shadow-sm border border-border p-6 md:p-8">
                        <div className="flex items-center gap-3 mb-6 pb-6 border-b border-gray-100">
                            <div className="bg-primary/10 p-2.5 rounded-lg">
                                <UserCircle className="w-6 h-6 text-primary" />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-gray-900">Personal Information</h2>
                                <p className="text-sm text-gray-500">Contact HR to update these locked details.</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-6">
                            <ReadOnlyField label="Full Name" value={studentName} />
                            <ReadOnlyField label="Registration Number" value={regNo} />
                            <ReadOnlyField label="Date of Birth" value={dob} />
                            <ReadOnlyField label="Blood Group" value={bloodGroup} />
                            <ReadOnlyField label="Phone Number" value={phone} />
                            <ReadOnlyField label="Parent Contact" value={parentContact} />

                            <div className="md:col-span-2">
                                <ReadOnlyField label="Permanent Address" value={address} />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Security / Change Password */}
                <div className="space-y-6">
                    <div className="bg-white rounded-xl shadow-sm border border-border p-6 md:p-8 relative overflow-hidden">
                        {/* Decorative Theme Accent */}
                        <div className="absolute top-0 left-0 w-full h-1 bg-primary"></div>

                        <div className="flex items-center gap-3 mb-6">
                            <div className="bg-primary/10 p-2.5 rounded-lg">
                                <ShieldCheck className="w-5 h-5 text-primary" />
                            </div>
                            <h2 className="text-lg font-bold text-gray-900">Security</h2>
                        </div>

                        <form onSubmit={handlePasswordSubmit} className="space-y-4">
                            <div className="space-y-1.5">
                                <label className="text-sm font-semibold text-gray-700">Current Password</label>
                                <input
                                    type="password"
                                    name="currentPassword"
                                    required
                                    value={passwordData.currentPassword}
                                    onChange={handlePasswordChange}
                                    className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-sm"
                                    placeholder="••••••••"
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-sm font-semibold text-gray-700">New Password</label>
                                <input
                                    type="password"
                                    name="newPassword"
                                    required
                                    value={passwordData.newPassword}
                                    onChange={handlePasswordChange}
                                    className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-sm"
                                    placeholder="••••••••"
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-sm font-semibold text-gray-700">Confirm New Password</label>
                                <input
                                    type="password"
                                    name="confirmPassword"
                                    required
                                    value={passwordData.confirmPassword}
                                    onChange={handlePasswordChange}
                                    className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-sm"
                                    placeholder="••••••••"
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className={`w-full mt-6 py-2.5 rounded-lg font-bold text-sm transition-all flex items-center justify-center gap-2
                                    ${loading
                                        ? 'bg-primary/70 text-white cursor-wait'
                                        : 'bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm hover:shadow active:scale-[0.98]'
                                    }`}
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        Updating...
                                    </>
                                ) : (
                                    <>
                                        <KeyRound className="w-4 h-4" />
                                        Update Password
                                    </>
                                )}
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

const ReadOnlyField = ({ label, value }) => (
    <div className="space-y-1">
        <label className="text-xs font-semibold text-gray-400 tracking-wider uppercase">{label}</label>
        <div className="p-3 bg-gray-50/50 border border-gray-100 rounded-lg">
            <p className="text-sm font-medium text-gray-800 break-words">{value}</p>
        </div>
    </div>
);

export default SettingsPage;
