const express = require("express");
const axios = require("axios");
const authenticateToken = require("../middleware/auth");

const router = express.Router();

// AI DIFFICULTY RECOMMENDATION
router.post(
  "/predict-difficulty",
  authenticateToken,
  async (req, res) => {
    try {
      const aiResponse = await axios.post(
        "http://127.0.0.1:8000/predict-difficulty",
        req.body
      );

      res.json({
        message: "AI prediction successful",
        prediction: aiResponse.data,
      });
    } catch (error) {
      console.error("AI service error:", error.message);

      res.status(500).json({
        message: "AI service unavailable",
      });
    }
  }
);

module.exports = router;