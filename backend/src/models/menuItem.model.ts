import mongoose from "mongoose";

const menuItemSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    price: {
      type: Number,
      required: true,
    },
    category: {
      type: String,
      required: true,
      trim: true,
    },
    customCategory: {
      type: String,
      trim: true,
      required: function () {
        return this.category === "Custom";
      },
    },
    image: {
      url: { type: String },
      public_id: { type: String },
    },
    status: {
      type: String,
      enum: ["available", "unavailable"],
      default: "available",
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

const MenuItem = mongoose.model("MenuItem", menuItemSchema);
export default MenuItem;