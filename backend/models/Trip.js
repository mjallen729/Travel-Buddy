import mongoose from "mongoose";

const activitySchema = new mongoose.Schema({
  day: {
    type: Number,
    required: true,
  },
  date: {
    type: Date,
    required: true,
  },
  items: [
    {
      time: {
        type: String,
        required: true,
      },
      title: {
        type: String,
        required: true,
      },
      type: {
        type: String,
        required: true,
      },
      description: String,
      location: String,
      duration: Number, // in minutes
      cost: Number,
      bookingRequired: {
        type: Boolean,
        default: false,
      },
      bookingInfo: {
        website: String,
        phone: String,
        notes: String,
      },
      aiGenerated: {
        type: Boolean,
        default: true,
      },
    },
  ],
});

const travelInfoSchema = new mongoose.Schema({
  flights: [
    {
      airline: String,
      flightNumber: String,
      departureAirport: String,
      arrivalAirport: String,
      departureTime: Date,
      arrivalTime: Date,
      bookingReference: String,
      cost: Number,
    },
  ],
  hotels: [
    {
      name: String,
      address: String,
      checkIn: Date,
      checkOut: Date,
      bookingReference: String,
      cost: Number,
      amenities: [String],
    },
  ],
  trains: [
    {
      departureStation: String,
      arrivalStation: String,
      departureTime: Date,
      arrivalTime: Date,
      trainNumber: String,
      bookingReference: String,
      cost: Number,
    },
  ],
  carRentals: [
    {
      company: String,
      pickupLocation: String,
      dropoffLocation: String,
      pickupDate: Date,
      dropoffDate: Date,
      carType: String,
      bookingReference: String,
      cost: Number,
    },
  ],
});

const tripSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    tripName: {
      type: String,
      required: [true, "Trip name is required"],
      trim: true,
    },
    destination: {
      type: String,
      required: [true, "Destination is required"],
      trim: true,
    },
    startDate: {
      type: Date,
      required: [true, "Start date is required"],
    },
    endDate: {
      type: Date,
      required: [true, "End date is required"],
    },
    duration: {
      type: Number, // calculated in days
      required: true,
    },
    budget: {
      type: Number,
      required: [true, "Budget is required"],
      min: [0, "Budget cannot be negative"],
    },
    status: {
      type: String,
      enum: ["planning", "upcoming", "ongoing", "completed", "cancelled"],
      default: "planning",
    },

    // Trip Preferences (can override user preferences)
    preferences: {
      travelStyle: {
        type: String,
        enum: ["relaxed", "balanced", "fast-paced", "adventure"],
        required: true,
      },
      interests: [
        {
          type: String,
          enum: [
            "food",
            "culture",
            "adventure",
            "nature",
            "nightlife",
            "history",
            "wellness",
            "photography",
            "shopping",
            "sports",
            "art",
            "music",
            "architecture",
            "beaches",
            "mountains",
            "cities",
            "rural",
            "temples",
            "museums",
            "local-experiences",
          ],
        },
      ],
      budgetRange: {
        type: String,
        enum: ["budget", "mid-range", "luxury"],
        required: true,
      },
      accommodationStyle: {
        type: String,
        enum: [
          "hotels",
          "hostels",
          "vacation-rentals",
          "eco-lodges",
          "camping",
          "luxury-resorts",
        ],
        required: true,
      },
    },

    // AI-Generated Content
    aiGenerated: {
      itineraryGenerated: {
        type: Boolean,
        default: false,
      },
      recommendationsGenerated: {
        type: Boolean,
        default: false,
      },
      lastGeneratedAt: Date,
    },

    // Travel Information
    travelInfo: travelInfoSchema,

    // Activities and Itinerary
    activities: [activitySchema],

    // AI Recommendations
    recommendations: {
      attractions: [
        {
          name: String,
          description: String,
          location: String,
          rating: Number,
          cost: Number,
          category: String,
          aiRecommended: {
            type: Boolean,
            default: true,
          },
        },
      ],
      restaurants: [
        {
          name: String,
          cuisine: String,
          description: String,
          location: String,
          rating: Number,
          priceRange: String,
          dietaryOptions: [String],
          aiRecommended: {
            type: Boolean,
            default: true,
          },
        },
      ],
      experiences: [
        {
          name: String,
          description: String,
          category: String,
          duration: Number,
          cost: Number,
          location: String,
          aiRecommended: {
            type: Boolean,
            default: true,
          },
        },
      ],
    },

    // Travel Tips and Local Guidance
    travelTips: [
      {
        category: {
          type: String,
          enum: [
            "cultural",
            "transportation",
            "safety",
            "language",
            "weather",
            "money",
            "food",
            "customs",
          ],
          required: true,
        },
        title: String,
        content: String,
        importance: {
          type: String,
          enum: ["low", "medium", "high"],
          default: "medium",
        },
        aiGenerated: {
          type: Boolean,
          default: true,
        },
      },
    ],

    // Notes and Reviews
    notes: String,
    review: {
      rating: {
        type: Number,
        min: 1,
        max: 5,
      },
      comment: String,
      date: Date,
    },

    // Soft delete
    isDeleted: {
      type: Boolean,
      default: false,
    },

    // Timestamps
    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  },
);

// Indexes for search and performance
tripSchema.index({ userId: 1, status: 1 });
tripSchema.index({ destination: "text", tripName: "text" });
tripSchema.index({ startDate: 1, endDate: 1 });
tripSchema.index({ isDeleted: 1 });

// Calculate duration before saving
tripSchema.pre("save", function (next) {
  if (this.startDate && this.endDate) {
    const start = new Date(this.startDate);
    const end = new Date(this.endDate);
    this.duration = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
  }
  next();
});

// Update status based on dates
tripSchema.methods.updateStatus = function () {
  const now = new Date();
  const start = new Date(this.startDate);
  const end = new Date(this.endDate);

  if (this.status === "cancelled") return;

  if (now < start) {
    this.status = "upcoming";
  } else if (now >= start && now <= end) {
    this.status = "ongoing";
  } else if (now > end) {
    this.status = "completed";
  }
};

// Get trip summary
tripSchema.methods.getSummary = function () {
  return {
    id: this._id,
    tripName: this.tripName,
    destination: this.destination,
    startDate: this.startDate,
    endDate: this.endDate,
    duration: this.duration,
    status: this.status,
    budget: this.budget,
  };
};

export default mongoose.model("Trip", tripSchema);
