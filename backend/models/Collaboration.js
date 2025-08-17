import mongoose from "mongoose";

const collaborationSchema = new mongoose.Schema(
  {
    tripId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Trip",
      required: true,
    },
    invitedUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    invitedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    role: {
      type: String,
      enum: ["viewer", "editor", "co-traveler", "admin"],
      default: "viewer",
    },
    status: {
      type: String,
      enum: ["pending", "accepted", "declined", "revoked"],
      default: "pending",
    },
    permissions: {
      canEdit: {
        type: Boolean,
        default: false,
      },
      canDelete: {
        type: Boolean,
        default: false,
      },
      canInvite: {
        type: Boolean,
        default: false,
      },
      canViewBudget: {
        type: Boolean,
        default: true,
      },
      canViewItinerary: {
        type: Boolean,
        default: true,
      },
    },
    message: {
      type: String,
      trim: true,
    },
    invitedAt: {
      type: Date,
      default: Date.now,
    },
    respondedAt: Date,
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  },
);

// Indexes for performance
collaborationSchema.index({ tripId: 1, status: 1 });
collaborationSchema.index({ invitedUserId: 1, status: 1 });
collaborationSchema.index({ invitedBy: 1 });

// Set permissions based on role
collaborationSchema.pre("save", function (next) {
  switch (this.role) {
    case "admin":
      this.permissions = {
        canEdit: true,
        canDelete: true,
        canInvite: true,
        canViewBudget: true,
        canViewItinerary: true,
      };
      break;
    case "editor":
      this.permissions = {
        canEdit: true,
        canDelete: false,
        canInvite: true,
        canViewBudget: true,
        canViewItinerary: true,
      };
      break;
    case "co-traveler":
      this.permissions = {
        canEdit: true,
        canDelete: false,
        canInvite: false,
        canViewBudget: true,
        canViewItinerary: true,
      };
      break;
    case "viewer":
      this.permissions = {
        canEdit: false,
        canDelete: false,
        canInvite: false,
        canViewBudget: false,
        canViewItinerary: true,
      };
      break;
  }
  next();
});

export default mongoose.model("Collaboration", collaborationSchema);
