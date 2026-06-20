/**
 * Generates the GoatKeep app icons from a single vector mark using sharp.
 * Clean, bold, high-contrast (2026 icon guidance): one shape, no text.
 *   icon.png          1024  full square (forest gradient + goat)
 *   adaptive-icon.png 1024  goat on transparent (Android foreground; bg color in app.json)
 *   splash-icon.png   1024  goat on transparent
 *   favicon.png         48  small square
 * Run: node scripts/genIcons.mjs
 */
import sharp from "sharp";

const CREAM = "#F4EEE1";
const CLAY = "#CF7650";
const EYE = "#10311A";

// The goat mark, centered on a 1024 canvas (horns/ears/beard so it reads as a goat).
const GOAT = `
  <g>
    <!-- horns (clay, behind) -->
    <path d="M470 372 C432 322,386 276,372 206 C360 214,350 226,344 242 C360 304,412 352,452 392 Z" fill="${CLAY}"/>
    <path d="M554 372 C592 322,638 276,652 206 C664 214,674 226,680 242 C664 304,612 352,572 392 Z" fill="${CLAY}"/>
    <!-- ears (cream, behind face) -->
    <ellipse cx="326" cy="486" rx="78" ry="40" transform="rotate(-28 326 486)" fill="${CREAM}"/>
    <ellipse cx="698" cy="486" rx="78" ry="40" transform="rotate(28 698 486)" fill="${CREAM}"/>
    <!-- face (cream) -->
    <path d="M512 348 C614 348,678 392,678 470 C678 556,660 642,600 700 C576 724,546 740,512 740 C478 740,448 724,424 700 C364 642,346 556,346 470 C346 392,410 348,512 348 Z" fill="${CREAM}"/>
    <!-- beard (cream) -->
    <path d="M484 730 C484 778,496 812,512 824 C528 812,540 778,540 730 C524 736,500 736,484 730 Z" fill="${CREAM}"/>
    <!-- eyes -->
    <ellipse cx="456" cy="520" rx="22" ry="28" fill="${EYE}"/>
    <ellipse cx="568" cy="520" rx="22" ry="28" fill="${EYE}"/>
    <!-- nose (clay accent) -->
    <ellipse cx="512" cy="636" rx="30" ry="22" fill="${CLAY}"/>
  </g>
`;

const markSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1024" viewBox="0 0 1024 1024">${GOAT}</svg>`;

const fullSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1024" viewBox="0 0 1024 1024">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#1C4726"/>
      <stop offset="1" stop-color="#0A1E10"/>
    </linearGradient>
  </defs>
  <rect width="1024" height="1024" fill="url(#bg)"/>
  ${GOAT}
</svg>`;

const buf = (svg) => Buffer.from(svg);

async function main() {
  await sharp(buf(fullSvg)).resize(1024, 1024).png().toFile("assets/icon.png");
  await sharp(buf(markSvg))
    .resize(1024, 1024)
    .png()
    .toFile("assets/adaptive-icon.png");
  await sharp(buf(markSvg))
    .resize(1024, 1024)
    .png()
    .toFile("assets/splash-icon.png");
  await sharp(buf(fullSvg)).resize(48, 48).png().toFile("assets/favicon.png");
  console.log("Icons generated: icon, adaptive-icon, splash-icon, favicon");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
