# Grizzle Time Tracking Dashboard

An internal time tracking dashboard for Grizzle that pulls data from ClickUp and visualises how the team spends time — broken down by role, client, and task type.

---

## Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment variables

Copy `.env.local.example` to `.env.local` (or edit `.env.local` directly) and fill in your values:

```
CLICKUP_API_TOKEN=your_personal_api_token_here
CLICKUP_TEAM_ID=your_team_id_here
```

### 3. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## How to get a ClickUp Personal API Token

1. Log in to ClickUp.
2. Click your avatar (bottom-left) → **Settings**.
3. In the left sidebar, click **Apps**.
4. Under **API Token**, click **Generate** (or copy your existing token).
5. Paste the token as `CLICKUP_API_TOKEN` in `.env.local`.

> Keep this token secret — it grants full access to your ClickUp workspace.

---

## How to find your Team ID

Your Team ID is your workspace ID in ClickUp.

**Option A — from the URL:**
Navigate to any page in your workspace. The URL will look like:
```
https://app.clickup.com/14330021/v/...
```
The number after `app.clickup.com/` is your Team ID.

**Option B — from the API:**
```bash
curl -H "Authorization: YOUR_API_TOKEN" https://api.clickup.com/api/v2/team
```
The `id` field on each team object is the Team ID.

---

## Dashboard Views

| View | Description |
|---|---|
| **Hours by Person** | Stacked bar chart of hours per team member, segmented by Delivery Role |
| **Week-on-Week Trends** | Weekly stacked bars by Delivery Role; toggle between all-team and per-person |
| **Hours by Client** | Horizontal bar chart per client, segmented by team member; toggle absolute / % |
| **Automatable vs Strategic** | Per-person donut + weekly trend; top automatable task list |

---

## Customising the classification config

All classification logic lives in **`config.js`** at the project root.

### `ROLE_CATEGORY`

Maps a ClickUp Delivery Role value to a category used for grouping:

```js
export const ROLE_CATEGORY = {
  "Account Manager": "delivery",
  "Strategist": "strategic",
  "Manager": "internal",
  // add more roles here
}
```

Categories used in the UI: `delivery`, `strategic`, `internal`, `other`.

### `AUTOMATABLE_KEYWORDS`

A list of lowercase substrings. Any task whose name (lowercased) contains one of these strings is classified as **automatable**; all others are **strategic**.

```js
export const AUTOMATABLE_KEYWORDS = [
  "ship draft",
  "upload",
  "check client feedback",
  // add more keywords here
]
```

Changes to `config.js` take effect immediately on next page load (no rebuild required in dev mode).

---

## Architecture

- **Next.js App Router** — server and client components
- **`/api/time-entries`** — fetches ClickUp time entries + task details server-side, enriches and classifies them, returns JSON
- **Task detail cache** — in-memory per process; avoids redundant ClickUp API calls within a session
- **Recharts** — all chart rendering
- **No database** — all data fetched fresh on each date-range change
