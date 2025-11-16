
import React from 'react';
import { STATUS_CONFIG, STATUS_CONFIG as statusConfig } from '../constants';
import { StatusLevel } from '../types';

const LegendItem: React.FC<{ status: StatusLevel }> = ({ status }) => {
    const config = statusConfig[status];
    return (
        <div className="flex items-start space-x-3">
            <div className={`w-5 h-5 mt-1 rounded-full ${config.color.split(' ')[0]}`}></div>
            <div>
                <h4 className={`font-bold ${config.textColor}`}>{config.label}</h4>
                <p className="text-sm text-gray-600">
                    Sugestões de terminologia: <span className="font-semibold">{config.suggestion}</span>
                </p>
            </div>
        </div>
    );
};


const StatusLegend: React.FC = () => {
    return (
        <div>
            <h3 className="text-xl font-bold text-gray-700 mb-4">Critérios de Avaliação por Cores</h3>
            <div className="space-y-4">
                <LegendItem status={StatusLevel.NORMAL} />
                <LegendItem status={StatusLevel.ALERT} />
                <LegendItem status={StatusLevel.CRITICAL} />
            </div>
        </div>
    );
}

export default StatusLegend;
