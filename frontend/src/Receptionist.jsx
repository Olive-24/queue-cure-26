import { useEffect, useState } from "react";
import socket from "./socket";

function Receptionist() {
  const [queue, setQueue] = useState([]);
  const [currentToken, setCurrentToken] = useState(null);
  const [avgConsultTime, setAvgConsultTime] = useState(5);
  const [patientName, setPatientName] = useState("");

  useEffect(() => {
    socket.on("queue-updated", (data) => {
      setQueue(data.queue);
      setCurrentToken(data.currentToken);
      setAvgConsultTime(data.avgConsultTime);
    });

    socket.on("error-message", (msg) => {
      alert(msg);
    });

    return () => {
      socket.off("queue-updated");
      socket.off("error-message");
    };
  }, []);

  const handleAddPatient = () => {
    if (!patientName.trim()) return;
    socket.emit("add-patient", { name: patientName });
    setPatientName("");
  };

  const handleCallNext = () => {
    socket.emit("call-next");
  };

  const handleMarkDone = () => {
    socket.emit("mark-done");
  };

  const handleSetAvgTime = (e) => {
    const minutes = Number(e.target.value);
    setAvgConsultTime(minutes);
    socket.emit("set-avg-time", minutes);
  };

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <div style={styles.header}>
          <h1 style={styles.title}>🩺 Receptionist Dashboard</h1>
          <p style={styles.subtitle}>Queue Cure '26 — Live Clinic Queue Management</p>
        </div>

        <div style={styles.card}>
          <h3 style={styles.cardTitle}>Add New Patient</h3>
          <div style={styles.row}>
            <input
              type="text"
              placeholder="Enter patient name"
              value={patientName}
              onChange={(e) => setPatientName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAddPatient()}
              style={styles.input}
            />
            <button onClick={handleAddPatient} style={styles.primaryBtn}>
              + Add Patient
            </button>
          </div>
        </div>

        <div style={styles.card}>
          <h3 style={styles.cardTitle}>Average Consultation Time</h3>
          <div style={styles.row}>
            <input
              type="number"
              min="1"
              value={avgConsultTime}
              onChange={handleSetAvgTime}
              style={styles.numberInput}
            />
            <span style={styles.minutesLabel}>minutes per patient</span>
          </div>
        </div>

        <button onClick={handleCallNext} style={styles.callNextBtn}>
          📢 Call Next Patient
        </button>

        <div style={styles.statusGrid}>
          <div style={styles.statusCard}>
            <p style={styles.statusLabel}>Currently Consulting</p>
            {currentToken ? (
              <>
                <p style={styles.currentTokenText}>
                  Token #{currentToken.tokenNumber} — {currentToken.name}
                </p>
                <button onClick={handleMarkDone} style={styles.doneBtn}>
                  ✓ Mark Done
                </button>
              </>
            ) : (
              <p style={styles.emptyText}>No patient currently</p>
            )}
          </div>

          <div style={styles.statusCard}>
            <p style={styles.statusLabel}>Patients Waiting</p>
            <p style={styles.queueCount}>{queue.length}</p>
          </div>
        </div>

        <div style={styles.card}>
          <h3 style={styles.cardTitle}>Waiting Queue</h3>
          {queue.length === 0 ? (
            <p style={styles.emptyText}>No patients in queue</p>
          ) : (
            <ul style={styles.list}>
              {queue.map((p, index) => (
                <li key={p.id} style={styles.listItem}>
                  <span style={styles.tokenBadge}>#{p.tokenNumber}</span>
                  <span style={styles.patientName}>{p.name}</span>
                  {index === 0 && <span style={styles.nextTag}>Next</span>}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    background: "linear-gradient(135deg, #f0f4ff 0%, #e6f0ff 100%)",
    fontFamily: "'Segoe UI', Arial, sans-serif",
    padding: "2rem 1rem",
  },
  container: {
    maxWidth: "600px",
    margin: "0 auto",
  },
  header: {
    textAlign: "center",
    marginBottom: "2rem",
  },
  title: {
    fontSize: "2rem",
    color: "#1e3a8a",
    margin: 0,
  },
  subtitle: {
    color: "#64748b",
    marginTop: "4px",
  },
  card: {
    background: "white",
    borderRadius: "12px",
    padding: "1.25rem",
    marginBottom: "1.25rem",
    boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
  },
  cardTitle: {
    margin: "0 0 12px 0",
    color: "#1e293b",
    fontSize: "1.05rem",
  },
  row: {
    display: "flex",
    gap: "10px",
  },
  input: {
    flex: 1,
    padding: "10px 14px",
    borderRadius: "8px",
    border: "1px solid #cbd5e1",
    fontSize: "1rem",
    outline: "none",
  },
  numberInput: {
    width: "70px",
    padding: "10px",
    borderRadius: "8px",
    border: "1px solid #cbd5e1",
    fontSize: "1rem",
  },
  minutesLabel: {
    alignSelf: "center",
    color: "#64748b",
  },
  primaryBtn: {
    padding: "10px 18px",
    background: "#2563eb",
    color: "white",
    border: "none",
    borderRadius: "8px",
    fontSize: "1rem",
    cursor: "pointer",
    fontWeight: 600,
  },
  callNextBtn: {
    width: "100%",
    padding: "16px",
    background: "linear-gradient(135deg, #16a34a, #15803d)",
    color: "white",
    border: "none",
    borderRadius: "12px",
    fontSize: "1.2rem",
    fontWeight: 700,
    cursor: "pointer",
    marginBottom: "1.25rem",
    boxShadow: "0 4px 12px rgba(22,163,74,0.3)",
  },
  statusGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "1rem",
    marginBottom: "1.25rem",
  },
  statusCard: {
    background: "white",
    borderRadius: "12px",
    padding: "1.25rem",
    textAlign: "center",
    boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
  },
  statusLabel: {
    color: "#64748b",
    fontSize: "0.85rem",
    margin: "0 0 8px 0",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
  },
  currentTokenText: {
    fontSize: "1.1rem",
    fontWeight: 600,
    color: "#1e3a8a",
    margin: 0,
  },
  doneBtn: {
    marginTop: "8px",
    padding: "6px 14px",
    background: "#16a34a",
    color: "white",
    border: "none",
    borderRadius: "6px",
    fontSize: "0.85rem",
    cursor: "pointer",
    fontWeight: 600,
  },
  queueCount: {
    fontSize: "2rem",
    fontWeight: 700,
    color: "#2563eb",
    margin: 0,
  },
  emptyText: {
    color: "#94a3b8",
    fontStyle: "italic",
    margin: 0,
  },
  list: {
    listStyle: "none",
    padding: 0,
    margin: 0,
  },
  listItem: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    padding: "10px 0",
    borderBottom: "1px solid #f1f5f9",
  },
  tokenBadge: {
    background: "#dbeafe",
    color: "#1e3a8a",
    padding: "4px 10px",
    borderRadius: "6px",
    fontWeight: 700,
    fontSize: "0.9rem",
  },
  patientName: {
    flex: 1,
    color: "#1e293b",
  },
  nextTag: {
    background: "#fef3c7",
    color: "#92400e",
    padding: "2px 8px",
    borderRadius: "6px",
    fontSize: "0.75rem",
    fontWeight: 600,
  },
};

export default Receptionist;