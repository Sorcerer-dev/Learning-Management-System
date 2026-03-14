import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/ThemeContext';
import { User, Shield, CheckCircle, Loader2, Save } from 'lucide-react';
import { toast } from 'sonner';

const API_URL = import.meta.env.VITE_API_URL;

const HRProfileSettings = () => {
    const { token, user } = useAuth();
    const [loading, setLoading] = useState(false);
    
    const [profileForm, setProfileForm] = useState({
        name: '',
        phone: ''
    });

    const [passwordForm, setPasswordForm] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });

    useEffect(() => {
        if (user) {
            setProfileForm({
                name: user.name || '',
                phone: user.staffProfile?.phone || ''
            });
        }
    }, [user]);

    const handleProfileChange = (e) => {
        setProfileForm({ ...profileForm, [e.target.name]: e.target.value });
    };

    const handlePasswordChange = (e) => {
        setPasswordForm({ ...passwordForm, [e.target.name]: e.target.value });
    };

    const handleProfileSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const res = await fetch(`${API_URL}/api/auth/update-profile`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    name: profileForm.name,
                    phone: profileForm.phone
                })
            });

            const data = await res.json();
            if (res.ok) {
                toast.success('Profile details updated successfully');
            } else {
                toast.error(data.error || 'Failed to update profile');
            }
        } catch (err) {
            toast.error('Network error. Failed to update profile');
        } finally {
            setLoading(false);
        }
    };

    const handlePasswordSubmit = async (e) => {
        e.preventDefault();
        
        if (passwordForm.newPassword !== passwordForm.confirmPassword) {
            toast.error('New Password and Confirm Password do not match.');
            return;
        }

        setLoading(true);
        try {
            const res = await fetch(`${API_URL}/api/auth/update-profile`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    currentPassword: passwordForm.currentPassword,
                    newPassword: passwordForm.newPassword
                })
            });

            const data = await res.json();
            if (res.ok) {
                toast.success('Password updated successfully');
                setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
            } else {
                toast.error(data.error || 'Failed to update password');
            }
        } catch (err) {
            toast.error('Network error. Failed to update password');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-6 max-w-4xl mx-auto animate-in fade-in duration-300">
            <h1 className="text-3xl font-bold text-primary mb-2">Profile Settings</h1>
            <p className="text-slate-500 mb-8">Manage your personal details and account security.</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Personal Details Card */}
                <div className="bg-white rounded-2xl shadow-sm border border-border p-6 sm:p-8">
                    <div className="flex items-center gap-3 mb-6 border-b border-gray-100 pb-4">
                        <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                            <User className="w-6 h-6" />
                        </div>
                        <h2 className="text-xl font-bold text-gray-800">Personal Details</h2>
                    </div>

                    <form onSubmit={handleProfileSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                            <input
                                type="text"
                                name="name"
                                value={profileForm.name}
                                onChange={handleProfileChange}
                                required
                                className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-primary focus:border-primary outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Phone Contact</label>
                            <input
                                type="tel"
                                name="phone"
                                value={profileForm.phone}
                                onChange={handleProfileChange}
                                className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-primary focus:border-primary outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Email <span className="text-xs text-gray-400 font-normal">(Non-editable)</span></label>
                            <input
                                type="text"
                                value={user?.email || ''}
                                disabled
                                className="w-full border border-gray-200 bg-gray-50 text-gray-500 rounded-lg p-3 outline-none cursor-not-allowed"
                            />
                        </div>

                        <div className="pt-4">
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground py-3 rounded-xl font-bold shadow-sm transition-all flex items-center justify-center gap-2"
                            >
                                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Save className="w-4 h-4" /> Save Profile</>}
                            </button>
                        </div>
                    </form>
                </div>

                {/* Security Card */}
                <div className="bg-white rounded-2xl shadow-sm border border-border p-6 sm:p-8">
                    <div className="flex items-center gap-3 mb-6 border-b border-gray-100 pb-4">
                        <div className="p-2 bg-green-50 text-green-600 rounded-lg">
                            <Shield className="w-6 h-6" />
                        </div>
                        <h2 className="text-xl font-bold text-gray-800">Security & Password</h2>
                    </div>

                    <form onSubmit={handlePasswordSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Current Password</label>
                            <input
                                type="password"
                                name="currentPassword"
                                value={passwordForm.currentPassword}
                                onChange={handlePasswordChange}
                                required
                                className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
                            />
                        </div>
                        <div className="pt-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                            <input
                                type="password"
                                name="newPassword"
                                value={passwordForm.newPassword}
                                onChange={handlePasswordChange}
                                required
                                minLength={6}
                                className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
                            <input
                                type="password"
                                name="confirmPassword"
                                value={passwordForm.confirmPassword}
                                onChange={handlePasswordChange}
                                required
                                minLength={6}
                                className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
                            />
                        </div>

                        <div className="pt-4">
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-3 rounded-xl font-bold shadow-sm transition-all flex items-center justify-center gap-2"
                            >
                                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <><CheckCircle className="w-4 h-4" /> Update Password</>}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default HRProfileSettings;
