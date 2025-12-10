
import React, { useState, useMemo, useEffect } from 'react';
import { BedData, BedType, StatusLevel, ChartData, HistoricalData } from './types';
import { INITIAL_HISTORICAL_DATA, BED_THRESHOLDS, STATUS_CONFIG, EMPTY_BED_DATA, BED_CAPACITY } from './constants';
import Header from './components/Header';
import StatusCard from './components/StatusCard';
import BedChart from './components/BedChart';
import ControlPanel from './components/ControlPanel';
import StatusLegend from './components/StatusLegend';
import HistoryTable from './components/HistoryTable';
import ComparisonTool from './components/ComparisonTool';
import Toast from './components/Toast';
import OverwriteConfirmationModal from './components/OverwriteConfirmationModal';

// Declare LZString global from CDN
declare const LZString: any;

const formatDateKey = (date: Date) => date.toISOString().slice(0, 10);

const App: React.FC = () => {
  const [historicalData, setHistoricalData] = useState<HistoricalData>(INITIAL_HISTORICAL_DATA);
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [justSavedDateKey, setJustSavedDateKey] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [overwriteConfirmation, setOverwriteConfirmation] = useState<{date: Date, data: BedData} | null>(null);


  useEffect(() => {
    const initializeApp = () => {
      setIsLoading(true);
      const urlParams = new URLSearchParams(window.location.search);
      const sharedData = urlParams.get('data');

      let dataToProcess: HistoricalData | null = null;

      if (sharedData) {
        try {
          // 1. Attempt to decompress using LZString (New Format)
          let jsonString = LZString.decompressFromEncodedURIComponent(sharedData);

          // 2. If decompression returns null/empty, it might be the old format (Base64)
          if (!jsonString) {
             try {
                 // Fallback to old decoding method
                 jsonString = decodeURIComponent(atob(sharedData));
             } catch (e) {
                 console.warn("Legacy decoding failed, link might be invalid or corrupted.");
             }
          }

          if (jsonString) {
              dataToProcess = JSON.parse(jsonString);
          } else {
              throw new Error("Could not decode data");
          }

        } catch (e) {
          console.error("Failed to parse shared data from URL", e);
          setToastMessage("Erro ao carregar dados do link. O formato pode ser inválido.");
        }
      } else {
        // Fallback to localStorage if no URL data
        const savedData = localStorage.getItem('hospitalBedData');
        if (savedData) {
          try {
            dataToProcess = JSON.parse(savedData);
          } catch (e) {
            console.error("Failed to parse local data", e);
            setToastMessage("Erro ao carregar dados locais.");
          }
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

  const currentBedData = useMemo<BedData>(() => {
    return historicalData[formatDateKey(currentDate)] || EMPTY_BED_DATA;
  }, [historicalData, currentDate]);

  const getStatus = (bedType: BedType, value: number): StatusLevel => {
    const thresholds = BED_THRESHOLDS[bedType as keyof typeof BED_THRESHOLDS];
    if (!thresholds) {
      return StatusLevel.NORMAL;
    }
    if (value >= thresholds.critical) {
      return StatusLevel.CRITICAL;
    }
    if (value >= thresholds.alert) {
      return StatusLevel.ALERT;
    }
    return StatusLevel.NORMAL;
  };

  const chartData = useMemo<ChartData>(() => {
    return Object.entries(currentBedData).map(([name, value]) => {
      const status = getStatus(name as BedType, value as number);
      const color = STATUS_CONFIG[status].textColor.replace('text-','').replace('-700','');
      const capacity = BED_CAPACITY[name as keyof typeof BED_CAPACITY] || 100; // Default to 100 if undefined, though types cover it.
      
      let finalColor = '#34d399'; // green-400
      if(color === 'yellow') finalColor = '#f59e0b'; // yellow-500
      if(color === 'red') finalColor = '#ef4444'; // red-500

      const thresholds = BED_THRESHOLDS[name as keyof typeof BED_THRESHOLDS];
      if (!thresholds) {
        finalColor = '#60a5fa'; // blue-400
      }

      // Calculate percentages for the progress bar visualization
      // We limit to 100% to avoid breaking the chart visual if over capacity
      const rawPercent = ((value as number) / capacity) * 100;
      const percent = Math.min(100, Math.max(0, rawPercent));
      const freePercent = 100 - percent;
      
      const showCapacity = !name.includes('Cuida+') && name !== BedType.STABILIZATION;

      return {
        name: name.replace('Leitos ', '').replace('Clínicos', 'Clín.').replace('Pediátricos', 'Ped.').replace(' (emergência) (variável)', ''),
        value: percent, // Use percentage for the bar length
        realValue: value as number, // Store real value for the label
        capacity,
        percent,
        freePercent,
        color: finalColor,
        showCapacity
      };
    });
  }, [currentBedData]);

  const performSave = (date: Date, data: BedData) => {
    const dateKey = formatDateKey(date);
    const newHistoricalData = {
      ...historicalData,
      [dateKey]: data
    };
    setHistoricalData(newHistoricalData);
    localStorage.setItem('hospitalBedData', JSON.stringify(newHistoricalData));
    setToastMessage('Dados salvos com sucesso!');
    setJustSavedDateKey(dateKey);
    setTimeout(() => setJustSavedDateKey(null), 1500);
  };

  const handleSaveData = (date: Date, data: BedData) => {
    const dateKey = formatDateKey(date);
    if (historicalData[dateKey]) {
        setOverwriteConfirmation({ date, data });
    } else {
        performSave(date, data);
    }
  };

  const handleConfirmOverwrite = () => {
    if (overwriteConfirmation) {
        performSave(overwriteConfirmation.date, overwriteConfirmation.data);
        setOverwriteConfirmation(null);
    }
  };

  const handleCancelOverwrite = () => {
    setOverwriteConfirmation(null);
  };
  
  const handleDeleteData = (dateKey: string) => {
    const newData = { ...historicalData };
    delete newData[dateKey];
    
    if (formatDateKey(currentDate) === dateKey) {
      const remainingDates = Object.keys(newData).sort((a,b) => new Date(b).getTime() - new Date(a).getTime());
      if (remainingDates.length > 0) {
        setCurrentDate(new Date(`${remainingDates[0]}T00:00:00`));
      } else {
        setCurrentDate(new Date());
      }
    }

    setHistoricalData(newData);
    localStorage.setItem('hospitalBedData', JSON.stringify(newData));
    setToastMessage('Registro excluído com sucesso!');
  };

  const getShareUrl = (scope: 'current' | 'all'): string => {
    try {
        let dataToShare = historicalData;

        if (scope === 'current') {
            const dateKey = formatDateKey(currentDate);
            const currentData = historicalData[dateKey] || EMPTY_BED_DATA;
            dataToShare = { [dateKey]: currentData };
        }

        const dataStr = JSON.stringify(dataToShare);
        
        // COMPRESSION STEP:
        // Use LZString to compress the JSON string into a URI-safe format.
        // This significantly reduces URL length compared to standard Base64.
        const compressedData = LZString.compressToEncodedURIComponent(dataStr);
        
        const url = new URL(window.location.origin + window.location.pathname);
        url.searchParams.set('data', compressedData);
        return url.href;
    } catch (e) {
        console.error("Failed to create share link", e);
        setToastMessage('Erro ao criar link de compartilhamento.');
        return '';
    }
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
            <h2 className="text-xl font-bold text-gray-700 mb-4">Medidor de Ocupação (Ocupados {chartData.some(d => d.showCapacity) ? '/ Total' : ''})</h2>
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
                    getShareUrl={getShareUrl}
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
                title={bedType === BedType.ICU ? `${bedType} (emergência) (variável)` : bedType}
                value={currentBedData[bedType]}
                maxValue={BED_CAPACITY[bedType as keyof typeof BED_CAPACITY] ?? 0}
                status={getStatus(bedType, currentBedData[bedType])}
                hasThreshold={!!BED_THRESHOLDS[bedType as keyof typeof BED_THRESHOLDS]}
                isHighlighted={justSavedDateKey === formatDateKey(currentDate)}
                subtext={bedType.includes('Cuida+') ? '' : undefined}
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
            isAdmin={isAuthenticated}
          />
        </div>

        <div className="mt-6 bg-white p-6 rounded-xl shadow-md">
            <StatusLegend />
        </div>

        <div className="mt-8 pb-8">
            <div className="flex justify-center mb-10">
                 <a 
                    href="https://drive.google.com/file/d/1oB5s2rZEhCwyPPJ1QLzxiBp1QlZjb7n2/view?usp=sharing"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center px-6 py-3 rounded-full shadow-[0_4px_14px_0_rgba(20,184,166,0.39)] bg-teal-600 text-white text-sm font-semibold transition-all hover:bg-teal-700 hover:scale-105 active:scale-95 group"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 group-hover:rotate-6 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Acessar Projeto Cuida+ P.S
                </a>
            </div>

            {/* Capacity Info Modules */}
            <div className="mx-auto max-w-5xl mb-8 px-2">
                <div className="text-center mb-4">
                     <span className="text-xs font-bold tracking-widest text-gray-400 uppercase">Capacidade Instalada de Referência</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                    
                    {/* Module 1: Clínicos */}
                    <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 flex items-center justify-between hover:shadow-md transition-shadow">
                         <div className="flex items-center space-x-4">
                            <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                </svg>
                            </div>
                            <div className="flex flex-col">
                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Leitos Clínicos</span>
                                <span className="text-2xl font-black text-gray-800 leading-none">46 <span className="text-xs font-medium text-gray-400">Total</span></span>
                            </div>
                         </div>
                    </div>

                    {/* Module 2: Pediátricos */}
                    <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 flex items-center justify-between hover:shadow-md transition-shadow">
                         <div className="flex items-center space-x-4">
                            <div className="p-3 bg-indigo-50 text-indigo-600 rounded-lg">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <div className="flex flex-col">
                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Leitos Pediátricos</span>
                                <span className="text-2xl font-black text-gray-800 leading-none">08 <span className="text-xs font-medium text-gray-400">Total</span></span>
                            </div>
                         </div>
                    </div>

                    {/* Module 3: UTI */}
                    <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 flex items-center justify-between hover:shadow-md transition-shadow relative overflow-hidden">
                         <div className="absolute right-0 top-0 h-full w-1 bg-red-400"></div>
                         <div className="flex items-center space-x-4">
                            <div className="p-3 bg-red-50 text-red-600 rounded-lg">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                </svg>
                            </div>
                            <div className="flex flex-col">
                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Leitos UTI</span>
                                <div className="flex items-center gap-2">
                                    <span className="text-2xl font-black text-gray-800 leading-none">07</span>
                                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-gray-100 text-gray-500 border border-gray-200 uppercase">Variável</span>
                                </div>
                            </div>
                         </div>
                    </div>

                </div>
            </div>

            <div className="border-t border-gray-200 pt-4 w-1/2 mx-auto text-center">
                <p className="text-xs text-gray-400 italic">
                    Desenvolvido por <span className="font-semibold text-gray-500">Samuel Amaro</span>
                </p>
            </div>
        </div>

      </main>
      
      <OverwriteConfirmationModal
          isOpen={!!overwriteConfirmation}
          onClose={handleCancelOverwrite}
          onConfirm={handleConfirmOverwrite}
          date={overwriteConfirmation ? overwriteConfirmation.date.toLocaleDateString('pt-BR') : ''}
      />
    </div>
  );
};

export default App;
