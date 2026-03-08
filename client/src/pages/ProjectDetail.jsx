import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Pencil, Trash2 } from "lucide-react";
import { useState, useEffect } from "react";
import { useProjects } from "@/context/ProjectsContext";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import KanbanBoard from "@/components/board/KanbanBoard";
import ProjectEditModal from "@/components/project/ProjectEditModal";
import ProjectInviteSection from "@/components/project/ProjectInviteSection";
import api from "@/lib/api";

export default function ProjectDetail() {
  const { projectId } = useParams();
  const navigate = useNavigate();

  const { getProject, addTask, updateTask, updateProject, deleteProject } =
    useProjects();

  const { user } = useAuth();

  const project = getProject(projectId);

  const [projectMembers, setProjectMembers] = useState([]);

  const [inviteEmailInput, setInviteEmailInput] = useState("");
  const [inviteStatus, setInviteStatus] = useState({ type: "", text: "" });
  const [isInviteLoading, setIsInviteLoading] = useState(false);

  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editProjectName, setEditProjectName] = useState("");
  const [editProjectDescription, setEditProjectDescription] = useState("");
  const [isEditLoading, setIsEditLoading] = useState(false);

  const [isDeleteConfirm, setIsDeleteConfirm] = useState(false);
  const [isDeleteLoading, setIsDeleteLoading] = useState(false);

  const fetchProjectMembers = () => {
    if (!projectId) return;

    api
      .get(`/api/projects/${projectId}/members`)
      .then((res) => setProjectMembers(res.data || []))
      .catch(() => setProjectMembers([]));
  };

  useEffect(() => {
    if (!projectId || !project) return;
    fetchProjectMembers();
  }, [projectId, project]);

  const currentUserName = user?.name ?? "You";

  if (!project) {
    return (
      <div className="p-8 min-h-full">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate("/dashboard")}
          className="mb-4"
        >
          <ArrowLeft className="size-4 mr-1" />
          Back
        </Button>

        <div className="rounded-xl border border-border bg-muted/30 p-12 text-center">
          <p className="text-muted-foreground">Project not found.</p>

          <Button
            variant="outline"
            className="mt-4"
            onClick={() => navigate("/dashboard")}
          >
            Back to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  const projectTasks = project.tasks ?? [];

  const isOwner = projectMembers.some(
    (member) => member.id === user?.id && member.role === "owner"
  );

  const handleInvite = async (e) => {
    e.preventDefault();

    const email = inviteEmailInput.trim();
    if (!email) return;

    setInviteStatus({ type: "", text: "" });
    setIsInviteLoading(true);

    try {
      await api.post(`/api/projects/${projectId}/invite`, { email });

      setInviteEmailInput("");
      setInviteStatus({ type: "success", text: "Invite sent." });

      fetchProjectMembers();
    } catch (err) {
      setInviteStatus({
        type: "error",
        text: err.response?.data?.error || "Invite failed",
      });
    } finally {
      setIsInviteLoading(false);
    }
  };

  const openEditModal = () => {
    setEditProjectName(project.name);
    setEditProjectDescription(project.description || "");
    setIsEditOpen(true);
  };

  const handleProjectEdit = async (e) => {
    e.preventDefault();

    if (!editProjectName.trim()) return;

    setIsEditLoading(true);

    try {
      await updateProject(projectId, {
        name: editProjectName.trim(),
        description: editProjectDescription.trim(),
      });

      setIsEditOpen(false);
    } finally {
      setIsEditLoading(false);
    }
  };

  const handleProjectDelete = async () => {
    setIsDeleteLoading(true);

    try {
      await deleteProject(projectId);
      navigate("/dashboard");
    } finally {
      setIsDeleteLoading(false);
    }
  };

  return (
    <div className="p-2 min-h-full">
      <div className="flex items-center justify-between gap-4 mb-6 flex-wrap">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate("/dashboard")}
        >
          <ArrowLeft className="size-4 mr-1" />
          Back
        </Button>

        {isOwner && (
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={openEditModal}>
              <Pencil className="size-4 mr-1" />
              Edit
            </Button>

            {!isDeleteConfirm ? (
              <Button
                variant="outline"
                size="sm"
                className="text-destructive hover:text-destructive"
                onClick={() => setIsDeleteConfirm(true)}
              >
                <Trash2 className="size-4 mr-1" />
                Delete
              </Button>
            ) : (
              <span className="text-sm text-muted-foreground flex items-center gap-2">
                Remove this project and all its tasks?
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={handleProjectDelete}
                  disabled={isDeleteLoading}
                >
                  {isDeleteLoading ? "Deleting..." : "Yes, delete"}
                </Button>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsDeleteConfirm(false)}
                >
                  Cancel
                </Button>
              </span>
            )}
          </div>
        )}
      </div>

      <h1 className="text-2xl font-bold mb-1 ">{(project.name).toUpperCase()}</h1>

      {project.description && (
        <p className="text-muted-foreground mb-6">{project.description}</p>
      )}

      {isOwner && (
        <ProjectInviteSection
          email={inviteEmailInput}
          setEmail={setInviteEmailInput}
          loading={isInviteLoading}
          message={inviteStatus}
          onInvite={handleInvite}
        />
      )}

      <ProjectEditModal
        open={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        name={editProjectName}
        description={editProjectDescription}
        setName={setEditProjectName}
        setDescription={setEditProjectDescription}
        onSubmit={handleProjectEdit}
        loading={isEditLoading}
      />

      <KanbanBoard
        projectId={projectId}
        tasks={projectTasks}
        addTask={addTask}
        updateTask={updateTask}
        currentUserName={currentUserName}
        members={projectMembers}
      />
    </div>
  );
}