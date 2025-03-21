import { useState } from 'react';
import { Printer } from 'lucide-react';
import { useBooking } from '../context/BookingContext';
import { format } from 'date-fns';
import FaceValidation from '../components/FaceValidation';

const Onboarding = () => {
  const { bookingData, updateApproval } = useBooking();
  const [verifiedPassengers, setVerifiedPassengers] = useState<number[]>([]);
  const [isVerifying, setIsVerifying] = useState<number | null>(null);

  const handlePrint = (index: number) => {
    const boardingPass = document.getElementById(`approved-pass-${index}`);
    if (!boardingPass) return;

    const printContent = boardingPass.innerHTML;
    const iframe = document.createElement('iframe');
    iframe.style.display = 'none';
    document.body.appendChild(iframe);

    const iframeDoc = iframe.contentWindow?.document;
    if (!iframeDoc) return;

    iframeDoc.write(`
      <html>
        <head>
          <title>Approved Boarding Pass</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
            .text-sm { font-size: 0.875rem; }
            .opacity-70 { opacity: 0.7; }
            .font-semibold { font-weight: 600; }
            .mb-4 { margin-bottom: 1rem; }
            .approved-stamp {
              position: absolute;
              top: 50%;
              left: 50%;
              transform: translate(-50%, -50%) rotate(-15deg);
              font-size: 4rem;
              color: #10B981;
              opacity: 0.5;
              pointer-events: none;
              border: 0.5rem double #10B981;
              padding: 1rem;
              border-radius: 0.5rem;
            }
            @media print {
              body { padding: 0; }
              button { display: none !important; }
            }
          </style>
        </head>
        <body>${printContent}</body>
      </html>
    `);

    iframeDoc.close();
    iframe.contentWindow?.focus();
    iframe.contentWindow?.print();
    document.body.removeChild(iframe);
  };

  const handleVerification = (index: number, isValid: boolean) => {
    if (isValid) {
      setVerifiedPassengers(prev => [...prev, index]);
      if (!verifiedPassengers.includes(index)) {
        const allVerified = [...verifiedPassengers, index].length === bookingData.passengers.length;
        updateApproval(allVerified);
      }
      setIsVerifying(null);
    } else {
      console.log('Face verification failed. Please try again.');
    }
  };

  const renderApprovedPass = (index: number) => {
    const passenger = bookingData.passengers[index];
    const seat = bookingData.selectedSeats[index];
    const flight = bookingData.flight;
    const isVerified = verifiedPassengers.includes(index);

    if (!passenger || !flight) return null;

    return (
      <div key={index} className="mb-8">
        {isVerifying === index ? (
          <div className="card bg-base-100 shadow-xl mb-4">
            <div className="card-body">
              <h3 className="text-lg font-semibold mb-4">
                Verify {passenger.firstName} {passenger.lastName}
              </h3>
              <FaceValidation
                savedImageUrls={(passenger as any).faceImages || []}
                onValidationComplete={(isValid) => handleVerification(index, isValid)}
                buttonText="Verify Identity"
                threshold={0.6}
              />
              <button
                className="btn btn-outline mt-4"
                onClick={() => setIsVerifying(null)}
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <div className="card bg-base-100 shadow-xl">
            <div className="card-body relative" id={`approved-pass-${index}`}>
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
              {isVerified && (
                <div className="approved-stamp">APPROVED</div>
              )}
            </div>
          </div>
        )}
        
        {!isVerified && (
          <div className="text-center mt-4">
            <button
              className="btn btn-primary"
              onClick={() => setIsVerifying(index)}
              disabled={!((passenger as any).faceImages && (passenger as any).faceImages.length > 0)}
            >
              {(passenger as any).faceImages && (passenger as any).faceImages.length > 0 
                ? "Verify Identity" 
                : "No Reference Images"}
            </button>
          </div>
        )}
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
      <h2 className="text-2xl font-bold mb-6">Identity Verification</h2>
      <div className="alert alert-info mb-8">
        <p>Please verify each passenger's identity using face recognition to receive approved boarding passes.</p>
      </div>
      {bookingData.passengers.map((_, index) => renderApprovedPass(index))}
    </div>
  );
};

export default Onboarding;