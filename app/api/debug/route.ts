import { NextResponse } from "next/server";

const API_TOKEN = process.env.CLICKUP_API_TOKEN || "pk_10807600_3S5RXKCWLRTR6RBCV7XWBPI68E7SQCVK";
const TEAM_ID = process.env.CLICKUP_TEAM_ID || "14330021";

export async function GET() {
  const results: Record<string, unknown> = {};

  // 1. Who owns this token?
  const userRes = await fetch("https://api.clickup.com/api/v2/user", {
    headers: { Authorization: API_TOKEN },
  });
  results.user = userRes.ok ? await userRes.json() : { error: userRes.status, body: await userRes.text() };

  // 2. List team members
  const membersRes = await fetch(`https://api.clickup.com/api/v2/team/${TEAM_ID}/member`, {
    headers: { Authorization: API_TOKEN },
  });
  results.members = membersRes.ok ? await membersRes.json() : { error: membersRes.status, body: await membersRes.text() };

  // 3. Time entries with NO date filter (last available)
  const noDateRes = await fetch(
    `https://api.clickup.com/api/v2/team/${TEAM_ID}/time_entries?page=0`,
    { headers: { Authorization: API_TOKEN } }
  );
  results.timeEntriesNoFilter = noDateRes.ok ? await noDateRes.json() : { error: noDateRes.status, body: await noDateRes.text() };

  // 4. Time entries with a very wide range (Jan 2024 – now)
  const wideStart = new Date("2024-01-01").getTime();
  const wideEnd = Date.now();
  const wideRes = await fetch(
    `https://api.clickup.com/api/v2/team/${TEAM_ID}/time_entries?start_date=${wideStart}&end_date=${wideEnd}&page=0`,
    { headers: { Authorization: API_TOKEN } }
  );
  results.timeEntriesWideRange = wideRes.ok ? await wideRes.json() : { error: wideRes.status, body: await wideRes.text() };

  return NextResponse.json(results, { headers: { "Cache-Control": "no-store" } });
}
