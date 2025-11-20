
import React, { useState, useMemo } from 'react';
import { BedData, BedType, HistoricalData } from '../types';
import DeleteConfirmationModal from './DeleteConfirmationModal';

// Add this declaration for TypeScript to recognize the XLSX global from the CDN
declare const XLSX: any;

interface HistoryTableProps {
    data: HistoricalData;
    onDelete: (dateKey: string) => void;
    highlightedDateKey: string | null;
    isAdmin: boolean;
}

const DeleteIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm4 0a1 1 0 012 0v6a1 1 0 11-2 0V8z" clipRule="evenodd" />
    </svg>
);

const DownloadIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
    </svg>
);


const HistoryTable: React.FC<HistoryTableProps> = ({ data, onDelete, highlightedDateKey, isAdmin }) => {
    const [dateToDelete, setDateToDelete] = useState<string | null>(null);

    const sortedDates = Object.keys(data).sort((a, b) => new Date(b).getTime() - new Date(a).getTime());
    const bedTypes = Object.values(BedType);

    const stats = useMemo(() => {
        if (sortedDates.length === 0) return null;

        const calculateStats = (type: BedType) => {
            let maxVal = -1;
            let minVal = Infinity;

            // First pass: find min/max values
            sortedDates.forEach(dateStr => {
                const val = data[dateStr][type] ?? 0;
                if (val > maxVal) maxVal = val;
                if (val < minVal) minVal = val;
            });

            if (minVal === Infinity) minVal = 0;
            if (maxVal === -1) maxVal = 0;

            // Second pass: collect all dates matching min/max
            const maxDates: string[] = [];
            const minDates: string[] = [];

            sortedDates.forEach(dateStr => {
                const val = data[dateStr][type] ?? 0;
                if (val === maxVal) maxDates.push(dateStr);
                if (val === minVal) minDates.push(dateStr);
            });

            return { maxVal, maxDates, minVal, minDates };
        };

        return {
            clinical: calculateStats(BedType.CLINICAL),
            icu: calculateStats(BedType.ICU)
        };
    }, [data, sortedDates]);

    const handleOpenModal = (dateStr: string) => {
        setDateToDelete(dateStr);
    };

    const handleCloseModal = () => {
        setDateToDelete(null);
    };

    const handleConfirmDelete = () => {
        if (dateToDelete) {
            onDelete(dateToDelete);
            handleCloseModal();
        }
    };

    const handleDownloadExcel = () => {
        const formattedBedTypes = bedTypes.map(type => 
            type.replace('Leitos ', '').replace('Clínicos', 'Clín.').replace('Pediátricos', 'Ped.')
        );
        
        const dataForSheet = sortedDates.map(dateStr => {
            const bedDataForDate = data[dateStr];
            const formattedDate = new Date(`${dateStr}T00:00:00`).toLocaleDateString('pt-BR');
            
            const row: { [key: string]: string | number } = {
                'Data': formattedDate,
            };
    
            bedTypes.forEach((type, index) => {
                const formattedHeader = formattedBedTypes[index];
                row[formattedHeader] = bedDataForDate[type] ?? 'N/A';
            });
    
            return row;
        });

        const ws = XLSX.utils.json_to_sheet(dataForSheet);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Histórico de Ocupação");
        XLSX.writeFile(wb, "Historico_Ocupacao_Leitos.xlsx");
    };

    const renderDateList = (dates: string[]) => {
        return dates.map(d => new Date(`${d}T00:00:00`).toLocaleDateString('pt-BR')).join(', ');
    };

    if (sortedDates.length === 0) {
        return (
            <div>
                <h3 className="text-xl font-bold text-gray-700 mb-4">Histórico de Ocupação</h3>
                <p className="text-gray-500">Ainda não há dados históricos para exibir.</p>
            </div>
        );
    }

    return (
        <div>
            <div className="flex justify-between items-center mb-4 flex-wrap gap-4">
                <h3 className="text-xl font-bold text-gray-700">Histórico de Ocupação</h3>
                <button
                    onClick={handleDownloadExcel}
                    className="flex items-center space-x-2 px-3 py-2 bg-green-600 text-white text-sm font-medium rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors"
                    aria-label="Baixar histórico em Excel"
                >
                    <DownloadIcon />
                    <span>Baixar Excel</span>
                </button>
            </div>
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Data
                            </th>
                            {bedTypes.map(type => (
                                <th key={type} scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    {type.replace('Leitos ', '').replace('Clínicos', 'Clín.').replace('Pediátricos', 'Ped.')}
                                </th>
                            ))}
                            {isAdmin && (
                                <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Ações
                                </th>
                            )}
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {sortedDates.map(dateStr => {
                            const bedDataForDate = data[dateStr];
                            const formattedDate = new Date(`${dateStr}T00:00:00`).toLocaleDateString('pt-BR');
                            return (
                                <tr key={dateStr} className={`hover:bg-gray-50 ${dateStr === highlightedDateKey ? 'animate-flash' : ''}`}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                        {formattedDate}
                                    </td>
                                    {bedTypes.map(type => (
                                        <td key={`${dateStr}-${type}`} className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                                            {bedDataForDate[type] ?? 'N/A'}
                                        </td>
                                    ))}
                                    {isAdmin && (
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-center">
                                            <button
                                                onClick={() => handleOpenModal(dateStr)}
                                                className="text-red-500 hover:text-red-700 p-1 rounded-full hover:bg-red-100 transition-colors"
                                                aria-label={`Excluir dados de ${formattedDate}`}
                                            >
                                                <DeleteIcon />
                                            </button>
                                        </td>
                                    )}
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            {stats && (
                <div className="mt-6 space-y-6 border-t pt-6 border-gray-200">
                    
                    {/* Clinical Stats */}
                    <div>
                        <h4 className="text-lg font-semibold text-gray-700 mb-3">Estatísticas - Leitos Clínicos</h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="flex flex-col p-4 bg-red-50 rounded-lg border border-red-100 shadow-sm">
                                <div className="flex justify-between items-start mb-2">
                                    <p className="text-xs font-bold text-red-600 uppercase tracking-wider">Maior Lotação</p>
                                    <p className="text-3xl font-bold text-red-700 leading-none">{stats.clinical.maxVal} <span className="text-sm font-medium text-red-500">leitos</span></p>
                                </div>
                                <div>
                                    <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Datas</p>
                                    <div className="max-h-24 overflow-y-auto">
                                        <p className="text-sm font-medium text-gray-800 leading-relaxed">{renderDateList(stats.clinical.maxDates)}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="flex flex-col p-4 bg-green-50 rounded-lg border border-green-100 shadow-sm">
                                <div className="flex justify-between items-start mb-2">
                                    <p className="text-xs font-bold text-green-600 uppercase tracking-wider">Menor Lotação</p>
                                    <p className="text-3xl font-bold text-green-700 leading-none">{stats.clinical.minVal} <span className="text-sm font-medium text-green-500">leitos</span></p>
                                </div>
                                <div>
                                    <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Datas</p>
                                    <div className="max-h-24 overflow-y-auto">
                                        <p className="text-sm font-medium text-gray-800 leading-relaxed">{renderDateList(stats.clinical.minDates)}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                     {/* ICU Stats */}
                     <div>
                        <h4 className="text-lg font-semibold text-gray-700 mb-3">Estatísticas - Leitos UTI (emergência)</h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="flex flex-col p-4 bg-red-50 rounded-lg border border-red-100 shadow-sm">
                                <div className="flex justify-between items-start mb-2">
                                    <p className="text-xs font-bold text-red-600 uppercase tracking-wider">Maior Lotação</p>
                                    <p className="text-3xl font-bold text-red-700 leading-none">{stats.icu.maxVal} <span className="text-sm font-medium text-red-500">leitos</span></p>
                                </div>
                                <div>
                                    <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Datas</p>
                                    <div className="max-h-24 overflow-y-auto">
                                        <p className="text-sm font-medium text-gray-800 leading-relaxed">{renderDateList(stats.icu.maxDates)}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="flex flex-col p-4 bg-green-50 rounded-lg border border-green-100 shadow-sm">
                                <div className="flex justify-between items-start mb-2">
                                    <p className="text-xs font-bold text-green-600 uppercase tracking-wider">Menor Lotação</p>
                                    <p className="text-3xl font-bold text-green-700 leading-none">{stats.icu.minVal} <span className="text-sm font-medium text-green-500">leitos</span></p>
                                </div>
                                <div>
                                    <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Datas</p>
                                    <div className="max-h-24 overflow-y-auto">
                                        <p className="text-sm font-medium text-gray-800 leading-relaxed">{renderDateList(stats.icu.minDates)}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
            )}

            <DeleteConfirmationModal
                isOpen={!!dateToDelete}
                onClose={handleCloseModal}
                onConfirm={handleConfirmDelete}
                date={dateToDelete ? new Date(`${dateToDelete}T00:00:00`).toLocaleDateString('pt-BR') : ''}
            />

        </div>
    );
};

export default HistoryTable;
