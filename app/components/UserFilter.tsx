"use client";

interface Props {
  allUsers: string[];
  selected: string[];
  onChange: (users: string[]) => void;
}

export default function UserFilter({ allUsers, selected, onChange }: Props) {
  function toggle(user: string) {
    if (selected.includes(user)) {
      onChange(selected.filter((u) => u !== user));
    } else {
      onChange([...selected, user]);
    }
  }

  function toggleAll() {
    if (selected.length === allUsers.length) {
      onChange([]);
    } else {
      onChange([...allUsers]);
    }
  }

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <span className="text-xs" style={{ color: "#6b7280" }}>
        Team:
      </span>
      <button
        onClick={toggleAll}
        className="px-2.5 py-1 text-xs rounded transition-colors"
        style={{
          background:
            selected.length === allUsers.length ? "#6366f1" : "#1a1a1a",
          color: selected.length === allUsers.length ? "#fff" : "#9ca3af",
          border: "1px solid #333",
        }}
      >
        All
      </button>
      {allUsers.map((user) => (
        <button
          key={user}
          onClick={() => toggle(user)}
          className="px-2.5 py-1 text-xs rounded transition-colors"
          style={{
            background: selected.includes(user) ? "#4f46e5" : "#1a1a1a",
            color: selected.includes(user) ? "#fff" : "#9ca3af",
            border: "1px solid #333",
          }}
        >
          {user}
        </button>
      ))}
    </div>
  );
}
