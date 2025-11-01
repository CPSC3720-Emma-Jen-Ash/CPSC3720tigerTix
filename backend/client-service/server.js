/**
 * @file server.js (Client Service)
 * @description Handles viewing events and buying tickets
 */
import express from "express";
import cors from "cors";
import clientRoutes from "./routes/clientRoutes.js";

// Create Express app and define PORT 6001
const app = express();
const PORT = 6001;

// cors is needed to allow cross-origin requests
app.use(cors());
app.use(express.json());
app.use("/api", clientRoutes);

if (process.env.NODE_ENV !== "test") {
  app.listen(PORT, () => {
    console.log(`Client Service running on http://localhost:${PORT}`);
  });
}

export default app;