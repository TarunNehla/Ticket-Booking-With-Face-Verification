import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useBooking } from '../context/BookingContext';
import { Passenger } from '../types';
import FaceCapture from '../components/FaceCapture';

const PassengerDetails = () => {
  const navigate = useNavigate();
  const { bookingData, updatePassengers } = useBooking();
  const [passengers, setPassengers] = React.useState<(Passenger & { faceImages?: string[] })[]>(
    bookingData.passengers.length ? bookingData.passengers : [
      { firstName: '', lastName: '', email: '' },
      { firstName: '', lastName: '', email: '' }
    ]
  );

  const handleChange = (index: number, field: keyof Passenger, value: string) => {
    const newPassengers = [...passengers];
    newPassengers[index] = { ...newPassengers[index], [field]: value };
    setPassengers(newPassengers);
  };

  const handleFaceCapture = (index: number, imageUrls: string[]) => {
    const newPassengers = [...passengers];
    newPassengers[index] = { ...newPassengers[index], faceImages: imageUrls };
    setPassengers(newPassengers);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
   
    // Check if all passengers have face images
    const allHaveFaces = passengers.every(p => p.faceImages && p.faceImages.length > 0);
    if (!allHaveFaces) {
      alert('Please capture faces for all passengers');
      return;
    }
    updatePassengers(passengers);
    navigate('/seat-selection');
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="card bg-base-100 shadow-xl">
        <div className="card-body">
          <h2 className="card-title mb-6">Passenger Details</h2>
          <form onSubmit={handleSubmit}>
            {passengers.map((passenger, index) => (
              <div key={index} className="mb-8">
                <h3 className="text-lg font-semibold mb-4">Passenger {index + 1}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input
                    type="text"
                    placeholder="First Name"
                    className="input input-bordered w-full"
                    value={passenger.firstName}
                    onChange={(e) => handleChange(index, 'firstName', e.target.value)}
                    required
                  />
                  <input
                    type="text"
                    placeholder="Last Name"
                    className="input input-bordered w-full"
                    value={passenger.lastName}
                    onChange={(e) => handleChange(index, 'lastName', e.target.value)}
                    required
                  />
                  <input
                    type="email"
                    placeholder="Email Address"
                    className="input input-bordered w-full md:col-span-2"
                    value={passenger.email}
                    onChange={(e) => handleChange(index, 'email', e.target.value)}
                    required
                  />
                  <div className="md:col-span-2">
                    <FaceCapture
                      onCapture={(images) => handleFaceCapture(index, images)}
                      buttonText={passenger.faceImages && passenger.faceImages.length > 0 ? "Retake Face Photos" : "Take Face Photos"}
                      maxImages={3}
                    />
                    {passenger.faceImages && passenger.faceImages.length > 0 && (
                      <div className="text-center text-sm text-green-600 mt-2">
                        ✓ {passenger.faceImages.length} photo{passenger.faceImages.length > 1 ? 's' : ''} captured successfully
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
            <div className="card-actions justify-end">
              <button type="submit" className="btn btn-primary">
                Continue to Seat Selection
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default PassengerDetails;