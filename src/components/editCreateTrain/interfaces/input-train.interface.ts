export interface IRouteStop {
  id?: string;
  stationId: string;
  stationName: string;
  arrivalTime: string;
  departureTime: string;
  platform?: string;
  stopOrder: number;
  stationPlatformCount?: number;
}

export interface ICarriageInput {
  carriageNumber: number;
  type: "ECONOMY" | "BUSINESS" | "FIRST_CLASS";
  totalSeats: number;
}

export interface IInputTrain {
  departureDate: string;
  departureCity: string;
  arrivalDate: string;
  arrivalCity: string;
  availableSeats?: number;
  price: number;
  stops?: IRouteStop[];
  carriages?: ICarriageInput[];
}