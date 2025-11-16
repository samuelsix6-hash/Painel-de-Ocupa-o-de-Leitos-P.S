import React from 'react';

const HospitalIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 12H6m6-6v12" />
        <path d="M12 2L12 2C6.47715 2 2 6.47715 2 12V19C2 20.6569 3.34315 22 5 22H19C20.6569 22 22 20.6569 22 19V12C22 6.47715 17.5228 2 12 2Z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" opacity="0.5" />
    </svg>
);

interface HeaderProps {
    currentDate: Date;
}

const Header: React.FC<HeaderProps> = ({ currentDate }) => {

  return (
    <header className="bg-blue-600 shadow-lg">
      <div className="container mx-auto px-4 md:px-6 py-4 flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center space-x-3">
          <div className="bg-blue-500 p-2 rounded-full">
            <HospitalIcon/>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            Painel de Ocupação de Leitos
          </h1>
        </div>
        <div className="flex items-center space-x-2 bg-blue-500 text-white rounded-md border-blue-400 p-2 text-sm">
            <span className="font-medium">Data Exibida:</span>
            <span>{currentDate.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })}</span>
        </div>
      </div>
    </header>
  );
};

export default Header;
