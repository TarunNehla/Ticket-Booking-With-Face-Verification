import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import SearchFlights from './pages/SearchFlights';
import PassengerDetails from './pages/PassengerDetails';
import SeatSelection from './pages/SeatSelection';
import BoardingPass from './pages/BoardingPass';
import Onboarding from './pages/Onboarding';
import { BookingProvider } from './context/BookingContext';

function App() {
  return (
    <BookingProvider>
      <BrowserRouter>
        <div className="drawer lg:drawer-open">
          <input id="my-drawer" type="checkbox" className="drawer-toggle" />
          <div className="drawer-content">
            <div className="flex flex-col min-h-screen">
              <label htmlFor="my-drawer" className="btn btn-primary drawer-button lg:hidden m-4">
                Open Menu
              </label>
              <main className="flex-1 p-4">
                <Routes>
                  <Route path="/" element={<SearchFlights />} />
                  <Route path="/passenger-details" element={<PassengerDetails />} />
                  <Route path="/seat-selection" element={<SeatSelection />} />
                  <Route path="/boarding-pass" element={<BoardingPass />} />
                  <Route path="/onboarding" element={<Onboarding />} />
                </Routes>
              </main>
            </div>
          </div>
          <Navbar />
        </div>
      </BrowserRouter>
    </BookingProvider>
  );
}

export default App;