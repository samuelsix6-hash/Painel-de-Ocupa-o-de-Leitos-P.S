
import React, { useMemo } from 'react';
import { BedType, HistoricalData } from '../types';

interface StatisticsPanelProps {
    data: HistoricalData;
    filteredDates: string[];
    selectedMonthLabel: string;
}

const StatisticsPanel: React.FC<StatisticsPanelProps> = ({ data, filteredDates, selectedMonthLabel }) => {
    
    // Cálculos estatísticos memorizados que dependem de filteredDates e data
    const stats = useMemo(() => {
        const calculateForType = (type: BedType) => {
            if (!filteredDates || filteredDates.length === 0) return null;
            
            let maxVal = -1;
            let minVal = Infinity;

            // Primeira passada: encontrar os valores extremos
            filteredDates.forEach(dateStr => {
                const dayData = data[dateStr];
                if (!dayData) return;
                
                const val = dayData[type] ?? 0;
                if (val > maxVal) maxVal = val;
                if (val < minVal) minVal = val;
            });

            // Fallback para caso não existam dados válidos
            if (minVal === Infinity) minVal = 0;
            if (maxVal === -1) maxVal = 0;

            // Segunda passada: encontrar todas as datas que possuem esses valores
            const maxDates: string[] = [];
            const minDates: string[] = [];

            filteredDates.forEach(dateStr => {
                const dayData = data[dateStr];
                if (!dayData) return;
                
                const val = dayData[type] ?? 0;
                if (val === maxVal) maxDates.push(dateStr);
                if (val === minVal) minDates.push(dateStr);
            });

            return { maxVal, maxDates, minVal, minDates };
        };

        return {
            clinical: calculateForType(BedType.CLINICAL),
            icu: calculateForType(BedType.ICU)
        };
    }, [filteredDates, data]);

    const renderDateList = (dates: string[]) => {
        if (!dates || dates.length === 0) return "Nenhuma data";
        return dates
            .map(d => new Date(`${d}T00:00:00`).toLocaleDateString('pt-BR'))
            .join(', ');
    };

    if (!filteredDates || filteredDates.length === 0) return null;

    return (
        <div className="mt-8 space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-700 flex items-center">
                    <span className="w-2 h-6 bg-indigo-600 rounded-full mr-3"></span>
                    Estatísticas do Período: <span className="text-indigo-600 ml-2">{selectedMonthLabel}</span>
                </h2>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Estatísticas Clínicos */}
                <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100 flex flex-col h-full">
                    <h4 className="text-sm font-black text-gray-400 uppercase tracking-widest mb-4 border-b pb-2 flex justify-between items-center">
                        <span>{BedType.CLINICAL.replace('Leitos ', '')}</span>
                        <span className="text-[10px] bg-gray-100 px-2 py-0.5 rounded text-gray-400">Picos de Lotação</span>
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 flex-grow">
                        <div className="flex flex-col p-4 bg-red-50 rounded-lg border border-red-100 transition-all hover:shadow-inner">
                            <p className="text-[10px] font-bold text-red-600 uppercase mb-1 flex items-center">
                                <span className="w-1.5 h-1.5 bg-red-500 rounded-full mr-1.5 animate-pulse"></span>
                                Maior Ocupação
                            </p>
                            <p className="text-3xl font-black text-red-700">{stats.clinical?.maxVal} <span className="text-xs font-medium">leitos</span></p>
                            <div className="mt-2 max-h-20 overflow-y-auto text-[10px] text-gray-500 leading-relaxed scrollbar-thin">
                                <span className="font-bold text-red-800">Datas: </span>
                                {stats.clinical && renderDateList(stats.clinical.maxDates)}
                            </div>
                        </div>
                        <div className="flex flex-col p-4 bg-green-50 rounded-lg border border-green-100 transition-all hover:shadow-inner">
                            <p className="text-[10px] font-bold text-green-600 uppercase mb-1 flex items-center">
                                <span className="w-1.5 h-1.5 bg-green-500 rounded-full mr-1.5"></span>
                                Menor Ocupação
                            </p>
                            <p className="text-3xl font-black text-green-700">{stats.clinical?.minVal} <span className="text-xs font-medium">leitos</span></p>
                            <div className="mt-2 max-h-20 overflow-y-auto text-[10px] text-gray-500 leading-relaxed scrollbar-thin">
                                <span className="font-bold text-green-800">Datas: </span>
                                {stats.clinical && renderDateList(stats.clinical.minDates)}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Estatísticas UTI */}
                <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100 flex flex-col h-full">
                    <h4 className="text-sm font-black text-gray-400 uppercase tracking-widest mb-4 border-b pb-2 flex justify-between items-center">
                        <span>{BedType.ICU.replace('Leitos ', '')} (emergência)</span>
                        <span className="text-[10px] bg-gray-100 px-2 py-0.5 rounded text-gray-400">Picos de Lotação</span>
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 flex-grow">
                        <div className="flex flex-col p-4 bg-red-50 rounded-lg border border-red-100 transition-all hover:shadow-inner">
                            <p className="text-[10px] font-bold text-red-600 uppercase mb-1 flex items-center">
                                <span className="w-1.5 h-1.5 bg-red-500 rounded-full mr-1.5 animate-pulse"></span>
                                Maior Ocupação
                            </p>
                            <p className="text-3xl font-black text-red-700">{stats.icu?.maxVal} <span className="text-xs font-medium">leitos</span></p>
                            <div className="mt-2 max-h-20 overflow-y-auto text-[10px] text-gray-500 leading-relaxed scrollbar-thin">
                                <span className="font-bold text-red-800">Datas: </span>
                                {stats.icu && renderDateList(stats.icu.maxDates)}
                            </div>
                        </div>
                        <div className="flex flex-col p-4 bg-green-50 rounded-lg border border-green-100 transition-all hover:shadow-inner">
                            <p className="text-[10px] font-bold text-green-600 uppercase mb-1 flex items-center">
                                <span className="w-1.5 h-1.5 bg-green-500 rounded-full mr-1.5"></span>
                                Menor Ocupação
                            </p>
                            <p className="text-3xl font-black text-green-700">{stats.icu?.minVal} <span className="text-xs font-medium">leitos</span></p>
                            <div className="mt-2 max-h-20 overflow-y-auto text-[10px] text-gray-500 leading-relaxed scrollbar-thin">
                                <span className="font-bold text-green-800">Datas: </span>
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
