
import React, { useState, useMemo } from 'react';
import { HistoricalData, BedType } from '../types';

// Add this declaration for TypeScript to recognize the XLSX global from the CDN
declare const XLSX: any;

interface ComparisonToolProps {
    historicalData: HistoricalData;
}

const ArrowUpIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L9 9.414V13a1 1 0 102 0V9.414l1.293 1.293a1 1 0 001.414-1.414z" clipRule="evenodd" />
    </svg>
);

const ArrowDownIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm-3.707-7.293l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 10.586V7a1 1 0 10-2 0v3.586L7.707 9.293a1 1 0 00-1.414 1.414z" clipRule="evenodd" />
    </svg>
);

const HorizontalLineIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM7 9a1 1 0 000 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
    </svg>
);

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
            return {
                type,
                value1,
                value2,
                delta,
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
        return null; // Don't render the tool if there aren't at least two dates to compare
    }

    return (
        <div className="mt-6 bg-white p-6 rounded-xl shadow-md">
            <div className="flex justify-between items-center mb-4 flex-wrap gap-4">
                <h3 className="text-xl font-bold text-gray-700">Comparativo de Ocupação</h3>
                {comparisonData && (
                     <button
                        onClick={handleDownloadExcel}
                        className="flex items-center space-x-2 px-3 py-2 bg-green-600 text-white text-sm font-medium rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors"
                        aria-label="Baixar comparativo em Excel"
                    >
                        <DownloadIcon />
                        <span>Baixar Excel</span>
                    </button>
                )}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div>
                    <label htmlFor="date1-select" className="block text-sm font-medium text-gray-700 mb-1">
                        Selecione a Data 1
                    </label>
                    <select
                        id="date1-select"
                        value={date1}
                        onChange={handleDateChange(setDate1)}
                        className="w-full bg-white border border-gray-300 rounded-md shadow-sm p-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500 cursor-pointer"
                    >
                        <option value="">-- Escolha uma data --</option>
                        {availableDates.map(date => (
                            <option key={date} value={date}>
                                {new Date(`${date}T00:00:00`).toLocaleDateString('pt-BR')}
                            </option>
                        ))}
                    </select>
                </div>
                <div>
                    <label htmlFor="date2-select" className="block text-sm font-medium text-gray-700 mb-1">
                        Selecione a Data 2
                    </label>
                    <select
                        id="date2-select"
                        value={date2}
                        onChange={handleDateChange(setDate2)}
                        className="w-full bg-white border border-gray-300 rounded-md shadow-sm p-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500 cursor-pointer"
                    >
                        <option value="">-- Escolha uma data --</option>
                        {availableDates.map(date => (
                            <option key={date} value={date}>
                                {new Date(`${date}T00:00:00`).toLocaleDateString('pt-BR')}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {comparisonData ? (
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tipo de Leito</th>
                                <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">{new Date(`${date1}T00:00:00`).toLocaleDateString('pt-BR')}</th>
                                <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">{new Date(`${date2}T00:00:00`).toLocaleDateString('pt-BR')}</th>
                                <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Diferença</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {comparisonData.map(item => (
                                <tr key={item.type} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{item.type}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">{item.value1}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">{item.value2}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-center">
                                        <div className={`flex items-center justify-center space-x-2 font-semibold ${item.delta > 0 ? 'text-red-600' : item.delta < 0 ? 'text-green-600' : 'text-gray-600'}`}>
                                            {item.delta > 0 ? <ArrowUpIcon /> : item.delta < 0 ? <ArrowDownIcon /> : <HorizontalLineIcon />}
                                            <span className="w-4 text-center">{item.delta}</span>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ) : (
                <div className="text-center py-8 bg-gray-50 rounded-lg">
                    <p className="text-gray-500">Selecione duas datas para comparar os dados de ocupação.</p>
                </div>
            )}
        </div>
    );
};

export default ComparisonTool;
