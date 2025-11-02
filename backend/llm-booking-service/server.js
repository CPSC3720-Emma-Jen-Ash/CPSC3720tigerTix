import express from "express";
import bodyParser from "body-parser";
import chatRoutes from "./routes/chatRoutes.js";

const app = express();
app.use(bodyParser.json());
app.use("/api", chatRoutes);

// Ensure a default port for the LLM booking service
const PORT = process.env.PORT || 7001;

if (process.env.NODE_ENV !== "test") {
  app.listen(PORT, () => {
    console.log(`LLM Booking Service running on http://localhost:${PORT}`);
  });
}

export default app;