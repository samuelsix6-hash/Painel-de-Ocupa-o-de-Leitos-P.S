
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

const App: React.FC = () => {
  const [historicalData, setHistoricalData] = useState<HistoricalData>(() => {
    try {
      // 1. Check for data in URL
      const urlParams = new URLSearchParams(window.location.search);
      const dataFromUrl = urlParams.get('data');
      if (dataFromUrl) {
        const decodedData = JSON.parse(atob(dataFromUrl));
        // Also save it to local storage for persistence
        localStorage.setItem('hospitalBedData', JSON.stringify(decodedData));
        return decodedData;
      }

      // 2. Fallback to localStorage
      const savedData = localStorage.getItem('hospitalBedData');
      return savedData ? JSON.parse(savedData) : INITIAL_HISTORICAL_DATA;
    } catch (error) {
      console.error("Error loading initial data", error);
      // 3. Fallback to initial data on any error
      return INITIAL_HISTORICAL_DATA;
    }
  });
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [justSavedDateKey, setJustSavedDateKey] = useState<string | null>(null);
  
  useEffect(() => {
    try {
      localStorage.setItem('hospitalBedData', JSON.stringify(historicalData));
    } catch (error) {
      console.error("Error saving data to localStorage", error);
    }
  }, [historicalData]);


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
      // Fix: Cast `value` to number as Object.entries may infer it as `unknown`.
      const status = getStatus(name as BedType, value as number);
      const color = STATUS_CONFIG[status].textColor.replace('text-','').replace('-700','');
      
      let finalColor = '#34d399'; // green-400
      if(color === 'yellow') finalColor = '#f59e0b'; // yellow-500
      if(color === 'red') finalColor = '#ef4444'; // red-500

      // For types without specific thresholds, keep them neutral/blue
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
    setTimeout(() => setJustSavedDateKey(null), 1500); // Reset after animation
  };
  
  const handleDeleteData = (dateKey: string) => {
    setHistoricalData(prevData => {
      const newData = { ...prevData };
      delete newData[dateKey];
      
      // If the deleted date was the currently displayed date, select the latest available date
      if (formatDateKey(currentDate) === dateKey) {
        const remainingDates = Object.keys(newData).sort((a,b) => new Date(b).getTime() - new Date(a).getTime());
        if (remainingDates.length > 0) {
          setCurrentDate(new Date(`${remainingDates[0]}T00:00:00`));
        } else {
          setCurrentDate(new Date()); // Or default to today if no data is left
        }
      }

      return newData;
    });
    setToastMessage('Registro excluído com sucesso!');
  };

  const handleShare = () => {
    try {
        const dataString = JSON.stringify(historicalData);
        const encodedData = btoa(dataString);
        const url = `${window.location.origin}${window.location.pathname}?data=${encodedData}`;
        navigator.clipboard.writeText(url);
        setToastMessage('Link de compartilhamento copiado!');
    } catch (error) {
        console.error("Error creating share link", error);
        setToastMessage('Erro ao criar link de compartilhamento.');
    }
  };

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
              <ControlPanel
                bedDataForDate={currentBedData}
                currentDate={currentDate}
                onDateChange={setCurrentDate}
                onSave={handleSaveData}
                onShare={handleShare}
                isAuthenticated={isAuthenticated}
                setIsAuthenticated={setIsAuthenticated}
              />
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
