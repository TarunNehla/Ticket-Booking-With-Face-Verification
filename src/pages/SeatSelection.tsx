import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useBooking } from '../context/BookingContext';

const SeatSelection = () => {
  const navigate = useNavigate();
  const { bookingData, updateSeats } = useBooking();
  const [selectedSeats, setSelectedSeats] = React.useState<string[]>(
    bookingData.selectedSeats || []
  );

  const generateSeats = () => {
    const rows = ['A', 'B', 'C', 'D', 'E', 'F'];
    const seats = [];
    for (let i = 1; i <= 5; i++) {
      for (let j = 0; j < rows.length; j++) {
        seats.push(`${i}${rows[j]}`);
      }
    }
    return seats;
  };

  const handleSeatSelect = (seat: string) => {
    if (selectedSeats.includes(seat)) {
      setSelectedSeats(selectedSeats.filter(s => s !== seat));
    } else if (selectedSeats.length < 2) {
      setSelectedSeats([...selectedSeats, seat]);
    }
  };

  const handleContinue = () => {
    updateSeats(selectedSeats);
    navigate('/onboarding');
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="card bg-base-100 shadow-xl">
        <div className="card-body">
          <h2 className="card-title mb-6">Select Your Seats</h2>
          <p className="mb-4">Please select 2 seats</p>
          
          <div className="relative w-full max-w-md mx-auto mb-8">
            <div className="w-24 h-24 bg-base-200 rounded-full mx-auto mb-4"></div>
            
            <div className="grid grid-cols-6 gap-2">
              {generateSeats().map((seat) => {
                const col = seat.charAt(1);
                return (
                  <React.Fragment key={seat}>
                    {col === 'C' && <div className="col-span-1"></div>}
                    <button
                      className={`btn btn-sm ${
                        selectedSeats.includes(seat)
                          ? 'btn-primary'
                          : 'btn-outline'
                      }`}
                      onClick={() => handleSeatSelect(seat)}
                      disabled={selectedSeats.length >= 2 && !selectedSeats.includes(seat)}
                    >
                      {seat}
                    </button>
                  </React.Fragment>
                );
              })}
            </div>
          </div>

          <div className="flex justify-between items-center">
            <div>
              Selected seats: {selectedSeats.join(', ')}
            </div>
            <button
              className="btn btn-primary"
              onClick={handleContinue}
              disabled={selectedSeats.length !== 2}
            >
              Continue
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SeatSelection;