/**
 * @file server.js (Client Service)
 * @description Handles viewing events and buying tickets
 */
import express from "express";
import cors from "cors";
import cookieParser from 'cookie-parser';
import clientRoutes from "./routes/clientRoutes.js";

// Create Express app and define PORT 6001
const app = express();
const PORT = 6001;

// cors is needed to allow cross-origin requests and to support credentialed requests
// so that the frontend can include httpOnly auth cookies when calling protected endpoints.
app.use(
  cors({
    origin: 'http://localhost:3000',
    credentials: true,
  })
);
app.use(express.json());
// parse cookies so auth middleware can read httpOnly token cookie
app.use(cookieParser());
app.use("/api", clientRoutes);

if (process.env.NODE_ENV !== "test") {
  app.listen(PORT, () => {
    console.log(`Client Service running on http://localhost:${PORT}`);
  });
}

export default app;