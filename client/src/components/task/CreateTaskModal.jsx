import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { STATUSES, PRIORITIES } from "@/lib/constants";
import { cn } from "@/lib/utils";

const initialForm = {
  title: "",
  description: "",
  status: "todo",
  priority: "medium",
  dueDate: "",
  assigneeId: "",
};

export default function CreateTaskModal({
  open,
  onClose,
  onCreate,
  members = [],
}) {
  const [form, setForm] = useState(initialForm);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  if (!open) return null;

  const updateField = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const resetForm = () => {
    setForm(initialForm);
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const trimmedTitle = form.title.trim();

    if (!trimmedTitle) {
      setError("Title is required");
      return;
    }

    setLoading(true);

    try {
      await onCreate({
        title: trimmedTitle,
        description: form.description.trim(),
        status: form.status,
        priority: form.priority,
        dueDate: form.dueDate || undefined,
        assigneeId: form.assigneeId || undefined,
      });

      resetForm();
      onClose();
    } catch {
      setError("Failed to create task");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const selectClass =
    "h-8 w-full rounded-lg border border-input bg-transparent px-2.5 py-1 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/50"
        onClick={handleClose}
        aria-hidden
      />

      <Card className="relative w-full max-w-md bg-card shadow-lg max-h-[90vh] overflow-auto">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle>New Task</CardTitle>

          <Button variant="ghost" size="icon" onClick={handleClose}>
            ×
          </Button>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>Title</Label>
              <Input
                placeholder="Task title"
                value={form.title}
                onChange={(e) => updateField("title", e.target.value)}
                autoFocus
              />
            </div>

            <div className="space-y-2">
              <Label>Description (optional)</Label>
              <Input
                placeholder="Description"
                value={form.description}
                onChange={(e) =>
                  updateField("description", e.target.value)
                }
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Status</Label>
                <select
                  value={form.status}
                  onChange={(e) => updateField("status", e.target.value)}
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
                  value={form.priority}
                  onChange={(e) => updateField("priority", e.target.value)}
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
              <Label>Due date (optional)</Label>
              <Input
                type="date"
                value={form.dueDate}
                onChange={(e) => updateField("dueDate", e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Assignee (optional)</Label>
              <select
                value={form.assigneeId}
                onChange={(e) =>
                  updateField("assigneeId", e.target.value)
                }
                className={cn(selectClass)}
              >
                <option value="">Unassigned</option>

                {members.map((member) => (
                  <option key={member.id} value={member.id}>
                    {member.name}
                  </option>
                ))}
              </select>
            </div>

            {error && (
              <p className="text-sm text-destructive">{error}</p>
            )}

            <div className="flex gap-2 justify-end pt-2">
              <Button type="button" variant="outline" onClick={handleClose}>
                Cancel
              </Button>

              <Button type="submit" disabled={loading}>
                {loading ? "Creating..." : "Create"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}