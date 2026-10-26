const fs = require("fs");
const path = require("path");
const sharp = require("sharp");

const IMG_1 =
  "C:/Users/Ryuko/.gemini/antigravity/brain/2cb7ad06-1b08-4f04-9b0d-00570529f664/.user_uploaded/media_1792718594140_96457b4e.jpg";
const IMG_2 =
  "C:/Users/Ryuko/.gemini/antigravity/brain/2cb7ad06-1b08-4f04-9b0d-00570529f664/.user_uploaded/media_1792718601286_81373cd0.jpg";
const IMG_3 =
  "C:/Users/Ryuko/.gemini/antigravity/brain/2cb7ad06-1b08-4f04-9b0d-00570529f664/.user_uploaded/media_1792718610358_1b9ca1dc.jpg";

const PUBLIC_GIFTS_DIR = path.join(__dirname, "..", "public", "gifts");
const ICONS_PNG_DIR = path.join(PUBLIC_GIFTS_DIR, "png-512");
const ICONS_SVG_DIR = path.join(PUBLIC_GIFTS_DIR, "svg");
const FRAMES_DIR = path.join(PUBLIC_GIFTS_DIR, "marcos");

// Definición de los 27 regalos de las 3 imágenes
const ALL_27_GIFTS = [
  // SET 1: CÓSMICO NOVA (Imagen 1 - 1024x682)
  { id: "01-estrella-fugaz", name: "Estrella Fugaz", sheet: 1, row: 0, col: 0, accent: "#00f5ff", secondary: "#38bdf8" },
  { id: "02-corazon-nova", name: "Corazón Nova", sheet: 1, row: 0, col: 1, accent: "#00f5ff", secondary: "#e879f9" },
  { id: "03-cohete", name: "Cohete", sheet: 1, row: 0, col: 2, accent: "#00f5ff", secondary: "#a855f7" },
  { id: "04-planeta", name: "Planeta", sheet: 1, row: 1, col: 0, accent: "#b829ff", secondary: "#00f5ff" },
  { id: "05-lluvia-meteoritos", name: "Lluvia de Meteoritos", sheet: 1, row: 1, col: 1, accent: "#b829ff", secondary: "#38bdf8" },
  { id: "06-anillo-galactico", name: "Anillo Galáctico", sheet: 1, row: 1, col: 2, accent: "#b829ff", secondary: "#00f5ff" },
  { id: "07-supernova", name: "Supernova", sheet: 1, row: 2, col: 0, accent: "#ff2a85", secondary: "#ffcf33" },
  { id: "08-agujero-negro", name: "Agujero Negro", sheet: 1, row: 2, col: 1, accent: "#ffcf33", secondary: "#b829ff", preserveDarkCenter: true },
  { id: "09-galaxia", name: "Galaxia", sheet: 1, row: 2, col: 2, accent: "#ff2a85", secondary: "#ffcf33" },

  // SET 2: DIVERSIÓN NEÓN (Imagen 2 - 1024x1024)
  { id: "10-osito-neon", name: "Osito Neón", sheet: 2, row: 0, col: 0, accent: "#00f5ff", secondary: "#ff2a85", preserveInterior: true },
  { id: "11-balon-futbol", name: "Balón de Fútbol", sheet: 2, row: 0, col: 1, accent: "#00f5ff", secondary: "#b829ff" },
  { id: "12-rosa-neon", name: "Rosa Neón", sheet: 2, row: 0, col: 2, accent: "#ff2a85", secondary: "#00f5ff" },
  { id: "13-dulce-cosmico", name: "Dulce Cósmico", sheet: 2, row: 1, col: 0, accent: "#00f5ff", secondary: "#ff2a85" },
  { id: "14-mariposa-neon", name: "Mariposa Neón", sheet: 2, row: 1, col: 1, accent: "#00f5ff", secondary: "#b829ff" },
  { id: "15-helado-neon", name: "Helado Neón", sheet: 2, row: 1, col: 2, accent: "#ff2a85", secondary: "#00f5ff" },
  { id: "16-patito-dorado", name: "Patito Dorado", sheet: 2, row: 2, col: 0, accent: "#ffcf33", secondary: "#00f5ff", preserveInterior: true },
  { id: "17-gatito-cosmico", name: "Gatito Cósmico", sheet: 2, row: 2, col: 1, accent: "#b829ff", secondary: "#00f5ff", preserveInterior: true },
  { id: "18-unicornio-estelar", name: "Unicornio Estelar", sheet: 2, row: 2, col: 2, accent: "#ff2a85", secondary: "#00f5ff" },

  // SET 3: ÉPICOS Y LEYENDAS (Imagen 3 - 1024x682)
  { id: "19-diamante-cristal", name: "Diamante Cristal", sheet: 3, row: 0, col: 0, accent: "#00f5ff", secondary: "#b829ff" },
  { id: "20-corona-real", name: "Corona Real", sheet: 3, row: 0, col: 1, accent: "#ffcf33", secondary: "#b829ff", preserveInterior: true },
  { id: "21-trofeo-campeon", name: "Trofeo Campeón", sheet: 3, row: 0, col: 2, accent: "#ffcf33", secondary: "#00f5ff", preserveInterior: true },
  { id: "22-caja-sorpresa", name: "Caja Sorpresa Neón", sheet: 3, row: 1, col: 0, accent: "#00f5ff", secondary: "#ff2a85" },
  { id: "23-guitarra-electrica", name: "Guitarra Eléctrica", sheet: 3, row: 1, col: 1, accent: "#b829ff", secondary: "#00f5ff" },
  { id: "24-leon-cosmico", name: "León Cósmico", sheet: 3, row: 1, col: 2, accent: "#00f5ff", secondary: "#b829ff", preserveInterior: true },
  { id: "25-dragon-neon", name: "Dragón Neón", sheet: 3, row: 2, col: 0, accent: "#00f5ff", secondary: "#b829ff" },
  { id: "26-castillo-cristal", name: "Castillo de Cristal", sheet: 3, row: 2, col: 1, accent: "#00f5ff", secondary: "#ffcf33" },
  { id: "27-ave-fenix", name: "Ave Fénix Imperial", sheet: 3, row: 2, col: 2, accent: "#ffcf33", secondary: "#ff2a85" },
];

