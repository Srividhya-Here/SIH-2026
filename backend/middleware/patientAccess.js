const prisma = require("../lib/db");

const checkPatientAccess = async (req, res, next) => {
  try {
    const patientId = Number(
      req.params.patientId || req.params.id
    );

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

    // Admin can access any patient
    if (req.user.role === "ADMIN") {
      return next();
    }

    // Patient can access only their own data
    if (
      req.user.role === "PATIENT" &&
      patient.userId === req.user.userId
    ) {
      return next();
    }

    // Caregiver can access only assigned patients
    if (req.user.role === "CAREGIVER") {
      const assignment =
        await prisma.patientCaregiver.findUnique({
          where: {
            patientId_caregiverId: {
              patientId: patientId,
              caregiverId: (
                await prisma.caregiver.findUnique({
                  where: {
                    userId: req.user.userId,
                  },
                })
              )?.id,
            },
          },
        });

      if (assignment) {
        return next();
      }
    }

    return res.status(403).json({
      message: "You do not have access to this patient's data",
    });
  } catch (error) {
    console.error("Patient authorization error:", error);

    return res.status(500).json({
      message: "Authorization check failed",
    });
  }
};

module.exports = checkPatientAccess;
