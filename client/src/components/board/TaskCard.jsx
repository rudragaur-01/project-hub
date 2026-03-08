import { useDraggable } from "@dnd-kit/core";
import { cn } from "@/lib/utils";
import { PRIORITIES } from "@/lib/constants";

function getAssigneeName(members, assigneeId) {
  if (!assigneeId) return "Unassigned";
  const u = members.find((x) => x.id === assigneeId);
  return u ? u.name : "Unassigned";
}

function getPriorityLabel(priority) {
  return PRIORITIES.find((p) => p.value === priority)?.label ?? priority;
}

const priorityColors = {
  low: "bg-slate-100 text-slate-700",
  medium: "bg-amber-100 text-amber-800",
  high: "bg-red-100 text-red-800",
};

export default function TaskCard({ task, members = [], onClick }) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: task.id,
    data: { task },
  });

  const priorityClass = priorityColors[task.priority] ?? priorityColors.medium;

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      onClick={() => onClick(task)}
      className={cn(
        "rounded-lg border border-border bg-card p-3 shadow-sm cursor-grab active:cursor-grabbing text-left hover:border-ring/50 transition-colors",
        isDragging && "opacity-50 shadow-md",
      )}
    >
      <div className="flex justify-between">
        <p className="font-medium text-md text-foreground line-clamp-1">
          {task.title}
        </p>
        <span className={cn("text-xs px-1.5 py-0.5 rounded", priorityClass)}>
          {getPriorityLabel(task.priority)}
        </span>
      </div>

      <div className="flex justify-between items-center gap-1.5 mt-2">
          <p className="text-xs text-muted-foreground mt-1">
          {getAssigneeName(members, task.assigneeId)}
        </p>
        {task.dueDate && (
          <span className="text-xs text-muted-foreground">
            {new Date(task.dueDate).toLocaleDateString()}
          </span>
        )}
      </div>

      <div className="text-center">
        <p className="text-xs text-muted-foreground/80 mt-1.5 border-t border-border/50 pt-1.5">
          Click to open · comments & history
        </p>
      </div>
    </div>
  );
}
