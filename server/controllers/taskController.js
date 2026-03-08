import mongoose from "mongoose";
import Task from "../models/Task.js";

const isValidId = (id) =>
  id && typeof id === "string" && mongoose.Types.ObjectId.isValid(id) && String(new mongoose.Types.ObjectId(id)) === id;

const taskResponse = (t) => ({
  id: t._id.toString(),
  title: t.title,
  description: t.description || "",
  status: t.status,
  priority: t.priority,
  dueDate: t.dueDate || "",
  assigneeId: t.assigneeId ? t.assigneeId.toString() : "",
  comments: t.comments || [],
  activity: t.activity || [],
  createdAt: t.createdAt,
});

export async function create(req, res) {
  try {
    const projectId = req.params.projectId;
    const { title, description, status, priority, dueDate, assigneeId } =
      req.body;

    if (!title?.trim()) {
      return res.status(400).json({ error: "Title is required" });
    }

    const now = new Date().toISOString();

    const task = await Task.create({
      projectId,
      title: title.trim(),
      description: (description || "").trim(),
      status: status || "todo",
      priority: priority || "medium",
      dueDate: dueDate || "",
      assigneeId: assigneeId || null,
      activity: [{ action: "Task created", date: now }],
    });

    return res.status(201).json(taskResponse(task));
  } catch (err) {
    console.error("Create task error:", err);
    return res.status(500).json({ error: "Failed to create task" });
  }
}

export async function update(req, res) {
  try {
    const { projectId, taskId } = req.params;

    if (!isValidId(projectId)) {
      return res.status(400).json({ error: "Invalid project ID" });
    }
    if (!isValidId(taskId)) {
      return res.status(400).json({ error: "Invalid task ID" });
    }

    const task = await Task.findOne({ _id: taskId, projectId });
    if (!task) {
      return res.status(404).json({ error: "Task not found" });
    }

    const fields = [
      "title",
      "description",
      "status",
      "priority",
      "dueDate",
      "assigneeId",
      "comments",
    ];
    const updates = {};
    for (const f of fields) {
      if (req.body[f] !== undefined) updates[f] = req.body[f];
    }

    if (updates.assigneeId === "") updates.assigneeId = null;
    if (updates.assigneeId && !isValidId(updates.assigneeId)) {
      return res.status(400).json({ error: "Invalid assignee ID" });
    }

    const now = new Date().toISOString();

    if (updates.status && updates.status !== task.status) {
      const labels = { todo: "Todo", in_progress: "In Progress", done: "Done" };
      task.activity.push({
        action: `Status changed to ${labels[updates.status] || updates.status}`,
        date: now,
      });
    }

    if (updates.assigneeId !== undefined) {
      task.activity.push({
        action: updates.assigneeId ? "Assignee updated" : "Assignee cleared",
        date: now,
      });
    }

    if (
      updates.comments &&
      updates.comments.length > (task.comments?.length || 0)
    ) {
      task.activity.push({ action: "Comment added", date: now });
    }

    Object.assign(task, updates);
    await task.save();

    return res.json(taskResponse(task));
  } catch (err) {
    console.error("Update task error:", err);
    return res.status(500).json({ error: "Failed to update task" });
  }
}
