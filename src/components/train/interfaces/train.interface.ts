export type TrainStatus = 'ON_TIME' | 'DELAYED' | 'CANCELLED';

export interface ITrainStop {
  id: string;
  trainId?: string;
  stationId: string;
  station?: {
    id: string;
    name: string;
    city: string;
    code: string;
  };
  /** @deprecated use station.name */
  stationName?: string;
  stationCode?: string;
  city?: string;
  platform?: string;
  arrivalTime?: string;
  departureTime?: string;
  stopOrder: number;
}

export type ITrain = {
  id: string;
  trainNumber?: string;
  departureCity: string;
  arrivalCity: string;
  departureDate: string;
  arrivalDate: string;
  availableSeats: number;
  price: number;
  status?: TrainStatus;
  delayMinutes?: number;
  stops?: ITrainStop[];
  carriages?: any[];
}