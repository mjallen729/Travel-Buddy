import mongoose from "mongoose";
import bcrypt from "bcrypt";

const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: [true, "First name is required"],
      trim: true,
    },
    lastName: {
      type: String,
      required: [true, "Last name is required"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        "Please enter a valid email",
      ],
    },
    username: {
      type: String,
      required: [true, "Username is required"],
      unique: true,
      trim: true,
      minlength: [3, "Username must be at least 3 characters long"],
    },
    hashedPassword: {
      type: String,
      required: [true, "Password is required"],
      minlength: [6, "Password must be at least 6 characters long"],
    },
    age: {
      type: Number,
      min: [13, "Must be at least 13 years old"],
      max: [120, "Invalid age"],
    },

    // Travel Preferences Profile
    travelPreferences: {
      budgetRange: {
        type: String,
        enum: ["budget", "mid-range", "luxury"],
        default: "mid-range",
      },
      travelStyle: {
        type: String,
        enum: ["relaxed", "balanced", "fast-paced", "adventure"],
        default: "balanced",
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
        default: "hotels",
      },
      dietaryRestrictions: [
        {
          type: String,
          enum: [
            "vegetarian",
            "vegan",
            "gluten-free",
            "dairy-free",
            "halal",
            "kosher",
            "none",
          ],
        },
      ],
      accessibilityNeeds: [
        {
          type: String,
          enum: [
            "wheelchair-accessible",
            "mobility-assistance",
            "visual-impairment",
            "hearing-impairment",
            "none",
          ],
        },
      ],
    },

    // Profile completion tracking
    profileCompleted: {
      type: Boolean,
      default: false,
    },

    // Account status
    isActive: {
      type: Boolean,
      default: true,
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

// Index for search functionality
userSchema.index({
  firstName: "text",
  lastName: "text",
  email: "text",
  username: "text",
});

// Password hashing middleware
userSchema.pre("save", async function (next) {
  if (!this.isModified("hashedPassword")) return next();

  try {
    const salt = await bcrypt.genSalt(10);
    this.hashedPassword = await bcrypt.hash(this.hashedPassword, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Password comparison method
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.hashedPassword);
};

// Remove password from JSON output
userSchema.methods.toJSON = function () {
  const user = this.toObject();
  delete user.hashedPassword;
  return user;
};

export default mongoose.model("User", userSchema);
