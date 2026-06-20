import { Routes, Route } from "react-router-dom";
import Receptionist from "./Receptionist";
import PatientView from "./PatientView";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Receptionist />} />
      <Route path="/patient" element={<PatientView />} />
    </Routes>
  );
}

export default App;