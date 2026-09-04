const express = require("express");
const prisma = require("../lib/db");
const authenticateToken = require("../middleware/auth");
const checkPatientAccess = require("../middleware/patientAccess");

const router = express.Router();

router.post(
  "/session",
  authenticateToken,
  async (req, res, next) => {
    // Game-session creation needs the patientId from the request body,
    // while checkPatientAccess reads from route parameters.
    req.params.patientId = req.body.patientId;
    next();
  },
  checkPatientAccess,
  async (req, res) => {
    try {
      const {
        patientId,
        gameType,
        difficulty,
        score,
        accuracy,
        reactionTime,
        errorRate,
        attempts,
        hintUsage,
        completionTime,
        streak,
      } = req.body;

      if (
        !patientId ||
        !gameType ||
        !difficulty ||
        score === undefined ||
        accuracy === undefined ||
        reactionTime === undefined ||
        errorRate === undefined ||
        attempts === undefined ||
        hintUsage === undefined ||
        completionTime === undefined ||
        streak === undefined
      ) {
        return res.status(400).json({
          message: "All game session fields are required",
        });
      }

      const gameSession = await prisma.gameSession.create({
        data: {
          patientId: Number(patientId),
          gameType,
          difficulty,
          score: Number(score),
          accuracy: Number(accuracy),
          reactionTime: Number(reactionTime),
          errorRate: Number(errorRate),
          attempts: Number(attempts),
          hintUsage: Number(hintUsage),
          completionTime: Number(completionTime),
          streak: Number(streak),
        },
      });

      res.status(201).json({
        message: "Game session recorded successfully",
        gameSession,
      });
    } catch (error) {
      console.error("Game session error:", error);

      res.status(500).json({
        message: "Failed to record game session",
      });
    }
  }
);

module.exports = router;