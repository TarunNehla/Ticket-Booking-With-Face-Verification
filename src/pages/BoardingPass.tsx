import { Printer } from 'lucide-react';
import { useBooking } from '../context/BookingContext';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';

const BoardingPass = () => {
  const { bookingData } = useBooking();
  const navigate = useNavigate();

  const handlePrint = (index: number) => {
    const boardingPass = document.getElementById(`boarding-pass-${index}`);
    if (!boardingPass) return;
  
    const printContent = boardingPass.innerHTML;
    
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert('Please allow pop-ups for printing functionality');
      return;
    }
  
    printWindow.document.write(`
      <html>
        <head>
          <title>Boarding Pass</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
            .text-sm { font-size: 0.875rem; }
            .opacity-70 { opacity: 0.7; }
            .font-semibold { font-weight: 600; }
            .mb-4 { margin-bottom: 1rem; }
            @media print {
              body { padding: 0; }
              button { display: none !important; }
            }
          </style>
        </head>
        <body>
          ${printContent}
          <script>
            // Print and close the window after content is loaded
            window.onload = function() {
              setTimeout(() => {
                window.print();
                window.onafterprint = function() {
                  window.close();
                };
              }, 500);
            }
          </script>
        </body>
      </html>
    `);
    
    printWindow.document.close();
  };

  const renderBoardingPass = (index: number) => {
    const passenger = bookingData.passengers[index];
    const seat = bookingData.selectedSeats[index];
    const flight = bookingData.flight;

    if (!passenger || !flight) return null;

    return (
      <div className="card bg-base-100 shadow-xl mb-8">
        <div className="card-body" id={`boarding-pass-${index}`}>
          <div className="flex justify-between items-start">
            <div className="w-full">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-2xl font-bold">Boarding Pass</h3>
                <button 
                  className="btn btn-ghost print:hidden"
                  onClick={() => handlePrint(index)}
                >
                  <Printer size={24} />
                </button>
              </div>
              <div className="grid grid-cols-2 gap-8">
                <div>
                  <p className="text-sm opacity-70">Passenger</p>
                  <p className="font-semibold">{`${passenger.firstName} ${passenger.lastName}`}</p>
                </div>
                <div>
                  <p className="text-sm opacity-70">Flight</p>
                  <p className="font-semibold">{flight.company} {flight.id}</p>
                </div>
                <div>
                  <p className="text-sm opacity-70">From</p>
                  <p className="font-semibold">{flight.source}</p>
                </div>
                <div>
                  <p className="text-sm opacity-70">To</p>
                  <p className="font-semibold">{flight.destination}</p>
                </div>
                <div>
                  <p className="text-sm opacity-70">Date</p>
                  <p className="font-semibold">{format(new Date(bookingData.date), 'MMM dd, yyyy')}</p>
                </div>
                <div>
                  <p className="text-sm opacity-70">Seat</p>
                  <p className="font-semibold">{seat}</p>
                </div>
                <div>
                  <p className="text-sm opacity-70">Gate</p>
                  <p className="font-semibold">B12</p>
                </div>
                <div>
                  <p className="text-sm opacity-70">Boarding Time</p>
                  <p className="font-semibold">{flight.departureTime}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (!bookingData.flight || !bookingData.passengers.length) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="alert alert-warning">
          Please complete the booking process first.
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">Your Boarding Passes</h2>
      {renderBoardingPass(0)}
      {renderBoardingPass(1)}
      <div className="card-actions justify-end mt-4">
        <button
          className="btn btn-primary"
          onClick={() => navigate('/onboarding')}
        >
          Continue to Onboarding
        </button>
      </div>
    </div>
  );
};

export default BoardingPass;