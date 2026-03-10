#!/usr/bin/env node
/**
 * Interactive setup: opens Slack & Notion in the browser, prompts for credentials, writes .env
 * Run from repo root: node scripts/setup-credentials.js
 */
import readline from "node:readline";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.join(__dirname, "..");
const envPath = path.join(rootDir, ".env");

const ANTHROPIC_KEY = process.env.ANTHROPIC_API_KEY || ""; // Use .env or set when running

const urls = {
  slackApps: "https://api.slack.com/apps",
  notionIntegrations: "https://www.notion.so/my-integrations",
  dealDeskFaq: "https://www.notion.so/Deal-Desk-FAQ-31ed5556a4b580f0b997e50a72d67770",
};

function open(url) {
  try {
    const { execSync } = await import("node:child_process");
    const cmd = process.platform === "darwin" ? "open" : process.platform === "win32" ? "start" : "xdg-open";
    execSync(`${cmd} "${url}"`, { stdio: "ignore" });
  } catch (_) {}
}

function ask(rl, prompt, defaultValue = "") {
  const hint = defaultValue ? ` (or Enter to keep current)` : "";
  return new Promise((resolve) => {
    rl.question(`${prompt}${hint}: `, (answer) => {
      resolve(typeof answer === "string" && answer.trim() ? answer.trim() : defaultValue);
    });
  });
}

function getExistingEnv() {
  try {
    const raw = fs.readFileSync(envPath, "utf8");
    const out = {};
    for (const line of raw.split("\n")) {
      const m = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)$/);
      if (m) out[m[1]] = m[2].replace(/^["']|["']$/g, "").trim();
    }
    return out;
  } catch {
    return {};
  }
}

async function main() {
  console.log("\nDeal Desk Bot — credential setup\n");
  console.log("Opening Slack and Notion in your browser so you can copy the values.\n");
  open(urls.slackApps);
  open(urls.notionIntegrations);
  console.log("Don’t forget to connect your Notion integration to the Deal Desk FAQ page:");
  console.log("  " + urls.dealDeskFaq);
  console.log("  (⋯ → Connections → connect your integration)\n");

  const existing = getExistingEnv();
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });

  const SLACK_BOT_TOKEN = await ask(rl, "Slack Bot Token (xoxb-...)", existing.SLACK_BOT_TOKEN || "");
  const SLACK_APP_TOKEN = await ask(rl, "Slack App-Level Token (xapp-..., scope: connections:write)", existing.SLACK_APP_TOKEN || "");
  const SLACK_SIGNING_SECRET = await ask(rl, "Slack Signing Secret", existing.SLACK_SIGNING_SECRET || "");
  const NOTION_API_KEY = await ask(rl, "Notion Integration Secret (ntn_...)", existing.NOTION_API_KEY || "");

  rl.close();

  const envContent = `# Required: Slack (from api.slack.com/apps)
SLACK_BOT_TOKEN=${SLACK_BOT_TOKEN || "xoxb-your-bot-token"}
SLACK_APP_TOKEN=${SLACK_APP_TOKEN || "xapp-your-app-token"}
SLACK_SIGNING_SECRET=${SLACK_SIGNING_SECRET || "your-signing-secret"}

# Required: Anthropic (from console.anthropic.com)
ANTHROPIC_API_KEY=${ANTHROPIC_KEY}

# Required: Notion (from notion.so/my-integrations)
NOTION_API_KEY=${NOTION_API_KEY || "ntn_your-notion-key"}

# Optional
# WATCH_CHANNELS=general,support
# CLAUDE_MODEL=claude-sonnet-4-5
# SHOW_EVIDENCE=false
# DATA_DIR=./data
`;

  fs.writeFileSync(envPath, envContent, "utf8");
  console.log("\nWrote " + envPath);

  const missing = [];
  if (!SLACK_BOT_TOKEN || SLACK_BOT_TOKEN.startsWith("xoxb-your")) missing.push("SLACK_BOT_TOKEN");
  if (!SLACK_APP_TOKEN || SLACK_APP_TOKEN.startsWith("xapp-your")) missing.push("SLACK_APP_TOKEN");
  if (!SLACK_SIGNING_SECRET || SLACK_SIGNING_SECRET === "your-signing-secret") missing.push("SLACK_SIGNING_SECRET");
  if (!NOTION_API_KEY || NOTION_API_KEY === "ntn_your-notion-key") missing.push("NOTION_API_KEY");

  if (missing.length > 0) {
    console.log("\nStill missing (edit .env after you have them): " + missing.join(", "));
    console.log("Then run: npm install && npm start\n");
    process.exit(0);
    return;
  }

  console.log("\nCredentials set. Installing dependencies and starting the bot...\n");
  const { execSync } = await import("node:child_process");
  execSync("npm install", { cwd: rootDir, stdio: "inherit" });
  execSync("npm start", { cwd: rootDir, stdio: "inherit" });
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
