import mongoose from "mongoose";

const counterSchema = new mongoose.Schema({
  _id: { type: String, required: true },
  seq: { type: Number, default: 0 },
});
const Counter = mongoose.model("Counter", counterSchema);

const entrySchema = new mongoose.Schema({
  srNo: { type: Number, unique: true },

  // ══════════════════════════════════════════════════════
  // PERSONAL INFORMATION - Enhanced Validation
  // ══════════════════════════════════════════════════════

  name: {
    type: String,
    required: [true, "Name required"],
    trim: true,
    minlength: [2, "Name too short (min 2 chars)"],
    maxlength: [50, "Name too long (max 50 chars)"],
    match: [/^[a-zA-Z\s]+$/, "Name: letters only"],
  },

  surname: {
    type: String,
    required: [true, "Surname required"],
    trim: true,
    minlength: [2, "Surname too short (min 2 chars)"],
    maxlength: [50, "Surname too long (max 50 chars)"],
    match: [/^[a-zA-Z\s]+$/, "Surname: letters only"],
  },

  contactNo: {
    type: String,
    required: [true, "Contact number required"],
    trim: true,
    validate: {
      validator: function (v) {
        // Remove spaces and check if it's a valid 10-digit Indian mobile
        const cleaned = v.replace(/\s+/g, "").replace(/^\+91/, "");
        return /^[6-9]\d{9}$/.test(cleaned);
      },
      message: "Invalid mobile (10 digits, start with 6-9)",
    },
    set: (v) => v.replace(/\s+/g, ""), // Remove all spaces
  },

  email: {
    type: String,
    trim: true,
    lowercase: true,
    default: "",
    validate: {
      validator: function (v) {
        // If email is provided, validate format
        if (!v || v === "") return true;
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
      },
      message: "Invalid email format",
    },
  },

  dob: {
    type: String,
    default: "",
    // ✅ No validation — sab age allowed
  },

  // ══════════════════════════════════════════════════════
  // ENTRY DETAILS - Enhanced Validation
  // ══════════════════════════════════════════════════════

  entryTime: {
    type: String,
    required: [true, "Entry time required"],
    validate: {
      validator: function (v) {
        // Sirf HH:MM format check karo, time restriction hatao
        return /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(v);
      },
      message: "Invalid time format",
    },
  },
  // ══════════════════════════════════════════════════════
  // REFERENCE - Enhanced Validation
  // ══════════════════════════════════════════════════════

  reffBy: {
    type: String,
    trim: true,
    default: "",
  },

  refMemberNo: {
    type: String,
    trim: true,
    default: "",
  },

  refMebbe: { type: String, trim: true, default: "" },

  // ══════════════════════════════════════════════════════
  // PAYMENT - Enhanced Validation
  // ══════════════════════════════════════════════════════

  paymentMode: {
    type: String,
    enum: {
      values: ["UPI", "Cash", "CC"],
      message: "Payment: UPI, Cash, or CC only",
    },
    required: [true, "Payment mode required"],
  },

  dsAmount: {
    type: Number,
    default: 0,
    min: [0, "Amount cannot be negative"],
    max: [1000000, "Amount too high"],
  },

  rsAmount: {
    type: Number,
    default: 0,
    min: [0, "Amount cannot be negative"],
    max: [1000000, "Amount too high"],
  },

  totalAmount: {
    type: Number,
    default: 0,
    min: [0, "Total cannot be negative"],
  },

  withCover: {
    type: Number,
    default: 0,
    min: [0, "Count cannot be negative"],
    max: [100, "Guest count too high"],
  },

  withoutCover: {
    type: Number,
    default: 0,
    min: [0, "Count cannot be negative"],
    max: [100, "Guest count too high"],
  },

  // ══════════════════════════════════════════════════════
  // CATEGORY - Enhanced Validation
  // ══════════════════════════════════════════════════════

  category: {
    type: String,
    enum: {
      values: ["Normal", "VIP", "VVIP"],
      message: "Category: Normal, VIP, or VVIP only",
    },
    default: "Normal",
  },

  // ══════════════════════════════════════════════════════
  // PHOTOS - No validation (optional)
  // ══════════════════════════════════════════════════════

  livePhotoUrl: { type: String, default: "" },
  livePhotoPublicId: { type: String, default: "" },

  idFrontUrl: { type: String, default: "" },
  idFrontPublicId: { type: String, default: "" },

  idBackUrl: { type: String, default: "" },
  idBackPublicId: { type: String, default: "" },

  // ══════════════════════════════════════════════════════
  // ADDITIONAL FIELDS
  // ══════════════════════════════════════════════════════

  additional: { type: Boolean, default: false },

  remarks: {
    type: String,
    trim: true,
    default: "",
    maxlength: [500, "Remarks too long (max 500)"],
  },

 tableNo: {
  type: Number,
  default: null,
},
});

// ══════════════════════════════════════════════════════
// PRE-SAVE HOOKS
// ══════════════════════════════════════════════════════

// Auto-increment SR Number
entrySchema.pre("save", async function () {
  if (this.isNew) {
    const counter = await Counter.findOneAndUpdate(
      { _id: "entryCounter" },
      { $inc: { seq: 1 } },
      { returnDocument: "after", upsert: true },
    );
    if (!counter) throw new Error("Counter not found");
    this.srNo = counter.seq;
  }
});

// Virtual field for full name
entrySchema.virtual("fullName").get(function () {
  return `${this.name} ${this.surname}`;
});

const Entry = mongoose.model("Entry", entrySchema);

export default Entry;
