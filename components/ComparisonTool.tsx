
import React, { useState, useMemo } from 'react';
import { HistoricalData, BedType } from '../types';
import { BED_CAPACITY } from '../constants';

// Add this declaration for TypeScript to recognize the XLSX global from the CDN
declare const XLSX: any;

interface ComparisonToolProps {
    historicalData: HistoricalData;
}

const TrendIcon = ({ delta }: { delta: number }) => {
    if (delta > 0) {
        return (
            <div className="flex items-center text-red-600 bg-red-100 px-2 py-1 rounded-lg">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z" clipRule="evenodd" />
                </svg>
                <span className="font-bold">+{delta}</span>
            </div>
        );
    }
    if (delta < 0) {
        return (
            <div className="flex items-center text-green-600 bg-green-100 px-2 py-1 rounded-lg">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M12 13a1 1 0 110 2h5a1 1 0 011-1V9a1 1 0 11-2 0v2.586l-4.293-4.293a1 1 0 01-1.414 0L8 9.586 3.707 5.293a1 1 0 01-1.414 1.414l5 5a1 1 0 011.414 0L11 9.414 14.586 13H12z" clipRule="evenodd" />
                </svg>
                <span className="font-bold">{delta}</span>
            </div>
        );
    }
    return (
        <div className="flex items-center text-gray-500 bg-gray-100 px-2 py-1 rounded-lg">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
            </svg>
            <span className="font-bold">0</span>
        </div>
    );
};

const DownloadIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
    </svg>
);


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
            'Tipo de Leito': item.type,
            [formattedDate1]: item.value1,
            [formattedDate2]: item.value2,
            'Diferença': item.delta,
        }));
        
        const ws = XLSX.utils.json_to_sheet(dataForSheet);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Comparativo de Ocupação");
        XLSX.writeFile(wb, `Comparativo_Ocupacao_${date1}_vs_${date2}.xlsx`);
    };
    
    if (availableDates.length < 2) {
        return null; 
    }

    return (
        <div className="mt-6 bg-white p-6 rounded-xl shadow-md">
            <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
                <div>
                    <h3 className="text-xl font-bold text-gray-700">Comparativo de Evolução</h3>
                    <p className="text-sm text-gray-500">Selecione duas datas para visualizar a mudança na ocupação.</p>
                </div>
                {comparisonData && (
                     <button
                        onClick={handleDownloadExcel}
                        className="flex items-center space-x-2 px-4 py-2 bg-slate-100 text-slate-600 text-sm font-semibold rounded-lg hover:bg-slate-200 transition-colors border border-slate-200"
                    >
                        <DownloadIcon />
                        <span>Baixar Relatório</span>
                    </button>
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 bg-slate-50 p-4 rounded-xl border border-slate-100">
                <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-2 tracking-wide">
                        Data Inicial (Referência)
                    </label>
                    <select
                        value={date1}
                        onChange={handleDateChange(setDate1)}
                        className="w-full bg-white border border-gray-300 rounded-lg shadow-sm p-2.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 cursor-pointer transition-shadow"
                    >
                        <option value="">Selecione a primeira data...</option>
                        {availableDates.map(date => (
                            <option key={date} value={date}>
                                {new Date(`${date}T00:00:00`).toLocaleDateString('pt-BR')}
                            </option>
                        ))}
                    </select>
                </div>
                <div className="flex flex-col justify-end">
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-2 tracking-wide">
                        Data Final (Comparação)
                    </label>
                    <select
                        value={date2}
                        onChange={handleDateChange(setDate2)}
                        className="w-full bg-white border border-gray-300 rounded-lg shadow-sm p-2.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 cursor-pointer transition-shadow"
                    >
                        <option value="">Selecione a segunda data...</option>
                        {availableDates.map(date => (
                            <option key={date} value={date}>
                                {new Date(`${date}T00:00:00`).toLocaleDateString('pt-BR')}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {comparisonData ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {comparisonData.map(item => {
                        const percent1 = Math.min(100, (item.value1 / item.capacity) * 100);
                        const percent2 = Math.min(100, (item.value2 / item.capacity) * 100);
                        const displayTitle = item.type.replace('Leitos ', '');

                        return (
                            <div key={item.type} className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
                                <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-blue-400 to-indigo-500 opacity-50 group-hover:opacity-100 transition-opacity"></div>
                                
                                <div className="flex justify-between items-start mb-4">
                                    <h4 className="font-bold text-gray-700 text-sm uppercase tracking-tight max-w-[70%]">{displayTitle}</h4>
                                    <TrendIcon delta={item.delta} />
                                </div>

                                <div className="flex items-center justify-between text-sm mb-4">
                                    <div className="flex flex-col">
                                        <span className="text-gray-400 text-xs">Antes</span>
                                        <span className="font-bold text-gray-600 text-lg">{item.value1}</span>
                                    </div>
                                    <div className="text-gray-300 mx-2">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                                        </svg>
                                    </div>
                                    <div className="flex flex-col items-end">
                                        <span className="text-gray-400 text-xs">Depois</span>
                                        <span className={`font-bold text-xl ${item.delta > 0 ? 'text-red-600' : item.delta < 0 ? 'text-green-600' : 'text-gray-800'}`}>
                                            {item.value2}
                                        </span>
                                    </div>
                                </div>

                                {/* Visual Bars Comparison */}
                                <div className="space-y-2">
                                    <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
                                        <div className="bg-gray-400 h-1.5 rounded-full" style={{ width: `${percent1}%` }} title={`Antes: ${percent1.toFixed(0)}%`}></div>
                                    </div>
                                    <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                                        <div 
                                            className={`h-2 rounded-full transition-all duration-500 ${item.delta > 0 ? 'bg-red-500' : item.delta < 0 ? 'bg-green-500' : 'bg-blue-500'}`} 
                                            style={{ width: `${percent2}%` }}
                                            title={`Agora: ${percent2.toFixed(0)}%`}
                                        ></div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            ) : (
                <div className="text-center py-12 border-2 border-dashed border-gray-200 rounded-xl bg-gray-50">
                    <svg className="mx-auto h-12 w-12 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <p className="mt-2 text-gray-500 font-medium">Selecione as datas acima para gerar a comparação.</p>
                </div>
            )}
        </div>
    );
};

export default ComparisonTool;
