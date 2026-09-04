const express = require("express");
const prisma = require("../lib/db");
const authenticateToken = require("../middleware/auth");

const router = express.Router();

// SYNC OFFLINE EVENT
router.post("/", authenticateToken, async (req, res) => {
  try {
    const {
      eventId,
      eventType,
      patientId,
      payload,
    } = req.body;

    if (!eventId || !eventType || !payload) {
      return res.status(400).json({
        message: "eventId, eventType, and payload are required",
      });
    }

    const existingEvent = await prisma.syncQueue.findUnique({
      where: {
        eventId: eventId,
      },
    });

    if (existingEvent) {
      return res.status(200).json({
        message: "Event already synced",
        event: existingEvent,
      });
    }

    const syncEvent = await prisma.syncQueue.create({
      data: {
        eventId: eventId,
        eventType: eventType,
        patientId: patientId ? Number(patientId) : null,
        payload:
          typeof payload === "string"
            ? payload
            : JSON.stringify(payload),
        synced: true,
        syncedAt: new Date(),
      },
    });

    res.status(201).json({
      message: "Offline event synced successfully",
      event: syncEvent,
    });
  } catch (error) {
    console.error("Sync error:", error);

    res.status(500).json({
      message: "Failed to sync offline event",
    });
  }
});

module.exports = router;