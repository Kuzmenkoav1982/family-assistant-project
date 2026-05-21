#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

const scanRoots = ["src", "app", "pages", "components", "features", "modules", "lib"];
const codeExtensions = new Set([".ts", ".tsx", ".js", ".jsx", ".mjs", ".cjs"]);

const bannedPatterns = [
  { label: "SectionHero symbol", regex: /\bSectionHero\b/g },
  { label: "section-hero path/name", regex: /section-hero/g },
];

const violations = [];

function scanFile(filePath) {
  const ext = path.extname(filePath);
  if (!codeExtensions.has(ext)) return;

  const baseName = path.basename(filePath).toLowerCase();
  if (baseName.includes("section-hero")) {
    violations.push({ file: filePath, reason: "banned filename", match: baseName });
  }

  const content = fs.readFileSync(filePath, "utf8");
  for (const pattern of bannedPatterns) {
    const matches = [...content.matchAll(pattern.regex)];
    for (const match of matches) {
      violations.push({ file: filePath, reason: pattern.label, match: match[0] });
    }
  }
}

function walk(dirPath) {
  const entries = fs.readdirSync(dirPath, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry.name);
    if (entry.isDirectory()) { walk(fullPath); continue; }
    if (entry.isFile()) { scanFile(fullPath); }
  }
}

let rootsFound = 0;
for (const relativeRoot of scanRoots) {
  const fullRoot = path.join(root, relativeRoot);
  if (fs.existsSync(fullRoot) && fs.statSync(fullRoot).isDirectory()) {
    rootsFound += 1;
    walk(fullRoot);
  }
}

if (rootsFound === 0) {
  console.warn("Warning: no known code roots found to scan.");
}

if (violations.length > 0) {
  console.error("SectionHero regression guard failed.\n");
  for (const v of violations) {
    console.error(`- ${v.file}: ${v.reason} (${v.match})`);
  }
  process.exit(1);
}

console.log("OK: no SectionHero references found in code roots.");
