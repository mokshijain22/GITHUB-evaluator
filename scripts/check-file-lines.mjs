import { readFileSync } from 'node:fs';
import { execSync } from 'node:child_process';

const MAX_LINES = 500;
const files = execSync('rg --files -g "*.js" -g "*.jsx" -g "!node_modules/**" -g "!dist/**"')
  .toString()
  .trim()
  .split('\n')
  .filter(Boolean);

const violations = [];
for (const file of files) {
  const lines = readFileSync(file, 'utf8').split('\n').length;
  if (lines > MAX_LINES) violations.push({ file, lines });
}

if (violations.length) {
  console.error(`Files above ${MAX_LINES} lines:`);
  for (const v of violations) console.error(`- ${v.file}: ${v.lines}`);
  process.exit(1);
}

console.log(`OK: ${files.length} JS/JSX files are <= ${MAX_LINES} lines.`);
