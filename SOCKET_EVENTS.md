# Socket Event Diagram — Queue Cure '26

## Event Flow

```mermaid
sequenceDiagram
    participant R as Receptionist Screen
    participant S as Server (Socket.io)
    participant P as Patient Screen

    Note over R,P: On page load (any screen)
    R->>S: connection
    S->>R: queue-updated (initial state)
    P->>S: connection
    S->>P: queue-updated (initial state)

    Note over R,S: Receptionist adds a patient
    R->>S: add-patient { name }
    alt name is empty/whitespace
        S->>R: error-message
    else valid name
        S->>S: increment tokenCounter, push to queue
        S->>R: queue-updated (broadcast)
        S->>P: queue-updated (broadcast)
    end

    Note over R,S: Receptionist calls next token
    R->>S: call-next
    alt queue is empty
        S->>R: error-message
    else queue has patients
        S->>S: shift queue → currentToken (lock applied)
        S->>R: queue-updated (broadcast)
        S->>P: queue-updated (broadcast)
    end

    Note over R,S: Receptionist marks consultation done
    R->>S: mark-done
    S->>S: currentToken = null
    S->>R: queue-updated (broadcast)
    S->>P: queue-updated (broadcast)

    Note over R,S: Receptionist updates avg consult time
    R->>S: set-avg-time (minutes)
    S->>S: update avgConsultTime
    S->>R: queue-updated (broadcast)
    S->>P: queue-updated (broadcast)
```

## Event Reference

| Event Name | Direction | Payload | Triggered By | Effect |
|---|---|---|---|---|
| `connection` | Client → Server | — | Any screen loading | Server sends current state immediately |
| `queue-updated` | Server → All Clients | `{ queue, currentToken, avgConsultTime }` | Any state change | Both screens re-render with fresh data |
| `add-patient` | Client → Server | `{ name }` | Receptionist clicks "Add Patient" | New token created, pushed to queue |
| `call-next` | Client → Server | — | Receptionist clicks "Call Next" | First patient in queue becomes currentToken |
| `mark-done` | Client → Server | — | Receptionist clicks "Mark Done" | currentToken cleared |
| `set-avg-time` | Client → Server | `minutes` (number) | Receptionist edits time input | avgConsultTime updated, wait times recalculate |
| `error-message` | Server → Client | `string` | Invalid action (empty name, empty queue) | Client shows alert |
| `disconnect` | Client → Server | — | Tab closed / refresh | Server logs disconnection |

## Why Broadcast (`io.emit`) Instead of Targeted (`socket.emit`)?

Every state-changing event uses `io.emit()` so **all connected clients** — the receptionist's own screen and every open patient screen — receive the update simultaneously. This is what makes the "live sync without refresh" requirement work: there's a single source of truth (the server's in-memory queue), and every screen is just a live mirror of it.