
import React from 'react';
import { ResponsiveContainer, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, Bar, Cell, LabelList } from 'recharts';
import { ChartData } from '../types';

interface BedChartProps {
  data: ChartData;
}

const CustomLabel = (props: any) => {
    const { x, y, width, height, value, index, data } = props;
    const item = data[index];
    
    // Position text to the right of the bar
    return (
        <text 
            x={x + width + 5} 
            y={y + height / 2 + 5} 
            fill="#374151" 
            fontSize={12} 
            fontWeight="bold"
            textAnchor="start"
        >
            {item.showCapacity ? `${item.realValue} / ${item.capacity}` : `${item.realValue}`}
        </text>
    );
};

const BedChart: React.FC<BedChartProps> = ({ data }) => {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart
        data={data}
        layout="vertical"
        margin={{
          top: 5,
          right: 60, // Increased right margin to fit the custom labels
          left: 30,  // Increased left margin for longer names
          bottom: 5,
        }}
      >
        <CartesianGrid strokeDasharray="3 3" horizontal={false} />
        <XAxis type="number" hide domain={[0, 100]} />
        <YAxis 
            type="category" 
            dataKey="name" 
            tick={{ fontSize: 11, width: 120 }} 
            width={120}
        />
        <Tooltip
          cursor={{fill: 'transparent'}}
          content={({ active, payload }) => {
            if (active && payload && payload.length) {
              const dataItem = payload[0].payload;
              return (
                <div className="bg-white p-2 border border-gray-300 rounded shadow-sm">
                  <p className="font-bold text-gray-700">{dataItem.name}</p>
                  <p className="text-sm text-gray-600">Ocupados: <span className="font-semibold">{dataItem.realValue}</span></p>
                  {dataItem.showCapacity && (
                      <>
                        <p className="text-sm text-gray-600">Capacidade: <span className="font-semibold">{dataItem.capacity}</span></p>
                        <p className="text-sm text-gray-600">Disponíveis: <span className="font-semibold">{Math.max(0, dataItem.capacity - dataItem.realValue)}</span></p>
                      </>
                  )}
                </div>
              );
            }
            return null;
          }}
        />
        {/* Occupied Bar (Foreground) */}
        <Bar dataKey="value" name="Ocupado" stackId="a" barSize={24}>
            {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
        </Bar>
        
        {/* Free Bar (Background/Remaining) */}
        <Bar dataKey="freePercent" name="Livre" stackId="a" barSize={24} fill="#e5e7eb">
             <LabelList dataKey="freePercent" content={<CustomLabel data={data} />} />
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
};

export default BedChart;