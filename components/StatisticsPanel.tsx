
import React from 'react';
import { BedType, HistoricalData } from '../types';

interface StatisticsPanelProps {
    data: HistoricalData;
    filteredDates: string[];
    selectedMonthLabel: string;
}

const StatisticsPanel: React.FC<StatisticsPanelProps> = ({ data, filteredDates, selectedMonthLabel }) => {
    const calculateStats = (type: BedType) => {
        if (filteredDates.length === 0) return null;
        
        let maxVal = -1;
        let minVal = Infinity;

        filteredDates.forEach(dateStr => {
            const val = data[dateStr][type] ?? 0;
            if (val > maxVal) maxVal = val;
            if (val < minVal) minVal = val;
        });

        if (minVal === Infinity) minVal = 0;
        if (maxVal === -1) maxVal = 0;

        const maxDates: string[] = [];
        const minDates: string[] = [];

        filteredDates.forEach(dateStr => {
            const val = data[dateStr][type] ?? 0;
            if (val === maxVal) maxDates.push(dateStr);
            if (val === minVal) minDates.push(dateStr);
        });

        return { maxVal, maxDates, minVal, minDates };
    };

    const stats = {
        clinical: calculateStats(BedType.CLINICAL),
        icu: calculateStats(BedType.ICU)
    };

    const renderDateList = (dates: string[]) => {
        return dates.map(d => new Date(`${d}T00:00:00`).toLocaleDateString('pt-BR')).join(', ');
    };

    if (filteredDates.length === 0) return null;

    return (
        <div className="mt-8 space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-700 flex items-center">
                    <span className="w-2 h-6 bg-indigo-600 rounded-full mr-3"></span>
                    Estatísticas do Período ({selectedMonthLabel})
                </h2>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Clinical Stats */}
                <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
                    <h4 className="text-sm font-black text-gray-400 uppercase tracking-widest mb-4 border-b pb-2">
                        {BedType.CLINICAL.replace('Leitos ', '')}
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="flex flex-col p-4 bg-red-50 rounded-lg border border-red-100">
                            <p className="text-[10px] font-bold text-red-600 uppercase mb-1">Maior Lotação</p>
                            <p className="text-3xl font-black text-red-700">{stats.clinical?.maxVal} <span className="text-xs font-medium">leitos</span></p>
                            <div className="mt-2 max-h-16 overflow-y-auto text-[10px] text-gray-500 italic">
                                {stats.clinical && renderDateList(stats.clinical.maxDates)}
                            </div>
                        </div>
                        <div className="flex flex-col p-4 bg-green-50 rounded-lg border border-green-100">
                            <p className="text-[10px] font-bold text-green-600 uppercase mb-1">Menor Lotação</p>
                            <p className="text-3xl font-black text-green-700">{stats.clinical?.minVal} <span className="text-xs font-medium">leitos</span></p>
                            <div className="mt-2 max-h-16 overflow-y-auto text-[10px] text-gray-500 italic">
                                {stats.clinical && renderDateList(stats.clinical.minDates)}
                            </div>
                        </div>
                    </div>
                </div>

                {/* ICU Stats */}
                <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
                    <h4 className="text-sm font-black text-gray-400 uppercase tracking-widest mb-4 border-b pb-2">
                        {BedType.ICU.replace('Leitos ', '')} (emergência)
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="flex flex-col p-4 bg-red-50 rounded-lg border border-red-100">
                            <p className="text-[10px] font-bold text-red-600 uppercase mb-1">Maior Lotação</p>
                            <p className="text-3xl font-black text-red-700">{stats.icu?.maxVal} <span className="text-xs font-medium">leitos</span></p>
                            <div className="mt-2 max-h-16 overflow-y-auto text-[10px] text-gray-500 italic">
                                {stats.icu && renderDateList(stats.icu.maxDates)}
                            </div>
                        </div>
                        <div className="flex flex-col p-4 bg-green-50 rounded-lg border border-green-100">
                            <p className="text-[10px] font-bold text-green-600 uppercase mb-1">Menor Lotação</p>
                            <p className="text-3xl font-black text-green-700">{stats.icu?.minVal} <span className="text-xs font-medium">leitos</span></p>
                            <div className="mt-2 max-h-16 overflow-y-auto text-[10px] text-gray-500 italic">
                                {stats.icu && renderDateList(stats.icu.minDates)}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StatisticsPanel;
