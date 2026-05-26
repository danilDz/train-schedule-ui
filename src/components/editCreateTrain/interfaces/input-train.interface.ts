export interface IRouteStop {
  id?: string;
  stationId: string;
  stationName: string;
  arrivalTime: string;
  departureTime: string;
  platform?: string;
  stopOrder: number;
}

export interface IInputTrain {
  departureDate: string;
  departureCity: string;
  arrivalDate: string;
  arrivalCity: string;
  availableSeats: number;
  price: number;
  stops?: IRouteStop[];
}