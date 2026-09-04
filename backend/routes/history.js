const express = require("express");
const prisma = require("../lib/db");
const authenticateToken = require("../middleware/auth");
const checkPatientAccess = require("../middleware/patientAccess");

const router = express.Router();

router.get(
  "/:patientId",
  authenticateToken,
  checkPatientAccess,
  async (req, res) => {
    try {
      const patientId = Number(req.params.patientId);

      const sessions = await prisma.gameSession.findMany({
        where: {
          patientId: patientId,
        },
        orderBy: {
          playedAt: "desc",
        },
      });

      res.json({
        message: "Game history retrieved successfully",
        patientId: patientId,
        totalSessions: sessions.length,
        sessions: sessions,
      });
    } catch (error) {
      console.error("Game history error:", error);

      res.status(500).json({
        message: "Failed to retrieve game history",
      });
    }
  }
);

module.exports = router;