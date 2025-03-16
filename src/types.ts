export interface Flight {
  id: string;
  source: string;
  destination: string;
  company: string;
  price: number;
  departureTime: string;
  arrivalTime: string;
}

export interface Passenger {
  firstName: string;
  lastName: string;
  email: string;
}

export interface BookingData {
  flight: Flight | null;
  passengers: Passenger[];
  selectedSeats: string[];
  date: string;
  isApproved?: boolean;
}

export interface BoardingPass {
  passenger: Passenger;
  flight: Flight;
  seatNumber: string;
  gate: string;
  boardingTime: string;
}