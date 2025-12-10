import React from 'react';

const HospitalIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
    </svg>
);

interface HeaderProps {
    currentDate: Date;
}

const Header: React.FC<HeaderProps> = ({ currentDate }) => {

  return (
    <header className="bg-gradient-to-r from-slate-900 via-blue-900 to-blue-800 shadow-2xl border-b border-white/10 relative overflow-hidden">
      
      {/* Abstract Shapes for "Innovation" feel */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/3 pointer-events-none"></div>

      <div className="container mx-auto px-4 md:px-6 py-6 flex items-center justify-between flex-wrap gap-4 relative z-10">
        <div className="flex items-center space-x-5">
          <div className="bg-white/10 backdrop-blur-md p-3.5 rounded-2xl border border-white/20 shadow-[0_0_15px_rgba(59,130,246,0.3)] group transition-all duration-300 hover:bg-white/20 hover:scale-105 hover:shadow-[0_0_25px_rgba(59,130,246,0.5)]">
            <HospitalIcon/>
          </div>
          <div className="flex flex-col justify-center">
            <h1 className="text-2xl md:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-blue-50 to-blue-200 tracking-tight leading-none drop-shadow-sm">
              Pronto Socorro de Pelotas
            </h1>
            <div className="flex items-center mt-1.5 space-x-2">
                <span className="h-0.5 w-8 bg-gradient-to-r from-blue-400 to-transparent rounded-full"></span>
                <h2 className="text-xs md:text-sm font-bold text-blue-300 uppercase tracking-[0.2em] shadow-black drop-shadow-sm">
                  Painel de Ocupação de Leitos
                </h2>
            </div>
          </div>
        </div>
        
        <div className="flex items-center space-x-4 bg-white/5 backdrop-blur-lg border border-white/10 text-white rounded-xl px-5 py-3 shadow-lg hover:bg-white/10 transition-all duration-300 ring-1 ring-white/5 group">
            <div className="flex flex-col items-end">
                <span className="text-[10px] uppercase font-bold text-blue-300 tracking-wider mb-0.5">Data de Referência</span>
                <span className="font-bold text-lg leading-none tracking-wide font-mono text-white group-hover:text-blue-100 transition-colors">
                    {currentDate.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                </span>
            </div>
             <div className="h-8 w-px bg-white/20 mx-1 hidden sm:block"></div>
             <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-400 drop-shadow-[0_0_8px_rgba(96,165,250,0.8)] hidden sm:block" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
        </div>
      </div>
    </header>
  );
};

export default Header;