import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const FirstLoginForm = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        dob: '',
        bloodGroup: '',
        address: '',
        parentContact: '',
        gender: ''
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        // Simulate updating backend and setting profile_locked = true
        alert('Profile locked! Redirecting to dashboard...');
        navigate('/student');
    };

    return (
        <div className="max-w-2xl mx-auto py-8">
            <div className="bg-white rounded-xl shadow-sm border border-border p-8 relative overflow-hidden">
                {/* Decorative Theme Accent */}
                <div className="absolute top-0 left-0 w-full h-2 bg-primary"></div>

                <div className="mb-8">
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">Complete Your Profile</h1>
                    <p className="text-gray-500">Welcome to UMS! Please complete your mandatory profile details before proceeding. Once submitted, this information cannot be changed without HR approval.</p>
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
                                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-primary outline-none"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">Gender <span className="text-red-500">*</span></label>
                            <select
                                name="gender"
                                required
                                value={formData.gender}
                                onChange={handleChange}
                                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-primary outline-none"
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
                                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-primary outline-none"
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
                            <label className="text-sm font-medium text-gray-700">Parent/Guardian Contact <span className="text-red-500">*</span></label>
                            <input
                                type="tel"
                                name="parentContact"
                                required
                                value={formData.parentContact}
                                onChange={handleChange}
                                placeholder="+91"
                                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-primary outline-none"
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
                                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-primary outline-none resize-none"
                            ></textarea>
                        </div>

                    </div>

                    <div className="pt-4 flex items-center justify-end border-t border-gray-100">
                        <button
                            type="submit"
                            className="bg-primary text-primary-foreground px-6 py-2.5 rounded-md font-medium hover:opacity-90 transition-opacity"
                        >
                            Lock & Submit Profile
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default FirstLoginForm;
