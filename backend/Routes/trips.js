import express from "express";
import Trip from "../models/Trip.js";
import User from "../models/User.js";
import logger from "../utils/logger.js";
import {
  generateItinerary,
  generateRecs,
  generateTips,
} from "../integrations/gemini.js";

const router = express.Router();

// TODO: Add authentication middleware
// import auth from '../middleware/auth.js';

// Get all trips for a user
router.get("/user/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const { status, search } = req.query;

    logger.debug("Fetching user trips", {
      userId,
      status,
      search,
    });

    let query = { userId, isDeleted: false };

    // Filter by status
    if (status) {
      query.status = status;
    }

    // Search functionality
    if (search) {
      query.$or = [
        { tripName: { $regex: search, $options: "i" } },
        { destination: { $regex: search, $options: "i" } },
      ];
    }

    const trips = await Trip.find(query)
      .sort({ startDate: 1 })
      .populate("userId", "firstName lastName username");

    logger.info("Trips fetched successfully", {
      userId,
      tripCount: trips.length,
      status,
      search,
    });

    res.status(200).json(trips);
  } catch (error) {
    logger.error("Error fetching trips", {
      userId: req.params.userId,
      error: error.message,
      stack: error.stack,
    });
    res.status(500).json({ error: "Server error" });
  }
});

// Get a specific trip
router.get("/:tripId", async (req, res) => {
  try {
    logger.debug("Fetching trip details", { tripId: req.params.tripId });

    const trip = await Trip.findById(req.params.tripId).populate(
      "userId",
      "firstName lastName username",
    );

    if (!trip || trip.isDeleted) {
      logger.warn("Trip not found", { tripId: req.params.tripId });
      return res.status(404).json({ error: "Trip not found" });
    }

    logger.info("Trip fetched successfully", {
      tripId: trip._id,
      userId: trip.userId._id,
    });

    res.status(200).json(trip);
  } catch (error) {
    logger.error("Error fetching trip", {
      tripId: req.params.tripId,
      error: error.message,
      stack: error.stack,
    });
    res.status(500).json({ error: "Server error" });
  }
});

// Create a new trip
router.post("/", async (req, res) => {
  try {
    const {
      userId,
      tripName,
      destination,
      startDate,
      endDate,
      duration,
      budget,
      status,
      preferences,
    } = req.body;

    logger.debug("Creating new trip", {
      userId,
      tripName,
      destination,
    });

    // Validate required fields
    if (
      !userId ||
      !tripName ||
      !destination ||
      !startDate ||
      !endDate ||
      !budget
    ) {
      logger.warn("Trip creation failed - missing required fields", { userId });
      return res
        .status(400)
        .json({ error: "All required fields must be provided" });
    }

    // Validate dates
    const start = new Date(startDate);
    const end = new Date(endDate);

    if (start >= end) {
      logger.warn("Trip creation failed - invalid dates", {
        userId,
        startDate,
        endDate,
      });
      return res
        .status(400)
        .json({ error: "End date must be after start date" });
    }

    if (startDate < new Date()) {
      logger.warn("Trip creation failed - past start date", {
        userId,
        startDate,
      });
      return res
        .status(400)
        .json({ error: "Start date cannot be in the past" });
    }

    // Create new trip
    const newTrip = new Trip({
      userId,
      tripName,
      destination,
      startDate: start,
      endDate: end,
      duration,
      budget,
      status,
      preferences: preferences || {
        travelStyle: "balanced",
        interests: [],
        budgetRange: "mid-range",
        accommodationStyle: "hotels",
      },
    });

    await newTrip.save();

    logger.info("New trip created successfully", {
      tripId: newTrip._id,
      userId: newTrip.userId,
      destination: newTrip.destination,
    });

    res.status(201).json(newTrip);
  } catch (error) {
    logger.error("Error creating trip", {
      userId: req.body.userId,
      error: error.message,
      stack: error.stack,
    });
    res.status(500).json({ error: "Server error" });
  }
});

