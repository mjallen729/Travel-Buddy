import express from "express";
import Collaboration from "../models/Collaboration.js";
import Trip from "../models/Trip.js";
import User from "../models/User.js";

const router = express.Router();

// TODO: Add authentication middleware
// import auth from '../middleware/auth.js';

// Get all collaborations for a user
router.get("/user/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const { status } = req.query;

    let query = { invitedUserId: userId, isActive: true };

    if (status) {
      query.status = status;
    }

    const collaborations = await Collaboration.find(query)
      .populate("tripId", "tripName destination startDate endDate status")
      .populate("invitedBy", "firstName lastName username")
      .sort({ invitedAt: -1 });

    res.status(200).json(collaborations);
  } catch (error) {
    console.error("Error fetching collaborations:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// Get collaborations for a specific trip
router.get("/trip/:tripId", async (req, res) => {
  try {
    const { tripId } = req.params;

    const collaborations = await Collaboration.find({ tripId, isActive: true })
      .populate("invitedUserId", "firstName lastName username email")
      .populate("invitedBy", "firstName lastName username")
      .sort({ invitedAt: -1 });

    res.status(200).json(collaborations);
  } catch (error) {
    console.error("Error fetching trip collaborations:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// Invite user to collaborate on a trip
router.post("/invite", async (req, res) => {
  try {
    const { tripId, invitedUserId, invitedBy, role, message } = req.body;

    // Validate required fields
    if (!tripId || !invitedUserId || !invitedBy || !role) {
      return res
        .status(400)
        .json({ error: "All required fields must be provided" });
    }

    // Check if trip exists and belongs to inviter
    const trip = await Trip.findById(tripId);
    if (!trip || trip.isDeleted) {
      return res.status(404).json({ error: "Trip not found" });
    }

    // Check if user exists
    const invitedUser = await User.findById(invitedUserId);
    if (!invitedUser || !invitedUser.isActive) {
      return res.status(404).json({ error: "User not found" });
    }

    // Check if collaboration already exists
    const existingCollaboration = await Collaboration.findOne({
      tripId,
      invitedUserId,
      isActive: true,
    });

    if (existingCollaboration) {
      return res
        .status(409)
        .json({ error: "User already invited to this trip" });
    }

    // Create new collaboration
    const newCollaboration = new Collaboration({
      tripId,
      invitedUserId,
      invitedBy,
      role,
      message: message || "",
      status: "pending",
    });

    await newCollaboration.save();

    // Populate the response
    await newCollaboration.populate(
      "invitedUserId",
      "firstName lastName username email",
    );
    await newCollaboration.populate("invitedBy", "firstName lastName username");

    res.status(201).json(newCollaboration);
  } catch (error) {
    console.error("Error creating collaboration:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// Accept collaboration invitation
router.put("/:collaborationId/accept", async (req, res) => {
  try {
    const collaboration = await Collaboration.findByIdAndUpdate(
      req.params.collaborationId,
      {
        status: "accepted",
        respondedAt: new Date(),
      },
      { new: true },
    ).populate("tripId invitedUserId invitedBy");

    if (!collaboration) {
      return res.status(404).json({ error: "Collaboration not found" });
    }

    res.status(200).json(collaboration);
  } catch (error) {
    console.error("Error accepting collaboration:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// Decline collaboration invitation
router.put("/:collaborationId/decline", async (req, res) => {
  try {
    const collaboration = await Collaboration.findByIdAndUpdate(
      req.params.collaborationId,
      {
        status: "declined",
        respondedAt: new Date(),
      },
      { new: true },
    );

    if (!collaboration) {
      return res.status(404).json({ error: "Collaboration not found" });
    }

    res.status(200).json(collaboration);
  } catch (error) {
    console.error("Error declining collaboration:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// Revoke collaboration invitation
router.put("/:collaborationId/revoke", async (req, res) => {
  try {
    const collaboration = await Collaboration.findByIdAndUpdate(
      req.params.collaborationId,
      {
        status: "revoked",
        isActive: false,
      },
      { new: true },
    );

    if (!collaboration) {
      return res.status(404).json({ error: "Collaboration not found" });
    }

    res.status(200).json(collaboration);
  } catch (error) {
    console.error("Error revoking collaboration:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// Update collaboration role
router.put("/:collaborationId/role", async (req, res) => {
  try {
    const { role } = req.body;

    if (!role) {
      return res.status(400).json({ error: "Role is required" });
    }

    const collaboration = await Collaboration.findByIdAndUpdate(
      req.params.collaborationId,
      { role },
      { new: true, runValidators: true },
    ).populate("tripId invitedUserId invitedBy");

    if (!collaboration) {
      return res.status(404).json({ error: "Collaboration not found" });
    }

    res.status(200).json(collaboration);
  } catch (error) {
    console.error("Error updating collaboration role:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// Remove collaboration
router.delete("/:collaborationId", async (req, res) => {
  try {
    const collaboration = await Collaboration.findByIdAndUpdate(
      req.params.collaborationId,
      { isActive: false },
      { new: true },
    );

    if (!collaboration) {
      return res.status(404).json({ error: "Collaboration not found" });
    }

    res.status(200).json({ message: "Collaboration removed successfully" });
  } catch (error) {
    console.error("Error removing collaboration:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// Get collaboration statistics
router.get("/stats/:userId", async (req, res) => {
  try {
    const { userId } = req.params;

    const stats = await Collaboration.aggregate([
      { $match: { invitedUserId: userId, isActive: true } },
      {
        $group: {
          _id: null,
          totalInvitations: { $sum: 1 },
          acceptedInvitations: {
            $sum: { $cond: [{ $eq: ["$status", "accepted"] }, 1, 0] },
          },
          pendingInvitations: {
            $sum: { $cond: [{ $eq: ["$status", "pending"] }, 1, 0] },
          },
          declinedInvitations: {
            $sum: { $cond: [{ $eq: ["$status", "declined"] }, 1, 0] },
          },
        },
      },
    ]);

    res.status(200).json(
      stats[0] || {
        totalInvitations: 0,
        acceptedInvitations: 0,
        pendingInvitations: 0,
        declinedInvitations: 0,
      },
    );
  } catch (error) {
    console.error("Error fetching collaboration stats:", error);
    res.status(500).json({ error: "Server error" });
  }
});

export default router;
