export default function ProjectEditModal({
  open,
  onClose,
  name,
  description,
  setName,
  setDescription,
  onSubmit,
  loading
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      <div className="relative w-full max-w-md rounded-lg border bg-card p-6 shadow-lg">
        <h3 className="font-semibold mb-4">Edit project</h3>

        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label>Name</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 w-full border rounded px-3 py-2"
              required
            />
          </div>

          <div>
            <label>Description</label>
            <input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="mt-1 w-full border rounded px-3 py-2"
            />
          </div>

          <div className="flex gap-2 justify-end">
            <button type="button" onClick={onClose}>Cancel</button>
            <button type="submit" disabled={loading}>
              {loading ? "Saving..." : "Save"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}