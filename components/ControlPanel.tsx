import React, { useState, useEffect } from 'react';
import { BedData, BedType } from '../types';
import { BED_MAX_VALUES, PASSWORD } from '../constants';

interface ControlPanelProps {
  bedDataForDate: BedData;
  currentDate: Date;
  onDateChange: (date: Date) => void;
  onSave: (date: Date, data: BedData) => void;
  isAuthenticated: boolean;
  setIsAuthenticated: (isAuthenticated: boolean) => void;
}

const ControlPanel: React.FC<ControlPanelProps> = ({ bedDataForDate, currentDate, onDateChange, onSave, isAuthenticated, setIsAuthenticated }) => {
  const [passwordInput, setPasswordInput] = useState('');
  const [error, setError] = useState('');
  const [localBedData, setLocalBedData] = useState<BedData>(bedDataForDate);

  // Sync local state when the date (and thus data) changes from parent
  useEffect(() => {
    setLocalBedData(bedDataForDate);
  }, [bedDataForDate]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordInput === PASSWORD) {
      setIsAuthenticated(true);
      setError('');
      setPasswordInput('');
    } else {
      setError('Senha incorreta. Tente novamente.');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
  };

  const handleInputChange = (bedType: BedType, value: number) => {
    setLocalBedData(prevData => ({
      ...prevData,
      [bedType]: value
    }));
  };

  const handleDateChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const date = new Date(`${event.target.value}T00:00:00`);
    onDateChange(date);
  };

  const handleSaveClick = () => {
    onSave(currentDate, localBedData);
  };

  if (!isAuthenticated) {
    return (
      <div>
        <h2 className="text-xl font-bold text-gray-700 mb-4">Acesso Restrito</h2>
        <p className="text-sm text-gray-500 mb-6">Insira a senha para alterar os dados.</p>
        <form onSubmit={handleLogin}>
          <div className="mb-4">
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">Senha</label>
            <input
              type="password"
              id="password"
              name="password"
              value={passwordInput}
              onChange={(e) => setPasswordInput(e.target.value)}
              className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              required
            />
          </div>
          {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
          <button
            type="submit"
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Entrar
          </button>
        </form>
      </div>
    );
  }

  return (
    <div>
        <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-700">Controle de Ocupação</h2>
            <button
                onClick={handleLogout}
                className="text-sm text-red-600 hover:text-red-800 font-medium px-3 py-1 rounded-md hover:bg-red-100 transition-colors"
            >
                Sair
            </button>
        </div>
        <p className="text-sm text-gray-500 mb-6">Selecione a data e insira os valores de ocupação.</p>
        
        <div className="mb-6">
            <label htmlFor="date-picker-panel" className="block text-sm font-medium text-gray-700 mb-1">Data para Inserção</label>
            <input
                type="date"
                id="date-picker-panel"
                value={currentDate.toISOString().slice(0, 10)}
                onChange={handleDateChange}
                className="w-full bg-white border border-gray-300 rounded-md shadow-sm p-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500 cursor-pointer"
            />
        </div>

        {(Object.keys(localBedData) as BedType[]).map(bedType => (
            <div key={bedType} className="mb-4 grid grid-cols-2 items-center gap-4">
              <label htmlFor={bedType} className="block text-sm font-medium text-gray-700">
                  {bedType}
              </label>
              <input
                  type="number"
                  id={bedType}
                  name={bedType}
                  min="0"
                  max={BED_MAX_VALUES[bedType]}
                  value={localBedData[bedType]}
                  onChange={(e) => {
                      const rawValue = e.target.value;
                      if (rawValue === '') {
                          handleInputChange(bedType, 0);
                          return;
                      }
                      const numericValue = parseInt(rawValue, 10);
                      if (!isNaN(numericValue)) {
                          const max = BED_MAX_VALUES[bedType];
                          const clampedValue = Math.max(0, Math.min(numericValue, max));
                          handleInputChange(bedType, clampedValue);
                      }
                  }}
                  className="w-full text-right px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
            </div>
        ))}
        <button
          onClick={handleSaveClick}
          className="w-full mt-4 flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
        >
          Salvar Dados
        </button>
    </div>
  );
};

export default ControlPanel;
