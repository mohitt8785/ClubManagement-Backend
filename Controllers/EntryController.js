import Entry from "../Models/Entry.model.js";
import cloudinary from "../Config/cloudinary.js";
import sendEntryConfirmation from "../utils/sendEmail.js";

// ─── GET All Entries ──────────────────────────────────────────
const getAllEntries = async (req, res) => {
  try {
    const { category, paymentMode, tableNo, date } = req.query;
    const filter = {};

    if (category) filter.category = category;
    if (paymentMode) filter.paymentMode = paymentMode;
    if (tableNo) filter.tableNo = Number(tableNo);

    if (date) {
      const start = new Date(date);
      start.setHours(0, 0, 0, 0);
      const end = new Date(date);
      end.setHours(23, 59, 59, 999);
      filter.createdAt = { $gte: start, $lte: end };
    }

    const entries = await Entry.find(filter).sort({ srNo: -1 });

    res.status(200).json({
      success: true,
      count: entries.length,
      data: entries,
    });
  } catch (error) {
    console.log("Get entries error:", error);
    res.status(500).json({
      success: false,
      message: "Server Error: Could not fetch entries",
      error: error.message,
    });
  }
};

// ─── GET Single Entry ─────────────────────────────────────────
const getEntryById = async (req, res) => {
  try {
    const entry = await Entry.findById(req.params.id);

    if (!entry) {
      return res.status(404).json({
        success: false,
        message: `Entry not found with ID: ${req.params.id}`,
      });
    }

    res.status(200).json({ success: true, data: entry });
  } catch (error) {
    if (error.name === "CastError") {
      return res
        .status(400)
        .json({ success: false, message: "Invalid Entry ID format" });
    }
    res
      .status(500)
      .json({ success: false, message: "Server Error", error: error.message });
  }
};

// ─── POST Create New Entry ────────────────────────────────────
const createEntry = async (req, res) => {
  try {
    // 🧹 Clean contact number
    if (req.body.contactNo) {
      req.body.contactNo = req.body.contactNo.replace(/\s+/g, "");
    }

    const { dsAmount = 0, rsAmount = 0 } = req.body;
    req.body.totalAmount = Number(dsAmount) + Number(rsAmount);

    if (
      !req.body.tableNo ||
      req.body.tableNo === "" ||
      isNaN(req.body.tableNo)
    ) {
      req.body.tableNo = null;
    } else {
      req.body.tableNo = Number(req.body.tableNo);
    }

    console.log("📤 Files received:", {
      livePhoto: req.files?.livePhoto?.[0]?.originalname,
      idFront: req.files?.idFront?.[0]?.originalname,
      idBack: req.files?.idBack?.[0]?.originalname,
    });

    // ✅ Manual Cloudinary Upload
    const { uploadToCloudinary } = await import("../Middlewares/upload.js");

    if (req.files?.livePhoto?.[0]) {
      console.log("📸 Uploading livePhoto to Cloudinary...");
      const result = await uploadToCloudinary(
        req.files.livePhoto[0],
        "live_photos",
        [{ width: 350, height: 450, crop: "fill" }],
      );
      req.body.livePhotoUrl = result.secure_url;
      req.body.livePhotoPublicId = result.public_id;
      console.log("✅ livePhoto uploaded:", result.secure_url);
    }

    if (req.files?.idFront?.[0]) {
      console.log("🪪 Uploading idFront to Cloudinary...");
      const result = await uploadToCloudinary(
        req.files.idFront[0],
        "id_front",
        [{ width: 800, height: 500, crop: "fit" }],
      );
      req.body.idFrontUrl = result.secure_url;
      req.body.idFrontPublicId = result.public_id;
      console.log("✅ idFront uploaded:", result.secure_url);
    }

    if (req.files?.idBack?.[0]) {
      console.log("🪪 Uploading idBack to Cloudinary...");
      const result = await uploadToCloudinary(req.files.idBack[0], "id_back", [
        { width: 800, height: 500, crop: "fit" },
      ]);
      req.body.idBackUrl = result.secure_url;
      req.body.idBackPublicId = result.public_id;
      console.log("✅ idBack uploaded:", result.secure_url);
    }

    const entry = new Entry(req.body);
    await entry.save();

    console.log("🟡 Entry created:", entry.srNo, "Contact:", entry.contactNo);

    // 📧 Email (non-blocking)
    if (entry.email) {
      sendEntryConfirmation({
        name: entry.name,
        surname: entry.surname,
        email: entry.email,
        srNo: entry.srNo,
        tableNo: entry.tableNo,
        entryTime: entry.entryTime,
      });
    }

    console.log("🟢 Entry saved & notifications sent");

    res.status(201).json({
      success: true,
      message: `✅ Entry saved! SR No: ${entry.srNo}`,
      data: entry,
    });
  } catch (error) {
    console.error("❌ createEntry error:", error);

    if (error.name === "ValidationError") {
      const errors = Object.values(error.errors).map((e) => ({
        field: e.path,
        message: e.message,
      }));
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors,
      });
    }

    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "Duplicate entry. Try again.",
      });
    }

    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};

