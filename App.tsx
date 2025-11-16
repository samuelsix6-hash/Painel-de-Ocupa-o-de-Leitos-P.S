
import React, { useState, useMemo, useEffect } from 'react';
import { BedData, BedType, StatusLevel, ChartData, HistoricalData } from './types';
import { INITIAL_HISTORICAL_DATA, BED_THRESHOLDS, STATUS_CONFIG, BED_MAX_VALUES, EMPTY_BED_DATA, BED_CAPACITY } from './constants';
import Header from './components/Header';
import StatusCard from './components/StatusCard';
import BedChart from './components/BedChart';
import ControlPanel from './components/ControlPanel';
import StatusLegend from './components/StatusLegend';
import HistoryTable from './components/HistoryTable';
import ComparisonTool from './components/ComparisonTool';
import Toast from './components/Toast';

const formatDateKey = (date: Date) => date.toISOString().slice(0, 10);

// IMPORTANT: Replace this with the raw URL to your `data.json` file on GitHub or another host.
const PUBLIC_DATA_URL = 'https://raw.githubusercontent.com/SEU-USUARIO/SEU-REPOSITORIO/main/data.json';


const App: React.FC = () => {
  const [historicalData, setHistoricalData] = useState<HistoricalData>(INITIAL_HISTORICAL_DATA);
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [justSavedDateKey, setJustSavedDateKey] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isAdminMode, setIsAdminMode] = useState<boolean>(false);

  useEffect(() => {
    const initializeApp = async () => {
        setIsLoading(true);
        const urlParams = new URLSearchParams(window.location.search);
        const adminParam = urlParams.get('admin');
        const isUserAdmin = adminParam === 'true';
        setIsAdminMode(isUserAdmin);

        let dataToProcess: HistoricalData | null = null;

        try {
            if (isUserAdmin) {
                // Admin mode: Load from localStorage for editing
                const savedData = localStorage.getItem('hospitalBedData');
                if (savedData) {
                    dataToProcess = JSON.parse(savedData);
                }
            } else {
                // Public mode: Fetch from the central public URL
                const response = await fetch(PUBLIC_DATA_URL);
                if (!response.ok) {
                    throw new Error(`Failed to fetch data: ${response.statusText}`);
                }
                dataToProcess = await response.json();
            }
        } catch (error) {
            console.error("Error loading data:", error);
            setToastMessage("Falha ao carregar dados. Exibindo informações locais.");
            // Fallback to localStorage if fetch fails even for public users
            const savedData = localStorage.getItem('hospitalBedData');
            if (savedData) {
                dataToProcess = JSON.parse(savedData);
            }
        }

        if (dataToProcess && Object.keys(dataToProcess).length > 0) {
            const sortedDates = Object.keys(dataToProcess).sort((a, b) => new Date(b).getTime() - new Date(a).getTime());
            const latestDateStr = sortedDates[0];
            setHistoricalData(dataToProcess);
            setCurrentDate(new Date(`${latestDateStr}T00:00:00`));
        } else {
            setHistoricalData(INITIAL_HISTORICAL_DATA);
            setCurrentDate(new Date());
        }
        setIsLoading(false);
    };

    initializeApp();
  }, []);

  useEffect(() => {
    // Only save to localStorage in admin mode
    if (isAdminMode) {
        try {
            localStorage.setItem('hospitalBedData', JSON.stringify(historicalData));
        } catch (error) {
            console.error("Error saving data to localStorage", error);
        }
    }
  }, [historicalData, isAdminMode]);


  const currentBedData = useMemo<BedData>(() => {
    return historicalData[formatDateKey(currentDate)] || EMPTY_BED_DATA;
  }, [historicalData, currentDate]);

  const getStatus = (bedType: BedType, value: number): StatusLevel => {
    const thresholds = BED_THRESHOLDS[bedType as keyof typeof BED_THRESHOLDS];
    if (!thresholds) {
      return StatusLevel.NORMAL;
    }
    if (value > thresholds.critical) {
      return StatusLevel.CRITICAL;
    }
    if (value === thresholds.alert) {
      return StatusLevel.ALERT;
    }
    return StatusLevel.NORMAL;
  };

  const chartData = useMemo<ChartData>(() => {
    return Object.entries(currentBedData).map(([name, value]) => {
      const status = getStatus(name as BedType, value as number);
      const color = STATUS_CONFIG[status].textColor.replace('text-','').replace('-700','');
      
      let finalColor = '#34d399'; // green-400
      if(color === 'yellow') finalColor = '#f59e0b'; // yellow-500
      if(color === 'red') finalColor = '#ef4444'; // red-500

      const thresholds = BED_THRESHOLDS[name as keyof typeof BED_THRESHOLDS];
      if (!thresholds) {
        finalColor = '#60a5fa'; // blue-400
      }

      return {
        name: name.replace('Leitos ', '').replace('Clínicos', 'Clín.').replace('Pediátricos', 'Ped.'),
        value,
        color: finalColor
      };
    });
  }, [currentBedData]);

  const handleSaveData = (date: Date, data: BedData) => {
    const dateKey = formatDateKey(date);
    setHistoricalData(prevData => ({
      ...prevData,
      [dateKey]: data
    }));
    setToastMessage('Dados salvos com sucesso!');
    setJustSavedDateKey(dateKey);
    setTimeout(() => setJustSavedDateKey(null), 1500);
  };
  
  const handleDeleteData = (dateKey: string) => {
    setHistoricalData(prevData => {
      const newData = { ...prevData };
      delete newData[dateKey];
      
      if (formatDateKey(currentDate) === dateKey) {
        const remainingDates = Object.keys(newData).sort((a,b) => new Date(b).getTime() - new Date(a).getTime());
        if (remainingDates.length > 0) {
          setCurrentDate(new Date(`${remainingDates[0]}T00:00:00`));
        } else {
          setCurrentDate(new Date());
        }
      }

      return newData;
    });
    setToastMessage('Registro excluído com sucesso!');
  };

  if (isLoading) {
    return (
        <div className="flex justify-center items-center min-h-screen bg-gray-100">
            <div className="text-xl font-semibold text-gray-700">Carregando dados...</div>
        </div>
    );
  }

  return (
    <div className="bg-gray-100 min-h-screen font-sans">
      <Header currentDate={currentDate} />
      {toastMessage && <Toast message={toastMessage} onClose={() => setToastMessage(null)} />}
      <main className="container mx-auto p-4 md:p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-md">
            <h2 className="text-xl font-bold text-gray-700 mb-4">Visão Geral da Ocupação</h2>
            <div className="h-96">
              <BedChart data={chartData} />
            </div>
          </div>

          <div className="lg:col-span-1 bg-white p-6 rounded-xl shadow-md">
              {isAdminMode ? (
                <ControlPanel
                    bedDataForDate={currentBedData}
                    currentDate={currentDate}
                    onDateChange={setCurrentDate}
                    onSave={handleSaveData}
                    isAuthenticated={isAuthenticated}
                    setIsAuthenticated={setIsAuthenticated}
                    historicalData={historicalData}
                />
              ) : (
                <div className="flex flex-col items-center justify-center h-full">
                    <h2 className="text-xl font-bold text-gray-700 mb-2">Modo de Visualização</h2>
                    <p className="text-gray-500 text-center">Os dados estão sendo exibidos em tempo real. Para editar, acesse o painel de administração.</p>
                </div>
              )}
          </div>
        </div>

        <div className="mt-6">
            <h2 className="text-xl font-bold text-gray-700 mb-4">Status Detalhado dos Leitos</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {(Object.keys(currentBedData) as BedType[]).map(bedType => (
                <StatusCard
                key={bedType}
                title={bedType}
                value={currentBedData[bedType]}
                maxValue={BED_CAPACITY[bedType as keyof typeof BED_CAPACITY] ?? 0}
                status={getStatus(bedType, currentBedData[bedType])}
                hasThreshold={!!BED_THRESHOLDS[bedType as keyof typeof BED_THRESHOLDS]}
                isHighlighted={justSavedDateKey === formatDateKey(currentDate)}
                />
            ))}
            </div>
        </div>
        
        <ComparisonTool historicalData={historicalData} />

        <div className="mt-6 bg-white p-6 rounded-xl shadow-md">
          <HistoryTable 
            data={historicalData} 
            onDelete={handleDeleteData} 
            highlightedDateKey={justSavedDateKey}
            isAdmin={isAdminMode && isAuthenticated}
          />
        </div>

        <div className="mt-6 bg-white p-6 rounded-xl shadow-md">
            <StatusLegend />
        </div>

      </main>
    </div>
  );
};

export default App;
