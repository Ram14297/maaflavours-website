// scripts/set-webhook-secret.mjs
// Reads CASHFREE_SECRET_KEY from .env.local (cleanly, no PowerShell BOM
// nonsense) and prints it. We pass that value to `vercel env add` via shell.

import { readFileSync } from "node:fs";
const txt = readFileSync(".env.local.fresh", "utf8").replace(/^﻿/, "");
for (const line of txt.split(/\r?\n/)) {
  const m = line.match(/^CASHFREE_SECRET_KEY="?([^"]+)"?$/);
  if (m) {
    process.stdout.write(m[1]);
    break;
  }
}
