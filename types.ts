export enum BedType {
  CLINICAL = 'Leitos Clínicos',
  CLINICAL_CUIDA_MAIS = 'Leitos Clínicos Cuida+',
  ICU = 'Leitos UTI',
  PEDIATRIC = 'Leitos Pediátricos',
  PEDIATRIC_CUIDA_MAIS = 'Leitos Pediátricos Cuida+',
  STABILIZATION = 'Estabilização'
}

export enum StatusLevel {
  NORMAL = 'NORMAL',
  ALERT = 'ALERT',
  CRITICAL = 'CRITICAL'
}

export type BedData = {
  [key in BedType]: number;
};

export type HistoricalData = Record<string, BedData>;

export type StatusConfig = {
  [key in StatusLevel]: {
    label: string;
    color: string;
    textColor: string;
    suggestion: string;
  };
};

export type ChartData = {
    name: string;
    value: number;
    color: string;
}[];
