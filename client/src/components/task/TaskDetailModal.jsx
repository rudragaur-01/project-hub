import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { STATUSES, PRIORITIES } from "@/lib/constants";
import { cn } from "@/lib/utils";

function getAssigneeName(members, assigneeId) {
  if (!assigneeId) return "Unassigned";
  const u = members.find((x) => x.id === assigneeId);
  return u ? u.name : "Unassigned";
}

export default function TaskDetailModal({
  open,
  task,
  projectId,
  onClose,
  onUpdate,
  currentUserName = "You",
  members = [],
}) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState("todo");
  const [priority, setPriority] = useState("medium");
  const [dueDate, setDueDate] = useState("");
  const [assigneeId, setAssigneeId] = useState("");
  const [commentText, setCommentText] = useState("");

  useEffect(() => {
    if (task) {
      setTitle(task.title);
      setDescription(task.description ?? "");
      setStatus(task.status ?? "todo");
      setPriority(task.priority ?? "medium");
      setDueDate(task.dueDate ?? "");
      setAssigneeId(task.assigneeId ?? "");
    }
  }, [task]);

  if (!open) return null;

  const comments = task?.comments ?? [];
  const activity = task?.activity ?? [];
  const selectClass =
    "h-8 w-full rounded-lg border border-input bg-transparent px-2.5 py-1 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";

  const handleSave = () => {
    if (!task) return;
    onUpdate(projectId, task.id, {
      title: title.trim(),
      description: description.trim(),
      status,
      priority,
      dueDate: dueDate || undefined,
      assigneeId: assigneeId || undefined,
    });
    onClose();
  };

  const handleAddComment = (e) => {
    e.preventDefault();
    const text = commentText.trim();
    if (!text) return;
    const newComment = {
      author: currentUserName,
      text,
      date: new Date().toISOString(),
    };
    onUpdate(projectId, task.id, {
      comments: [...comments, newComment],
    });
    setCommentText("");
  };

  function formatDate(iso) {
    if (!iso) return "";

    return new Date(iso).toLocaleString(undefined, {
      dateStyle: "medium",
      timeStyle: "short",
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
        aria-hidden
      />
      <Card className="relative w-full max-w-xl bg-card shadow-lg max-h-[90vh] overflow-auto">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div className=" w-full">
            <CardTitle>Task</CardTitle>
            <p className="text-xs text-muted-foreground mt-0.5">
              Scroll down for Activity & Comments
            </p>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            ×
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Title</Label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Title"
            />
          </div>
          <div className="space-y-2">
            <Label>Description</Label>
            <Input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Description"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Status</Label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className={cn(selectClass)}
              >
                {STATUSES.map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label>Priority</Label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className={cn(selectClass)}
              >
                {PRIORITIES.map((p) => (
                  <option key={p.value} value={p.value}>
                    {p.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="space-y-2">
            <Label>Due date</Label>
            <Input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>Assignee</Label>
            <select
              value={assigneeId}
              onChange={(e) => setAssigneeId(e.target.value)}
              className={cn(selectClass)}
            >
              <option value="">Unassigned</option>
              {members.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name}
                </option>
              ))}
            </select>
          </div>
          <div className="flex gap-2 justify-end border-t pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleSave}>Save</Button>
          </div>

          {/* Activity history */}
          <div className="border-t pt-4 space-y-2">
            <Label>Activity</Label>
            <div className="space-y-1.5 max-h-28 overflow-auto rounded-lg bg-muted/30 p-2">
              {activity.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No activity yet.
                </p>
              ) : (
                [...activity].reverse().map((a, i) => (
                  <div key={i} className="flex items-start gap-2 text-sm">
                    <span className="text-muted-foreground shrink-0">
                      {formatDate(a.date)}
                    </span>
                    <span className="text-foreground">{a.action}</span>
                    <p>Assigned to: {getAssigneeName(members, assigneeId)}</p>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Comments */}
          <div className="border-t pt-4 space-y-2">
            <Label>Comments ({comments.length})</Label>
            <div className="space-y-2 max-h-36 overflow-auto">
              {comments.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No comments yet. Add one below.
                </p>
              ) : (
                comments.map((c, i) => (
                  <div
                    key={i}
                    className="rounded-lg bg-muted/50 px-3 py-2 text-sm flex gap-3"
                  >
                    <div className="min-w-[120px]">
                      <p className="font-medium text-foreground">{c.author}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {formatDate(c.date)}
                      </p>
                    </div>

                    <div className="flex-1">
                      <p className="text-muted-foreground">{c.text}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
            <form onSubmit={handleAddComment} className="flex gap-2 mt-2">
              <Input
                placeholder="Add a comment..."
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                className="flex-1"
              />
              <Button type="submit" size="sm">
                Add comment
              </Button>
            </form>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
