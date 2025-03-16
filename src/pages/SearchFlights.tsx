import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Flight } from '../types';
import { useBooking } from '../context/BookingContext';

const CITIES = ['New York', 'London', 'Tokyo', 'Paris'];

const SAMPLE_FLIGHTS: Flight[] = [
  {
    id: '1',
    company: 'SkyWings',
    price: 299,
    departureTime: '09:00',
    arrivalTime: '14:00',
    source: '',
    destination: ''
  },
  {
    id: '2',
    company: 'AirGlobe',
    price: 349,
    departureTime: '11:30',
    arrivalTime: '16:30',
    source: '',
    destination: ''
  },
  {
    id: '3',
    company: 'StarFlight',
    price: 279,
    departureTime: '14:00',
    arrivalTime: '19:00',
    source: '',
    destination: ''
  },
  {
    id: '4',
    company: 'CloudAir',
    price: 319,
    departureTime: '16:30',
    arrivalTime: '21:30',
    source: '',
    destination: ''
  }
];

const SearchFlights = () => {
  const navigate = useNavigate();
  const { updateFlight } = useBooking();
  const [source, setSource] = useState('');
  const [destination, setDestination] = useState('');
  const [date, setDate] = useState('');
  const [showFlights, setShowFlights] = useState(false);

  const handleSearch = () => {
    setShowFlights(true);
  };

  const handleSelectFlight = (flight: Flight) => {
    const updatedFlight = {
      ...flight,
      source,
      destination
    };
    updateFlight(updatedFlight, date);
    navigate('/passenger-details');
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="card bg-base-100 shadow-xl">
        <div className="card-body">
          <h2 className="card-title mb-4">Search Flights</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <select 
              className="select select-bordered w-full" 
              value={source}
              onChange={(e) => setSource(e.target.value)}
            >
              <option value="">Select Source</option>
              {CITIES.map(city => (
                <option key={city} value={city}>{city}</option>
              ))}
            </select>

            <select 
              className="select select-bordered w-full"
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
            >
              <option value="">Select Destination</option>
              {CITIES.map(city => (
                <option key={city} value={city}>{city}</option>
              ))}
            </select>

            <input
              type="date"
              className="input input-bordered w-full"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>
          
          <div className="card-actions justify-end mt-4">
            <button 
              className="btn btn-primary"
              onClick={handleSearch}
              disabled={!source || !destination || !date}
            >
              Search Flights
            </button>
          </div>
        </div>
      </div>

      {showFlights && (
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
          {SAMPLE_FLIGHTS.map(flight => (
            <div 
              key={flight.id}
              className="card bg-base-100 shadow-xl cursor-pointer hover:shadow-2xl transition-shadow"
              onClick={() => handleSelectFlight(flight)}
            >
              <div className="card-body">
                <h3 className="card-title">{flight.company}</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm opacity-70">From</p>
                    <p className="font-semibold">{source}</p>
                    <p className="text-sm">{flight.departureTime}</p>
                  </div>
                  <div>
                    <p className="text-sm opacity-70">To</p>
                    <p className="font-semibold">{destination}</p>
                    <p className="text-sm">{flight.arrivalTime}</p>
                  </div>
                </div>
                <div className="card-actions justify-end mt-4">
                  <p className="text-xl font-bold">${flight.price}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SearchFlights;