// Update a trip
router.put("/:tripId", async (req, res) => {
  try {
    const { tripId } = req.params;
    const updateData = req.body;

    logger.debug("Updating trip", {
      tripId,
      updateFields: Object.keys(updateData),
    });

    // Remove fields that shouldn't be updated directly
    delete updateData._id;
    delete updateData.userId;
    delete updateData.createdAt;

    const updatedTrip = await Trip.findByIdAndUpdate(
      tripId,
      { ...updateData, updatedAt: new Date() },
      { new: true, runValidators: true },
    );

    if (!updatedTrip || updatedTrip.isDeleted) {
      logger.warn("Trip update failed - trip not found", { tripId });
      return res.status(404).json({ error: "Trip not found" });
    }

    logger.info("Trip updated successfully", {
      tripId: updatedTrip._id,
      userId: updatedTrip.userId,
      updatedFields: Object.keys(updateData),
    });

    res.status(200).json(updatedTrip);
  } catch (error) {
    logger.error("Error updating trip", {
      tripId: req.params.tripId,
      error: error.message,
      stack: error.stack,
    });
    res.status(500).json({ error: "Server error" });
  }
});

// Delete a trip (soft delete)
router.delete("/:tripId", async (req, res) => {
  try {
    logger.debug("Deleting trip", { tripId: req.params.tripId });

    const trip = await Trip.findByIdAndUpdate(
      req.params.tripId,
      { isDeleted: true },
      { new: true },
    );

    if (!trip) {
      logger.warn("Trip deletion failed - trip not found", {
        tripId: req.params.tripId,
      });
      return res.status(404).json({ error: "Trip not found" });
    }

    logger.info("Trip deleted successfully", {
      tripId: trip._id,
      userId: trip.userId,
    });

    res.status(200).json({ message: "Trip deleted successfully" });
  } catch (error) {
    logger.error("Error deleting trip", {
      tripId: req.params.tripId,
      error: error.message,
      stack: error.stack,
    });
    res.status(500).json({ error: "Server error" });
  }
});

// Search trips
router.get("/search/:query", async (req, res) => {
  try {
    const { query } = req.params;
    const [textQuery, startRange, endRange] = query.split(";");
    const { userId } = req.query;

    logger.info("Searching trips", {
      textQuery,
      startRange,
      endRange,
      userId,
    });

    const start = new Date(startRange);
    const end = new Date(endRange);

    if (end) {
      if (start >= end) {
        logger.error("Trip query failed - invalid date range", {
          startRange,
          endRange,
        });
      }
    }

    let searchQuery = {
      isDeleted: false,
      ...(textQuery &&
        textQuery.trim() !== "" && {
          $or: [
            { tripName: { $regex: textQuery, $options: "i" } },
            { destination: { $regex: textQuery, $options: "i" } },
          ],
        }),
    };

    if (startRange && endRange) {
      searchQuery.startDate = { $lte: end };
      searchQuery.endDate = { $gte: start };
    } else if (startRange && !endRange) {
      searchQuery.startDate = { $gte: start };
    } else if (!startRange && endRange) {
      const nextDay = end;
      nextDay.setDate(nextDay.getDate() + 1);
      searchQuery.endDate = { $lte: nextDay };
    }

    if (userId) {
      searchQuery.userId = userId;
    }

    const trips = await Trip.find(searchQuery)
      .populate("userId", "firstName lastName username")
      .sort({ startDate: 1 })
      .limit(20);

    logger.info("Trip search completed", {
      query,
      userId,
      resultCount: trips.length,
    });

    res.status(200).json(trips);
  } catch (error) {
    logger.error("Error searching trips", {
      query: req.params.query,
      userId: req.query.userId,
      error: error.message,
      stack: error.stack,
    });
    res.status(500).json({ error: "Server error" });
  }
});

