import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import chatRoutes from "./routes/chatRoutes.js";

const app = express();

// allow requests from React frontend (localhost:3000)
app.use(cors());

// parse incoming JSON bodies
app.use(bodyParser.json());

// mount routes
app.use("/api", chatRoutes);

// default port
const PORT = process.env.PORT || 7001;

// start server unless in test mode
if (process.env.NODE_ENV !== "test") {
  app.listen(PORT, () => {
    console.log(`LLM Booking Service running on http://localhost:${PORT}`);
  });
}

export default app;