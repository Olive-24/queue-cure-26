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
    <div style={{ padding: "2rem", fontFamily: "Arial", textAlign: "center" }}>
      <h1>Patient Waiting Room — Queue Cure '26</h1>

      <div style={{ margin: "2rem 0" }}>
        <h2>Now Serving</h2>
        {currentToken ? (
          <p style={{ fontSize: "3rem", color: "#2563eb", fontWeight: "bold" }}>
            Token #{currentToken.tokenNumber}
          </p>
        ) : (
          <p style={{ fontSize: "1.5rem", color: "gray" }}>No one is being served yet</p>
        )}
      </div>

      <div style={{ margin: "2rem 0" }}>
        <h3>Tokens Ahead of You: {queue.length}</h3>
        <h3>Estimated Wait Time: {estimatedWait} minutes</h3>
      </div>

      <div>
        <h3>Upcoming Queue:</h3>
        <ul style={{ listStyle: "none", padding: 0 }}>
          {queue.map((p) => (
            <li key={p.id} style={{ fontSize: "1.1rem", margin: "4px 0" }}>
              Token #{p.tokenNumber} — {p.name}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default PatientView;