const BOUNDS_BY_SHEET = {
  1: {
    source: IMG_1,
    cols: [
      { left: 50, width: 272 },
      { left: 376, width: 272 },
      { left: 702, width: 272 },
    ],
    rows: [
      { top: 26, height: 186 },
      { top: 248, height: 186 },
      { top: 470, height: 186 },
    ],
  },
  2: {
    source: IMG_2,
    cols: [
      { left: 68, width: 240 },
      { left: 392, width: 240 },
      { left: 716, width: 240 },
    ],
    rows: [
      { top: 68, height: 240 },
      { top: 392, height: 240 },
      { top: 716, height: 240 },
    ],
  },
  3: {
    source: IMG_3,
    cols: [
      { left: 102, width: 228 },
      { left: 398, width: 228 },
      { left: 694, width: 228 },
    ],
    rows: [
      { top: 32, height: 176 },
      { top: 252, height: 176 },
      { top: 472, height: 176 },
    ],
  },
};

function ensureDirs() {
  for (const dir of [PUBLIC_GIFTS_DIR, ICONS_PNG_DIR, ICONS_SVG_DIR, FRAMES_DIR]) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

async function extractGiftIcon(gift) {
  const sheetCfg = BOUNDS_BY_SHEET[gift.sheet];
  const col = sheetCfg.cols[gift.col];
  const row = sheetCfg.rows[gift.row];

  const targetW = gift.sheet === 2 ? 380 : 430;
  const targetH = gift.sheet === 2 ? 380 : 300;

  const { data, info } = await sharp(sheetCfg.source)
    .extract({
      left: col.left,
      top: row.top,
      width: col.width,
      height: row.height,
    })
    .resize(targetW, targetH, { fit: "fill" })
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const w = info.width;
  const h = info.height;
  const cx = w / 2;
  const cy = h / 2;

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const idx = (y * w + x) * 4;
      const r = data[idx];
      const g = data[idx + 1];
      const b = data[idx + 2];

      const normX = (x - cx) / (w * 0.48);
      const normY = (y - cy) / (h * 0.48);
      const radialDist = Math.hypot(normX, normY);
      let radialFade = 1;
      if (radialDist > 0.74) {
        radialFade = Math.max(0, 1 - (radialDist - 0.74) / 0.26);
      }

      const maxC = Math.max(r, g, b);
      const minC = Math.min(r, g, b);
      const sat = maxC - minC;

      const distCenter = Math.hypot((x - cx) / 68, (y - cy) / 53);
      if (gift.preserveDarkCenter && distCenter < 0.72) {
        data[idx + 3] = 255;
        continue;
      }

      const floor = gift.preserveInterior ? 26 : 38;
      const ceiling = gift.preserveInterior ? 88 : 112;
      const brightnessScore = maxC + sat * 0.8;

      let alpha = 0;
      if (brightnessScore <= floor) {
        alpha = 0;
      } else if (brightnessScore >= ceiling) {
        alpha = 255;
      } else {
        const t = (brightnessScore - floor) / (ceiling - floor);
        alpha = Math.round(t * t * 255);
      }

      data[idx + 3] = Math.round(alpha * radialFade);
    }
  }

  const croppedRgba = await sharp(data, {
    raw: { width: w, height: h, channels: 4 },
  })
    .png()
    .toBuffer();

  const final512Buffer = await sharp({
    create: {
      width: 512,
      height: 512,
      channels: 4,
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    },
  })
    .composite([{ input: croppedRgba, gravity: "center" }])
    .png()
    .toBuffer();

  const pngPath = path.join(ICONS_PNG_DIR, `${gift.id}.png`);
  fs.writeFileSync(pngPath, final512Buffer);

  const base64Png = final512Buffer.toString("base64");
  const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <defs>
    <radialGradient id="aura-${gift.id}" cx="50%" cy="50%" r="46%">
      <stop offset="0%" stop-color="${gift.accent}" stop-opacity="0.22"/>
      <stop offset="65%" stop-color="${gift.secondary}" stop-opacity="0.06"/>
      <stop offset="100%" stop-color="#000000" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <circle cx="256" cy="256" r="220" fill="url(#aura-${gift.id})"/>
  <image href="data:image/png;base64,${base64Png}" x="0" y="0" width="512" height="512"/>
</svg>`;
  const svgPath = path.join(ICONS_SVG_DIR, `${gift.id}.svg`);
  fs.writeFileSync(svgPath, svgContent, "utf8");
}

(async () => {
  ensureDirs();
  for (const gift of ALL_27_GIFTS) {
    await extractGiftIcon(gift);
  }
  console.log("SUCCESS: Generated all 27 transparent 512x512 PNGs and 27 SVGs!");
})();
