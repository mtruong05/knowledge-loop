# Deal Desk Bot — Credentials & Setup Guide

This guide walks you through setting up **Deal Desk Bot** from scratch: creating the Slack app, connecting Notion, and running the bot locally or on Railway.

---

## What’s already configured

- **Bot name:** Deal Desk Bot  
- **Slash command:** `/dealdesk`  
- **Knowledge area:** Deal Desk, linked to your [Deal Desk FAQ Notion page](https://www.notion.so/Deal-Desk-FAQ-31ed5556a4b580f0b997e50a72d67770)  
- **Deal desk lead:** Natalie Luu (Slack ID `U091ZMW3MFE`) — she’ll be tagged when the bot escalates and can manage the knowledge area via DMs  

You only need to add credentials and connect the integrations.

---

## 1. Create a Slack App

1. Go to **[api.slack.com/apps](https://api.slack.com/apps)** → **Create New App** → **From a manifest**.
2. Choose the workspace where you want Deal Desk Bot to run.
3. Select **JSON** and paste the full contents of **`slack-manifest.json`** from this repo (it’s already set up for Deal Desk Bot and `/dealdesk`).
4. Click **Create**, then **Install to Workspace** and approve the permissions.

Save these three values (you’ll put them in `.env` next):

| Variable | Where to find it |
|----------|------------------|
| **Bot Token** (`xoxb-...`) | **OAuth & Permissions** → Bot User OAuth Token |
| **App-Level Token** (`xapp-...`) | **Basic Information** → **App-Level Tokens** → Generate a token with scope **`connections:write`** |
| **Signing Secret** | **Basic Information** → App Credentials → Signing Secret |

---

## 2. Set up Notion

1. Go to **[notion.so/my-integrations](https://www.notion.so/my-integrations)** → **New integration**.
2. Name it (e.g. “Deal Desk Bot”), select your workspace, and click **Submit**.
3. Copy the **Internal Integration Secret** (starts with `ntn_`).
4. **Connect the integration to your FAQ page:**  
   Open your [Deal Desk FAQ page](https://www.notion.so/Deal-Desk-FAQ-31ed5556a4b580f0b997e50a72d67770) in Notion → click **⋯** (top right) → **Connections** → **Connect to** → select your integration.

Without this connection, the bot cannot read the FAQ.

---

## 3. Get an Anthropic API key

1. Go to **[console.anthropic.com](https://console.anthropic.com)** → **API Keys**.
2. Create a key (starts with `sk-ant-...`).  
   The bot uses Claude to classify questions and generate answers from the Notion FAQ.

---

## 4. Create your `.env` file

In the project root (`knowledge-loop/`), copy the example env file and fill in your values:

```bash
cp .env.example .env
```

Edit `.env` so it looks like this (use your real values):

```env
# Required: Slack (from api.slack.com/apps)
SLACK_BOT_TOKEN=xoxb-your-bot-token
SLACK_APP_TOKEN=xapp-your-app-token
SLACK_SIGNING_SECRET=your-signing-secret

# Required: Anthropic (from console.anthropic.com)
ANTHROPIC_API_KEY=sk-ant-your-api-key

# Required: Notion (from notion.so/my-integrations)
NOTION_API_KEY=ntn_your-notion-secret

# Optional: channels where the bot listens and answers (comma-separated)
# WATCH_CHANNELS=deal-desk,sales,general
```

- **SLACK_BOT_TOKEN** — Bot User OAuth Token from step 1.  
- **SLACK_APP_TOKEN** — App-level token with `connections:write` (Socket Mode).  
- **SLACK_SIGNING_SECRET** — Signing secret from Slack app settings.  
- **ANTHROPIC_API_KEY** — Your Anthropic API key.  
- **NOTION_API_KEY** — Notion integration secret.  
- **WATCH_CHANNELS** — Optional. Add channel names (e.g. `deal-desk,sales`) when you’re ready for the bot to listen in channels; leave empty to use only DMs and slash commands at first.

---

## 5. Run the bot

Install dependencies and start the app:

```bash
cd knowledge-loop
npm install
npm start
```

You should see the bot connect via Socket Mode. In Slack you can:

- **DM the bot** — Ask deal desk questions; it will answer from the Notion FAQ and tag Natalie when it escalates.
- **Use `/dealdesk`** — e.g. `/dealdesk list` to see the Deal Desk knowledge area; leads can use `add`, `remove`, `set-owners`, etc.
- **Invite the bot to channels** — If you set `WATCH_CHANNELS`, the bot will answer questions in those channels.

---

## 6. (Optional) Deploy to Railway

See **[RAILWAY_DEPLOY.md](RAILWAY_DEPLOY.md)** for step-by-step instructions. Summary:

1. [Railway](https://railway.app) → **New Project** → **Deploy from GitHub repo** (connect **mtruong05/knowledge-loop**).
2. Add **Variables**: `SLACK_BOT_TOKEN`, `SLACK_APP_TOKEN`, `SLACK_SIGNING_SECRET`, `ANTHROPIC_API_KEY`, `NOTION_API_KEY`, and optionally `WATCH_CHANNELS`.
3. In **Settings** → **Volumes**, add a volume with mount path **`/app/data`**, then add variable **`DATA_DIR=/app/data`** so state persists.
4. Deploy. No public URL is required; the bot uses Socket Mode to connect to Slack.

---

## Summary

| What | Where |
|------|--------|
| Deal Desk FAQ | [Notion: Deal Desk FAQ](https://www.notion.so/Deal-Desk-FAQ-31ed5556a4b580f0b997e50a72d67770) |
| Deal desk lead | Natalie Luu — Slack ID `U091ZMW3MFE` |
| Bot config | `src/config/bot-config.json` (name, slash command) |
| Knowledge area | `src/config/knowledge-areas.json` (Deal Desk + Notion page + lead) |
| Secrets | `.env` (never commit this file) |

After you complete steps 1–4 and run `npm start`, the bot is ready to use in Slack.
