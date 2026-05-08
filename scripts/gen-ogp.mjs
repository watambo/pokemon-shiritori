import sharp from 'sharp';

// GB palette
const C = {
  lightest: '#d8e8b0',
  light:    '#a8c870',
  dark:     '#508040',
  darkest:  '#203820',
};

// Pixel-art helper: draw a filled rectangle string
const rect = (x, y, w, h, fill, extra = '') =>
  `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${fill}" ${extra}/>`;

// Pixel-art border: 4-corner square frame using rects (no rounded corners = pixel look)
function pixelFrame(x, y, w, h, t, fill) {
  return [
    rect(x,         y,         w,  t,    fill), // top
    rect(x,         y+h-t,     w,  t,    fill), // bottom
    rect(x,         y+t,       t,  h-2*t, fill), // left
    rect(x+w-t,     y+t,       t,  h-2*t, fill), // right
  ].join('');
}

// Speaker dots (3x3 grid of circles)
function speakerDots(cx, cy, gap, r, fill, rows=4, cols=3) {
  let out = '';
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      out += `<circle cx="${cx + col*gap}" cy="${cy + row*gap}" r="${r}" fill="${fill}"/>`;
    }
  }
  return out;
}

// D-pad cross
function dpad(cx, cy, size, fill) {
  const s = size;
  return [
    rect(cx - s/6, cy - s/2, s/3, s, fill),   // vertical
    rect(cx - s/2, cy - s/6, s, s/3, fill),   // horizontal
  ].join('');
}

// A/B buttons
function abButtons(cx, cy, r, fill, label, labelFill) {
  return `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${fill}"/>
  <text x="${cx}" y="${cy}" font-family="Courier New" font-size="${r*1.1}" font-weight="bold"
    fill="${labelFill}" text-anchor="middle" dominant-baseline="central">${label}</text>`;
}

const W = 1200, H = 630;

// Device body dimensions
const DEV_W = 460, DEV_H = 580;
const DEV_X = (W - DEV_W) / 2;  // 370
const DEV_Y = (H - DEV_H) / 2;  // 25

// Screen dimensions (inside device)
const SCR_X = DEV_X + 40, SCR_Y = DEV_Y + 40;
const SCR_W = DEV_W - 80, SCR_H = 280;

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
<defs>
  <!-- Background dot pattern -->
  <pattern id="dots" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
    <circle cx="10" cy="10" r="1.5" fill="${C.dark}" opacity="0.35"/>
  </pattern>
</defs>

<!-- ── Background ── -->
${rect(0, 0, W, H, C.darkest)}
${rect(0, 0, W, H, 'url(#dots)')}

<!-- ── Left decorative column ── -->
${rect(0, 0, DEV_X - 20, H, C.darkest)}
<!-- Left accent lines -->
${rect(DEV_X - 60, 60, 6, H-120, C.dark)}
${rect(DEV_X - 44, 100, 4, H-200, C.dark)}

<!-- ── Right decorative column ── -->
${rect(DEV_X + DEV_W + 20, 0, W - (DEV_X + DEV_W + 20), H, C.darkest)}
<!-- Right accent lines -->
${rect(DEV_X + DEV_W + 38, 60, 6, H-120, C.dark)}
${rect(DEV_X + DEV_W + 54, 100, 4, H-200, C.dark)}

<!-- ── Game Boy device body ── -->
<!-- Shadow -->
${rect(DEV_X+8, DEV_Y+8, DEV_W, DEV_H, '#000000', 'opacity="0.4" rx="24"')}
<!-- Main body -->
${rect(DEV_X, DEV_Y, DEV_W, DEV_H, C.dark, 'rx="20"')}
<!-- Body highlight (top edge) -->
${rect(DEV_X+4, DEV_Y+4, DEV_W-8, 12, C.light, 'rx="16" opacity="0.5"')}
<!-- Inner body -->
${rect(DEV_X+6, DEV_Y+6, DEV_W-12, DEV_H-12, C.darkest, 'rx="16"')}

<!-- ── Screen bezel ── -->
${rect(SCR_X-12, SCR_Y-12, SCR_W+24, SCR_H+24, C.dark)}
<!-- Screen border (pixel-perfect) -->
${rect(SCR_X-8,  SCR_Y-8,  SCR_W+16, SCR_H+16, C.darkest)}
${rect(SCR_X-4,  SCR_Y-4,  SCR_W+8,  SCR_H+8,  C.dark)}
<!-- Screen itself -->
${rect(SCR_X, SCR_Y, SCR_W, SCR_H, C.lightest)}

<!-- Screen scanlines (subtle) -->
<rect x="${SCR_X}" y="${SCR_Y}" width="${SCR_W}" height="${SCR_H}" fill="none"
  style="background:repeating-linear-gradient(0deg,transparent,transparent 3px,rgba(0,0,0,.04) 3px,rgba(0,0,0,.04) 4px)"/>
<pattern id="scanlines" x="0" y="0" width="${SCR_W}" height="4" patternUnits="userSpaceOnUse">
  <rect x="0" y="3" width="${SCR_W}" height="1" fill="#000" opacity="0.06"/>
</pattern>
<rect x="${SCR_X}" y="${SCR_Y}" width="${SCR_W}" height="${SCR_H}" fill="url(#scanlines)"/>

<!-- ── Screen content ── -->
<!-- Top bar on screen -->
${rect(SCR_X, SCR_Y, SCR_W, 44, C.dark)}
<text x="${SCR_X + SCR_W/2}" y="${SCR_Y + 27}"
  font-family="'Courier New', monospace" font-size="17" font-weight="bold"
  fill="${C.lightest}" text-anchor="middle" letter-spacing="5">
  &#9733; POKEMON &#9733;
</text>

