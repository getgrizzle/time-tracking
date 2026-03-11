// Consistent colour palette for roles, clients, users
const PALETTE = [
  "#6366f1", // indigo
  "#22d3ee", // cyan
  "#f59e0b", // amber
  "#10b981", // emerald
  "#f43f5e", // rose
  "#a78bfa", // violet
  "#fb923c", // orange
  "#34d399", // green
  "#60a5fa", // blue
  "#e879f9", // fuchsia
  "#facc15", // yellow
  "#4ade80", // lime
];

const assignedColors: Record<string, string> = {};
let colorIndex = 0;

export function colorFor(key: string): string {
  if (!assignedColors[key]) {
    assignedColors[key] = PALETTE[colorIndex % PALETTE.length];
    colorIndex++;
  }
  return assignedColors[key];
}

export function resetColors() {
  Object.keys(assignedColors).forEach((k) => delete assignedColors[k]);
  colorIndex = 0;
}
