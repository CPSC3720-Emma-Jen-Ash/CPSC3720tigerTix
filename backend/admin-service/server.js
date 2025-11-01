/**
 * @file server.js (Admin Service)
 * @description entry point for Admin Microservice
 * Handles event creation and database initialization.
 */

//dependencies express for server, cors for cross-origin requests
import express from "express";
import cors from "cors";
import adminRoutes from "./routes/adminRoutes.js";
import { initDatabase } from "./setup.js";

const app = express();
const PORT = 5001;

app.use(cors());
app.use(express.json());

// Initialize DB tables if needed
initDatabase();

// Mount routes because all admin routes start with /api/admin 
//ex http://localhost:5001/api/admin/events vs http://localhost:5001/api/events
app.use("/api/admin", adminRoutes);


// Start the server listening on PORT 5001
app.listen(PORT, () => {
  console.log(`Admin Service running on http://localhost:${PORT}`);
});
export default app;