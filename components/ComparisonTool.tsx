
import React, { useState, useMemo } from 'react';
import { HistoricalData, BedType } from '../types';
import { BED_CAPACITY } from '../constants';

// Add this declaration for TypeScript to recognize the XLSX global from the CDN
declare const XLSX: any;

interface ComparisonToolProps {
    historicalData: HistoricalData;
}

// Helper to ensure strict nomenclature adherence
const formatBedName = (type: string): string => {
    switch (type) {
        case BedType.ICU:
            return 'UTI (Emergência)';
        case BedType.CLINICAL_CUIDA_MAIS:
            return 'Clínicos Cuida +';
        case BedType.PEDIATRIC_CUIDA_MAIS:
            return 'Pediátricos Cuida +';
        case BedType.CLINICAL:
            return 'Clínicos';
        case BedType.PEDIATRIC:
            return 'Pediátricos';
        case BedType.STABILIZATION:
            return 'Estabilização';
        default:
            return type.replace('Leitos ', '');
    }
};

const ComparisonTool: React.FC<ComparisonToolProps> = ({ historicalData }) => {
    const [date1, setDate1] = useState<string>('');
    const [date2, setDate2] = useState<string>('');

    const availableDates = useMemo(() => {
        return Object.keys(historicalData).sort((a, b) => new Date(b).getTime() - new Date(a).getTime());
    }, [historicalData]);

    const comparisonData = useMemo(() => {
        if (!date1 || !date2 || !historicalData[date1] || !historicalData[date2]) {
            return null;
        }

        const data1 = historicalData[date1];
        const data2 = historicalData[date2];
        const bedTypes = Object.values(BedType);

        return bedTypes.map(type => {
            const value1 = data1[type] ?? 0;
            const value2 = data2[type] ?? 0;
            const delta = value2 - value1;
            const capacity = BED_CAPACITY[type as keyof typeof BED_CAPACITY] || 100;
            
            return {
                type,
                name: formatBedName(type),
                value1,
                value2,
                delta,
                capacity,
                occupancyPercent: Math.min(100, (value2 / capacity) * 100)
            };
        });

    }, [date1, date2, historicalData]);

    const summary = useMemo(() => {
        if (!comparisonData) return null;
        return comparisonData.reduce((acc, curr) => ({
            totalDelta: acc.totalDelta + curr.delta,
            totalValue1: acc.totalValue1 + curr.value1,
            totalValue2: acc.totalValue2 + curr.value2
        }), { totalDelta: 0, totalValue1: 0, totalValue2: 0 });
    }, [comparisonData]);

    const handleDateChange = (setter: React.Dispatch<React.SetStateAction<string>>) => (e: React.ChangeEvent<HTMLSelectElement>) => {
        setter(e.target.value);
    };

    const handleDownloadExcel = () => {
        if (!comparisonData || !date1 || !date2) {
            return;
        }

        const formattedDate1 = new Date(`${date1}T00:00:00`).toLocaleDateString('pt-BR');
        const formattedDate2 = new Date(`${date2}T00:00:00`).toLocaleDateString('pt-BR');

        const dataForSheet = comparisonData.map(item => ({
            'Tipo de Leito': item.name,
            [formattedDate1]: item.value1,
            [formattedDate2]: item.value2,
            'Diferença': item.delta,
        }));
        
        const ws = XLSX.utils.json_to_sheet(dataForSheet);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Comparativo");
        XLSX.writeFile(wb, `Comparativo_${date1}_vs_${date2}.xlsx`);
    };

    if (availableDates.length < 2) return null;

    return (
        <div className="mt-8 bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
            {/* Header Section */}
            <div className="bg-gradient-to-r from-gray-50 to-white p-6 border-b border-gray-100">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h3 className="text-xl font-black text-gray-800 tracking-tight">Análise Comparativa</h3>
                        <p className="text-sm text-gray-500 font-medium mt-1">Selecione dois períodos para analisar a evolução da ocupação hospitalar.</p>
                    </div>
                    {comparisonData && (
                        <button
                            onClick={handleDownloadExcel}
                            className="inline-flex items-center px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-semibold text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm group"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 text-gray-400 group-hover:text-green-600 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                            </svg>
                            Exportar Excel
                        </button>
                    )}
                </div>

                {/* Date Selectors */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                    <div className="relative group">
                        <label className="absolute -top-2.5 left-3 bg-white px-1 text-xs font-bold text-gray-400 group-focus-within:text-blue-500 transition-colors">
                            PERÍODO ANTERIOR (A)
                        </label>
                        <select
                            value={date1}
                            onChange={handleDateChange(setDate1)}
                            className="w-full bg-white border border-gray-200 text-gray-700 text-sm font-semibold rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all appearance-none cursor-pointer"
                        >
                            <option value="">Selecione a data base...</option>
                            {availableDates.map(date => (
                                <option key={date} value={date}>
                                    {new Date(`${date}T00:00:00`).toLocaleDateString('pt-BR')}
                                </option>
                            ))}
                        </select>
                    </div>
                    
                    <div className="relative group">
                        <label className="absolute -top-2.5 left-3 bg-white px-1 text-xs font-bold text-gray-400 group-focus-within:text-indigo-500 transition-colors">
                            PERÍODO ATUAL (B)
                        </label>
                        <select
                            value={date2}
                            onChange={handleDateChange(setDate2)}
                            className="w-full bg-white border border-gray-200 text-gray-700 text-sm font-semibold rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all appearance-none cursor-pointer"
                        >
                            <option value="">Selecione a data de comparação...</option>
                            {availableDates.map(date => (
                                <option key={date} value={date}>
                                    {new Date(`${date}T00:00:00`).toLocaleDateString('pt-BR')}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            {/* Results Section */}
            {comparisonData && summary ? (
                <div className="p-6 bg-slate-50/50">
                    
                    {/* Global Summary Badge */}
                    <div className="flex justify-center mb-8">
                        <div className="bg-white rounded-full shadow-sm border border-gray-200 px-6 py-2 flex items-center gap-4">
                            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Balanço Geral</span>
                            <div className="h-4 w-px bg-gray-200"></div>
                            <div className="flex items-center gap-2">
                                <span className="text-gray-500 font-medium text-sm">Total Ocupado:</span>
                                <span className="text-gray-800 font-bold">{summary.totalValue2}</span>
                            </div>
                            <div className={`flex items-center gap-1 text-sm font-bold px-2 py-0.5 rounded-full ${summary.totalDelta > 0 ? 'bg-red-50 text-red-600' : summary.totalDelta < 0 ? 'bg-green-50 text-green-600' : 'bg-gray-100 text-gray-500'}`}>
                                {summary.totalDelta > 0 ? '↑' : summary.totalDelta < 0 ? '↓' : '-'} 
                                {Math.abs(summary.totalDelta)} leitos
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                        {comparisonData.map((item) => {
                            const isIncrease = item.delta > 0;
                            const isDecrease = item.delta < 0;
                            const isNeutral = item.delta === 0;

                            return (
                                <div key={item.type} className="bg-white rounded-xl p-5 shadow-[0_2px_8px_rgba(0,0,0,0.04)] border border-gray-100 hover:shadow-[0_4px_12px_rgba(0,0,0,0.08)] transition-all duration-300 group">
                                    <div className="flex justify-between items-start mb-3">
                                        <h4 className="font-bold text-gray-700 text-sm">{item.name}</h4>
                                        <div className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-bold ${
                                            isIncrease ? 'bg-red-50 text-red-600' : 
                                            isDecrease ? 'bg-green-50 text-green-600' : 
                                            'bg-gray-50 text-gray-400'
                                        }`}>
                                            {isIncrease && <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 10l7-7m0 0l7 7m-7-7v18" /></svg>}
                                            {isDecrease && <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 14l-7 7m0 0l-7-7m7 7V3" /></svg>}
                                            {isNeutral ? 'Estável' : Math.abs(item.delta)}
                                        </div>
                                    </div>

                                    <div className="flex items-end justify-between mb-4">
                                        <div>
                                            <span className="text-3xl font-black text-gray-800 tracking-tight block">
                                                {item.value2}
                                            </span>
                                            <span className="text-xs text-gray-400 font-medium">
                                                Ocupação Atual
                                            </span>
                                        </div>
                                        <div className="text-right pb-1">
                                            <span className="text-lg font-bold text-gray-400 block">
                                                {item.value1}
                                            </span>
                                            <span className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">
                                                Anterior
                                            </span>
                                        </div>
                                    </div>

                                    {/* Capacity Bar */}
                                    <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden mb-2">
                                        <div 
                                            className={`h-full rounded-full transition-all duration-500 ${
                                                item.occupancyPercent > 90 ? 'bg-red-500' :
                                                item.occupancyPercent > 70 ? 'bg-yellow-500' : 'bg-blue-500'
                                            }`}
                                            style={{ width: `${item.occupancyPercent}%` }}
                                        ></div>
                                    </div>
                                    <div className="flex justify-between text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                                        <span>0</span>
                                        <span>Capacidade</span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center py-16 text-center bg-white">
                    <div className="bg-gray-50 p-4 rounded-full mb-4">
                        <svg className="h-8 w-8 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                        </svg>
                    </div>
                    <h4 className="text-gray-900 font-medium">Aguardando Seleção</h4>
                    <p className="text-gray-500 text-sm max-w-xs mx-auto mt-1">Escolha as datas de início e fim acima para gerar o relatório comparativo.</p>
                </div>
            )}
        </div>
    );
};

export default ComparisonTool;
