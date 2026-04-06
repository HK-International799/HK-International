import express from "express";
import {
  submitContact,
  getAllContacts,
  getContactById,
  updateContactStatus,
  deleteContact,
} from "../controllers/contactController.js";

const router = express.Router();

/* Submit Contact */
router.post("/", submitContact);

/* Admin */
router.get("/", getAllContacts);

router.get("/:id", getContactById);

router.put("/:id", updateContactStatus);

router.delete("/:id", deleteContact);

export default router;