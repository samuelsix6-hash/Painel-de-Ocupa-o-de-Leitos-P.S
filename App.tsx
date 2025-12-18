
import React, { useState, useMemo, useEffect } from 'react';
import { BedData, BedType, StatusLevel, ChartData, HistoricalData } from './types';
import { INITIAL_HISTORICAL_DATA, BED_THRESHOLDS, STATUS_CONFIG, EMPTY_BED_DATA, BED_CAPACITY, PASSWORD } from './constants';
import Header from './components/Header';
import StatusCard from './components/StatusCard';
import BedChart from './components/BedChart';
import ControlPanel from './components/ControlPanel';
import StatusLegend from './components/StatusLegend';
import HistoryTable from './components/HistoryTable';
import ComparisonTool from './components/ComparisonTool';
import StatisticsPanel from './components/StatisticsPanel';
import Toast from './components/Toast';
import OverwriteConfirmationModal from './components/OverwriteConfirmationModal';

// Declare LZString global from CDN
declare const LZString: any;

const formatDateKey = (date: Date) => date.toISOString().slice(0, 10);

const App: React.FC = () => {
  const [historicalData, setHistoricalData] = useState<HistoricalData>(INITIAL_HISTORICAL_DATA);
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [justSavedDateKey, setJustSavedDateKey] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [overwriteConfirmation, setOverwriteConfirmation] = useState<{date: Date, data: BedData} | null>(null);
  const [passwordInput, setPasswordInput] = useState('');
  const [loginError, setLoginError] = useState(false);
  
  // Período selecionado compartilhado entre estatísticas e histórico
  const [selectedMonth, setSelectedMonth] = useState<string>('');

  useEffect(() => {
    const initializeApp = () => {
      setIsLoading(true);
      const urlParams = new URLSearchParams(window.location.search);
      const sharedData = urlParams.get('data');

      let dataToProcess: HistoricalData | null = null;

      if (sharedData) {
        try {
          let jsonString = LZString.decompressFromEncodedURIComponent(sharedData);
          if (!jsonString) {
             try {
                 jsonString = decodeURIComponent(atob(sharedData));
             } catch (e) {
                 console.warn("Legacy decoding failed.");
             }
          }
          if (jsonString) {
              dataToProcess = JSON.parse(jsonString);
          }
        } catch (e) {
          console.error("Failed to parse shared data", e);
          setToastMessage("Erro ao carregar dados do link.");
        }
      } else {
        const savedData = localStorage.getItem('hospitalBedData');
        if (savedData) {
          try {
            dataToProcess = JSON.parse(savedData);
          } catch (e) {
            console.error("Failed to parse local data", e);
          }
        }
      }

      if (dataToProcess && Object.keys(dataToProcess).length > 0) {
        const sortedDates = Object.keys(dataToProcess).sort((a, b) => new Date(b).getTime() - new Date(a).getTime());
        setHistoricalData(dataToProcess);
        setCurrentDate(new Date(`${sortedDates[0]}T00:00:00`));
        
        // Inicializa o mês selecionado com o mais recente
        const mostRecentMonth = sortedDates[0].substring(0, 7);
        setSelectedMonth(mostRecentMonth);
      }
      setIsLoading(false);
    };

    initializeApp();
  }, []);

  const currentBedData = useMemo<BedData>(() => {
    return historicalData[formatDateKey(currentDate)] || EMPTY_BED_DATA;
  }, [historicalData, currentDate]);

  const allDatesSorted = useMemo(() => 
    Object.keys(historicalData).sort((a, b) => new Date(b).getTime() - new Date(a).getTime())
  , [historicalData]);

  const availableMonths = useMemo(() => {
    const months = new Set<string>();
    allDatesSorted.forEach(date => months.add(date.substring(0, 7)));
    return Array.from(months);
  }, [allDatesSorted]);

  const filteredDates = useMemo(() => {
    if (selectedMonth === 'all') return allDatesSorted;
    if (!selectedMonth) return []; 
    return allDatesSorted.filter(date => date.startsWith(selectedMonth));
  }, [allDatesSorted, selectedMonth]);

  const getMonthLabel = (monthStr: string) => {
    if (!monthStr) return "";
    if (monthStr === 'all') return 'Todos os períodos';
    const [year, month] = monthStr.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1, 1);
    const label = date.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
    return label.charAt(0).toUpperCase() + label.slice(1);
  };

  const getStatus = (bedType: BedType, value: number): StatusLevel => {
    const thresholds = BED_THRESHOLDS[bedType as keyof typeof BED_THRESHOLDS];
    if (!thresholds) return StatusLevel.NORMAL;
    if (value >= thresholds.critical) return StatusLevel.CRITICAL;
    if (value >= thresholds.alert) return StatusLevel.ALERT;
    return StatusLevel.NORMAL;
  };

  const chartData = useMemo<ChartData>(() => {
    return Object.entries(currentBedData).map(([name, value]) => {
      const status = getStatus(name as BedType, value as number);
      const color = STATUS_CONFIG[status].textColor.replace('text-','').replace('-700','');
      const capacity = BED_CAPACITY[name as keyof typeof BED_CAPACITY] || 100;
      
      let finalColor = '#34d399';
      if(color === 'yellow') finalColor = '#f59e0b';
      if(color === 'red') finalColor = '#ef4444';

      const rawPercent = ((value as number) / capacity) * 100;
      const percent = Math.min(100, Math.max(0, rawPercent));
      const showCapacity = !name.includes('Cuida+') && name !== BedType.STABILIZATION;

      return {
        name: name.replace('Leitos ', '').replace('Clínicos', 'Clín.').replace('Pediátricos', 'Ped.').replace(' (emergência) (variável)', ''),
        value: percent,
        realValue: value as number,
        capacity,
        percent,
        freePercent: 100 - percent,
        color: finalColor,
        showCapacity
      };
    });
  }, [currentBedData]);

  const performSave = (date: Date, data: BedData) => {
    const dateKey = formatDateKey(date);
    const newHistoricalData = { ...historicalData, [dateKey]: data };
    setHistoricalData(newHistoricalData);
    localStorage.setItem('hospitalBedData', JSON.stringify(newHistoricalData));
    setToastMessage('Dados salvos com sucesso!');
    setJustSavedDateKey(dateKey);
    setIsEditing(false);
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

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordInput === PASSWORD) {
        setIsAuthenticated(true);
        setLoginError(false);
        setPasswordInput('');
    } else {
        setLoginError(true);
        setTimeout(() => setLoginError(false), 2000);
    }
  };

  const getShareUrl = (scope: 'current' | 'all'): string => {
    try {
        let dataToShare = historicalData;
        if (scope === 'current') {
            const dateKey = formatDateKey(currentDate);
            dataToShare = { [dateKey]: historicalData[dateKey] || EMPTY_BED_DATA };
        }
        const compressedData = LZString.compressToEncodedURIComponent(JSON.stringify(dataToShare));
        const url = new URL(window.location.origin + window.location.pathname);
        url.searchParams.set('data', compressedData);
        return url.href;
    } catch (e) {
        return '';
    }
  };

  if (isLoading) {
    return <div className="flex justify-center items-center min-h-screen bg-gray-100">Carregando...</div>;
  }

  return (
    <div className="bg-gray-100 min-h-screen font-sans">
      <Header currentDate={currentDate} />
      
      {toastMessage && <Toast message={toastMessage} onClose={() => setToastMessage(null)} />}
      
      <main className="container mx-auto p-4 md:p-6">
        
        {/* ADMIN ACCESS */}
        <div className="mb-6 flex justify-center">
            <div className="bg-white/50 backdrop-blur-sm border border-gray-200 rounded-2xl px-6 py-3 shadow-sm inline-flex items-center transition-all">
                {!isAuthenticated ? (
                    <form onSubmit={handleLogin} className="flex items-center space-x-3">
                        <div className="flex items-center text-gray-500 mr-2">
                            <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                            </svg>
                            <span className="text-xs font-bold uppercase tracking-wider hidden md:inline">Acesso Restrito</span>
                        </div>
                        <input
                            type="password"
                            placeholder="Senha Admin"
                            value={passwordInput}
                            onChange={(e) => setPasswordInput(e.target.value)}
                            className={`px-3 py-1.5 border rounded-lg text-sm outline-none transition-all ${
                                loginError ? 'border-red-500 bg-red-50' : 'border-gray-200 focus:border-blue-400 focus:ring-4 focus:ring-blue-100'
                            }`}
                        />
                        <button type="submit" className="bg-slate-800 text-white text-xs font-bold px-4 py-2 rounded-lg hover:bg-slate-700 transition-colors uppercase tracking-widest">
                            Entrar
                        </button>
                    </form>
                ) : (
                    <div className="flex items-center space-x-4">
                        <div className="flex items-center text-green-600 font-bold text-xs uppercase tracking-widest">
                            <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
                            Administrador Ativo
                        </div>
                        <div className="h-4 w-px bg-gray-200"></div>
                        <button 
                            onClick={() => setIsEditing(true)}
                            className="bg-blue-600 text-white text-xs font-bold px-4 py-2 rounded-lg hover:bg-blue-700 transition-all flex items-center space-x-2"
                        >
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                            <span>Lançar Dados</span>
                        </button>
                        <button 
                            onClick={() => setIsAuthenticated(false)}
                            className="text-gray-400 hover:text-red-600 text-[10px] font-bold uppercase tracking-widest transition-colors"
                        >
                            Sair
                        </button>
                    </div>
                )}
            </div>
        </div>

        {/* CHART SECTION */}
        <div className="grid grid-cols-1 gap-6">
          <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-700">Painel Geral de Ocupação</h2>
                <div className="text-xs font-bold text-gray-400 uppercase bg-gray-50 px-3 py-1 rounded-full border border-gray-100">
                    Ocupados {chartData.some(d => d.showCapacity) ? '/ Capacidade' : ''}
                </div>
            </div>
            <div className="h-96">
              <BedChart data={chartData} />
            </div>
          </div>
        </div>

        {/* DETAILED STATUS SECTION */}
        <div className="mt-8">
            <h2 className="text-xl font-bold text-gray-700 mb-6 flex items-center">
                <span className="w-2 h-6 bg-blue-600 rounded-full mr-3"></span>
                Status Detalhado por Unidade
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {(Object.keys(currentBedData) as BedType[]).map(bedType => (
                <StatusCard
                    key={bedType}
                    title={bedType === BedType.ICU ? `${bedType} (variável)` : bedType.replace('Leitos ', '')}
                    value={currentBedData[bedType]}
                    maxValue={BED_CAPACITY[bedType as keyof typeof BED_CAPACITY] ?? 0}
                    status={getStatus(bedType, currentBedData[bedType])}
                    hasThreshold={!!BED_THRESHOLDS[bedType as keyof typeof BED_THRESHOLDS]}
                    isHighlighted={justSavedDateKey === formatDateKey(currentDate)}
                />
            ))}
            </div>
        </div>

        {/* SELECTOR DE MÊS PARA ESTATÍSTICAS E HISTÓRICO */}
        {availableMonths.length > 0 && (
            <div className="mt-8 flex justify-center">
                <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-4 flex flex-col md:flex-row items-center gap-4 shadow-sm w-full max-w-2xl">
                    <span className="text-sm font-bold text-indigo-700 uppercase tracking-widest whitespace-nowrap">Filtrar Período:</span>
                    <select
                        value={selectedMonth}
                        onChange={(e) => setSelectedMonth(e.target.value)}
                        className="w-full bg-white border border-indigo-200 rounded-lg py-2 px-4 font-bold text-indigo-900 outline-none focus:ring-2 focus:ring-indigo-400"
                    >
                        {availableMonths.map(month => (
                            <option key={month} value={month}>
                                {getMonthLabel(month)}
                            </option>
                        ))}
                        <option value="all">Todo o Histórico</option>
                    </select>
                </div>
            </div>
        )}
        
        {/* NEW LOCATION FOR STATISTICS PANEL */}
        <StatisticsPanel 
            data={historicalData} 
            filteredDates={filteredDates} 
            selectedMonthLabel={getMonthLabel(selectedMonth)} 
        />

        <ComparisonTool historicalData={historicalData} />

        {/* HISTORY TABLE SECTION */}
        <div className="mt-8 bg-white p-6 rounded-xl shadow-md border border-gray-100">
          <HistoryTable 
            data={historicalData} 
            filteredDates={filteredDates}
            selectedMonth={selectedMonth}
            onMonthChange={setSelectedMonth}
            onDelete={(key) => {
                const newData = { ...historicalData };
                delete newData[key];
                setHistoricalData(newData);
                localStorage.setItem('hospitalBedData', JSON.stringify(newData));
            }} 
            highlightedDateKey={justSavedDateKey}
            isAdmin={isAuthenticated}
          />
        </div>

        {/* LEGEND AND ACTIONS */}
        <div className="mt-8 bg-white p-6 rounded-xl shadow-md border border-gray-100 grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
            <StatusLegend />
            <div className="space-y-4">
                 <h3 className="text-xl font-bold text-gray-700 mb-4">Ações do Projeto</h3>
                 <a 
                    href="https://drive.google.com/file/d/1oB5s2rZEhCwyPPJ1QLzxiBp1QlZjb7n2/view?usp=sharing"
                    target="_blank" rel="noopener noreferrer"
                    className="flex items-center justify-center px-6 py-4 rounded-xl shadow-lg bg-teal-600 text-white font-bold transition-all hover:bg-teal-700 hover:scale-[1.02]"
                >
                    Acessar Projeto Cuida+ P.S
                </a>
                <p className="text-xs text-gray-400 italic text-center pt-4">
                    Desenvolvido por <span className="font-semibold text-gray-500">Samuel Amaro</span>
                </p>
            </div>
        </div>
      </main>

      {/* EDIT MODAL */}
      {isEditing && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
              <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setIsEditing(false)}></div>
              <div className="relative bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
                  <div className="p-6">
                    <ControlPanel
                        bedDataForDate={currentBedData}
                        currentDate={currentDate}
                        onDateChange={setCurrentDate}
                        onSave={handleSaveData}
                        getShareUrl={getShareUrl}
                        onClose={() => setIsEditing(false)}
                    />
                  </div>
              </div>
          </div>
      )}
      
      <OverwriteConfirmationModal
          isOpen={!!overwriteConfirmation}
          onClose={() => setOverwriteConfirmation(null)}
          onConfirm={() => {
              if (overwriteConfirmation) performSave(overwriteConfirmation.date, overwriteConfirmation.data);
              setOverwriteConfirmation(null);
          }}
          date={overwriteConfirmation ? overwriteConfirmation.date.toLocaleDateString('pt-BR') : ''}
      />
    </div>
  );
};

export default App;
