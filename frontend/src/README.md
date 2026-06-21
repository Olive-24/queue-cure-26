# Queue Cure '26 🩺

A real-time clinic queue management system built for the Wooble Hackathon. Replaces paper token slips and manual shouting with a live, synced digital queue between the receptionist and patients.

## Problem

76% of India's clinics still run on paper token slips. Patients wait 2-3 hours with zero visibility into their position in queue. Doctors have no dashboard, and receptionists track everything from memory.

## Solution

Two connected real-time screens:
- **Receptionist Dashboard** — add patients, call the next token, set average consultation time, mark consultations done
- **Patient Waiting Room** — see who's currently being served, how many tokens are ahead, and a live-calculated estimated wait time

Both screens update **instantly** via WebSockets the moment the receptionist takes any action — no refresh needed.

## Tech Stack

- **Frontend:** React (Vite), React Router
- **Backend:** Node.js, Express
- **Real-time sync:** Socket.io
- **State:** In-memory (no database — kept simple for a hackathon MVP)

## Features

- ✅ Live queue sync across both screens, no refresh
- ✅ Wait time calculated from real data (`queue length × avg consultation time`), not hardcoded
- ✅ Add patient with input validation (rejects empty/whitespace names)
- ✅ Call Next with race-condition protection (prevents double-pop on rapid clicks)
- ✅ Mark consultation as done
- ✅ Editable average consultation time, reflected live on patient screen

## How It Works

1. Receptionist adds a patient → gets a token number
2. Receptionist clicks "Call Next" → that patient becomes the current token, server broadcasts the update
3. Patient Waiting Room screen (open on any device) receives the broadcast instantly and updates "Now Serving," "Tokens Ahead," and "Estimated Wait Time"
4. Receptionist marks the consultation "Done" → slot clears, ready for the next call

## Project Structure
queue-cure-26/

├── backend/

│   └── server.js        # Express + Socket.io server, queue logic

└── frontend/

└── src/

├── App.jsx           # Route definitions 

├── Receptionist.jsx  # Receptionist dashboard screen

├── PatientView.jsx   # Patient waiting room screen

└── socket.js         # Socket.io client connection

## Running Locally

**Backend:**
```bash
cd backend
npm install
node server.js
```
Runs on `http://localhost:5000`

**Frontend:**
```bash
cd frontend
npm install
npm run dev
```
Runs on `http://localhost:5173`

- Receptionist screen: `http://localhost:5173/`
- Patient screen: `http://localhost:5173/patient`

## Edge Cases Handled

- Empty/whitespace-only patient names are rejected with an error message
- "Call Next" on an empty queue shows an error instead of crashing
- Rapid double-clicking "Call Next" is debounced so only one patient is pulled, not two
- Each new client connecting (e.g. a fresh patient screen tab) immediately receives the current queue state, not just future updates

## Future Improvements

- Persistent database (currently in-memory, resets on server restart)
- Receptionist authentication
- Multiple doctor/counter support
- SMS/notification when a patient's token is close

## Author

Built by Olive for Queue Cure '26 (Wooble Hackathon).