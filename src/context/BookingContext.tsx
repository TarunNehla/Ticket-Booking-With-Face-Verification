import React, { createContext, useContext, useState } from 'react';
import { BookingData, Flight, Passenger } from '../types';

interface BookingContextType {
  bookingData: BookingData;
  updateFlight: (flight: Flight, date: string) => void;
  updatePassengers: (passengers: Passenger[]) => void;
  updateSeats: (seats: string[]) => void;
  updateApproval: (approved: boolean) => void;
}

const defaultBookingData: BookingData = {
  flight: null,
  passengers: [],
  selectedSeats: [],
  date: '',
  isApproved: false,
};

const BookingContext = createContext<BookingContextType | undefined>(undefined);

export const BookingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [bookingData, setBookingData] = useState<BookingData>(defaultBookingData);

  const updateFlight = (flight: Flight, date: string) => {
    setBookingData(prev => ({ ...prev, flight, date }));
  };

  const updatePassengers = (passengers: Passenger[]) => {
    setBookingData(prev => ({ ...prev, passengers }));
  };

  const updateSeats = (seats: string[]) => {
    setBookingData(prev => ({ ...prev, selectedSeats: seats }));
  };

  const updateApproval = (approved: boolean) => {
    setBookingData(prev => ({ ...prev, isApproved: approved }));
  };

  return (
    <BookingContext.Provider value={{ 
      bookingData, 
      updateFlight, 
      updatePassengers, 
      updateSeats,
      updateApproval 
    }}>
      {children}
    </BookingContext.Provider>
  );
};

export const useBooking = () => {
  const context = useContext(BookingContext);
  if (context === undefined) {
    throw new Error('useBooking must be used within a BookingProvider');
  }
  return context;
};