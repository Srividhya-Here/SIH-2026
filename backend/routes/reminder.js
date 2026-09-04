const express = require("express");
const prisma = require("../lib/db");
const authenticateToken = require("../middleware/auth");
const checkPatientAccess = require("../middleware/patientAccess");

const router = express.Router();

// CREATE REMINDER
router.post(
  "/",
  authenticateToken,
  async (req, res, next) => {
    req.params.patientId = req.body.patientId;
    next();
  },
  checkPatientAccess,
  async (req, res) => {
    try {
      const {
        patientId,
        title,
        description,
        reminderAt,
      } = req.body;

      if (!patientId || !title || !reminderAt) {
        return res.status(400).json({
          message: "patientId, title, and reminderAt are required",
        });
      }

      const reminder = await prisma.reminder.create({
        data: {
          patientId: Number(patientId),
          title,
          description: description || null,
          reminderAt: new Date(reminderAt),
        },
      });

      res.status(201).json({
        message: "Reminder created successfully",
        reminder,
      });
    } catch (error) {
      console.error("Reminder creation error:", error);

      res.status(500).json({
        message: "Failed to create reminder",
      });
    }
  }
);

// GET REMINDERS
router.get(
  "/:patientId",
  authenticateToken,
  checkPatientAccess,
  async (req, res) => {
    try {
      const patientId = Number(req.params.patientId);

      const reminders = await prisma.reminder.findMany({
        where: {
          patientId,
        },
        orderBy: {
          reminderAt: "asc",
        },
      });

      res.json({
        message: "Reminders retrieved successfully",
        patientId,
        reminders,
      });
    } catch (error) {
      console.error("Reminder retrieval error:", error);

      res.status(500).json({
        message: "Failed to retrieve reminders",
      });
    }
  }
);

module.exports = router;