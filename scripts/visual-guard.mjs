import fs from "node:fs";
import path from "node:path";

const rootDir = process.cwd();

const checks = [
  {
    file: "src/app/globals.css",
    tokens: [
      ".hero",
      ".demo-card",
      ".bento-item.wide",
      ".conversation-shell",
      ".conversation-main",
      ".conversation-card-title",
      ".lb-row.you",
    ],
  },
  {
    file: "src/components/landing/LandingPage.tsx",
    tokens: [
      "className=\"hero\"",
      "className=\"demo-card\"",
      "className=\"how-grid fade-in\"",
      "className=\"bento fade-in\"",
      "className=\"cta-section\"",
    ],
  },
  {
    file: "src/components/conversation/ConversationClient.tsx",
    tokens: [
      "className=\"conversation-page\"",
      "className=\"conversation-shell\"",
      "className=\"conversation-main\"",
      "className=\"conversation-controls\"",
      "className=\"conversation-draft-input\"",
    ],
  },
  {
    file: "src/components/conversation/ConversationSidebarCard.tsx",
    tokens: ["conversation-card", "conversation-card-title"],
  },
];

const missing = [];

for (const check of checks) {
  const fullPath = path.join(rootDir, check.file);

  if (!fs.existsSync(fullPath)) {
    missing.push({ file: check.file, token: "<missing file>" });
    continue;
  }

  const content = fs.readFileSync(fullPath, "utf8");

  for (const token of check.tokens) {
    if (!content.includes(token)) {
      missing.push({ file: check.file, token });
    }
  }
}

if (missing.length > 0) {
  console.error("[visual:guard] Found visual contract regressions:\n");

  for (const issue of missing) {
    console.error(`- ${issue.file}: missing ${issue.token}`);
  }

  process.exit(1);
}

console.log("[visual:guard] Visual class contracts look good.");
