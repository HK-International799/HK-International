// import express from "express";
// import authMiddleware from "../middleware/authMiddleware.js";
// import roleMiddleware from "../middleware/roleMiddleware.js";

// import { getCrmDashboard }                  from "../controllers/crmDashboardController.js";
// import {
//   getLeads, getLeadById, createLead, updateLead,
//   deleteLead, assignLead, convertLead, exportLeadsCsv,
// }                                           from "../controllers/crmLeadController.js";
// import {
//   getFollowUps, createFollowUp, updateFollowUp, deleteFollowUp,
// }                                           from "../controllers/crmFollowUpController.js";
// import {
//   getTasks, createTask, updateTask, deleteTask,
// }                                           from "../controllers/crmTaskController.js";
// import {
//   getContacts, getContactById, createContact, updateContact, deleteContact,
// }                                           from "../controllers/crmContactController.js";
// import {
//   getOrgs, getOrgById, createOrg, updateOrg, deleteOrg,
// }                                           from "../controllers/crmOrgController.js";

// const router = express.Router();

// // All CRM routes require auth + admin or super_admin
// router.use(authMiddleware, roleMiddleware(["admin", "super_admin"]));

// // ── Dashboard ──────────────────────────────────────────────────────────────
// router.get("/dashboard", getCrmDashboard);

// // ── Leads ──────────────────────────────────────────────────────────────────
// router.get(   "/leads/export/csv",  exportLeadsCsv);
// router.get(   "/leads",             getLeads);
// router.post(  "/leads",             createLead);
// router.get(   "/leads/:id",         getLeadById);
// router.put(   "/leads/:id",         updateLead);
// router.delete("/leads/:id",         deleteLead);
// router.patch( "/leads/:id/assign",  assignLead);
// router.post(  "/leads/:id/convert", convertLead);

// // ── Follow-ups ─────────────────────────────────────────────────────────────
// router.get(   "/followups",     getFollowUps);
// router.post(  "/followups",     createFollowUp);
// router.put(   "/followups/:id", updateFollowUp);
// router.delete("/followups/:id", deleteFollowUp);

// // ── Tasks ──────────────────────────────────────────────────────────────────
// router.get(   "/tasks",     getTasks);
// router.post(  "/tasks",     createTask);
// router.put(   "/tasks/:id", updateTask);
// router.delete("/tasks/:id", deleteTask);

// // ── Contacts ───────────────────────────────────────────────────────────────
// router.get(   "/contacts",     getContacts);
// router.post(  "/contacts",     createContact);
// router.get(   "/contacts/:id", getContactById);
// router.put(   "/contacts/:id", updateContact);
// router.delete("/contacts/:id", deleteContact);

// // ── Organisations ──────────────────────────────────────────────────────────
// router.get(   "/organisations",     getOrgs);
// router.post(  "/organisations",     createOrg);
// router.get(   "/organisations/:id", getOrgById);
// router.put(   "/organisations/:id", updateOrg);
// router.delete("/organisations/:id", deleteOrg);

// export default router;


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

// All CRM routes require authentication
router.use(authMiddleware);

// Helper: write operations restricted to admin/super_admin only
const adminOnly  = roleMiddleware(["admin", "super_admin"]);

// Read + create allowed for sales_agent; destructive ops remain admin-only
const crmAccess  = roleMiddleware(["admin", "super_admin", "sales_agent"]);

// ── Dashboard ──────────────────────────────────────────────────────────────
router.get("/dashboard", crmAccess, getCrmDashboard);

// ── Leads ──────────────────────────────────────────────────────────────────
router.get(   "/leads/export/csv",  crmAccess,  exportLeadsCsv);
router.get(   "/leads",             crmAccess,  getLeads);
router.post(  "/leads",             crmAccess,  createLead);
router.get(   "/leads/:id",         crmAccess,  getLeadById);
router.put(   "/leads/:id",         crmAccess,  updateLead);
router.delete("/leads/:id",         adminOnly,  deleteLead);         // admin only
router.patch( "/leads/:id/assign",  adminOnly,  assignLead);         // admin only
router.post(  "/leads/:id/convert", adminOnly,  convertLead);        // admin only

// ── Follow-ups ─────────────────────────────────────────────────────────────
router.get(   "/followups",     crmAccess,  getFollowUps);
router.post(  "/followups",     crmAccess,  createFollowUp);
router.put(   "/followups/:id", crmAccess,  updateFollowUp);
router.delete("/followups/:id", adminOnly,  deleteFollowUp);         // admin only

// ── Tasks ──────────────────────────────────────────────────────────────────
router.get(   "/tasks",     crmAccess,  getTasks);
router.post(  "/tasks",     crmAccess,  createTask);
router.put(   "/tasks/:id", crmAccess,  updateTask);
router.delete("/tasks/:id", adminOnly,  deleteTask);                 // admin only

// ── Contacts ───────────────────────────────────────────────────────────────
router.get(   "/contacts",     crmAccess,  getContacts);
router.post(  "/contacts",     crmAccess,  createContact);
router.get(   "/contacts/:id", crmAccess,  getContactById);
router.put(   "/contacts/:id", crmAccess,  updateContact);
router.delete("/contacts/:id", adminOnly,  deleteContact);           // admin only

// ── Organisations ──────────────────────────────────────────────────────────
router.get(   "/organisations",     crmAccess,  getOrgs);
router.post(  "/organisations",     crmAccess,  createOrg);
router.get(   "/organisations/:id", crmAccess,  getOrgById);
router.put(   "/organisations/:id", crmAccess,  updateOrg);
router.delete("/organisations/:id", adminOnly,  deleteOrg);          // admin only

export default router;