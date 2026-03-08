import { useState, useMemo } from "react";
import {
  DndContext,
  DragOverlay,
  useDroppable,
  pointerWithin,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { STATUSES, PRIORITIES } from "@/lib/constants";
import { cn } from "@/lib/utils";
import TaskCard from "./TaskCard";
import { Button } from "@/components/ui/button";
import { Plus, Search } from "lucide-react";
import CreateTaskModal from "@/components/task/CreateTaskModal";
import TaskDetailModal from "@/components/task/TaskDetailModal";
import TaskFilters from "./TaskFilters";

const COLUMN_IDS = STATUSES.map((status) => status.value);

function DroppableColumn({ id, title, children }) {
  const { setNodeRef } = useDroppable({ id });

  return (
    <div
      ref={setNodeRef}
      className="rounded-xl border border-border bg-muted/20 p-3 min-h-[220px] flex flex-col"
    >
      <h3 className="text-sm font-semibold mb-2 px-1">{title}</h3>
      <div className="flex-1 space-y-2 overflow-y-auto">{children}</div>
    </div>
  );
}

function DragPreviewCard({ task }) {
  return (
    <div className="rounded-lg border border-border bg-card p-3 shadow-lg w-64">
      <p className="font-medium text-sm">{task.title}</p>
      <p className="text-xs text-muted-foreground mt-1">
        {PRIORITIES.find((p) => p.value === task.priority)?.label ??
          task.priority}
      </p>
    </div>
  );
}

export default function KanbanBoard({
  projectId,
  tasks,
  addTask,
  updateTask,
  currentUserName,
  members = [],
}) {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);

  const [statusFilter, setStatusFilter] = useState("");
  const [assigneeFilter, setAssigneeFilter] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("");
  const [dueDateFilter, setDueDateFilter] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const [draggingTask, setDraggingTask] = useState(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
  );

  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      if (statusFilter && task.status !== statusFilter) return false;
      if (assigneeFilter && task.assigneeId !== assigneeFilter) return false;
      if (priorityFilter && task.priority !== priorityFilter) return false;

      if (dueDateFilter) {
        const taskDate = task.dueDate ? task.dueDate.slice(0, 10) : "";
        if (taskDate !== dueDateFilter) return false;
      }

      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const match =
          task.title?.toLowerCase().includes(q) ||
          task.description?.toLowerCase().includes(q);

        if (!match) return false;
      }

      return true;
    });
  }, [
    tasks,
    statusFilter,
    assigneeFilter,
    priorityFilter,
    dueDateFilter,
    searchQuery,
  ]);

  const tasksByColumn = useMemo(() => {
    const map = { todo: [], in_progress: [], done: [] };

    filteredTasks.forEach((task) => {
      const status = task.status || "todo";
      if (map[status]) map[status].push(task);
    });

    return map;
  }, [filteredTasks]);

  const handleDragStart = (event) => {
    const task = event.active.data.current?.task;
    if (task) setDraggingTask(task);
  };

  const handleDragEnd = (event) => {
    setDraggingTask(null);

    const { active, over } = event;
    if (!over) return;

    const taskId = active.id;
    let newStatus = over.id;

    if (!COLUMN_IDS.includes(newStatus)) {
      const targetTask = tasks.find((task) => task.id === over.id);
      if (targetTask) newStatus = targetTask.status;
    }

    if (COLUMN_IDS.includes(newStatus)) {
      const task = tasks.find((t) => t.id === taskId);

      if (task && task.status !== newStatus) {
        updateTask(projectId, taskId, { status: newStatus });
      }
    }
  };

  const handleCreateTask = (taskData) => {
    addTask(projectId, taskData);
  };

  const selectStyles =
    "h-8 rounded-lg border border-input bg-background px-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";

  const clearFilters = () => {
    setStatusFilter("");
    setAssigneeFilter("");
    setPriorityFilter("");
    setDueDateFilter("");
    setSearchQuery("");
  };

  return (
    <div className="space-y-4">
      <TaskFilters
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        assigneeFilter={assigneeFilter}
        setAssigneeFilter={setAssigneeFilter}
        priorityFilter={priorityFilter}
        setPriorityFilter={setPriorityFilter}
        dueDateFilter={dueDateFilter}
        setDueDateFilter={setDueDateFilter}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        members={members}
        clearFilters={clearFilters}
        openCreateModal={() => setIsCreateModalOpen(true)}
      />

      <DndContext
        sensors={sensors}
        collisionDetection={pointerWithin}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {STATUSES.map((column) => (
            <DroppableColumn
              key={column.value}
              id={column.value}
              title={column.label}
            >
              {tasksByColumn[column.value]?.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  members={members}
                  onClick={() => setSelectedTask(task)}
                />
              ))}
            </DroppableColumn>
          ))}
        </div>

        <DragOverlay>
          {draggingTask ? <DragPreviewCard task={draggingTask} /> : null}
        </DragOverlay>
      </DndContext>

      <CreateTaskModal
        open={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreate={handleCreateTask}
        members={members}
      />

      <TaskDetailModal
        open={!!selectedTask}
        task={
          selectedTask
            ? (tasks.find((t) => t.id === selectedTask.id) ?? selectedTask)
            : null
        }
        projectId={projectId}
        onClose={() => setSelectedTask(null)}
        onUpdate={updateTask}
        currentUserName={currentUserName}
        members={members}
      />
    </div>
  );
}
