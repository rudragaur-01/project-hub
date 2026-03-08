import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useProjects } from "@/context/ProjectsContext";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import CreateProjectModal from "@/components/project/CreateProjectModal";

export default function Dashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { projects, loading, addProject } = useProjects();

  const [openModal, setOpenModal] = useState(false);

  const name = user?.name || user?.email || "there";

  const projectCount = projects.length;

  const tasks = projects.flatMap((p) => p.tasks || []);
  const stats = tasks.reduce(
    (acc, task) => {
      if (task.status === "todo") acc.todo++;
      if (task.status === "in_progress") acc.inProgress++;
      if (task.status === "done") acc.done++;
      return acc;
    },
    { todo: 0, inProgress: 0, done: 0 },
  );
  const pendingTasks = stats.todo;
  const inProgressTasks = stats.inProgress;
  const completedTasks = stats.done;

  const createProject = () => setOpenModal(true);

  const handleCreate = ({ name, description }) => {
    addProject({ name, description });
  };

  const openProject = (id) => {
    navigate(`/projects/${id}`);
  };

  return (
    <div className="p-8 min-h-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold">Welcome back, {name}!</h1>
          <p className="text-muted-foreground mt-1">
            Here’s your project overview
          </p>
        </div>

        <Button
          onClick={createProject}
          className="bg-[#1a1a1a] hover:bg-[#2d2d2d] text-white"
        >
          <Plus className="size-4 mr-2" />
          New Project
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">
              Total Projects
            </CardTitle>
          </CardHeader>

          <CardContent>
            <p className="text-3xl font-bold">{projectCount}</p>
            <p className="text-sm text-muted-foreground mt-1">
              {projectCount === 0 ? "No projects yet" : "Projects created"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">
              Todo Tasks
            </CardTitle>
          </CardHeader>

          <CardContent>
            <p className="text-3xl font-bold">{pendingTasks}</p>
            <p className="text-sm text-muted-foreground mt-1">
              Tasks not started
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">
              In Progress
            </CardTitle>
          </CardHeader>

          <CardContent>
            <p className="text-3xl font-bold">{inProgressTasks}</p>
            <p className="text-sm text-muted-foreground mt-1">
              Currently being worked on
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">
              Completed Tasks
            </CardTitle>
          </CardHeader>

          <CardContent>
            <p className="text-3xl font-bold">{completedTasks}</p>
            <p className="text-sm text-muted-foreground mt-1">Tasks finished</p>
          </CardContent>
        </Card>
      </div>
      {/* Projects */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Projects</CardTitle>
          <CardDescription>
            Open a project to view boards and tasks
          </CardDescription>
        </CardHeader>

        <CardContent>
          {loading ? (
            <p className="text-center text-muted-foreground py-12">
              Loading...
            </p>
          ) : projects.length === 0 ? (
            <p className="text-center text-muted-foreground py-12">
              No projects yet. Click "New Project" to create one.
            </p>
          ) : (
           <div className="grid gap-4 grid-cols-[repeat(auto-fit,minmax(280px,1fr))]">
              {projects.map((project) => (
                <Card
                  key={project.id}
                  className="hover:border-ring/50 transition"
                >
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">{project.name}</CardTitle>

                    {project.description && (
                      <CardDescription className="line-clamp-2">
                        {project.description}
                      </CardDescription>
                    )}
                  </CardHeader>

                  <CardContent>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => openProject(project.id)}
                    >
                      Open
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <CreateProjectModal
        open={openModal}
        onClose={() => setOpenModal(false)}
        onCreate={handleCreate}
      />
    </div>
  );
}
