import React from 'react';

const TableSkeleton = ({ rows = 5, cols = 4 }) => {
    return (
        <div className="w-full animate-pulse bg-white dark:bg-slate-900 rounded-xl border border-border dark:border-slate-800 overflow-hidden">
            <div className="bg-slate-50 dark:bg-slate-800/50 border-b border-gray-100 dark:border-slate-800 px-6 py-4 flex justify-between items-center">
                <div className="h-6 w-48 bg-slate-200 dark:bg-slate-800 rounded"></div>
                <div className="h-4 w-20 bg-slate-200 dark:bg-slate-800 rounded"></div>
            </div>
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-slate-800">
                    <thead className="bg-slate-50 dark:bg-slate-800/50">
                        <tr>
                            {[...Array(cols)].map((_, i) => (
                                <th key={i} className="px-6 py-4">
                                    <div className="h-4 w-24 bg-slate-200 dark:bg-slate-700 rounded mx-auto sm:mx-0"></div>
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-slate-800 bg-white dark:bg-slate-900/50">
                        {[...Array(rows)].map((_, i) => (
                            <tr key={i}>
                                {[...Array(cols)].map((_, j) => (
                                    <td key={j} className="px-6 py-4">
                                        <div className="h-4 w-full bg-slate-100 dark:bg-slate-800/80 rounded"></div>
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
