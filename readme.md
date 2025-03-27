Here's the reformatted README with improved structure, formatting, and consistency:

```markdown
# Flight Ticket Booking with Face Verification

A web application for booking flight tickets with face verification security. Users can search flights, input passenger details, select seats, and verify identity using face recognition before generating boarding passes.

## ✨ Features

- **Flight Search** - Filter flights by source, destination, and date
- **Passenger Management** - Add passenger information with face image capture
- **Interactive Seat Map** - Visual seat selection interface
- **Face Verification** - Identity validation using face recognition
- **Boarding Passes** - Generate printable passes after verification

## 🛠 Tech Stack

**Frontend:**
- React + TypeScript
- TailwindCSS + DaisyUI
- React Router
- Vite

**Face Recognition:**
- [face-api.js](https://github.com/justadudewhohacks/face-api.js)

## 🚀 Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/TarunNehla/Ticket-Booking-With-Face-Verification.git
   cd Ticket-Booking-With-Face-Verification
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up face recognition models:
   - Download pre-trained models from [face-api.js models](https://github.com/justadudewhohacks/face-api.js/tree/master/weights)
   - Place them in `public/models/`

4. Start development server:
   ```bash
   npm run dev
   ```

5. Access the app at:
   ```
   http://localhost:5173
   ```

## 📋 Usage Flow

1. **Search Flights** - Select route and date
2. **Add Passengers** - Enter details + capture face images
3. **Choose Seats** - Select from interactive seat map
4. **Verify Identity** - Complete face verification
5. **Get Boarding Pass** - Generate and print after validation

## 📜 Scripts

| Command        | Description                          |
|----------------|--------------------------------------|
| `npm run dev`  | Start development server             |
| `npm run build`| Create production build              |
| `npm run preview`| Preview production build           |
| `npm run lint` | Run ESLint for code quality checks   |

## 📦 Key Dependencies

- `react`: Frontend library
- `face-api.js`: Face detection/recognition
- `tailwindcss`: Utility CSS framework
- `daisyui`: Tailwind component library
- `react-router`: Client-side routing
- `date-fns`: Date formatting

## 🛠 Development Notes

1. Face recognition models must be placed in `public/models/`
2. Face matching threshold can be adjusted in `FaceValidation` component
3. Ensure proper lighting conditions for optimal face verification


## 🙏 Acknowledgments

- [face-api.js](https://github.com/justadudewhohacks/face-api.js) team
- TailwindCSS and DaisyUI communities
```
