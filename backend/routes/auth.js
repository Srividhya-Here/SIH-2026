const express = require("express");
const prisma = require("../lib/db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const router = express.Router();

// REGISTER
router.post("/register", async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password || !role) {
      return res.status(400).json({
        message: "Name, email, password, and role are required",
      });
    }

    const existingUser = await prisma.user.findUnique({
      where: {
        email: email,
      },
    });

    if (existingUser) {
      return res.status(409).json({
        message: "User with this email already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        name: name,
        email: email,
        passwordHash: hashedPassword,
        role: role,
      },
    });

    res.status(201).json({
      message: "User registered successfully",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Registration error:", error);

    res.status(500).json({
      message: "Registration failed",
    });
  }
});

// LOGIN
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required",
      });
    }

    const user = await prisma.user.findUnique({
      where: {
        email: email,
      },
    });

    if (!user) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    const passwordMatch = await bcrypt.compare(
      password,
      user.passwordHash
    );

    if (!passwordMatch) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    const token = jwt.sign(
      {
        userId: user.id,
        role: user.role,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "1d",
      }
    );

    res.json({
      message: "Login successful",
      token: token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Login error:", error);

    res.status(500).json({
      message: "Login failed",
    });
  }
});
// CREATE PATIENT PROFILE
router.post("/create-patient", async (req, res) => {
  try {
    const { userId, dateOfBirth } = req.body;

    if (!userId) {
      return res.status(400).json({
        message: "userId is required",
      });
    }

    const user = await prisma.user.findUnique({
      where: {
        id: Number(userId),
      },
    });

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    if (user.role !== "PATIENT") {
      return res.status(400).json({
        message: "User must have PATIENT role",
      });
    }

    const existingPatient = await prisma.patient.findUnique({
      where: {
        userId: Number(userId),
      },
    });

    if (existingPatient) {
      return res.status(409).json({
        message: "Patient profile already exists",
      });
    }

    const patient = await prisma.patient.create({
      data: {
        userId: Number(userId),
        dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
      },
    });

    res.status(201).json({
      message: "Patient profile created successfully",
      patient: patient,
    });
  } catch (error) {
    console.error("Patient creation error:", error);

    res.status(500).json({
      message: "Failed to create patient profile",
    });
  }
});
// CREATE CAREGIVER PROFILE
router.post("/create-caregiver", async (req, res) => {
  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({
        message: "userId is required",
      });
    }

    const user = await prisma.user.findUnique({
      where: {
        id: Number(userId),
      },
    });

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    if (user.role !== "CAREGIVER") {
      return res.status(400).json({
        message: "User must have CAREGIVER role",
      });
    }

    const existingCaregiver = await prisma.caregiver.findUnique({
      where: {
        userId: Number(userId),
      },
    });

    if (existingCaregiver) {
      return res.status(409).json({
        message: "Caregiver profile already exists",
      });
    }

    const caregiver = await prisma.caregiver.create({
      data: {
        userId: Number(userId),
      },
    });

    res.status(201).json({
      message: "Caregiver profile created successfully",
      caregiver: caregiver,
    });
  } catch (error) {
    console.error("Caregiver creation error:", error);

    res.status(500).json({
      message: "Failed to create caregiver profile",
    });
  }
});

module.exports = router;