import CrmTask from "../models/CrmTask.js";
import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";

export const getTasks = asyncHandler(async (req, res) => {
  const {
    status,
    assignedTo,
    priority,
    lead,
    page = 1,
    limit = 30,
  } = req.query;
  const filter = {};
  if (status) filter.status = status;
  if (assignedTo) filter.assignedTo = assignedTo;
  if (priority) filter.priority = priority;
  if (lead) filter.lead = lead;

  const [tasks, total] = await Promise.all([
    CrmTask.find(filter)
      .populate("assignedTo", "name email")
      .populate("lead", "fullName")
      .populate("createdBy", "name")
      .sort({ dueDate: 1 })
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .lean(),
    CrmTask.countDocuments(filter),
  ]);

  res.json({ success: true, data: { tasks, total } });
});

export const createTask = asyncHandler(async (req, res) => {
  const { title, lead, assignedTo, dueDate, priority, description } = req.body;
  if (!title) throw new ApiError(400, "Title is required");
  //   if (!assignedTo) throw new ApiError(400, "assignedTo is required");
  const assignee = assignedTo || req.user._id;

  const task = await CrmTask.create({
    title,
    lead: lead || null,
    assignedTo: assignee,
    dueDate: dueDate ? new Date(dueDate) : null,
    priority: priority || "medium",
    description: description || "",
    createdBy: req.user._id,
  });

  res.status(201).json({ success: true, data: task });
});

export const updateTask = asyncHandler(async (req, res) => {
  const allowed = [
    "title",
    "assignedTo",
    "dueDate",
    "priority",
    "status",
    "description",
  ];
  const updates = {};
  for (const key of allowed) {
    if (req.body[key] !== undefined) updates[key] = req.body[key];
  }

  const task = await CrmTask.findByIdAndUpdate(req.params.id, updates, {
    new: true,
    runValidators: true,
  });
  if (!task) throw new ApiError(404, "Task not found");

  res.json({ success: true, data: task });
});

export const deleteTask = asyncHandler(async (req, res) => {
  const task = await CrmTask.findByIdAndDelete(req.params.id);
  if (!task) throw new ApiError(404, "Task not found");
  res.json({ success: true, message: "Task deleted" });
});
