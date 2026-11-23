// Bring the humans 03 — TikTok ad entry (Node 22, standard library only).
//
// The entry is the TikTok video itself: this program checks VIDEO.json
// (it must name the public TikTok video) and copies it to the output
// directory, where the gate reads it.
//
// The ad (ad.mp4) was made new in the builder session for this bounty:
// a vertical 9:16 short rendered with ffmpeg from frames drawn in that
// session, carrying make.fun's brand badge from its first frame and ending
// on the press pack's referral end card with the entrant's own referral
// code (p26b6feq) typed into its field. Badge and card come from the press
// pack (https://make.fun/press/manifest.json) and are used as they are.
//
// Outside the grader's container, MAKEFUN_BOT_DIR and MAKEFUN_OUTPUT_DIR
// stand in for /bot and /output:
//   mkdir -p out && MAKEFUN_BOT_DIR=. MAKEFUN_OUTPUT_DIR=out node main.ts

import { copyFileSync, mkdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

const BOT_DIR = process.env.MAKEFUN_BOT_DIR ?? '/bot';
const OUTPUT_DIR = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

// A public TikTok video address: a watch page or a vt/vm short link.
const TIKTOK_VIDEO =
  /^https:\/\/(www\.tiktok\.com\/@[\w.-]+\/video\/\d+|v[mt]\.tiktok\.com\/[\w]+)/;

const videoPath = join(BOT_DIR, 'VIDEO.json');
let video: unknown;
try {
  video = JSON.parse(readFileSync(videoPath, 'utf8'));
} catch (err) {
  console.error(`VIDEO.json could not be read from ${videoPath}: ${(err as Error).message}`);
  process.exit(1);
}

if (
  typeof video !== 'object' ||
  video === null ||
  Array.isArray(video) ||
  typeof (video as { url?: unknown }).url !== 'string'
) {
  console.error('VIDEO.json must be a JSON object with a string "url" field.');
  process.exit(1);
}

const url = (video as { url: string }).url;
if (url !== '' && !TIKTOK_VIDEO.test(url)) {
  console.error(`VIDEO.json "url" is not a TikTok video address: ${url}`);
  process.exit(1);
}
if (url === '') {
  console.warn(
    'VIDEO.json holds the placeholder (empty url): replace it with the public TikTok video address before submitting.',
  );
}

mkdirSync(OUTPUT_DIR, { recursive: true });
copyFileSync(videoPath, join(OUTPUT_DIR, 'VIDEO.json'));
console.log(`VIDEO.json copied to ${OUTPUT_DIR} (url: ${url || '(placeholder)'})`);

// The ad itself ships in this repository so the video can be checked and
// posted as it is. Copy it alongside VIDEO.json and report its size.
const adPath = join(BOT_DIR, 'ad.mp4');
let adBytes = 0;
try {
  adBytes = statSync(adPath).size;
} catch {
  console.error(`ad.mp4 is missing from ${BOT_DIR}: the entry video must be in the repository.`);
  process.exit(1);
}
copyFileSync(adPath, join(OUTPUT_DIR, 'ad.mp4'));
console.log(`ad.mp4 copied to ${OUTPUT_DIR} (${adBytes} bytes)`);
