TigerTix — Event Ticketing System

TigerTix is a microservices-based campus ticketing system where users can register, log in, browse events, and purchase tickets. Admins can create events, and the system automatically generates tickets. A separate LLM service allows ticket booking using natural-language text or optional speech. The project includes a React frontend and several Node.js services deployed individually.

Links For Live Site:
Frontend (Vercel): add link
Admin Service: https://tigertix-backend-admin-service.onrender.com
Client Service: add link
Auth Service: add link
LLM Booking Service: add link
GitHub Repo: https://github.com/CPSC3720-Emma-Jen-Ash/CPSC3720tigerTix

Demo Video

link INSERT
The demo shows login/registration, viewing events, confirming a booking through the LLM, voice input, and the deployed site running live.

Project Overview

TigerTix simulates a simple campus event-ticketing platform. The system lets users manage accounts, view available events, and purchase tickets. 
Admins can create new events through an admin microservice. All microservices share the same SQLite database so data stays consistent across the system. 
The LLM service handles natural-language booking requests and interprets them into actual ticket purchases.

Tech Stack

Frontend: React (Vite)
Backend: Node.js, Express
Database: SQLite
Authentication: JWT
AI Integration: OpenAI API
Hosting: Render (backend), Vercel (frontend)
Testing: Jest + Supertest

Architecture Summary

The system is split into four backend services plus a frontend.
	•	Admin Service (port 5001): creates events and tickets.
	•	Client Service (port 6001): retrieves events and handles ticket purchases.
	•	Auth Service (port 4001): handles user login and registration using JWT.
	•	LLM Booking Service (port 7001): processes natural-language booking requests.
	•	Frontend (port 3000): user interface for browsing and booking events.

All services communicate over HTTP and read/write the same SQLite database file stored in a shared directory. On Render, the DB file lives inside the persistent disk location /opt/render/project/data/TigerTix/database.sqlite.

Installation & Local Setup

Clone the repo:
```
git clone https://github.com/CPSC3720-Emma-Jen-Ash/CPSC3720tigerTix
cd CPSC3720tigerTix
npm install
```
Start all services at once:
```
npm run start:all
```
Running Regression Tests

From the repo root:
```
npm test
```
Team Members
Astraeus Newell
Emma Kropf
Jennifer Johnson
