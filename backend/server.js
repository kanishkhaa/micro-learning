require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");

connectDB();

const app = express();

app.use(cors());
app.use(express.json());

// Routes
app.use("/api/topics", require("./routes/topicRoutes"));
app.use("/api/flashcards", require("./routes/flashRoutes"));
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/bites", require("./routes/biteRoutes"));
app.use("/api/progress", require("./routes/progressRoutes"));
app.use("/api/favorites", require("./routes/favoriteRoutes"));
app.get("/", (req, res) => {
  res.send("Backend Running");
});
const PORT = process.env.PORT || 5000;

app.listen(process.env.PORT, () =>
  console.log(`Server running at http://localhost:${PORT}`)
);
