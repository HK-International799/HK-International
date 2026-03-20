import dotenv from "dotenv";
dotenv.config(); // Must be first — loads env vars before anything else imports them

import app from "./app.js";
import connectDB from "./config/db.js";

const PORT = process.env.PORT || 5000;

// Connect to DB then start server
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}).catch((err) => {
  console.error("Failed to connect to DB:", err.message);
  process.exit(1);
});