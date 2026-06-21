# Thought Process — Queue Cure '26

## Problem Understanding

Clinics in India largely run on paper token slips — patients have zero visibility into their queue position, and receptionists manually track everything in memory. The core pain point isn't just "no queue system," it's **no shared, real-time source of truth** between the front desk and the people waiting.

This shaped the entire architecture decision: instead of two screens that each have their own state and "guess" what's happening, both screens are just live mirrors of one server-side queue.

## Architecture Decisions

### Why a single server-side queue instead of two independent UIs?
If each screen kept its own state, we'd need polling, manual refresh, or complex reconciliation logic to keep them in sync — and they'd inevitably drift apart (e.g. receptionist calls next, but patient screen doesn't know for 10 seconds). Centralizing state on the server and broadcasting every change via Socket.io (`io.emit`) means there's exactly one truth, and every client is just a subscriber to it.

### Why in-memory storage instead of a database?
For a hackathon MVP, the queue is the entire state — a few arrays and variables. A database would add setup time and a persistence layer the judges' eval criteria doesn't ask for. The tradeoff (state resets on server restart) is documented in the README as a known limitation, not hidden.

### Why Socket.io instead of plain WebSockets or polling?
Socket.io handles reconnection, fallback transports (polling when WebSocket isn't available), and room/broadcast patterns out of the box. For a live-sync requirement under time pressure, this reliability matters more than rolling a custom WebSocket layer.

## Concurrency Considerations

### Race condition: rapid double-clicking "Call Next"
If a receptionist double-clicks (or clicks quickly while the UI hasn't visually updated yet), two `call-next` events could fire before the first `queue-updated` broadcast comes back. Without protection, this could pop two patients off the queue instead of one.

**Solution:** A short-lived lock (`isProcessingCallNext`) rejects any `call-next` event that arrives while one is already being processed, with a 300ms cooldown. This is a simple mutex pattern suitable for a single-server setup.

**Known limitation:** This lock is in-memory and per-server-instance. If this were deployed across multiple server instances (horizontal scaling), the lock wouldn't be shared between them, and a distributed lock (e.g. Redis-based) would be needed. For a single-instance hackathon deployment, this is out of scope but worth naming.

### Multiple receptionist tabs/devices
Since the queue state lives entirely on the server (not in any client's local state), two receptionists on two different devices both see and mutate the same queue. The race-condition lock above protects against simultaneous "Call Next" clicks from different devices, not just the same one.

### New client joining mid-session
A patient opening the waiting-room screen for the first time needs the *current* state, not just future updates. On every socket `connection` event, the server immediately emits `queue-updated` with the current state to that one client (`socket.emit`, not `io.emit`) — so no one ever sees a blank screen waiting for the next action to happen.

## Edge Cases Handled

| Edge Case | Handling |
|---|---|
| Empty or whitespace-only patient name | Rejected server-side (`data.name.trim()` check), error sent back to the requesting client only |
| "Call Next" clicked with an empty queue | Server checks `queue.length === 0` and returns an error instead of crashing or pushing `undefined` |
| Rapid double-click on "Call Next" | Debounced via a 300ms processing lock, so only one patient is dequeued |
| Client refreshes or reconnects | Receives full current state via `connection` event handler — no stale or missing data |
| Wait time with zero patients in queue | `queue.length * avgConsultTime` naturally evaluates to 0 — no special-casing needed, falls out of the math |

## What I'd Add With More Time

- Persist queue state to a database (Redis or PostgreSQL) so a server restart doesn't lose the queue
- Distributed lock for the call-next race condition if scaling beyond one server instance
- Authentication for the receptionist screen (currently anyone with the URL can act as receptionist)
- Audit log of queue actions for accountability (who called which token, when)
- Configurable per-patient consultation time instead of one global average, for more accurate wait estimates

## Why Wait Time Is Computed, Not Hardcoded

`estimatedWait = queue.length * avgConsultTime` is recalculated on every render from two live values: the current queue length and the receptionist-editable average consultation time. Neither value is fixed — adding/removing patients or changing the average time immediately changes the displayed estimate for every patient, in real time, without any manual update step.