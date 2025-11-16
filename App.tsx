
import React, { useState, useMemo } from 'react';
import { BedData, BedType, StatusLevel, ChartData, HistoricalData } from './types';
import { INITIAL_HISTORICAL_DATA, BED_THRESHOLDS, STATUS_CONFIG, BED_MAX_VALUES, EMPTY_BED_DATA } from './constants';
import Header from './components/Header';
import StatusCard from './components/StatusCard';
import BedChart from './components/BedChart';
import ControlPanel from './components/ControlPanel';
import StatusLegend from './components/StatusLegend';
import HistoryTable from './components/HistoryTable';
import ComparisonTool from './components/ComparisonTool';

const formatDateKey = (date: Date) => date.toISOString().slice(0, 10);

const App: React.FC = () => {
  const [historicalData, setHistoricalData] = useState<HistoricalData>(INITIAL_HISTORICAL_DATA);
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

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
  };

  return (
    <div className="bg-gray-100 min-h-screen font-sans">
      <Header currentDate={currentDate} />
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
                maxValue={BED_MAX_VALUES[bedType]}
                status={getStatus(bedType, currentBedData[bedType])}
                hasThreshold={!!BED_THRESHOLDS[bedType as keyof typeof BED_THRESHOLDS]}
                />
            ))}
            </div>
        </div>
        
        <ComparisonTool historicalData={historicalData} />

        <div className="mt-6 bg-white p-6 rounded-xl shadow-md">
          <HistoryTable data={historicalData} onDelete={handleDeleteData} />
        </div>

        <div className="mt-6 bg-white p-6 rounded-xl shadow-md">
            <StatusLegend />
        </div>

      </main>
    </div>
  );
};

export default App;
