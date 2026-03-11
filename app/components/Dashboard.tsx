"use client";

import { useState, useEffect, useCallback } from "react";
import Sidebar from "./Sidebar";
import DateRangePicker from "./DateRangePicker";
import UserFilter from "./UserFilter";
import { SkeletonCard } from "./Skeleton";
import HoursByPerson from "../views/HoursByPerson";
import WeeklyTrends from "../views/WeeklyTrends";
import HoursByClient from "../views/HoursByClient";
import AutomatableView from "../views/AutomatableView";
import { TimeEntry, DateRange } from "../types";
import { filterByUsers, uniqueValues } from "../utils";

type View = "by-person" | "trends" | "by-client" | "automatable";

export default function Dashboard() {
  const [activeView, setActiveView] = useState<View>("by-person");
  const [dateRange, setDateRange] = useState<DateRange>({
    start: Date.now() - 30 * 864e5,
    end: Date.now(),
    preset: "30d",
  });
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [allUsers, setAllUsers] = useState<string[]>([]);
  const [entries, setEntries] = useState<TimeEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchEntries = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(
        `/api/time-entries?start=${dateRange.start}&end=${dateRange.end}`
      );
      if (!res.ok) {
        const body = await res.json();
        throw new Error(body.error ?? `HTTP ${res.status}`);
      }
      const { data } = await res.json();
      setEntries(data);
      const users = uniqueValues((data as TimeEntry[]).map((e) => e.user.username)).sort();
      setAllUsers(users);
      // On first load or if no selection, default to all
      setSelectedUsers((prev) => (prev.length === 0 ? users : prev));
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  }, [dateRange.start, dateRange.end]);

  useEffect(() => {
    fetchEntries();
  }, [fetchEntries]);

  const filteredEntries = filterByUsers(entries, selectedUsers);

  function renderView() {
    if (loading) {
      return (
        <div className="grid gap-4">
          <SkeletonCard />
          <SkeletonCard />
        </div>
      );
    }
    if (error) {
      return (
        <div
          className="rounded-lg p-5 text-sm"
          style={{
            background: "#1a0f0f",
            border: "1px solid #7f1d1d",
            color: "#fca5a5",
          }}
        >
          <strong>Error:</strong> {error}
        </div>
      );
    }
    if (activeView === "by-person") return <HoursByPerson entries={filteredEntries} />;
    if (activeView === "trends") return <WeeklyTrends entries={filteredEntries} />;
    if (activeView === "by-client") return <HoursByClient entries={filteredEntries} />;
    if (activeView === "automatable") return <AutomatableView entries={filteredEntries} />;
    return null;
  }

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: "#0c0c0c" }}>
      <Sidebar activeView={activeView} onViewChange={setActiveView} />

      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <div
          className="px-6 py-3 flex items-center gap-6 flex-wrap shrink-0"
          style={{ borderBottom: "1px solid #222", background: "#0c0c0c" }}
        >
          <DateRangePicker value={dateRange} onChange={setDateRange} />
          {allUsers.length > 0 && (
            <>
              <div className="w-px h-4 bg-gray-700" />
              <UserFilter
                allUsers={allUsers}
                selected={selectedUsers}
                onChange={setSelectedUsers}
              />
            </>
          )}
        </div>

        {/* Main content */}
        <main className="flex-1 overflow-y-auto p-6">
          <div
            className="rounded-lg p-6"
            style={{ background: "#131313", border: "1px solid #222", minHeight: "100%" }}
          >
            {renderView()}
          </div>
        </main>
      </div>
    </div>
  );
}
