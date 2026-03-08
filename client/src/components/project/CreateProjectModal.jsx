import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function CreateProjectModal({ open, onClose, onCreate }) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  if (!open) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    const trimmedName = name.trim();
    if (!trimmedName) {
      setError("Project name is required");
      return;
    }
    setLoading(true);
    try {
      await onCreate({ name: trimmedName, description: description.trim() });
      setName("");
      setDescription("");
      onClose();
    } catch {
      setError("Failed to create project");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setName("");
    setDescription("");
    setError("");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/50"
        onClick={handleClose}
        aria-hidden
      />
      <Card className="relative w-full max-w-md bg-card shadow-lg">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle>New Project</CardTitle>
          <Button variant="ghost" size="icon" onClick={handleClose}>
            ×
          </Button>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="project-name">Name</Label>
              <Input
                id="project-name"
                placeholder="My project"
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoFocus
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="project-desc">Description (optional)</Label>
              <Input
                id="project-desc"
                placeholder="Short description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
            {error && (
              <p className="text-sm text-destructive">{error}</p>
            )}
            <div className="flex gap-2 justify-end pt-2">
              <Button type="button" variant="outline" onClick={handleClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>Create</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
