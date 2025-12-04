# TigerTix : Event Ticketing System

TigerTix is a microservices-based campus ticketing system where users can register, log in, browse events, and purchase tickets.<br>
Admins can create events, and the system automatically generates tickets.<br>
It also contains an LLM microservice supports natural language and optional voice based booking.<br>

---

## Links For Live Site

Frontend (Vercel): *https://tigertix-frontend.vercel.app/* <br>
Admin Service: *https://tigertix-backend-admin-service.onrender.com* <br>
Client Service: *https://tigertix-backend-client-service.onrender.com* <br>
Auth Service: *https://tigertix-backend-user-auth-service.onrender.com* <br>
LLM Booking Service: *https://tigertix-backend-llm-service.onrender.com* <br>
GitHub Repo: https://github.com/CPSC3720-Emma-Jen-Ash/CPSC3720tigerTix <br>

---

## Demo Video

*Insert unlisted YouTube or Google Drive link here.*<br><br>

The demo includes:<br>
• Login and registration flow<br>
• Browsing available events<br>
• Completing a ticket purchase using the LLM<br>
• Voice interaction demo<br>
• Running deployment shown live<br>

---

## Project Overview

TigerTix provides a simple, campus-oriented ticketing system.<br>
Users can register, view events, and purchase tickets through the client service.<br>
Admins can create events through their own microservice, which generates the ticket inventory automatically.<br>
All services share the same SQLite database file to ensure consistent data across the system.<br>

---

## Tech Stack

**Frontend:** React (Vite) <br>
**Backend:** Node.js, Express <br>
**Database:** SQLite <br>
**Authentication:** JWT-based authentication using HttpOnly cookies (jsonwebtoken, bcrypt password hashing) <br>
**AI Integration:** custom rule-based intent parser (no external AI API) <br>
**Hosting:** Render (backend), Vercel (frontend) <br>
**Testing:** Jest + Supertest <br>

---

## Architecture Summary

TigerTix is composed of several microservices:<br><br>

• **Admin Service (5001):** Creates events and generates tickets<br>
• **Client Service (6001):** Retrieves events and handles ticket purchases<br>
• **Auth Service (4001):** Provides registration + login via JWT<br>
• **LLM Booking Service (7001):** Converts natural-language requests into ticket purchases<br>
• **Frontend (3000):** React UI for the entire flow<br><br>

All services use a shared SQLite file located at:<br>

`/opt/render/project/data/TigerTix/database.sqlite`<br>

This keeps reads/writes consistent across all deployed services.<br>

---

## Installation & Local Setup

Clone the repo:<br>

```
git clone https://github.com/CPSC3720-Emma-Jen-Ash/CPSC3720tigerTix
cd CPSC3720tigerTix
npm install
```

Start all backend services and the frontend:<br>

```
npm run start:all
```

This launches:<br>
• Admin Service<br>
• Client Service<br>
• Auth Service<br>
• LLM Booking Service<br>
• React Frontend<br>

---
## Environment Variables

The project uses a small number of environment variables:

### Required
- **JWT_SECRET**  
  Secret key used by the authentication service to sign JSON Web Tokens.  
  In local development, a fallback (`"dev-secret"`) is used automatically, but in production this must be set manually.

### Optional
- **NODE_ENV**  
  Set to `"test"` when running the Jest test suite. Enables the in-memory databases and disables native SQLite usage.
  
- **PORT**  
  Overrides the default port for any microservice. Render sets this automatically during deployment.

### System-provided (no need to set)
- **RENDER** — injected by Render to signal deployment environment  
- **LOCALAPPDATA** — Windows variable used to store the SQLite DB locally
---
## Running Regression Tests

From the repo root:<br>

```
npm test
```

Tests run using an in-memory test DB (no native SQLite bindings required).<br>

---

## Team Members

Astraeus Newell<br>
Emma Kropf<br>
Jennifer Johnson<br>
Instructor:
Dr. Julian Brinkley

---
## License
This project is licensed under the MIT License.  
See the full text here: https://opensource.org/license/mit/
