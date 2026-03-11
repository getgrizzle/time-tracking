"use client";

export function SkeletonBar({ height = 200 }: { height?: number }) {
  return (
    <div
      className="rounded animate-pulse"
      style={{
        background: "#1a1a1a",
        height,
      }}
    />
  );
}

export function SkeletonCard() {
  return (
    <div
      className="rounded-lg p-6 animate-pulse"
      style={{ background: "#131313", border: "1px solid #222" }}
    >
      <div
        className="h-4 w-32 rounded mb-4"
        style={{ background: "#222" }}
      />
      <div className="h-48 rounded" style={{ background: "#1a1a1a" }} />
    </div>
  );
}