<!-- Game title - Japanese -->
<text x="${SCR_X + SCR_W/2}" y="${SCR_Y + 118}"
  font-family="'Hiragino Kaku Gothic ProN', 'Hiragino Sans', monospace"
  font-size="56" font-weight="900"
  fill="${C.darkest}" text-anchor="middle" letter-spacing="4">
  しりとり
</text>
<text x="${SCR_X + SCR_W/2}" y="${SCR_Y + 185}"
  font-family="'Hiragino Kaku Gothic ProN', 'Hiragino Sans', monospace"
  font-size="56" font-weight="900"
  fill="${C.darkest}" text-anchor="middle" letter-spacing="4">
  どうじょう
</text>

<!-- Screen bottom rule lines -->
${rect(SCR_X+10, SCR_Y+SCR_H-50, SCR_W-20, 4, C.dark)}
<text x="${SCR_X + SCR_W/2}" y="${SCR_Y + SCR_H - 22}"
  font-family="'Hiragino Sans', 'Hiragino Kaku Gothic ProN', monospace"
  font-size="15" fill="${C.dark}" text-anchor="middle" letter-spacing="2">
  1・2だいポケモンでCPUにいどめ！
</text>

<!-- ── Nintendo-style label under screen ── -->
<text x="${DEV_X + DEV_W/2}" y="${SCR_Y + SCR_H + 26}"
  font-family="'Courier New', monospace" font-size="10" font-weight="bold"
  fill="${C.light}" text-anchor="middle" letter-spacing="3">
  POKEMON SHIRITORI
</text>

<!-- ── D-pad ── -->
${dpad(DEV_X + 82, SCR_Y + SCR_H + 90, 60, C.dark)}
<!-- D-pad center dot -->
<circle cx="${DEV_X + 82}" cy="${SCR_Y + SCR_H + 90}" r="6" fill="${C.darkest}"/>

<!-- ── A/B buttons ── -->
${abButtons(DEV_X + DEV_W - 82, SCR_Y + SCR_H + 72,  22, C.dark, 'A', C.lightest)}
${abButtons(DEV_X + DEV_W - 118, SCR_Y + SCR_H + 102, 22, C.dark, 'B', C.lightest)}

<!-- ── START/SELECT ── -->
${rect(DEV_X + DEV_W/2 - 54, SCR_Y + SCR_H + 112, 42, 10, C.dark, 'rx="5"')}
${rect(DEV_X + DEV_W/2 + 12, SCR_Y + SCR_H + 112, 42, 10, C.dark, 'rx="5"')}
<text x="${DEV_X + DEV_W/2 - 33}" y="${SCR_Y + SCR_H + 130}"
  font-family="Courier New" font-size="8" fill="${C.dark}" text-anchor="middle">SELECT</text>
<text x="${DEV_X + DEV_W/2 + 33}" y="${SCR_Y + SCR_H + 130}"
  font-family="Courier New" font-size="8" fill="${C.dark}" text-anchor="middle">START</text>

<!-- ── Speaker grille (right side of device) ── -->
${speakerDots(DEV_X + DEV_W - 90, SCR_Y + SCR_H + 62, 12, 3.5, C.dark, 5, 4)}

<!-- ── Left panel: tagline ── -->
<text
  x="${(DEV_X - 20) / 2}" y="${H/2 - 80}"
  font-family="'Hiragino Sans', 'Hiragino Kaku Gothic ProN', monospace"
  font-size="22" font-weight="bold" fill="${C.light}"
  text-anchor="middle" dominant-baseline="middle" writing-mode="lr">
  ポケモンの
</text>
<text
  x="${(DEV_X - 20) / 2}" y="${H/2 - 40}"
  font-family="'Hiragino Sans', 'Hiragino Kaku Gothic ProN', monospace"
  font-size="22" font-weight="bold" fill="${C.light}"
  text-anchor="middle" dominant-baseline="middle">
  なまえで
</text>
<text
  x="${(DEV_X - 20) / 2}" y="${H/2}"
  font-family="'Hiragino Sans', 'Hiragino Kaku Gothic ProN', monospace"
  font-size="22" font-weight="bold" fill="${C.light}"
  text-anchor="middle" dominant-baseline="middle">
  しりとり
</text>
<text
  x="${(DEV_X - 20) / 2}" y="${H/2 + 50}"
  font-family="'Courier New', monospace"
  font-size="13" fill="${C.dark}"
  text-anchor="middle" dominant-baseline="middle">
  ★ FREE ★
</text>

<!-- ── Right panel: URL ── -->
<text
  x="${DEV_X + DEV_W + 20 + (W - DEV_X - DEV_W - 20) / 2}" y="${H/2 - 20}"
  font-family="'Courier New', monospace"
  font-size="11" fill="${C.light}"
  text-anchor="middle" dominant-baseline="middle">
  watambo.github.io/
</text>
<text
  x="${DEV_X + DEV_W + 20 + (W - DEV_X - DEV_W - 20) / 2}" y="${H/2 + 10}"
  font-family="'Courier New', monospace"
  font-size="11" fill="${C.light}"
  text-anchor="middle" dominant-baseline="middle">
  pokemon-shiritori/
</text>

<!-- ── Outer pixel frame ── -->
${pixelFrame(0, 0, W, H, 8, C.dark)}
${pixelFrame(8, 8, W-16, H-16, 4, C.darkest)}
${pixelFrame(12, 12, W-24, H-24, 2, C.dark)}

</svg>`;

import { default as sh } from 'sharp';
sh(Buffer.from(svg))
  .png()
  .toFile('./public/ogp.png')
  .then(info => console.log('✅ public/ogp.png generated', info.width + 'x' + info.height))
  .catch(e => { console.error('❌', e.message); process.exit(1); });
