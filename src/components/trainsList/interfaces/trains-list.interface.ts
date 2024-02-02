export type ITrain = {
  id: string;
  departureCity: string;
  arrivalCity: string;
  departureDate: Date;
  arrivalDate: Date;
  availableSeats: number;
  price: number;
}