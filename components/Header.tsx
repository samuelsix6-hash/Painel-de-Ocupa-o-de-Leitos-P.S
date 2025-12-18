
import React from 'react';

interface HeaderProps {
    currentDate: Date;
}

const HospitalIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
    </svg>
);

const Header: React.FC<HeaderProps> = ({ currentDate }) => {
  return (
    <header className="bg-gradient-to-r from-slate-900 via-blue-900 to-blue-800 shadow-xl relative overflow-hidden">
      <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none"></div>

      <div className="container mx-auto px-4 md:px-6 py-4 flex items-center justify-between relative z-10">
        <div className="flex items-center space-x-4">
          <div className="bg-white/10 backdrop-blur-md p-2.5 rounded-xl border border-white/20">
            <HospitalIcon/>
          </div>
          <div className="hidden sm:flex flex-col">
            <h1 className="text-xl md:text-2xl font-black text-white leading-none tracking-tight">
              Pronto Socorro de Pelotas
            </h1>
            <span className="text-[10px] md:text-xs font-bold text-blue-300 uppercase tracking-widest mt-1 opacity-80">
              Painel de Ocupação de Leitos
            </span>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
            <div className="bg-white/5 backdrop-blur-md border border-white/10 text-white rounded-lg px-4 py-2 flex flex-col items-center">
                <span className="text-[9px] uppercase font-bold text-blue-300 leading-none mb-1">Referência</span>
                <span className="font-mono font-bold text-sm">
                    {currentDate.toLocaleDateString('pt-BR')}
                </span>
            </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
