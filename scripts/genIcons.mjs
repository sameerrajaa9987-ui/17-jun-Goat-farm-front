/**
 * GoatKeep app icons from the client's mascot logo (../client-logo.jpeg).
 * Composites onto white with correct safe-zone padding per target.
 *   icon.png          1024  full square (white bg + mascot)
 *   adaptive-icon.png 1024  mascot scaled into the Android safe zone
 *   splash-icon.png   1024  mascot, smaller, for the splash
 *   favicon.png         48
 *   assets/brand/logo.png   full-res mascot for in-app use
 * Run: node scripts/genIcons.mjs   (needs: npm i sharp)
 */
import sharp from "sharp";
import fs from "fs";

const SRC = "../client-logo.jpeg";
const WHITE = { r: 255, g: 255, b: 255, alpha: 1 };

// Scale the mascot to `inner` px and pad out to 1024 on white.
async function padded(inner, out) {
  const pad = Math.round((1024 - inner) / 2);
  await sharp(SRC)
    .resize(inner, inner, { fit: "contain", background: WHITE })
    .extend({ top: pad, bottom: pad, left: pad, right: pad, background: WHITE })
    .flatten({ background: WHITE })
    .png()
    .toFile(out);
}

async function main() {
  fs.mkdirSync("assets/brand", { recursive: true });
  await sharp(SRC).png().toFile("assets/brand/logo.png");

  await padded(980, "assets/icon.png"); // slight breathing room
  await padded(680, "assets/adaptive-icon.png"); // Android safe zone (~66%)
  await padded(600, "assets/splash-icon.png");
  await sharp("assets/icon.png")
    .resize(48, 48)
    .png()
    .toFile("assets/favicon.png");
  console.log("Icons generated from client mascot logo.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
