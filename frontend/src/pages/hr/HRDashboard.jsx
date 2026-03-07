import React from 'react';
import { Upload, Users, FileText, CheckCircle } from 'lucide-react';

const HRDashboard = () => {
    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-gray-800">HR Operations</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard title="Active Staff" value="312" icon={<Users className="w-5 h-5 text-primary" />} />
                <StatCard title="Leaves Pending" value="14" icon={<FileText className="w-5 h-5 text-primary" />} />
                <StatCard title="Onboarded Today" value="0" icon={<CheckCircle className="w-5 h-5 text-primary" />} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Bulk Student Upload */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="bg-primary/5 px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                        <h2 className="text-lg font-semibold text-gray-800">Bulk Student Onboarding</h2>
                        <span className="text-xs font-medium bg-primary text-primary-foreground px-2 py-1 rounded">CSV Data</span>
                    </div>
                    <div className="p-8">
                        <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 flex flex-col items-center justify-center bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer group">
                            <Upload className="w-10 h-10 text-gray-400 group-hover:text-primary mb-4 transition-colors" />
                            <p className="font-medium text-gray-700">Click or drag CSV file to upload</p>
                            <p className="text-xs text-gray-500 mt-2">Required columns: Registration No, Name, Batch, Adm Type</p>
                        </div>
                        <div className="mt-6 flex justify-end">
                            <button className="bg-primary text-primary-foreground px-4 py-2 rounded-lg font- medium opacity-50 cursor-not-allowed">
                                Process Roster
                            </button>
                        </div>
                    </div>
                </div>

                {/* Recent Staff Activity */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                    <div className="px-6 py-4 border-b border-gray-100">
                        <h2 className="text-lg font-semibold text-gray-800">Recent Staff Onboarding</h2>
                    </div>
                    <div className="p-0">
                        <table className="w-full text-left text-sm text-gray-600">
                            <thead className="bg-gray-50 text-gray-500 font-medium">
                                <tr>
                                    <th className="px-6 py-3">Name</th>
                                    <th className="px-6 py-3">Department</th>
                                    <th className="px-6 py-3">Date</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                <tr className="hover:bg-gray-50/50">
                                    <td className="px-6 py-4 font-medium text-gray-900">Dr. Sarah Connor</td>
                                    <td className="px-6 py-4">CSE</td>
                                    <td className="px-6 py-4">Oct 24, 2025</td>
                                </tr>
                                <tr className="hover:bg-gray-50/50">
                                    <td className="px-6 py-4 font-medium text-gray-900">Prof. Alan Turing</td>
                                    <td className="px-6 py-4">Mathematics</td>
                                    <td className="px-6 py-4">Oct 23, 2025</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

const StatCard = ({ title, value, icon }) => (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        <div className="flex items-center justify-between mb-4">
            <h3 className="text-gray-500 text-sm font-medium">{title}</h3>
            <div className="p-2 bg-primary/10 rounded-lg">{icon}</div>
        </div>
        <div className="flex items-baseline space-x-2">
            <h2 className="text-2xl font-bold text-gray-900">{value}</h2>
        </div>
    </div>
);

export default HRDashboard;
