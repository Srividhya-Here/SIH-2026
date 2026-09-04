const express = require("express");
const cors = require("cors");
const prisma = require("./lib/db");

const authRoutes = require("./routes/auth");
const patientRoutes = require("./routes/patient");
const gameRoutes = require("./routes/game");
const historyRoutes = require("./routes/history");
const analyticsRoutes = require("./routes/analytics");
const reminderRoutes = require("./routes/reminder");
const caregiverRoutes = require("./routes/caregiver");
const syncRoutes = require("./routes/sync");
const aiRoutes = require("./routes/ai");

const authenticateToken = require("./middleware/auth");

const app = express();

app.use(cors());
app.use(express.json());

// ==================== PUBLIC ROUTES ====================

app.get("/", (req, res) => {
  res.json({
    message: "NER Care Backend is running",
  });
});

// ==================== AUTHENTICATION ====================

app.use("/api/auth", authRoutes);

// ==================== TEST DATABASE ====================

app.get("/api/test-db", async (req, res) => {
  try {
    const userCount = await prisma.user.count();

    res.json({
      message: "Database connection successful",
      userCount: userCount,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Database connection failed",
    });
  }
});

// ==================== TEST PROTECTED ROUTE ====================

app.get("/api/protected", authenticateToken, (req, res) => {
  res.json({
    message: "You accessed a protected route",
    user: req.user,
  });
});

// ==================== PATIENT ROUTES ====================

app.use("/api/patients", patientRoutes);

// ==================== GAME ROUTES ====================

app.use("/api/games", gameRoutes);

// ==================== HISTORY ROUTES ====================

app.use("/api/history", historyRoutes);

// ==================== ANALYTICS ROUTES ====================

app.use("/api/analytics", analyticsRoutes);

// ==================== REMINDER ROUTES ====================

app.use("/api/reminders", reminderRoutes);

// ==================== CAREGIVER ROUTES ====================

app.use("/api/caregivers", caregiverRoutes);

// ==================== OFFLINE SYNC ROUTES ====================

app.use("/api/sync", syncRoutes);

// ==================== AI ROUTES ====================

app.use("/api/ai", aiRoutes);

// ==================== START SERVER ====================

const PORT = 5000;

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});