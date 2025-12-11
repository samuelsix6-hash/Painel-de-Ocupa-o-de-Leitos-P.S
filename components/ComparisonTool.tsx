
import React, { useState, useMemo } from 'react';
import { HistoricalData, BedType } from '../types';
import { BED_CAPACITY } from '../constants';

// Add this declaration for TypeScript to recognize the XLSX global from the CDN
declare const XLSX: any;

interface ComparisonToolProps {
    historicalData: HistoricalData;
}

// Helper para garantir nomes corretos conforme solicitado
const getDisplayName = (type: string) => {
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
            const percent1 = Math.min(100, (value1 / capacity) * 100);
            const percent2 = Math.min(100, (value2 / capacity) * 100);

            return {
                type,
                displayName: getDisplayName(type),
                value1,
                value2,
                delta,
                capacity,
                percent1,
                percent2
            };
        });

    }, [date1, date2, historicalData]);

    // Calcular resumo total
    const summary = useMemo(() => {
        if (!comparisonData) return null;
        return comparisonData.reduce((acc, curr) => ({
            value1: acc.value1 + curr.value1,
            value2: acc.value2 + curr.value2,
            delta: acc.delta + curr.delta
        }), { value1: 0, value2: 0, delta: 0 });
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
            'Tipo de Leito': item.displayName,
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
        <div className="mt-8 bg-white rounded-xl shadow-lg overflow-hidden border border-slate-200">
            {/* Header / Controls */}
            <div className="p-6 bg-slate-50 border-b border-slate-200">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                    <div>
                        <h3 className="text-xl font-bold text-slate-800">Comparativo de Evolução</h3>
                        <p className="text-sm text-slate-500">Analise a variação da ocupação entre dois períodos.</p>
                    </div>
                    {comparisonData && (
                        <button
                            onClick={handleDownloadExcel}
                            className="inline-flex items-center px-4 py-2 bg-white border border-slate-300 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-colors shadow-sm"
                        >
                            <svg className="w-4 h-4 mr-2 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                            </svg>
                            Exportar Excel
                        </button>
                    )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Data Anterior (A)</label>
                        <select
                            value={date1}
                            onChange={handleDateChange(setDate1)}
                            className="w-full bg-white border border-slate-300 text-slate-700 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                        >
                            <option value="">Selecione...</option>
                            {availableDates.map(date => (
                                <option key={date} value={date}>
                                    {new Date(`${date}T00:00:00`).toLocaleDateString('pt-BR')}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Data Atual (B)</label>
                        <select
                            value={date2}
                            onChange={handleDateChange(setDate2)}
                            className="w-full bg-white border border-slate-300 text-slate-700 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                        >
                            <option value="">Selecione...</option>
                            {availableDates.map(date => (
                                <option key={date} value={date}>
                                    {new Date(`${date}T00:00:00`).toLocaleDateString('pt-BR')}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            {/* Results List */}
            {comparisonData && summary ? (
                <div>
                    {/* Summary Row */}
                    <div className="bg-blue-50/50 p-4 border-b border-blue-100 flex items-center justify-between">
                        <span className="text-sm font-bold text-blue-800 uppercase tracking-wide">Balanço Total</span>
                        <div className="flex items-center gap-4">
                            <div className="text-right">
                                <span className="block text-xs text-blue-400 font-bold uppercase">Variação Geral</span>
                                <span className={`text-lg font-black ${summary.delta > 0 ? 'text-red-600' : summary.delta < 0 ? 'text-green-600' : 'text-slate-600'}`}>
                                    {summary.delta > 0 ? '+' : ''}{summary.delta} Leitos
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Table Header (Hidden on mobile) */}
                    <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-2 bg-slate-50 border-b border-slate-100 text-xs font-bold text-slate-400 uppercase tracking-wider">
                        <div className="col-span-4">Tipo de Leito</div>
                        <div className="col-span-2 text-center">Anterior (A)</div>
                        <div className="col-span-4 text-center">Evolução</div>
                        <div className="col-span-2 text-right">Atual (B)</div>
                    </div>

                    {/* Rows */}
                    <div className="divide-y divide-slate-100">
                        {comparisonData.map((item) => {
                             const isPositive = item.delta > 0;
                             const isNegative = item.delta < 0;
                             
                             return (
                                <div key={item.type} className="group hover:bg-slate-50 transition-colors p-4 md:px-6 md:py-4">
                                    {/* Mobile View */}
                                    <div className="md:hidden flex justify-between items-center mb-2">
                                        <span className="font-bold text-slate-700">{item.displayName}</span>
                                        <span className={`text-sm font-bold px-2 py-0.5 rounded ${
                                            isPositive ? 'bg-red-100 text-red-700' : 
                                            isNegative ? 'bg-green-100 text-green-700' : 
                                            'bg-slate-100 text-slate-600'
                                        }`}>
                                            {isPositive ? '+' : ''}{item.delta}
                                        </span>
                                    </div>

                                    {/* Desktop View / Content */}
                                    <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                                        
                                        {/* Name */}
                                        <div className="hidden md:block col-span-4 font-bold text-slate-700">
                                            {item.displayName}
                                        </div>

                                        {/* Value 1 */}
                                        <div className="flex justify-between md:justify-center col-span-12 md:col-span-2 text-sm">
                                            <span className="md:hidden text-slate-400 text-xs uppercase font-bold">Data A:</span>
                                            <span className="font-medium text-slate-500">{item.value1}</span>
                                        </div>

                                        {/* Visual Bar */}
                                        <div className="col-span-12 md:col-span-4 px-2">
                                            <div className="flex items-center gap-2 h-6 relative">
                                                {/* Background Track */}
                                                <div className="absolute w-full h-1.5 bg-slate-100 rounded-full"></div>
                                                
                                                {/* Bar 1 (Previous) - Ghost Bar */}
                                                <div 
                                                    className="absolute h-1.5 bg-slate-300 rounded-full opacity-50"
                                                    style={{ width: `${item.percent1}%` }}
                                                ></div>

                                                {/* Bar 2 (Current) - Colored Bar */}
                                                <div 
                                                    className={`absolute h-1.5 rounded-full transition-all duration-500 ${
                                                        isPositive ? 'bg-red-500' : 
                                                        isNegative ? 'bg-green-500' : 'bg-blue-500'
                                                    }`}
                                                    style={{ width: `${item.percent2}%` }}
                                                ></div>
                                                
                                                {/* Arrow Indicator on Bar End if needed, usually simpler is better */}
                                            </div>
                                            <div className="flex justify-between text-[10px] text-slate-400 font-medium md:hidden">
                                                <span>Evolução visual</span>
                                            </div>
                                        </div>

                                        {/* Value 2 & Delta Badge */}
                                        <div className="flex justify-between md:justify-end items-center col-span-12 md:col-span-2 gap-3">
                                            <span className="md:hidden text-slate-400 text-xs uppercase font-bold">Data B:</span>
                                            <div className="flex items-center gap-3">
                                                <span className="font-bold text-slate-800 text-lg">{item.value2}</span>
                                                <span className={`hidden md:inline-block text-xs font-bold px-2 py-1 rounded min-w-[3rem] text-center ${
                                                    isPositive ? 'bg-red-50 text-red-600' : 
                                                    isNegative ? 'bg-green-50 text-green-600' : 
                                                    'bg-slate-100 text-slate-500'
                                                }`}>
                                                    {isPositive ? '+' : ''}{item.delta}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                             );
                        })}
                    </div>
                </div>
            ) : (
                <div className="text-center py-16 px-6">
                    <div className="bg-slate-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                        </svg>
                    </div>
                    <h4 className="text-lg font-medium text-slate-700">Aguardando Parâmetros</h4>
                    <p className="text-slate-500 text-sm mt-1 max-w-sm mx-auto">
                        Selecione as datas "Anterior" e "Atual" no topo para gerar o comparativo detalhado.
                    </p>
                </div>
            )}
        </div>
    );
};

export default ComparisonTool;
