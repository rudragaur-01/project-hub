export default function ProjectInviteSection({
  email,
  setEmail,
  loading,
  message,
  onInvite
}) {
  return (
    <div className="mb-6 p-4 rounded-lg border bg-muted/20">
      <p className="text-sm font-medium mb-2">Invite by email</p>

      <form onSubmit={onInvite} className="flex items-center gap-2">
        <input
          type="email"
          placeholder="user@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="flex-1 h-9 border border-input rounded-lg px-3 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring"
        />

        <button
          type="submit"
          disabled={loading}
          className="h-9 px-4 rounded-lg bg-primary text-primary-foreground text-sm hover:bg-primary/90 disabled:opacity-60"
        >
          {loading ? "Sending..." : "Invite"}
        </button>
      </form>

      {message.text && (
        <p className="text-sm mt-2">{message.text}</p>
      )}
    </div>
  );
}