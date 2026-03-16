import React from 'react';

const TableSkeleton = ({ rows = 5, cols = 4 }) => {
    return (
        <div className="w-full animate-pulse bg-white rounded-xl border border-border overflow-hidden">
            <div className="bg-slate-50 border-b border-gray-100 px-6 py-4 flex justify-between items-center">
                <div className="h-6 w-48 bg-slate-200 rounded"></div>
                <div className="h-4 w-20 bg-slate-200 rounded"></div>
            </div>
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-slate-50">
                        <tr>
                            {[...Array(cols)].map((_, i) => (
                                <th key={i} className="px-6 py-4">
                                    <div className="h-4 w-24 bg-slate-200 rounded mx-auto sm:mx-0"></div>
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 bg-white">
                        {[...Array(rows)].map((_, i) => (
                            <tr key={i}>
                                {[...Array(cols)].map((_, j) => (
                                    <td key={j} className="px-6 py-4">
                                        <div className="h-4 w-full bg-slate-100 rounded"></div>
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default TableSkeleton;
