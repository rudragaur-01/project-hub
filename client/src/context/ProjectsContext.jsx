import { createContext, useContext, useState, useCallback, useEffect } from "react";
import { useAuth } from "./AuthContext";
import api from "@/lib/api";

const ProjectsContext = createContext(null);

export function ProjectsProvider({ children }) {
  const { isAuthenticated } = useAuth();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      setProjects([]);
      return;
    }
    setLoading(true);
    api
      .get("/api/projects")
      .then((res) => setProjects(Array.isArray(res.data) ? res.data : []))
      .catch(() => setProjects([]))
      .finally(() => setLoading(false));
  }, [isAuthenticated]);

  const addProject = useCallback(async (project) => {
    const { data } = await api.post("/api/projects", {
      name: project.name,
      description: project.description,
    });
    setProjects((prev) => [...prev, data]);
    return data;
  }, []);

  const getProject = useCallback(
    (id) => projects.find((p) => p.id === id) || null,
    [projects]
  );

  const addTask = useCallback(async (projectId, task) => {
    const { data } = await api.post(`/api/projects/${projectId}/tasks`, {
      title: task.title,
      description: task.description,
      status: task.status,
      priority: task.priority,
      dueDate: task.dueDate,
      assigneeId: task.assigneeId,
    });
    setProjects((prev) =>
      prev.map((p) =>
        p.id === projectId ? { ...p, tasks: [...(p.tasks || []), data] } : p
      )
    );
    return data;
  }, []);

  const updateTask = useCallback(async (projectId, taskId, updates) => {
    const { data } = await api.patch(
      `/api/projects/${projectId}/tasks/${taskId}`,
      updates
    );
    setProjects((prev) =>
      prev.map((p) => {
        if (p.id !== projectId) return p;
        return {
          ...p,
          tasks: (p.tasks || []).map((t) => (t.id === taskId ? data : t)),
        };
      })
    );
  }, []);

  const updateProject = useCallback(async (projectId, updates) => {
    const { data } = await api.patch(`/api/projects/${projectId}`, updates);
    setProjects((prev) =>
      prev.map((p) => (p.id === projectId ? data : p))
    );
    return data;
  }, []);

  const deleteProject = useCallback(async (projectId) => {
    await api.delete(`/api/projects/${projectId}`);
    setProjects((prev) => prev.filter((p) => p.id !== projectId));
  }, []);

  return (
    <ProjectsContext.Provider
      value={{ projects, loading, addProject, getProject, addTask, updateTask, updateProject, deleteProject }}
    >
      {children}
    </ProjectsContext.Provider>
  );
}

export function useProjects() {
  const ctx = useContext(ProjectsContext);
  if (!ctx) throw new Error("useProjects must be used within ProjectsProvider");
  return ctx;
}
