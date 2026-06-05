import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import roleMiddleware from "../middleware/roleMiddleware.js";

import { getCrmDashboard }                  from "../controllers/crmDashboardController.js";
import {
  getLeads, getLeadById, createLead, updateLead,
  deleteLead, assignLead, convertLead, exportLeadsCsv,
}                                           from "../controllers/crmLeadController.js";
import {
  getFollowUps, createFollowUp, updateFollowUp, deleteFollowUp,
}                                           from "../controllers/crmFollowUpController.js";
import {
  getTasks, createTask, updateTask, deleteTask,
}                                           from "../controllers/crmTaskController.js";
import {
  getContacts, getContactById, createContact, updateContact, deleteContact,
}                                           from "../controllers/crmContactController.js";
import {
  getOrgs, getOrgById, createOrg, updateOrg, deleteOrg,
}                                           from "../controllers/crmOrgController.js";

const router = express.Router();

// All CRM routes require auth + admin or super_admin
router.use(authMiddleware, roleMiddleware(["admin", "super_admin"]));

// ── Dashboard ──────────────────────────────────────────────────────────────
router.get("/dashboard", getCrmDashboard);

// ── Leads ──────────────────────────────────────────────────────────────────
router.get(   "/leads/export/csv",  exportLeadsCsv);
router.get(   "/leads",             getLeads);
router.post(  "/leads",             createLead);
router.get(   "/leads/:id",         getLeadById);
router.put(   "/leads/:id",         updateLead);
router.delete("/leads/:id",         deleteLead);
router.patch( "/leads/:id/assign",  assignLead);
router.post(  "/leads/:id/convert", convertLead);

// ── Follow-ups ─────────────────────────────────────────────────────────────
router.get(   "/followups",     getFollowUps);
router.post(  "/followups",     createFollowUp);
router.put(   "/followups/:id", updateFollowUp);
router.delete("/followups/:id", deleteFollowUp);

// ── Tasks ──────────────────────────────────────────────────────────────────
router.get(   "/tasks",     getTasks);
router.post(  "/tasks",     createTask);
router.put(   "/tasks/:id", updateTask);
router.delete("/tasks/:id", deleteTask);

// ── Contacts ───────────────────────────────────────────────────────────────
router.get(   "/contacts",     getContacts);
router.post(  "/contacts",     createContact);
router.get(   "/contacts/:id", getContactById);
router.put(   "/contacts/:id", updateContact);
router.delete("/contacts/:id", deleteContact);

// ── Organisations ──────────────────────────────────────────────────────────
router.get(   "/organisations",     getOrgs);
router.post(  "/organisations",     createOrg);
router.get(   "/organisations/:id", getOrgById);
router.put(   "/organisations/:id", updateOrg);
router.delete("/organisations/:id", deleteOrg);

export default router;