import { Router } from "express";
import {
  getAllEntries,
  getEntryById,
  createEntry,
  updateEntry,
  deleteEntry,
} from "../Controllers/EntryController.js";
import { entryValidationRules, validate } from "../Middlewares/validate.js";
import upload from "../Middlewares/upload.js";

const router = Router();

router.route("/")
  .get(getAllEntries)
  .post(
    upload,                   // ← 3 photos upload (livePhoto, idFront, idBack)
    ...entryValidationRules,  // ← Spread operator ✅
    validate,
    createEntry
  );

router.route("/:id")
  .get(getEntryById)
  .put(
    upload,
    ...entryValidationRules,  // ← Spread operator ✅
    validate,
    updateEntry
  )
  .delete(deleteEntry);

export default router;