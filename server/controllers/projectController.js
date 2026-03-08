import Project from "../models/Project.js";
import Task from "../models/Task.js";
import User from "../models/User.js";

const id = (v) => (v?._id ?? v)?.toString();

const canAccess = (project, userId) =>
  id(project.ownerId) === userId ||
  (project.memberIds || []).some((m) => id(m) === userId);

const projectResponse = (p, tasks = []) => ({
  id: p._id.toString(),
  name: p.name,
  description: p.description || "",
  tasks: tasks.map(taskResponse),
});

const taskResponse = (t) => ({
  id: t._id.toString(),
  title: t.title,
  description: t.description || "",
  status: t.status || "todo",
  priority: t.priority || "medium",
  dueDate: t.dueDate || "",
  assigneeId: t.assigneeId || "",
  comments: t.comments || [],
  activity: t.activity || [],
  createdAt: t.createdAt,
});

export async function list(req, res) {
  try {
    const userId = req.userId;

    const projects = await Project.find({
      $or: [{ ownerId: userId }, { memberIds: userId }],
    })
      .sort({ updatedAt: -1 })
      .lean();

    const projectIds = projects.map((p) => p._id);

    const tasks = await Task.find({ projectId: { $in: projectIds } }).lean();

    const taskMap = {};
    for (const t of tasks) {
      const pid = t.projectId.toString();
      if (!taskMap[pid]) taskMap[pid] = [];
      taskMap[pid].push(t);
    }

    return res.json(
      projects.map((p) =>
        projectResponse(p, taskMap[p._id.toString()] || [])
      )
    );
  } catch (err) {
    console.error("List projects error:", err);
    return res.status(500).json({ error: "Failed to list projects" });
  }
}

export async function create(req, res) {
  try {
    const { name, description } = req.body;

    if (!name?.trim()) {
      return res.status(400).json({ error: "Project name is required" });
    }

    const project = await Project.create({
      name: name.trim(),
      description: (description || "").trim(),
      ownerId: req.userId,
    });

    return res.status(201).json(projectResponse(project));
  } catch (err) {
    console.error("Create project error:", err);
    return res.status(500).json({ error: "Failed to create project" });
  }
}

export async function update(req, res) {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ error: "Project not found" });
    }

    if (id(project.ownerId) !== req.userId) {
      return res.status(403).json({ error: "Only owner can update" });
    }

    const { name, description } = req.body;

    if (name !== undefined) project.name = name.trim() || project.name;
    if (description !== undefined) project.description = description.trim();

    await project.save();

    const tasks = await Task.find({ projectId: project._id }).lean();

    return res.json(projectResponse(project, tasks));
  } catch (err) {
    console.error("Update project error:", err);
    return res.status(500).json({ error: "Failed to update project" });
  }
}

export async function remove(req, res) {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ error: "Project not found" });
    }

    if (id(project.ownerId) !== req.userId) {
      return res.status(403).json({ error: "Only owner can delete" });
    }

    await Task.deleteMany({ projectId: project._id });
    await Project.findByIdAndDelete(req.params.id);

    return res.status(204).send();
  } catch (err) {
    console.error("Delete project error:", err);
    return res.status(500).json({ error: "Failed to delete project" });
  }
}

export async function getOne(req, res) {
  try {
    const project = await Project.findById(req.params.id).lean();

    if (!project) {
      return res.status(404).json({ error: "Project not found" });
    }

    if (!canAccess(project, req.userId)) {
      return res.status(403).json({ error: "Access denied" });
    }

    const tasks = await Task.find({ projectId: project._id }).lean();

    return res.json(projectResponse(project, tasks));
  } catch (err) {
    console.error("Get project error:", err);
    return res.status(500).json({ error: "Failed to get project" });
  }
}

export async function invite(req, res) {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ error: "Project not found" });
    }

    if (id(project.ownerId) !== req.userId) {
      return res.status(403).json({ error: "Only owner can invite" });
    }

    const { email } = req.body;

    if (!email?.trim()) {
      return res.status(400).json({ error: "Email is required" });
    }

    const user = await User.findOne({
      email: email.trim().toLowerCase(),
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const uid = user._id.toString();

    if (uid === id(project.ownerId)) {
      return res.status(400).json({ error: "Owner is already a member" });
    }

    if ((project.memberIds || []).some((m) => id(m) === uid)) {
      return res.status(400).json({ error: "User already a member" });
    }

    project.memberIds.push(user._id);
    await project.save();

    return res.json({ message: "Invited" });
  } catch (err) {
    console.error("Invite error:", err);
    return res.status(500).json({ error: "Invite failed" });
  }
}

export async function members(req, res) {
  try {
    const project = await Project.findById(req.params.id)
      .populate("ownerId", "name email")
      .populate("memberIds", "name email")
      .lean();

    if (!project) {
      return res.status(404).json({ error: "Project not found" });
    }

    if (!canAccess(project, req.userId)) {
      return res.status(403).json({ error: "Access denied" });
    }

    const owner = {
      id: project.ownerId._id.toString(),
      name: project.ownerId.name,
      email: project.ownerId.email,
      role: "owner",
    };

    const members = (project.memberIds || []).map((m) => ({
      id: m._id.toString(),
      name: m.name,
      email: m.email,
      role: "member",
    }));

    return res.json([owner, ...members]);
  } catch (err) {
    console.error("Members error:", err);
    return res.status(500).json({ error: "Failed to get members" });
  }
}