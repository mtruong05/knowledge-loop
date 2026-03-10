# Deploy Deal Desk Bot to Railway (24/7)

Follow these steps to run your bot on Railway so it stays online without keeping your laptop on.

---

## 1. Create a Railway account and project

1. Go to **[railway.app](https://railway.app)** and sign in (GitHub login is easiest).
2. Click **New Project**.
3. Choose **Deploy from GitHub repo**.
4. Select **mtruong05/knowledge-loop** (or the repo where you pushed your code).  
   If you don’t see it, click **Configure GitHub App** and grant Railway access to your repos, then try again.
5. Railway will create a project and start a first deploy. It may fail until you add variables in the next step — that’s expected.

---

## 2. Add environment variables (secrets)

Your bot needs the same values you have in your local `.env`.

1. In your Railway project, click your **service** (the knowledge-loop app).
2. Open the **Variables** tab.
3. Click **+ New Variable** or **Add variable** and add each of these (use the same values as in your `.env`):

| Variable | What to paste |
|----------|----------------|
| `SLACK_BOT_TOKEN` | Your Slack Bot Token (`xoxb-...`) |
| `SLACK_APP_TOKEN` | Your Slack App-Level Token (`xapp-...`) |
| `SLACK_SIGNING_SECRET` | Your Slack Signing Secret |
| `ANTHROPIC_API_KEY` | Your Anthropic API key (`sk-ant-...`) |
| `NOTION_API_KEY` | Your Notion integration secret (`ntn_...`) |
| `WATCH_CHANNELS` | Optional. e.g. `deal-desk,sales` (channel names, comma-separated, no `#`) |

4. Save. Railway will redeploy when you add variables.

---

## 3. Add a volume (so state is saved)

Without this, rosters and escalation state are lost when the app restarts.

1. In the same service, go to the **Settings** tab.
2. Find **Volumes** (or **Persistent storage**).
3. Click **Add Volume** (or **Create Volume**).
4. Set the **mount path** to: **`/app/data`**
5. Save.

Then add one more variable:

6. In **Variables**, add:
   - **Variable:** `DATA_DIR`
   - **Value:** `/app/data`

7. Save again. Railway will redeploy.

---

## 4. Check the deploy

1. Open the **Deployments** tab.
2. Wait until the latest deployment shows **Success** (green).
3. Open the deployment and check **Logs**. You should see something like:
   - `Bot started (Socket Mode).`
   - `Watching channels: ...`

If you see errors about missing variables, double-check that every variable from step 2 is set (no typos in names).

---

## 5. Test in Slack

- DM the bot or use **/dealdesk list** in Slack.  
- Ask a deal desk question in a channel that’s in `WATCH_CHANNELS` (if you set it).

The bot is now running 24/7 on Railway. You can close your laptop; it will keep running.

---

## Summary

| Step | What you did |
|------|----------------|
| 1 | New Project → Deploy from GitHub → chose mtruong05/knowledge-loop |
| 2 | Variables: `SLACK_BOT_TOKEN`, `SLACK_APP_TOKEN`, `SLACK_SIGNING_SECRET`, `ANTHROPIC_API_KEY`, `NOTION_API_KEY`, optional `WATCH_CHANNELS` |
| 3 | Volume mount path `/app/data` + variable `DATA_DIR=/app/data` |
| 4 | Deployments tab → confirm Success and check logs |
| 5 | Test in Slack |

No public URL or domain is required; the bot uses Slack Socket Mode to connect.

---

## If the deployment crashes

1. **Check the logs**
   - In Railway: open your **knowledge-loop** service → **Deployments** → click the latest (failed) deployment → **View Logs**.
   - Look for a red error line. Common messages:
     - **`Missing required env var: SLACK_BOT_TOKEN`** (or another name) → that variable is missing or empty in **Variables**. Add it or fix the name (must match exactly).
     - **`Error: ...`** or **`throw new Error`** → often means one of the five required env vars is not set in Railway.

2. **Verify all five required variables**
   In your service **Variables** tab, confirm you have **exactly** these names (case-sensitive):
   - `SLACK_BOT_TOKEN`
   - `SLACK_APP_TOKEN`
   - `SLACK_SIGNING_SECRET`
   - `ANTHROPIC_API_KEY`
   - `NOTION_API_KEY`  
   No extra spaces, no typos (e.g. `ANTHROPIC_KEY` instead of `ANTHROPIC_API_KEY` will fail).

3. **Redeploy**
   After fixing variables, go to **Deployments** → **Redeploy** (or push a small commit to trigger a new deploy).
