import { NextRequest, NextResponse } from "next/server";
import { ROLE_CATEGORY, AUTOMATABLE_KEYWORDS } from "@/config";

const API_TOKEN = process.env.CLICKUP_API_TOKEN || "pk_10807600_3S5RXKCWLRTR6RBCV7XWBPI68E7SQCVK";
const TEAM_ID = process.env.CLICKUP_TEAM_ID || "14330021";

// In-memory task cache for the process lifetime
const taskCache: Record<string, { client: string; deliveryRole: string }> = {};

function classifyTask(taskName: string): "automatable" | "strategic" {
  const lower = taskName.toLowerCase();
  for (const keyword of AUTOMATABLE_KEYWORDS) {
    if (lower.includes(keyword.toLowerCase())) return "automatable";
  }
  return "strategic";
}

async function fetchTaskDetails(
  taskId: string
): Promise<{ client: string; deliveryRole: string }> {
  if (taskCache[taskId]) return taskCache[taskId];

  try {
    const res = await fetch(`https://api.clickup.com/api/v2/task/${taskId}`, {
      headers: { Authorization: API_TOKEN! },
    });
    if (!res.ok) {
      taskCache[taskId] = { client: "Untagged", deliveryRole: "Untagged" };
      return taskCache[taskId];
    }
    const data = await res.json();
    const fields: Array<{ name: string; value?: unknown; type_config?: { options?: Array<{ name: string; orderindex: number }> } }> =
      data.custom_fields ?? [];

    let client = "Untagged";
    let deliveryRole = "Untagged";

    for (const field of fields) {
      if (field.name === "⭐️ Client" && field.value) {
        client = String(field.value);
      }
      if (
        field.name === "⭐️ Delivery Role (drop down)" &&
        field.value !== undefined &&
        field.value !== null &&
        field.value !== ""
      ) {
        // ClickUp dropdown fields return an index; resolve to option name
        const options = field.type_config?.options ?? [];
        const idx = Number(field.value);
        const option = options.find((o) => o.orderindex === idx);
        deliveryRole = option?.name ?? String(field.value);
      }
    }

    taskCache[taskId] = { client, deliveryRole };
    return taskCache[taskId];
  } catch {
    taskCache[taskId] = { client: "Untagged", deliveryRole: "Untagged" };
    return taskCache[taskId];
  }
}

async function fetchAllMemberIds(): Promise<string[]> {
  const res = await fetch("https://api.clickup.com/api/v2/team", {
    headers: { Authorization: API_TOKEN },
    next: { revalidate: 0 },
  });
  if (!res.ok) return [];
  const data = await res.json();
  const ids: string[] = [];
  for (const team of data.teams ?? []) {
    for (const member of team.members ?? []) {
      if (member.user?.id) ids.push(String(member.user.id));
    }
  }
  return ids;
}

export async function GET(req: NextRequest) {
  if (!API_TOKEN || !TEAM_ID) {
    return NextResponse.json(
      { error: "Missing CLICKUP_API_TOKEN or CLICKUP_TEAM_ID" },
      { status: 500 }
    );
  }

  const { searchParams } = req.nextUrl;
  const now = Date.now();
  const thirtyDaysAgo = now - 30 * 24 * 60 * 60 * 1000;
  const start = searchParams.get("start") ?? String(thirtyDaysAgo);
  const end = searchParams.get("end") ?? String(now);

  const memberIds = await fetchAllMemberIds();
  console.log(`[ClickUp] fetching for ${memberIds.length} members:`, memberIds);

  // ClickUp time_entries endpoint returns all results in a single response (no pagination)
  const url = new URL(
    `https://api.clickup.com/api/v2/team/${TEAM_ID}/time_entries`
  );
  url.searchParams.set("start_date", start);
  url.searchParams.set("end_date", end);
  if (memberIds.length > 0) {
    url.searchParams.set("assignee", memberIds.join(","));
  }

  console.log(`[ClickUp] fetching: ${url.toString()}`);
  const res = await fetch(url.toString(), {
    headers: { Authorization: API_TOKEN },
    next: { revalidate: 0 },
  });

  if (!res.ok) {
    const text = await res.text();
    console.error(`[ClickUp] API error status=${res.status}`, text);
    return NextResponse.json(
      { error: `ClickUp API error: ${res.status}`, details: text },
      { status: res.status }
    );
  }

  const data = await res.json();
  const allEntries: unknown[] = data.data ?? [];

  console.log(`[ClickUp] total entries: ${allEntries.length}`);

  // Collect unique task IDs
  const taskIds = [
    ...new Set(
      (allEntries as Array<{ task?: { id?: string } }>)
        .map((e) => e.task?.id)
        .filter(Boolean) as string[]
    ),
  ];

  // Fetch task details in parallel (batches of 10 to avoid rate limits)
  const BATCH = 10;
  for (let i = 0; i < taskIds.length; i += BATCH) {
    await Promise.all(taskIds.slice(i, i + BATCH).map(fetchTaskDetails));
  }

  // Enrich entries
  type RawEntry = {
    id: string;
    user: { id: string; username: string };
    task: { id: string; name: string };
    duration: string | number;
    start: string | number;
    end: string | number;
  };

  const enriched = (allEntries as RawEntry[]).map((entry) => {
    const taskId = entry.task?.id ?? "";
    const taskName = entry.task?.name ?? "";
    const { client, deliveryRole } = taskCache[taskId] ?? {
      client: "Untagged",
      deliveryRole: "Untagged",
    };
    const roleCategory =
      deliveryRole === "Untagged"
        ? "untagged"
        : (ROLE_CATEGORY as Record<string, string>)[deliveryRole] ?? "other";
    const taskCategory = classifyTask(taskName);

    return {
      id: entry.id,
      user: {
        id: String(entry.user?.id ?? ""),
        username: entry.user?.username ?? "Unknown",
      },
      task: { id: taskId, name: taskName },
      client,
      deliveryRole,
      roleCategory,
      taskCategory,
      duration: Number(entry.duration),
      start: Number(entry.start),
      end: Number(entry.end),
    };
  });

  return NextResponse.json({ data: enriched });
}
