
import React, { useState, useMemo } from 'react';
import { HistoricalData, BedType } from '../types';
import { BED_CAPACITY } from '../constants';

// Add this declaration for TypeScript to recognize the XLSX global from the CDN
declare const XLSX: any;

interface ComparisonToolProps {
    historicalData: HistoricalData;
}

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
            
            return {
                type,
                displayName: getDisplayName(type),
                value1,
                value2,
                delta,
                capacity
            };
        });

    }, [date1, date2, historicalData]);

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
        <div className="mt-8 bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden">
            {/* Header / Selectors */}
            <div className="p-6 bg-slate-50 border-b border-gray-200">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                    <div>
                        <h3 className="text-xl font-bold text-gray-800">Comparativo Rápido</h3>
                        <p className="text-sm text-gray-500">Selecione as datas para comparar a ocupação.</p>
                    </div>
                    {comparisonData && (
                        <button
                            onClick={handleDownloadExcel}
                            className="text-sm bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 font-medium shadow-sm"
                        >
                            Baixar Excel
                        </button>
                    )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-white p-3 rounded-lg border border-gray-200 shadow-sm">
                        <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Data Anterior (Referência)</label>
                        <select
                            value={date1}
                            onChange={handleDateChange(setDate1)}
                            className="w-full text-gray-700 font-medium outline-none bg-transparent cursor-pointer"
                        >
                            <option value="">Selecione...</option>
                            {availableDates.map(date => (
                                <option key={date} value={date}>
                                    {new Date(`${date}T00:00:00`).toLocaleDateString('pt-BR')}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="bg-white p-3 rounded-lg border border-gray-200 shadow-sm">
                        <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Data Atual (Comparação)</label>
                        <select
                            value={date2}
                            onChange={handleDateChange(setDate2)}
                            className="w-full text-gray-700 font-medium outline-none bg-transparent cursor-pointer"
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

            {/* Content */}
            {comparisonData ? (
                <div className="p-6">
                    {/* Simple Cards Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {comparisonData.map((item) => {
                            const isIncrease = item.delta > 0;
                            const isDecrease = item.delta < 0;
                            const isNeutral = item.delta === 0;

                            let cardBorder = 'border-gray-100';
                            let iconColor = 'text-gray-300';
                            let diffBg = 'bg-gray-100 text-gray-500';

                            if (isIncrease) {
                                cardBorder = 'border-l-4 border-l-red-500';
                                iconColor = 'text-red-500';
                                diffBg = 'bg-red-100 text-red-700';
                            } else if (isDecrease) {
                                cardBorder = 'border-l-4 border-l-green-500';
                                iconColor = 'text-green-500';
                                diffBg = 'bg-green-100 text-green-700';
                            }

                            return (
                                <div key={item.type} className={`bg-white border ${cardBorder} rounded-lg shadow-sm p-4 hover:shadow-md transition-shadow`}>
                                    <h4 className="text-sm font-bold text-gray-700 uppercase tracking-tight mb-4 border-b border-gray-100 pb-2">
                                        {item.displayName}
                                    </h4>
                                    
                                    <div className="flex justify-between items-center mb-4">
                                        <div className="text-center">
                                            <span className="block text-xs text-gray-400 mb-1">Antes</span>
                                            <span className="text-xl font-bold text-gray-500">{item.value1}</span>
                                        </div>

                                        <div className={`mx-2 ${iconColor}`}>
                                            {isIncrease ? (
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                                                </svg>
                                            ) : isDecrease ? (
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
                                                </svg>
                                            ) : (
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14" />
                                                </svg>
                                            )}
                                        </div>

                                        <div className="text-center">
                                            <span className="block text-xs text-gray-400 mb-1">Depois</span>
                                            <span className="text-2xl font-black text-gray-800">{item.value2}</span>
                                        </div>
                                    </div>

                                    <div className={`py-2 px-3 rounded text-center text-sm font-bold ${diffBg}`}>
                                        {isNeutral ? 'Sem alteração' : (
                                            <>
                                                {isIncrease ? 'Aumento de' : 'Redução de'} {Math.abs(item.delta)} leitos
                                            </>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            ) : (
                <div className="text-center py-12">
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-blue-50 text-blue-200 mb-3">
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                    </div>
                    <p className="text-gray-500 text-sm">Aguardando seleção das datas acima.</p>
                </div>
            )}
        </div>
    );
};

export default ComparisonTool;