// Get trip statistics
router.get("/stats/:userId", async (req, res) => {
  try {
    const { userId } = req.params;

    logger.debug("Fetching trip statistics", { userId });

    const stats = await Trip.aggregate([
      { $match: { userId: userId, isDeleted: false } },
      {
        $group: {
          _id: null,
          totalTrips: { $sum: 1 },
          totalBudget: { $sum: "$budget" },
          avgBudget: { $avg: "$budget" },
          upcomingTrips: {
            $sum: {
              $cond: [{ $eq: ["$status", "upcoming"] }, 1, 0],
            },
          },
          ongoingTrips: {
            $sum: {
              $cond: [{ $eq: ["$status", "ongoing"] }, 1, 0],
            },
          },
          completedTrips: {
            $sum: {
              $cond: [{ $eq: ["$status", "completed"] }, 1, 0],
            },
          },
        },
      },
    ]);

    logger.info("Trip statistics fetched successfully", {
      userId,
      stats: stats[0] || {
        totalTrips: 0,
        totalBudget: 0,
        avgBudget: 0,
        upcomingTrips: 0,
        ongoingTrips: 0,
        completedTrips: 0,
      },
    });

    res.status(200).json(
      stats[0] || {
        totalTrips: 0,
        totalBudget: 0,
        avgBudget: 0,
        upcomingTrips: 0,
        ongoingTrips: 0,
        completedTrips: 0,
      },
    );
  } catch (error) {
    logger.error("Error fetching trip stats", {
      userId: req.params.userId,
      error: error.message,
      stack: error.stack,
    });
    res.status(500).json({ error: "Server error" });
  }
});

// AI Planning Endpoints
const cleanAndParseJson = (jsonString) => {
  const cleanedString = jsonString
    .replace(/```json\n/g, "")
    .replace(/```/g, "");
  return JSON.parse(cleanedString);
};

router.post("/:tripId/generate-itinerary", async (req, res) => {
  // Generate AI itinerary
  try {
    logger.debug("Generating trip itinerary", { tripId: req.params.tripId });
    const tripId = req.params.tripId;
    const trip = await Trip.findById(tripId);

    if (!trip || trip.isDeleted) {
      logger.warn("Trip not found", { tripId: req.params.tripId });
      return res.status(404).json({ error: "Trip not found" });
    }

    const itineraryJson = cleanAndParseJson(await generateItinerary(trip));
    await Trip.findByIdAndUpdate(tripId, {
      activities: itineraryJson,
      $set: { "aiGenerated.itineraryGenerated": true },
    });

    res.status(200).json(itineraryJson);
  } catch (error) {
    logger.error("Error generating itinerary", {
      tripId: req.params.tripId,
      error: error.message,
      stack: error.stack,
    });

    res.status(500).json({ error: "Content-Generation error" });
  }
});

router.post("/:tripId/generate-recommendations", async (req, res) => {
  // Generate AI recommendations
  try {
    logger.debug("Generating trip recommendations", {
      tripId: req.params.tripId,
    });
    const tripId = req.params.tripId;
    const trip = await Trip.findById(tripId);

    if (!trip || trip.isDeleted) {
      logger.warn("Trip not found", { tripId: req.params.tripId });
      return res.status(404).json({ error: "Trip not found" });
    }

    const recsJson = cleanAndParseJson(await generateRecs(trip));
    await Trip.findByIdAndUpdate(tripId, {
      recommendations: recsJson,
      $set: { "aiGenerated.recommendationsGenerated": true },
    });

    res.status(200).json(recsJson);
  } catch (error) {
    logger.error("Error generating recommendations", {
      tripId: req.params.tripId,
      error: error.message,
      stack: error.stack,
    });

    res.status(500).json({ error: "Content-Generation error" });
  }
});

router.post("/:tripId/generate-tips", async (req, res) => {
  // Generate travel tips
  try {
    logger.debug("Generating trip travel tips", { tripId: req.params.tripId });
    const tripId = req.params.tripId;
    const trip = await Trip.findById(tripId);

    if (!trip || trip.isDeleted) {
      logger.warn("Trip not found", { tripId: req.params.tripId });
      return res.status(404).json({ error: "Trip not found" });
    }

    const tipsJson = cleanAndParseJson(await generateTips(trip));
    await Trip.findByIdAndUpdate(tripId, { travelTips: tipsJson });

    res.status(200).json(tipsJson);
  } catch (error) {
    logger.error("Error generating travel tips", {
      tripId: req.params.tripId,
      error: error.message,
      stack: error.stack,
    });

    res.status(500).json({ error: "Content-Generation error" });
  }
});

export default router;
