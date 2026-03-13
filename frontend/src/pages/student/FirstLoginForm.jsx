import React, { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../../context/ThemeContext';
import { toast } from 'sonner';
import { Loader2, Lock } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL;

const FirstLoginForm = () => {
    const navigate = useNavigate();
    const { token, user, refreshUser } = useAuth();
    const [loading, setLoading] = useState(false);

    if (user?.profileLocked) {
        return <Navigate to="/student" replace />;
    }

    const [formData, setFormData] = useState({
        dob: '',
        bloodGroup: '',
        address: '',
        parentContact: '',
        gender: '',
        phone: ''
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const res = await fetch(`${API_URL}/api/student/complete-profile`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(formData)
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || 'Failed to update profile');
            }

            toast.success('Profile completed!', {
                description: 'Your profile has been locked. Welcome to UMS!'
            });

            // Refresh the user data in context so profileLocked becomes true
            await refreshUser();

            // Navigate to the student dashboard
            navigate('/student', { replace: true });

        } catch (err) {
            toast.error('Profile update failed', { description: err.message });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto py-8">
            <div className="bg-white rounded-xl shadow-sm border border-border p-8 relative overflow-hidden">
                {/* Decorative Theme Accent */}
                <div className="absolute top-0 left-0 w-full h-2 bg-primary"></div>

                <div className="mb-8">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="bg-primary/10 p-2 rounded-lg">
                            <Lock className="w-6 h-6 text-primary" />
                        </div>
                        <h1 className="text-2xl font-bold text-gray-900">Complete Your Profile</h1>
                    </div>
                    <p className="text-gray-500">
                        Welcome to UMS, <strong>{user?.name || user?.email}</strong>! Please complete your mandatory profile details before proceeding. Once submitted, this information <strong>cannot be changed</strong> without HR approval.
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">Date of Birth <span className="text-red-500">*</span></label>
                            <input
                                type="date"
                                name="dob"
                                required
                                value={formData.dob}
                                onChange={handleChange}
                                className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">Gender <span className="text-red-500">*</span></label>
                            <select
                                name="gender"
                                required
                                value={formData.gender}
                                onChange={handleChange}
                                className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all"
                            >
                                <option value="">Select Gender</option>
                                <option value="Male">Male</option>
                                <option value="Female">Female</option>
                                <option value="Other">Other</option>
                            </select>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">Blood Group <span className="text-red-500">*</span></label>
                            <select
                                name="bloodGroup"
                                required
                                value={formData.bloodGroup}
                                onChange={handleChange}
                                className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all"
                            >
                                <option value="">Select Blood Group</option>
                                <option value="A+">A+</option>
                                <option value="A-">A-</option>
                                <option value="B+">B+</option>
                                <option value="B-">B-</option>
                                <option value="O+">O+</option>
                                <option value="O-">O-</option>
                                <option value="AB+">AB+</option>
                                <option value="AB-">AB-</option>
                            </select>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">Phone Number</label>
                            <input
                                type="tel"
                                name="phone"
                                value={formData.phone}
                                onChange={handleChange}
                                placeholder="+91 98765 43210"
                                className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">Parent/Guardian Contact <span className="text-red-500">*</span></label>
                            <input
                                type="tel"
                                name="parentContact"
                                required
                                value={formData.parentContact}
                                onChange={handleChange}
                                placeholder="+91 98765 43210"
                                className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all"
                            />
                        </div>

                        <div className="space-y-2 md:col-span-2">
                            <label className="text-sm font-medium text-gray-700">Permanent Address <span className="text-red-500">*</span></label>
                            <textarea
                                name="address"
                                required
                                value={formData.address}
                                onChange={handleChange}
                                rows="3"
                                placeholder="Enter your full permanent address"
                                className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none resize-none transition-all"
                            ></textarea>
                        </div>

                    </div>

                    <div className="pt-4 flex items-center justify-between border-t border-gray-100">
                        <p className="text-xs text-slate-400 max-w-xs">
                            This data is permanently locked once submitted. Contact HR if corrections are needed later.
                        </p>
                        <button
                            type="submit"
                            disabled={loading}
                            className={`flex items-center gap-2 px-6 py-2.5 rounded-lg font-bold transition-all shadow-sm ${loading
                                    ? 'bg-primary/70 text-primary-foreground cursor-wait'
                                    : 'bg-primary text-primary-foreground hover:bg-primary/90 hover:-translate-y-0.5 hover:shadow-md'
                                }`}
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    Saving...
                                </>
                            ) : (
                                <>
                                    <Lock className="w-4 h-4" />
                                    Lock & Submit Profile
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default FirstLoginForm;
