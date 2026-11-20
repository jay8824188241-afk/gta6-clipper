import { copyFileSync, existsSync, mkdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

// The repository is mounted at /bot when the scorer runs this program.
// Locally, point MAKEFUN_BOT_DIR at the repository root instead.
const botDir = process.env.MAKEFUN_BOT_DIR ?? process.env.MAKEFUN_INPUT_DIR ?? '/bot';
const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

const src = join(botDir, 'VIDEO.json');
if (!existsSync(src)) {
  throw new Error(`VIDEO.json not found in ${botDir}`);
}

// Read and check the entry before copying it, so a broken entry fails
// loudly here instead of silently shipping an empty or invalid file.
const raw = readFileSync(src, 'utf8');
const entry = JSON.parse(raw) as unknown;
if (typeof entry !== 'object' || entry === null || typeof (entry as { url?: unknown }).url !== 'string') {
  throw new Error('VIDEO.json must be an object with a string "url" field');
}
const url = (entry as { url: string }).url;
if (!/^https:\/\/(www\.youtube\.com\/shorts\/[A-Za-z0-9_-]{11}|www\.youtube\.com\/watch\?v=[A-Za-z0-9_-]{11}|youtu\.be\/[A-Za-z0-9_-]{11})/.test(url)) {
  throw new Error(`VIDEO.json url does not look like a YouTube video: ${url}`);
}

mkdirSync(outDir, { recursive: true });
copyFileSync(src, join(outDir, 'VIDEO.json'));
console.log(`Wrote VIDEO.json for ${url} to ${outDir}`);
