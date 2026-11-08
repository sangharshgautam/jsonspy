# JSONSpy — Privacy & Security Guarantee

At JSONSpy, security and privacy are fundamental design principles.

---

## 🔒 100% On-Device Local Data Processing

- **Zero Cloud Data Transmission**: All JSON documents, schemas, formatting operations, SmartFix syntax repairs, and JSONata query transformations are executed **100% in-memory on your local machine**.
- **No External Servers**: Your JSON files, schemas, and code models are never transmitted to, stored on, or processed by any external cloud server or remote service.

---

## 🚫 No Telemetry or Tracking

- **Zero Analytics**: JSONSpy does not collect usage telemetry, tracking cookies, or advertising identifiers.
- **Air-Gapped Ready**: You can safely use JSONSpy in offline, restricted, or air-gapped enterprise environments.

---

## 🌐 Local Loopback HTTP Connection

- The IntelliJ plugin runs a local loopback HTTP server (`127.0.0.1`) on an ephemeral port strictly inside your IDE process.
- This connection is isolated to your local machine and used exclusively to render the embedded JCEF workspace UI and perform zero-latency file operations. It does not accept remote network connections.
