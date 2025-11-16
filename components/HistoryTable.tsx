
import React, { useState } from 'react';
import { BedData, BedType, HistoricalData } from '../types';
import DeleteConfirmationModal from './DeleteConfirmationModal';

// Add this declaration for TypeScript to recognize the XLSX global from the CDN
declare const XLSX: any;

interface HistoryTableProps {
    data: HistoricalData;
    onDelete: (dateKey: string) => void;
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


const HistoryTable: React.FC<HistoryTableProps> = ({ data, onDelete }) => {
    const [dateToDelete, setDateToDelete] = useState<string | null>(null);

    const sortedDates = Object.keys(data).sort((a, b) => new Date(b).getTime() - new Date(a).getTime());
    const bedTypes = Object.values(BedType);

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

    const totals: BedData = bedTypes.reduce((acc, type) => {
        acc[type] = sortedDates.reduce((sum, dateStr) => {
            return sum + (data[dateStr][type] || 0);
        }, 0);
        return acc;
    }, {} as Partial<BedData>) as BedData;

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
                             <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Ações
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {sortedDates.map(dateStr => {
                            const bedDataForDate = data[dateStr];
                            const formattedDate = new Date(`${dateStr}T00:00:00`).toLocaleDateString('pt-BR');
                            return (
                                <tr key={dateStr} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                        {formattedDate}
                                    </td>
                                    {bedTypes.map(type => (
                                        <td key={`${dateStr}-${type}`} className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                                            {bedDataForDate[type] ?? 'N/A'}
                                        </td>
                                    ))}
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-center">
                                        <button
                                            onClick={() => handleOpenModal(dateStr)}
                                            className="text-red-500 hover:text-red-700 p-1 rounded-full hover:bg-red-100 transition-colors"
                                            aria-label={`Excluir dados de ${formattedDate}`}
                                        >
                                            <DeleteIcon />
                                        </button>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                    <tfoot className="bg-gray-100">
                        <tr className="font-bold">
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-left">
                                Total
                            </td>
                            {bedTypes.map(type => (
                                <td key={`total-${type}`} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-center">
                                    {totals[type]}
                                </td>
                            ))}
                            <td className="px-6 py-4"></td>
                        </tr>
                    </tfoot>
                </table>
            </div>

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
