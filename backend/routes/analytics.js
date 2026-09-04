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

      if (sessions.length === 0) {
        return res.json({
          message: "No game data available",
          patientId: patientId,
          analytics: {
            totalGames: 0,
            averageScore: 0,
            averageAccuracy: 0,
            averageReactionTime: 0,
            averageErrorRate: 0,
            currentStreak: 0,
          },
        });
      }

      const totalGames = sessions.length;

      const averageScore =
        sessions.reduce(
          (sum, session) => sum + session.score,
          0
        ) / totalGames;

      const averageAccuracy =
        sessions.reduce(
          (sum, session) => sum + session.accuracy,
          0
        ) / totalGames;

      const averageReactionTime =
        sessions.reduce(
          (sum, session) => sum + session.reactionTime,
          0
        ) / totalGames;

      const averageErrorRate =
        sessions.reduce(
          (sum, session) => sum + session.errorRate,
          0
        ) / totalGames;

      const currentStreak = sessions[0].streak;

      res.json({
        message: "Analytics retrieved successfully",
        patientId: patientId,
        analytics: {
          totalGames: totalGames,
          averageScore: Number(averageScore.toFixed(2)),
          averageAccuracy: Number(
            averageAccuracy.toFixed(2)
          ),
          averageReactionTime: Number(
            averageReactionTime.toFixed(2)
          ),
          averageErrorRate: Number(
            averageErrorRate.toFixed(2)
          ),
          currentStreak: currentStreak,
        },
      });
    } catch (error) {
      console.error("Analytics error:", error);

      res.status(500).json({
        message: "Failed to retrieve analytics",
      });
    }
  }
);

module.exports = router;