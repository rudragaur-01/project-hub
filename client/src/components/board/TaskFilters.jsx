import { Search, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { STATUSES, PRIORITIES } from "@/lib/constants";
import { cn } from "@/lib/utils";

export default function TaskFilters({
  statusFilter,
  setStatusFilter,
  assigneeFilter,
  setAssigneeFilter,
  priorityFilter,
  setPriorityFilter,
  dueDateFilter,
  setDueDateFilter,
  searchQuery,
  setSearchQuery,
  members,
  clearFilters,
  openCreateModal,
}) {
  const selectStyles =
    "h-8 rounded-lg border border-input bg-background px-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";

  return (
    <div className="flex flex-wrap items-center gap-2">
      <div className="relative flex-1 ">
        <Search className="absolute left-2 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />

        <input
          type="text"
          placeholder="Search tasks..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className={cn(selectStyles, "pl-8 w-full")}
        />
      </div>

      <select
        value={statusFilter}
        onChange={(e) => setStatusFilter(e.target.value)}
        className={selectStyles}
      >
        <option value="">All statuse</option>
        {STATUSES.map((status) => (
          <option key={status.value} value={status.value}>
            {status.label}
          </option>
        ))}
      </select>

      <select
        value={assigneeFilter}
        onChange={(e) => setAssigneeFilter(e.target.value)}
        className={selectStyles}
      >
        <option value="">All assignees</option>
        {members.map((member) => (
          <option key={member.id} value={member.id}>
            {member.name}
          </option>
        ))}
      </select>

      <select
        value={priorityFilter}
        onChange={(e) => setPriorityFilter(e.target.value)}
        className={selectStyles}
      >
        <option value="">All priorities</option>
        {PRIORITIES.map((priority) => (
          <option key={priority.value} value={priority.value}>
            {priority.label}
          </option>
        ))}
      </select>

      <input
        type="date"
        value={dueDateFilter}
        onChange={(e) => setDueDateFilter(e.target.value)}
        className={selectStyles}
      />

      {(statusFilter ||
        assigneeFilter ||
        priorityFilter ||
        dueDateFilter ||
        searchQuery) && (
        <Button variant="ghost" size="sm" onClick={clearFilters}>
          Clear
        </Button>
      )}

      <Button
        className="ml-auto bg-[#1a1a1a] hover:bg-[#2d2d2d] text-white"
        onClick={openCreateModal}
      >
        <Plus className="size-4 mr-2" />
        Add task
      </Button>
    </div>
  );
}