
import { BedData, BedType, StatusLevel, StatusConfig, HistoricalData } from './types';

export const PASSWORD = 'Conselho@2026';

export const BED_CAPACITY = {
  [BedType.CLINICAL]: 46,
  [BedType.ICU]: 8,
  [BedType.PEDIATRIC]: 8,
};

// Thresholds for status changes. Critical is at 100% capacity, Alert is at ~90%.
export const BED_THRESHOLDS = {
  [BedType.CLINICAL]: { alert: 42, critical: 46 }, // Alert at ~90% of 46
  [BedType.ICU]: { alert: 7, critical: 8 },      // Alert at ~90% of 8
  [BedType.PEDIATRIC]: { alert: 7, critical: 8 }, // Alert at ~90% of 8
};

export const STATUS_CONFIG: StatusConfig = {
  [StatusLevel.NORMAL]: {
    label: 'Normal',
    color: 'bg-green-100 border-green-500',
    textColor: 'text-green-700',
    suggestion: 'Estável / Controlado'
  },
  [StatusLevel.ALERT]: {
    label: 'Alerta',
    color: 'bg-yellow-100 border-yellow-500',
    textColor: 'text-yellow-700',
    suggestion: 'Atenção / Monitoramento'
  },
  [StatusLevel.CRITICAL]: {
    label: 'Crítico',
    color: 'bg-red-100 border-red-500',
    textColor: 'text-red-700',
    suggestion: 'Emergência / Superlotação'
  }
};

export const INITIAL_HISTORICAL_DATA: HistoricalData = {};

export const EMPTY_BED_DATA: BedData = {
    [BedType.CLINICAL]: 0,
    [BedType.CLINICAL_CUIDA_MAIS]: 0,
    [BedType.ICU]: 0,
    [BedType.PEDIATRIC]: 0,
    [BedType.PEDIATRIC_CUIDA_MAIS]: 0,
    [BedType.STABILIZATION]: 0,
};


export const BED_MAX_VALUES = {
    [BedType.CLINICAL]: 100,
    [BedType.CLINICAL_CUIDA_MAIS]: 50,
    [BedType.ICU]: 20,
    [BedType.PEDIATRIC]: 20,
    [BedType.PEDIATRIC_CUIDA_MAIS]: 10,
    [BedType.STABILIZATION]: 10,
};