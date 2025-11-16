import { BedData, BedType, StatusLevel, StatusConfig, HistoricalData } from './types';

export const PASSWORD = 'Conselho@2026';

export const BED_THRESHOLDS = {
  [BedType.CLINICAL]: { alert: 46, critical: 46 },
  [BedType.ICU]: { alert: 8, critical: 8 },
  [BedType.PEDIATRIC]: { alert: 8, critical: 8 },
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

const formatDateKey = (date: Date): string => date.toISOString().slice(0, 10);

const today = new Date();
const yesterday = new Date();
yesterday.setDate(today.getDate() - 1);
const twoDaysAgo = new Date();
twoDaysAgo.setDate(today.getDate() - 2);


export const INITIAL_BED_DATA: BedData = {
  [BedType.CLINICAL]: 40,
  [BedType.CLINICAL_CUIDA_MAIS]: 15,
  [BedType.ICU]: 7,
  [BedType.PEDIATRIC]: 5,
  [BedType.PEDIATRIC_CUIDA_MAIS]: 4,
  [BedType.STABILIZATION]: 2
};

export const INITIAL_HISTORICAL_DATA: HistoricalData = {
  [formatDateKey(twoDaysAgo)]: {
    [BedType.CLINICAL]: 42,
    [BedType.CLINICAL_CUIDA_MAIS]: 16,
    [BedType.ICU]: 8,
    [BedType.PEDIATRIC]: 6,
    [BedType.PEDIATRIC_CUIDA_MAIS]: 3,
    [BedType.STABILIZATION]: 1,
  },
  [formatDateKey(yesterday)]: {
    [BedType.CLINICAL]: 45,
    [BedType.CLINICAL_CUIDA_MAIS]: 14,
    [BedType.ICU]: 9,
    [BedType.PEDIATRIC]: 7,
    [BedType.PEDIATRIC_CUIDA_MAIS]: 5,
    [BedType.STABILIZATION]: 3,
  },
  [formatDateKey(today)]: INITIAL_BED_DATA,
};

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
