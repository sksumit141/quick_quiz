const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const http = require("http");
const connectDB = require("./config/database");
const { errorHandler } = require("./middleware/errorMiddleware"); // Added Error Middleware
const { initSocket } = require("./socket/index");
const path = require("path"); // Added path module

const quizRoutes = require("./routes/quizRoutes");
const userRoutes = require("./routes/userRoutes"); // Added userRoutes import
const sessionRoutes = require("./routes/sessionRoutes");
const studentRoutes = require("./routes/studentRoutes");
const pdfRoutes = require("./routes/pdfRoutes"); // Added PDF Route
const cookieParser = require("cookie-parser");

dotenv.config();

connectDB();

const app = express();
const server = http.createServer(app);

initSocket(server);

app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true,
  }),
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use("/api/quizzes", quizRoutes);
app.use("/api/users", userRoutes);
app.use("/api/sessions", sessionRoutes);
app.use("/api/students", studentRoutes);
app.use("/api/pdf", pdfRoutes); // Register PDF Routes

app.get("/api/health", (req, res) => {
  res.json({ status: "OK", timestamp: new Date().toISOString() });
});

// Serve frontend
// app.use(express.static(path.join(__dirname, "../frontend/dist")));
// app.get(/(.*)/, (req, res) =>
//   res.sendFile(path.resolve(__dirname, "../frontend", "dist", "index.html")),
// );

app.use(errorHandler);

const PORT = process.env.PORT || 8080;
server.listen(PORT, () => {
  console.log(
    `Server running on port ${PORT} in ${process.env.NODE_ENV || "development"} mode`,
  );
});

process.on("SIGTERM", () => {
  console.log("SIGTERM received. Shutting down gracefully...");
  server.close(() => {
    console.log("Server closed");
    process.exit(0);
  });
});
