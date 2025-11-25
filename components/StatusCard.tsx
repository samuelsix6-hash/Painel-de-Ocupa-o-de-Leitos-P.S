
import React from 'react';
import { StatusLevel } from '../types';
import { STATUS_CONFIG } from '../constants';

interface StatusCardProps {
  title: string;
  value: number;
  maxValue: number;
  status: StatusLevel;
  hasThreshold: boolean;
  isHighlighted?: boolean;
  subtext?: string;
}

const StatusCard: React.FC<StatusCardProps> = ({ title, value, maxValue, status, hasThreshold, isHighlighted, subtext }) => {
  const config = hasThreshold ? STATUS_CONFIG[status] : {
    label: 'Informativo',
    color: 'bg-blue-100 border-blue-500',
    textColor: 'text-blue-700'
  };

  // Corrected percentage calculation to accurately reflect over-capacity situations.
  const percentage = maxValue > 0 ? (value / maxValue) * 100 : 0;

  return (
    <div className={`bg-white rounded-xl shadow-md overflow-hidden transform hover:scale-105 transition-transform duration-300 border-t-4 ${config.color.split(' ')[1]} ${isHighlighted ? 'animate-flash' : ''}`}>
      <div className="p-5">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">{title}</h3>
          {hasThreshold && (
            <span className={`px-3 py-1 text-xs font-bold rounded-full ${config.color} ${config.textColor}`}>
              {config.label}
            </span>
          )}
        </div>
        <div className="mt-2 flex items-baseline space-x-2">
          <p className={`text-4xl font-bold ${config.textColor}`}>
            {value}
          </p>
          {hasThreshold && (
            <p className={`text-xl font-semibold ${config.textColor} opacity-80`}>
                ({percentage.toFixed(1)}%)
            </p>
          )}
        </div>
        <p className="text-sm text-gray-400">
            {subtext !== undefined ? subtext : 'leitos ocupados'}
        </p>
      </div>
    </div>
  );
};

export default StatusCard;