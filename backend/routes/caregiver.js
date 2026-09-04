const express = require("express");
const prisma = require("../lib/db");
const authenticateToken = require("../middleware/auth");
const authorizeRoles = require("../middleware/authorize");

const router = express.Router();

// CHECK CAREGIVER ACCESS
const checkCaregiverAccess = async (req, res, next) => {
  try {
    const caregiverId = Number(req.params.caregiverId);

    if (Number.isNaN(caregiverId)) {
      return res.status(400).json({
        message: "Invalid caregiver ID",
      });
    }

    // Admin can access caregiver data
    if (req.user.role === "ADMIN") {
      return next();
    }

    // Caregiver can only access their own caregiver profile
    const caregiver = await prisma.caregiver.findUnique({
      where: {
        id: caregiverId,
      },
    });

    if (!caregiver) {
      return res.status(404).json({
        message: "Caregiver not found",
      });
    }

    if (caregiver.userId !== req.user.userId) {
      return res.status(403).json({
        message: "You can only access your own caregiver data",
      });
    }

    next();
  } catch (error) {
    console.error("Caregiver authorization error:", error);

    res.status(500).json({
      message: "Authorization check failed",
    });
  }
};

// GET CAREGIVER'S ASSIGNED PATIENTS
router.get(
  "/:caregiverId/patients",
  authenticateToken,
  authorizeRoles("CAREGIVER", "ADMIN"),
  checkCaregiverAccess,
  async (req, res) => {
    try {
      const caregiverId = Number(req.params.caregiverId);

      const assignments = await prisma.patientCaregiver.findMany({
        where: {
          caregiverId: caregiverId,
        },
        include: {
          patient: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                  role: true,
                },
              },
            },
          },
        },
      });

      const patients = assignments.map(
        (assignment) => assignment.patient
      );

      res.json({
        message: "Caregiver patients retrieved successfully",
        caregiverId: caregiverId,
        totalPatients: patients.length,
        patients: patients,
      });
    } catch (error) {
      console.error("Caregiver patients error:", error);

      res.status(500).json({
        message: "Failed to retrieve caregiver patients",
      });
    }
  }
);

// ASSIGN PATIENT TO CAREGIVER
router.post(
  "/:caregiverId/patients/:patientId",
  authenticateToken,
  authorizeRoles("CAREGIVER", "ADMIN"),
  checkCaregiverAccess,
  async (req, res) => {
    try {
      const caregiverId = Number(req.params.caregiverId);
      const patientId = Number(req.params.patientId);

      if (Number.isNaN(patientId)) {
        return res.status(400).json({
          message: "Invalid patient ID",
        });
      }

      const patient = await prisma.patient.findUnique({
        where: {
          id: patientId,
        },
      });

      if (!patient) {
        return res.status(404).json({
          message: "Patient not found",
        });
      }

      const existingAssignment =
        await prisma.patientCaregiver.findUnique({
          where: {
            patientId_caregiverId: {
              patientId: patientId,
              caregiverId: caregiverId,
            },
          },
        });

      if (existingAssignment) {
        return res.status(409).json({
          message: "Patient is already assigned to this caregiver",
        });
      }

      const assignment =
        await prisma.patientCaregiver.create({
          data: {
            patientId: patientId,
            caregiverId: caregiverId,
          },
        });

      res.status(201).json({
        message: "Patient assigned to caregiver successfully",
        assignment: assignment,
      });
    } catch (error) {
      console.error("Patient assignment error:", error);

      res.status(500).json({
        message: "Failed to assign patient to caregiver",
      });
    }
  }
);

// GET CAREGIVER PATIENT DASHBOARD
router.get(
  "/:caregiverId/dashboard/:patientId",
  authenticateToken,
  authorizeRoles("CAREGIVER", "ADMIN"),
  checkCaregiverAccess,
  async (req, res) => {
    try {
      const caregiverId = Number(req.params.caregiverId);
      const patientId = Number(req.params.patientId);

      if (Number.isNaN(patientId)) {
        return res.status(400).json({
          message: "Invalid patient ID",
        });
      }

      const assignment =
        await prisma.patientCaregiver.findUnique({
          where: {
            patientId_caregiverId: {
              patientId: patientId,
              caregiverId: caregiverId,
            },
          },
        });

      if (!assignment) {
        return res.status(403).json({
          message: "Patient is not assigned to this caregiver",
        });
      }

      const patient = await prisma.patient.findUnique({
        where: {
          id: patientId,
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              role: true,
            },
          },
        },
      });

      const sessions = await prisma.gameSession.findMany({
        where: {
          patientId: patientId,
        },
        orderBy: {
          playedAt: "desc",
        },
        take: 10,
      });

      const reminders = await prisma.reminder.findMany({
        where: {
          patientId: patientId,
        },
        orderBy: {
          reminderAt: "asc",
        },
      });

      const totalGames = sessions.length;

      const averageScore =
        totalGames > 0
          ? sessions.reduce(
              (sum, session) => sum + session.score,
              0
            ) / totalGames
          : 0;

      const averageAccuracy =
        totalGames > 0
          ? sessions.reduce(
              (sum, session) => sum + session.accuracy,
              0
            ) / totalGames
          : 0;

      res.json({
        message: "Caregiver dashboard data retrieved successfully",

        patient: patient,

        analytics: {
          recentGames: totalGames,
          averageScore: Number(averageScore.toFixed(2)),
          averageAccuracy: Number(
            averageAccuracy.toFixed(2)
          ),
          latestStreak:
            totalGames > 0 ? sessions[0].streak : 0,
        },

        recentSessions: sessions,

        reminders: reminders,
      });
    } catch (error) {
      console.error("Caregiver dashboard error:", error);

      res.status(500).json({
        message: "Failed to retrieve caregiver dashboard",
      });
    }
  }
);

module.exports = router;