
import React, { useState, useEffect } from 'react';
import { BedData, BedType } from '../types';
import { BED_MAX_VALUES } from '../constants';
import ShareModal from './ShareModal';

interface ControlPanelProps {
  bedDataForDate: BedData;
  currentDate: Date;
  onDateChange: (date: Date) => void;
  onSave: (date: Date, data: BedData) => void;
  getShareUrl: (scope: 'current' | 'all') => string;
  onClose: () => void;
}

const ShareIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
      <path d="M15 8a3 3 0 10-2.977-2.63l-4.94 2.47a3 3 0 100 4.319l4.94 2.47a3 3 0 10.875-6.162l-4.94-2.47A3 3 0 0015 8z" />
    </svg>
);

const ControlPanel: React.FC<ControlPanelProps> = ({ bedDataForDate, currentDate, onDateChange, onSave, getShareUrl, onClose }) => {
  const [localBedData, setLocalBedData] = useState<BedData>(bedDataForDate);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);

  useEffect(() => {
    setLocalBedData(bedDataForDate);
  }, [bedDataForDate, currentDate]);

  const handleInputChange = (bedType: BedType, value: number) => {
    setLocalBedData(prevData => ({ ...prevData, [bedType]: value }));
  };

  return (
    <div className="flex flex-col h-full">
        <div className="flex justify-between items-center mb-6">
            <div>
                <h2 className="text-2xl font-black text-gray-800 tracking-tight">Lançar Ocupação</h2>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">Portal do Administrador</p>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                <svg className="w-6 h-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
            </button>
        </div>
        
        <div className="space-y-6">
            <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100">
                <label className="block text-xs font-black text-blue-600 uppercase mb-2 tracking-wider">Data do Registro</label>
                <input
                    type="date"
                    value={currentDate.toISOString().slice(0, 10)}
                    onChange={(e) => onDateChange(new Date(`${e.target.value}T00:00:00`))}
                    className="w-full bg-white border border-blue-200 rounded-lg shadow-sm p-3 font-bold text-blue-800 outline-none focus:ring-2 focus:ring-blue-500"
                />
            </div>

            <div className="space-y-3 max-h-[40vh] overflow-y-auto pr-2 custom-scrollbar">
                {(Object.keys(localBedData) as BedType[]).map(bedType => (
                    <div key={bedType} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-100 hover:border-gray-200 transition-colors">
                        <label className="text-sm font-bold text-gray-600 truncate mr-4">
                            {bedType.replace('Leitos ', '')}
                        </label>
                        <div className="flex items-center">
                            <input
                                type="number"
                                min="0"
                                max={BED_MAX_VALUES[bedType]}
                                value={localBedData[bedType]}
                                onChange={(e) => {
                                    const val = parseInt(e.target.value || '0', 10);
                                    handleInputChange(bedType, Math.min(BED_MAX_VALUES[bedType], Math.max(0, val)));
                                }}
                                className="w-20 text-center px-2 py-2 bg-white border border-gray-300 rounded-lg font-black text-gray-800 focus:ring-2 focus:ring-blue-500 outline-none"
                            />
                            <span className="text-[10px] font-bold text-gray-400 ml-2 w-8">/ {BED_MAX_VALUES[bedType]}</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>

        <div className="mt-8 grid grid-cols-2 gap-3">
            <button
                onClick={() => onSave(currentDate, localBedData)}
                className="py-4 px-4 bg-green-600 text-white rounded-xl font-black text-sm uppercase tracking-widest hover:bg-green-700 transition-all shadow-lg shadow-green-200"
            >
                Salvar Tudo
            </button>
            <button
                onClick={() => setIsShareModalOpen(true)}
                className="py-4 px-4 bg-blue-600 text-white rounded-xl font-black text-sm uppercase tracking-widest hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 flex items-center justify-center gap-2"
            >
                <ShareIcon />
                Gerar Link
            </button>
        </div>

        <ShareModal 
            isOpen={isShareModalOpen}
            onClose={() => setIsShareModalOpen(false)}
            getShareUrl={getShareUrl}
        />
    </div>
  );
};

export default ControlPanel;
