import Project from "../models/Project.js";

export async function projectAccess(req, res, next) {
 const projectId = req?.params?.projectId || req?.params?.id;

console.log(projectId);
    if (!projectId) return res.status(400).json({ error: "Project ID required" });

  const project = await Project.findById(projectId).lean();
  if (!project) return res.status(404).json({ error: "Project not found" });

  const userId = req.userId?.toString();
  const allowed =
    project.ownerId?.toString() === userId ||
    (project.memberIds || []).some((m) => m?.toString() === userId);

  if (!allowed) return res.status(403).json({ error: "Access denied" });

  req.project = project;
  next();
}
