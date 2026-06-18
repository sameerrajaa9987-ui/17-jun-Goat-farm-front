/**
 * Generates branded app assets (goat-head emblem on the earthy farm theme).
 * Run from goat-front: node scripts/make-assets.mjs
 * Uses `sharp` (borrowed from the sibling doctor-front if not installed here).
 */
import { createRequire } from "module";
import { fileURLToPath } from "url";
import path from "path";
import fs from "fs";

const require = createRequire(import.meta.url);
let sharp;
try {
  sharp = require("sharp");
} catch {
  // fall back to the sibling project's sharp
  sharp = require(
    path.resolve(process.cwd(), "../../22-04-26DR-front/node_modules/sharp"),
  );
}

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const assetsDir = path.resolve(__dirname, "../assets");
fs.mkdirSync(assetsDir, { recursive: true });

const FOREST = "#2F6B3C";
const FOREST_DARK = "#1C4726";
const INK = "#0A1E10";
const CREAM = "#F4EEE1";
const CLAY = "#C2683B";

// Goat-head emblem, designed in a 512x512 box, centred ~ (256, 250).
// `scale` shrinks it toward the centre; `fill`/`accent` set the colours.
function goatEmblem({ fill = CREAM, accent = CLAY, eye = INK, scale = 1 }) {
  const s = scale;
  return `
  <g transform="translate(256 256) scale(${s}) translate(-256 -256)">
    <!-- horns -->
    <path fill="${accent}" d="M232 150 C200 120 168 96 118 84 C150 66 198 76 232 108 C246 120 248 138 242 158 Z"/>
    <path fill="${accent}" d="M280 150 C312 120 344 96 394 84 C362 66 314 76 280 108 C266 120 264 138 270 158 Z"/>
    <!-- ears -->
    <path fill="${fill}" d="M198 228 C150 214 110 226 88 258 C118 268 168 260 200 242 Z"/>
    <path fill="${fill}" d="M314 228 C362 214 402 226 424 258 C394 268 344 260 312 242 Z"/>
    <!-- face -->
    <path fill="${fill}" d="M256 146 C320 146 352 194 350 256 C348 314 312 360 256 376 C200 360 164 314 162 256 C160 194 192 146 256 146 Z"/>
    <!-- snout shading -->
    <path fill="${accent}" opacity="0.18" d="M256 300 C284 300 300 318 300 340 C300 360 280 374 256 376 C232 374 212 360 212 340 C212 318 228 300 256 300 Z"/>
    <!-- beard -->
    <path fill="${fill}" d="M256 368 C246 396 250 420 256 438 C262 420 266 396 256 368 Z"/>
    <!-- eyes -->
    <ellipse cx="214" cy="250" rx="11" ry="16" fill="${eye}"/>
    <ellipse cx="298" cy="250" rx="11" ry="16" fill="${eye}"/>
    <!-- nostrils -->
    <ellipse cx="242" cy="338" rx="5" ry="7" fill="${eye}" opacity="0.55"/>
    <ellipse cx="270" cy="338" rx="5" ry="7" fill="${eye}" opacity="0.55"/>
  </g>`;
}

function roundedBgIcon() {
  return `
  <svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1024" viewBox="0 0 1024 1024">
    <defs>
      <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stop-color="${FOREST}"/>
        <stop offset="1" stop-color="${FOREST_DARK}"/>
      </linearGradient>
    </defs>
    <rect width="1024" height="1024" rx="224" fill="url(#g)"/>
    <circle cx="512" cy="512" r="372" fill="#ffffff" opacity="0.05"/>
    <g transform="translate(512 520) scale(1.32) translate(-256 -256)">
      ${goatEmblem({})}
    </g>
  </svg>`;
}

function adaptiveForeground() {
  // Android adds the green background (app.json adaptiveIcon.backgroundColor);
  // keep the goat within the safe centre on a transparent canvas.
  return `
  <svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1024" viewBox="0 0 1024 1024">
    <g transform="translate(512 512) scale(1.05) translate(-256 -256)">
      ${goatEmblem({})}
    </g>
  </svg>`;
}

function splash() {
  // Splash background is dark green (app.json); cream goat + wordmark, transparent.
  return `
  <svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1024" viewBox="0 0 1024 1024">
    <g transform="translate(512 430) scale(1.15) translate(-256 -256)">
      ${goatEmblem({})}
    </g>
    <text x="512" y="800" text-anchor="middle" font-family="Arial, Helvetica, sans-serif"
      font-size="84" font-weight="700" fill="${CREAM}" letter-spacing="2">Goat Farm</text>
    <text x="512" y="872" text-anchor="middle" font-family="Arial, Helvetica, sans-serif"
      font-size="40" font-weight="500" fill="${CLAY}" letter-spacing="6">MANAGER</text>
  </svg>`;
}

function favicon() {
  // Same 512 coordinate space as the emblem; sharp resizes down to 256.
  return `
  <svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512">
    <rect width="512" height="512" rx="112" fill="${FOREST_DARK}"/>
    <g transform="translate(256 268) scale(0.92) translate(-256 -256)">
      ${goatEmblem({})}
    </g>
  </svg>`;
}

async function render(svg, file, size) {
  const out = path.join(assetsDir, file);
  await sharp(Buffer.from(svg)).resize(size, size).png().toFile(out);
  console.log("wrote", file, `${size}x${size}`);
}

await render(roundedBgIcon(), "icon.png", 1024);
await render(adaptiveForeground(), "adaptive-icon.png", 1024);
await render(splash(), "splash-icon.png", 1024);
await render(favicon(), "favicon.png", 256);
console.log("done");