// ─── PUT Update Entry ─────────────────────────────────────────
const updateEntry = async (req, res) => {
  try {
    // Amount recalculate
    if (req.body.dsAmount !== undefined || req.body.rsAmount !== undefined) {
      const existing = await Entry.findById(req.params.id);
      if (existing) {
        const ds =
          req.body.dsAmount !== undefined
            ? parseFloat(req.body.dsAmount)
            : existing.dsAmount;
        const rs =
          req.body.rsAmount !== undefined
            ? parseFloat(req.body.rsAmount)
            : existing.rsAmount;
        req.body.totalAmount = ds + rs;
      }
    }

    // ✅ Handle photo updates
    if (req.files) {
      const existing = await Entry.findById(req.params.id);

      // Update Live Photo
      if (req.files.livePhoto && req.files.livePhoto[0]) {
        if (existing?.livePhotoPublicId) {
          await cloudinary.uploader.destroy(existing.livePhotoPublicId);
        }
        req.body.livePhotoUrl = req.files.livePhoto[0].path;
        req.body.livePhotoPublicId = req.files.livePhoto[0].filename;
      }

      // Update ID Front
      if (req.files.idFront && req.files.idFront[0]) {
        if (existing?.idFrontPublicId) {
          await cloudinary.uploader.destroy(existing.idFrontPublicId);
        }
        req.body.idFrontUrl = req.files.idFront[0].path;
        req.body.idFrontPublicId = req.files.idFront[0].filename;
      }

      // Update ID Back
      if (req.files.idBack && req.files.idBack[0]) {
        if (existing?.idBackPublicId) {
          await cloudinary.uploader.destroy(existing.idBackPublicId);
        }
        req.body.idBackUrl = req.files.idBack[0].path;
        req.body.idBackPublicId = req.files.idBack[0].filename;
      }
    }

    const entry = await Entry.findByIdAndUpdate(req.params.id, req.body, {
      returnDocument: "after",
      runValidators: true,
    });

    if (!entry) {
      return res
        .status(404)
        .json({ success: false, message: "Entry not found" });
    }

    res
      .status(200)
      .json({ success: true, message: "Entry updated!", data: entry });
  } catch (error) {
    if (error.name === "CastError") {
      return res
        .status(400)
        .json({ success: false, message: "Invalid Entry ID" });
    }
    res
      .status(500)
      .json({ success: false, message: "Server Error", error: error.message });
  }
};

// ─── DELETE Entry ─────────────────────────────────────────────
const deleteEntry = async (req, res) => {
  try {
    const entry = await Entry.findByIdAndDelete(req.params.id);

    if (!entry) {
      return res
        .status(404)
        .json({ success: false, message: "Entry not found" });
    }

    // ✅ Delete all 3 photos from Cloudinary
    const deletePromises = [];

    if (entry.livePhotoPublicId) {
      deletePromises.push(cloudinary.uploader.destroy(entry.livePhotoPublicId));
    }
    if (entry.idFrontPublicId) {
      deletePromises.push(cloudinary.uploader.destroy(entry.idFrontPublicId));
    }
    if (entry.idBackPublicId) {
      deletePromises.push(cloudinary.uploader.destroy(entry.idBackPublicId));
    }

    if (deletePromises.length > 0) {
      await Promise.all(deletePromises);
      console.log(`🗑️ All photos deleted for SR No. ${entry.srNo}`);
    }

    res.status(200).json({
      success: true,
      message: `Entry SR No. ${entry.srNo} deleted!`,
    });
  } catch (error) {
    if (error.name === "CastError") {
      return res
        .status(400)
        .json({ success: false, message: "Invalid Entry ID" });
    }
    res
      .status(500)
      .json({ success: false, message: "Server Error", error: error.message });
  }
};

export { getAllEntries, getEntryById, createEntry, updateEntry, deleteEntry };
