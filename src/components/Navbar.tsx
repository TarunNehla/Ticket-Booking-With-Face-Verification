import { NavLink } from 'react-router-dom';
import { Plane, Users, Armchair, Ticket, CheckSquare } from 'lucide-react';

const Navbar = () => {
  return (
    <div className="drawer-side">
      <label htmlFor="my-drawer" className="drawer-overlay"></label>
      <ul className="menu p-4 w-80 min-h-full bg-base-200 text-base-content">
        <li className="mb-8">
          <h1 className="text-2xl font-bold">Flight Booking</h1>
        </li>
        <li>
          <NavLink to="/" className="flex items-center gap-2">
            <Plane size={20} />
            Search Flights
          </NavLink>
        </li>
        <li>
          <NavLink to="/passenger-details" className="flex items-center gap-2">
            <Users size={20} />
            Passenger Details
          </NavLink>
        </li>
        <li>
          <NavLink to="/seat-selection" className="flex items-center gap-2">
            <Armchair size={20} />
            Seat Selection
          </NavLink>
        </li>
        <li>
          <NavLink to="/boarding-pass" className="flex items-center gap-2">
            <Ticket size={20} />
            Boarding Pass
          </NavLink>
        </li>
        <li>
          <NavLink to="/onboarding" className="flex items-center gap-2">
            <CheckSquare size={20} />
            Onboarding
          </NavLink>
        </li>
      </ul>
    </div>
  );
};

export default Navbar;