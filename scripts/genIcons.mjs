/**
 * GoatKeep app icons — aggressive "fighter" goat: big swept ram horns, angry
 * brow, narrowed eyes, and a snarl with teeth. Bold, high-contrast, no text.
 * Run: node scripts/genIcons.mjs   (needs: npm i sharp)
 */
import sharp from "sharp";

const CREAM = "#F4EEE1";
const CLAY = "#CF7650";
const DARK = "#0A1E10";

// Front-facing fighter goat head, centered on a 1024 canvas.
const GOAT = `
  <g>
    <!-- big swept-back ram horns (clay), bold strokes -->
    <path d="M468 372 C396 300 312 274 236 292 C182 304 164 356 186 408"
      fill="none" stroke="${CLAY}" stroke-width="56" stroke-linecap="round"/>
    <path d="M556 372 C628 300 712 274 788 292 C842 304 860 356 838 408"
      fill="none" stroke="${CLAY}" stroke-width="56" stroke-linecap="round"/>
    <!-- ears (cream) -->
    <path d="M356 478 C316 452 280 458 264 482 C282 514 330 524 378 506 Z" fill="${CREAM}"/>
    <path d="M668 478 C708 452 744 458 760 482 C742 514 694 524 646 506 Z" fill="${CREAM}"/>
    <!-- angular face / strong jaw (cream) -->
    <path d="M512 372 C606 372 666 416 666 490 C666 582 626 672 560 728
      C540 744 526 756 512 764 C498 756 484 744 464 728 C398 672 358 582 358 490
      C358 416 418 372 512 372 Z" fill="${CREAM}"/>
    <!-- fierce brow ridges (angled inward, dark) -->
    <path d="M424 502 L508 532 L502 480 Z" fill="${DARK}"/>
    <path d="M600 502 L516 532 L522 480 Z" fill="${DARK}"/>
    <!-- narrowed angry eyes (dark) -->
    <path d="M436 528 L504 540 L500 566 L442 556 Z" fill="${DARK}"/>
    <path d="M588 528 L520 540 L524 566 L582 556 Z" fill="${DARK}"/>
    <!-- snout + nostrils -->
    <ellipse cx="512" cy="638" rx="42" ry="28" fill="${CLAY}"/>
    <ellipse cx="495" cy="638" rx="6" ry="9" fill="${DARK}"/>
    <ellipse cx="529" cy="638" rx="6" ry="9" fill="${DARK}"/>
    <!-- snarl mouth (dark) with teeth (cream) -->
    <path d="M466 690 C490 712 534 712 558 690 C544 728 480 728 466 690 Z" fill="${DARK}"/>
    <path d="M486 700 L498 700 L492 716 Z" fill="${CREAM}"/>
    <path d="M526 700 L538 700 L532 716 Z" fill="${CREAM}"/>
    <!-- pointed beard (cream) -->
    <path d="M478 742 C478 800 496 852 512 870 C528 852 546 800 546 742
      C524 754 500 754 478 742 Z" fill="${CREAM}"/>
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
