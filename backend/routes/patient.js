const express = require("express");
const prisma = require("../lib/db");
const authenticateToken = require("../middleware/auth");
const checkPatientAccess = require("../middleware/patientAccess");

const router = express.Router();

router.get(
  "/:id",
  authenticateToken,
  checkPatientAccess,
  async (req, res) => {
    try {
      const patientId = Number(req.params.id);

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

      res.json({
        message: "Patient retrieved successfully",
        patient: patient,
      });
    } catch (error) {
      console.error("Patient retrieval error:", error);

      res.status(500).json({
        message: "Failed to retrieve patient",
      });
    }
  }
);

module.exports = router;