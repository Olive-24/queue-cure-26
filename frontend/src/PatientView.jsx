import { useEffect, useState } from "react";
import socket from "./socket";

function PatientView() {
  const [queue, setQueue] = useState([]);
  const [currentToken, setCurrentToken] = useState(null);
  const [avgConsultTime, setAvgConsultTime] = useState(5);

  useEffect(() => {
    socket.on("queue-updated", (data) => {
      setQueue(data.queue);
      setCurrentToken(data.currentToken);
      setAvgConsultTime(data.avgConsultTime);
    });

    return () => {
      socket.off("queue-updated");
    };
  }, []);

  // Real wait time calculation — queue length × average consultation time
  const estimatedWait = queue.length * avgConsultTime;

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <div style={styles.header}>
          <h1 style={styles.title}>🏥 Patient Waiting Room</h1>
          <p style={styles.subtitle}>Queue Cure '26</p>
        </div>

        <div style={styles.nowServingCard}>
          <p style={styles.nowServingLabel}>Now Serving</p>
          {currentToken ? (
            <p style={styles.tokenDisplay}>#{currentToken.tokenNumber}</p>
          ) : (
            <p style={styles.emptyTokenDisplay}>—</p>
          )}
          {currentToken && <p style={styles.currentName}>{currentToken.name}</p>}
        </div>

        <div style={styles.statsGrid}>
          <div style={styles.statCard}>
            <p style={styles.statNumber}>{queue.length}</p>
            <p style={styles.statLabel}>Tokens Ahead</p>
          </div>
          <div style={styles.statCard}>
            <p style={styles.statNumber}>{estimatedWait}</p>
            <p style={styles.statLabel}>Est. Wait (mins)</p>
          </div>
        </div>

        <div style={styles.card}>
          <h3 style={styles.cardTitle}>Upcoming Queue</h3>
          {queue.length === 0 ? (
            <p style={styles.emptyText}>No one is waiting right now</p>
          ) : (
            <ul style={styles.list}>
              {queue.map((p, index) => (
                <li key={p.id} style={styles.listItem}>
                  <span style={styles.tokenBadge}>#{p.tokenNumber}</span>
                  <span style={styles.patientName}>{p.name}</span>
                  {index === 0 && <span style={styles.nextTag}>Up Next</span>}
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
    background: "linear-gradient(135deg, #fff7ed 0%, #ffedd5 100%)",
    fontFamily: "'Segoe UI', Arial, sans-serif",
    padding: "2rem 1rem",
  },
  container: {
    maxWidth: "500px",
    margin: "0 auto",
  },
  header: {
    textAlign: "center",
    marginBottom: "1.5rem",
  },
  title: {
    fontSize: "1.8rem",
    color: "#9a3412",
    margin: 0,
  },
  subtitle: {
    color: "#a16207",
    marginTop: "4px",
  },
  nowServingCard: {
    background: "white",
    borderRadius: "16px",
    padding: "2rem",
    textAlign: "center",
    boxShadow: "0 4px 16px rgba(0,0,0,0.08)",
    marginBottom: "1.25rem",
  },
  nowServingLabel: {
    color: "#94a3b8",
    fontSize: "0.85rem",
    textTransform: "uppercase",
    letterSpacing: "1px",
    margin: "0 0 8px 0",
  },
  tokenDisplay: {
    fontSize: "4rem",
    fontWeight: 800,
    color: "#ea580c",
    margin: 0,
    lineHeight: 1,
  },
  emptyTokenDisplay: {
    fontSize: "4rem",
    fontWeight: 800,
    color: "#cbd5e1",
    margin: 0,
  },
  currentName: {
    fontSize: "1.1rem",
    color: "#1e293b",
    marginTop: "8px",
    fontWeight: 600,
  },
  statsGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "1rem",
    marginBottom: "1.25rem",
  },
  statCard: {
    background: "white",
    borderRadius: "12px",
    padding: "1.25rem",
    textAlign: "center",
    boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
  },
  statNumber: {
    fontSize: "2rem",
    fontWeight: 700,
    color: "#ea580c",
    margin: 0,
  },
  statLabel: {
    color: "#64748b",
    fontSize: "0.85rem",
    margin: "6px 0 0 0",
  },
  card: {
    background: "white",
    borderRadius: "12px",
    padding: "1.25rem",
    boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
  },
  cardTitle: {
    margin: "0 0 12px 0",
    color: "#1e293b",
    fontSize: "1.05rem",
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
    background: "#fed7aa",
    color: "#9a3412",
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
    background: "#dcfce7",
    color: "#166534",
    padding: "2px 8px",
    borderRadius: "6px",
    fontSize: "0.75rem",
    fontWeight: 600,
  },
};

export default PatientView;