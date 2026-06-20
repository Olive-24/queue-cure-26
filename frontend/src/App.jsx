import { useEffect, useState } from "react";
import socket from "./socket";
import "./App.css";

function App() {
  const [queue, setQueue] = useState([]);
  const [currentToken, setCurrentToken] = useState(null);
  const [avgConsultTime, setAvgConsultTime] = useState(5);
  const [patientName, setPatientName] = useState("");

  useEffect(() => {
    // Server se naya data aane par state update karo
    socket.on("queue-updated", (data) => {
      setQueue(data.queue);
      setCurrentToken(data.currentToken);
      setAvgConsultTime(data.avgConsultTime);
    });

    socket.on("error-message", (msg) => {
      alert(msg);
    });

    // cleanup — component unmount hone par listener hata do
    return () => {
      socket.off("queue-updated");
      socket.off("error-message");
    };
  }, []);

  const handleAddPatient = () => {
    if (!patientName.trim()) return;
    socket.emit("add-patient", { name: patientName });
    setPatientName(""); // input box clear kar do
  };

  const handleCallNext = () => {
    socket.emit("call-next");
  };

  const handleSetAvgTime = (e) => {
    const minutes = Number(e.target.value);
    setAvgConsultTime(minutes);
    socket.emit("set-avg-time", minutes);
  };

  return (
    <div style={{ padding: "2rem", fontFamily: "Arial" }}>
      <h1>Receptionist Dashboard — Queue Cure '26</h1>

      <div style={{ marginBottom: "1.5rem" }}>
        <input
          type="text"
          placeholder="Patient ka naam likho"
          value={patientName}
          onChange={(e) => setPatientName(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleAddPatient()}
          style={{ padding: "8px", marginRight: "8px", width: "250px" }}
        />
        <button onClick={handleAddPatient} style={{ padding: "8px 16px" }}>
          Add Patient
        </button>
      </div>

      <div style={{ marginBottom: "1.5rem" }}>
        <button
          onClick={handleCallNext}
          style={{ padding: "10px 20px", background: "#2563eb", color: "white", border: "none", borderRadius: "4px" }}
        >
          Call Next
        </button>
      </div>

      <div style={{ marginBottom: "1.5rem" }}>
        <label>Average Consultation Time (minutes): </label>
        <input
          type="number"
          value={avgConsultTime}
          onChange={handleSetAvgTime}
          style={{ padding: "6px", width: "60px" }}
        />
      </div>

      <div style={{ marginBottom: "1rem" }}>
        <h3>Currently Consulting:</h3>
        {currentToken ? (
          <p>Token #{currentToken.tokenNumber} — {currentToken.name}</p>
        ) : (
          <p>No patient currently</p>
        )}
      </div>

      <div>
        <h3>Waiting Queue ({queue.length}):</h3>
        <ul>
          {queue.map((p) => (
            <li key={p.id}>Token #{p.tokenNumber} — {p.name}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default App;