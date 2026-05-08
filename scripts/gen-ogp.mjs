import sharp from 'sharp';
import { writeFileSync } from 'fs';

// OGP image: 1200x630, Game Boy style
const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630">
  <defs>
    <style>
      @import url('https://fonts.googleapis.com/css2?family=Press+Start+2P&amp;display=swap');
    </style>
  </defs>

  <!-- Background -->
  <rect width="1200" height="630" fill="#203820"/>

  <!-- Inner frame -->
  <rect x="32" y="32" width="1136" height="566" fill="#203820" stroke="#a8c870" stroke-width="8"/>

  <!-- Screen area -->
  <rect x="80" y="80" width="1040" height="470" fill="#d8e8b0" rx="8"/>

  <!-- Screen inner border -->
  <rect x="88" y="88" width="1024" height="454" fill="#d8e8b0" stroke="#203820" stroke-width="6" rx="4"/>

  <!-- Pixel decoration top -->
  <rect x="88" y="88" width="1024" height="56" fill="#508040" rx="4"/>

  <!-- Title text block -->
  <!-- ★ POKEMON ★ -->
  <text x="600" y="160" font-family="'Press Start 2P', monospace" font-size="38"
        fill="#d8e8b0" text-anchor="middle" letter-spacing="6">
    &#9733; POKEMON &#9733;
  </text>

  <!-- しりとりどうじょう -->
  <text x="600" y="270" font-family="'Press Start 2P', monospace" font-size="54"
        fill="#203820" text-anchor="middle" letter-spacing="4">
    しりとり
  </text>
  <text x="600" y="340" font-family="'Press Start 2P', monospace" font-size="54"
        fill="#203820" text-anchor="middle" letter-spacing="4">
    どうじょう
  </text>

  <!-- Separator line -->
  <rect x="120" y="370" width="960" height="6" fill="#508040"/>

  <!-- Sub text -->
  <text x="600" y="420" font-family="'Press Start 2P', monospace" font-size="22"
        fill="#508040" text-anchor="middle" letter-spacing="2">
    1・2だいポケモンでたたかえ！
  </text>

  <!-- Pixel bullets -->
  <text x="200" y="480" font-family="'Press Start 2P', monospace" font-size="16"
        fill="#203820" letter-spacing="1">
    ▸ 60びょういないにこたえろ
  </text>
  <text x="640" y="480" font-family="'Press Start 2P', monospace" font-size="16"
        fill="#203820" letter-spacing="1">
    ▸ ンでおわるとまけ
  </text>

  <!-- Bottom bar -->
  <rect x="88" y="502" width="1024" height="40" fill="#a8c870" rx="4"/>
  <text x="600" y="528" font-family="'Press Start 2P', monospace" font-size="14"
        fill="#203820" text-anchor="middle" letter-spacing="2">
    watambo.github.io/pokemon-shiritori/
  </text>
</svg>`;

const buf = Buffer.from(svg);

sharp(buf)
  .resize(1200, 630)
  .png()
  .toFile('./public/ogp.png')
  .then(() => console.log('✅ public/ogp.png generated'))
  .catch(e => console.error('❌', e));
