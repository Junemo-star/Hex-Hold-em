import fs from 'node:fs';
import path from 'node:path';

const OUT_DIR = path.resolve('public/art/charms');
fs.mkdirSync(OUT_DIR, { recursive: true });

const CHARM_META = [
  { id: 'beer-jug', emoji: '🍺', rarity: 'common', pal: ['#3b2110', '#140905', '#ffbe4f', '#ff7b29'] },
  { id: 'jester-hat', emoji: '🃏', rarity: 'common', pal: ['#36144f', '#12061f', '#ff6be6', '#ffbe4f'] },
  { id: 'fire-ring', emoji: '🔥', rarity: 'common', pal: ['#4f1218', '#170408', '#ff5136', '#ffbe4f'] },
  { id: 'water-pendant', emoji: '💧', rarity: 'common', pal: ['#0f2d59', '#050e21', '#4fc3ff', '#7cf7e4'] },
  { id: 'elder-branch', emoji: '🌿', rarity: 'common', pal: ['#113d29', '#06170f', '#57f7a4', '#b8ff70'] },
  { id: 'earth-crystal', emoji: '💎', rarity: 'common', pal: ['#452b10', '#170d04', '#ffb44f', '#ffe680'] },
  { id: 'odd-candle', emoji: '🕯️', rarity: 'common', pal: ['#291547', '#0d061a', '#70e4ff', '#d599ff'] },
  { id: 'even-goblet', emoji: '🍷', rarity: 'common', pal: ['#4a1026', '#17040c', '#ff4d79', '#ffd269'] },
  { id: 'copper-ring', emoji: '🥉', rarity: 'common', pal: ['#3d2417', '#140b06', '#f0945b', '#57f7a4'] },
  { id: 'twin-mirror', emoji: '👯', rarity: 'common', pal: ['#1a2b4c', '#090f1f', '#8ce7ff', '#d4b8ff'] },
  { id: 'two-pair-gloves', emoji: '🧤', rarity: 'common', pal: ['#331c47', '#11081c', '#ffa657', '#d499ff'] },
  { id: 'trinity-amulet', emoji: '☘️', rarity: 'common', pal: ['#12402b', '#05170e', '#57f7a4', '#ffe066'] },
  { id: 'solo-mask', emoji: '🎭', rarity: 'common', pal: ['#38163d', '#120617', '#ff75b5', '#ffd166'] },
  { id: 'full-hand-banner', emoji: '🚩', rarity: 'common', pal: ['#47151f', '#170509', '#ff5964', '#ffd166'] },
  { id: 'abstract-grimoire', emoji: '📚', rarity: 'common', pal: ['#2c1654', '#0e061f', '#c28cff', '#57f7a4'] },
  { id: 'azure-spirit', emoji: '👻', rarity: 'common', pal: ['#102c54', '#050f21', '#63c5ff', '#b8ecff'] },
  { id: 'half-jester', emoji: '🎪', rarity: 'common', pal: ['#45163b', '#170514', '#ff6b9d', '#ffe066'] },
  { id: 'misprint-tome', emoji: '👾', rarity: 'common', pal: ['#1f3b34', '#081412', '#57f7a4', '#ff4d94'] },

  { id: 'lucky-coin', emoji: '🪙', rarity: 'uncommon', pal: ['#45320e', '#171003', '#ffd95e', '#57f7a4'] },
  { id: 'straight-scroll', emoji: '📜', rarity: 'uncommon', pal: ['#3b2a14', '#140d05', '#ffcf70', '#70c4ff'] },
  { id: 'flush-prism', emoji: '🌈', rarity: 'uncommon', pal: ['#1f1c54', '#0a0821', '#70e4ff', '#ff70c8'] },
  { id: 'royal-dagger', emoji: '🗡️', rarity: 'uncommon', pal: ['#2f144f', '#0f051c', '#c880ff', '#ffd166'] },
  { id: 'scholar-quill', emoji: '🪶', rarity: 'uncommon', pal: ['#14304f', '#06101c', '#78d2ff', '#ffd166'] },
  { id: 'iron-shield', emoji: '🛡️', rarity: 'uncommon', pal: ['#1a2a3d', '#080e17', '#7ac7ff', '#d6e8ff'] },
  { id: 'gambler-bones', emoji: '🦴', rarity: 'uncommon', pal: ['#1a3829', '#07140d', '#6bffb3', '#e8ffd9'] },
  { id: 'seven-clover', emoji: '🍀', rarity: 'uncommon', pal: ['#0f4526', '#04170c', '#4dff91', '#ffe066'] },
  { id: 'midas-hand', emoji: '✋', rarity: 'uncommon', pal: ['#4d360b', '#1a1102', '#ffd64f', '#fff3b8'] },
  { id: 'sniper-monocle', emoji: '🧐', rarity: 'uncommon', pal: ['#162c4a', '#060e1a', '#63beff', '#ffd166'] },
  { id: 'full-house-cauldron', emoji: '🍲', rarity: 'uncommon', pal: ['#293d16', '#0d1405', '#99ff57', '#ff9f4f'] },
  { id: 'golden-bull', emoji: '🐂', rarity: 'uncommon', pal: ['#47280e', '#170b03', '#ffae42', '#ffe380'] },
  { id: 'golden-boots', emoji: '👢', rarity: 'uncommon', pal: ['#3d2412', '#140b04', '#ffc457', '#70c4ff'] },
  { id: 'void-erosion', emoji: '🕳️', rarity: 'uncommon', pal: ['#241042', '#080312', '#b366ff', '#57f7a4'] },
  { id: 'fibonacci-spiral', emoji: '🐚', rarity: 'uncommon', pal: ['#123847', '#051217', '#5ce1e6', '#ffd166'] },
  { id: 'supernova-orb', emoji: '👖', rarity: 'uncommon', pal: ['#1c2854', '#080c1f', '#7aa2ff', '#ff9e66'] },
  { id: 'smiley-mask', emoji: '😄', rarity: 'uncommon', pal: ['#3d2b12', '#140d04', '#ffd157', '#ff6b8b'] },

  { id: 'moon-eye', emoji: '🌙', rarity: 'rare', pal: ['#1c144a', '#07041c', '#80d4ff', '#ff66a3'] },
  { id: 'last-hourglass', emoji: '⏳', rarity: 'rare', pal: ['#471236', '#170411', '#ff66b5', '#ffd166'] },
  { id: 'blood-pact', emoji: '🩸', rarity: 'rare', pal: ['#4f0d1b', '#170207', '#ff335c', '#ffb8c6'] },
  { id: 'ouroboros', emoji: '🐍', rarity: 'rare', pal: ['#113d28', '#04140c', '#4dff9d', '#ff5c8a'] },
  { id: 'blood-chalice', emoji: '🏺', rarity: 'rare', pal: ['#4d0f24', '#17030a', '#ff4778', '#ffd166'] },
  { id: 'pair-anvil', emoji: '🔨', rarity: 'rare', pal: ['#3b1b29', '#14070c', '#ff7a59', '#99d6ff'] },
  { id: 'assassin-cloak', emoji: '🥷', rarity: 'rare', pal: ['#261238', '#0b0412', '#d966ff', '#ff4d79'] },
  { id: 'four-horsemen', emoji: '🐎', rarity: 'rare', pal: ['#471414', '#170404', '#ff5252', '#ffd166'] },
  { id: 'void-stencil', emoji: '🖼️', rarity: 'rare', pal: ['#29104a', '#090314', '#c470ff', '#ff5c8a'] },
  { id: 'blackboard-rune', emoji: '⬛', rarity: 'rare', pal: ['#1c2030', '#090b12', '#8fa8ff', '#57f7a4'] },
  { id: 'mimic-slime', emoji: '🗺️', rarity: 'rare', pal: ['#0d2e5c', '#041024', '#4db8ff', '#ffffff'] },
  { id: 'echo-skull', emoji: '🧠', rarity: 'rare', pal: ['#42123b', '#140412', '#ff6bd6', '#70e4ff'] },

  { id: 'crown', emoji: '👑', rarity: 'legendary', pal: ['#52360a', '#1c1002', '#ffe066', '#ff5c8a'] },
  { id: 'philosopher-stone', emoji: '🔮', rarity: 'legendary', pal: ['#541125', '#1c040b', '#ffbe4f', '#ff3864'] },
  { id: 'archmage-staff', emoji: '🪄', rarity: 'legendary', pal: ['#331259', '#100421', '#ffe066', '#66f7ff'] },
];

function toRoman(num) {
  const map = [
    [50, 'L'],
    [40, 'XL'],
    [10, 'X'],
    [9, 'IX'],
    [5, 'V'],
    [4, 'IV'],
    [1, 'I'],
  ];
  let n = num;
  let out = '';
  for (const [val, sym] of map) {
    while (n >= val) {
      out += sym;
      n -= val;
    }
  }
  return out;
}

function geometryPattern(styleIdx, c1, c2) {
  switch (styleIdx % 6) {
    case 0: // Sunburst Astrolabe
      return `
        <circle cx="128" cy="148" r="86" fill="none" stroke="${c1}" stroke-width="2" opacity="0.45"/>
        <circle cx="128" cy="148" r="68" fill="none" stroke="${c2}" stroke-width="1.5" stroke-dasharray="6 4" opacity="0.6"/>
        <polygon points="128,48 148,118 220,118 162,160 184,230 128,188 72,230 94,160 36,118 108,118" fill="${c1}" opacity="0.16"/>
        <polygon points="128,62 172,148 128,234 84,148" fill="none" stroke="${c1}" stroke-width="1.5" opacity="0.5"/>
      `;
    case 1: // Hexagram Seal + Orbiting Moons
      return `
        <circle cx="128" cy="148" r="82" fill="none" stroke="${c1}" stroke-width="2.2" opacity="0.5"/>
        <polygon points="128,68 198,188 58,188" fill="none" stroke="${c1}" stroke-width="2" opacity="0.55"/>
        <polygon points="128,228 198,108 58,108" fill="none" stroke="${c2}" stroke-width="2" opacity="0.55"/>
        <circle cx="128" cy="68" r="6" fill="${c1}" opacity="0.8"/>
        <circle cx="128" cy="228" r="6" fill="${c2}" opacity="0.8"/>
      `;
    case 2: // Gothic Cathedral Arch
      return `
        <path d="M44,250 L44,125 Q44,52 128,44 Q212,52 212,125 L212,250 Z" fill="none" stroke="${c1}" stroke-width="2.5" opacity="0.5"/>
        <circle cx="128" cy="148" r="64" fill="none" stroke="${c2}" stroke-width="1.8" stroke-dasharray="4 4" opacity="0.65"/>
        <rect x="83" y="103" width="90" height="90" transform="rotate(45 128 148)" fill="${c1}" opacity="0.14" stroke="${c1}" stroke-width="1.5"/>
      `;
    case 3: // Diamond Compass Rose
      return `
        <polygon points="128,50 210,148 128,246 46,148" fill="${c1}" opacity="0.14" stroke="${c1}" stroke-width="2"/>
        <polygon points="128,74 190,148 128,222 66,148" fill="none" stroke="${c2}" stroke-width="1.5" stroke-dasharray="5 3" opacity="0.65"/>
        <line x1="36" y1="148" x2="220" y2="148" stroke="${c1}" stroke-width="1.2" opacity="0.4"/>
        <line x1="128" y1="44" x2="128" y2="252" stroke="${c1}" stroke-width="1.2" opacity="0.4"/>
      `;
    case 4: // Eclipse Halo + Crescent
      return `
        <circle cx="128" cy="148" r="88" fill="none" stroke="${c1}" stroke-width="1.5" stroke-dasharray="2 5" opacity="0.65"/>
        <circle cx="128" cy="148" r="70" fill="${c2}" opacity="0.15"/>
        <circle cx="128" cy="148" r="58" fill="none" stroke="${c1}" stroke-width="2.5" opacity="0.65"/>
        <path d="M88,82 A76,76 0 1,0 188,202 A62,62 0 1,1 88,82 Z" fill="${c1}" opacity="0.22"/>
      `;
    default: // Arcane Blueprint Octagram
      return `
        <rect x="58" y="78" width="140" height="140" fill="none" stroke="${c1}" stroke-width="1.8" opacity="0.45"/>
        <rect x="58" y="78" width="140" height="140" transform="rotate(45 128 148)" fill="${c2}" opacity="0.13" stroke="${c2}" stroke-width="1.8"/>
        <circle cx="128" cy="148" r="52" fill="none" stroke="${c1}" stroke-width="2" opacity="0.6"/>
      `;
  }
}

CHARM_META.forEach((c, idx) => {
  const [bgInner, bgOuter, accent1, accent2] = c.pal;
  const roman = toRoman(idx + 1);
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 300">
  <defs>
    <radialGradient id="bg" cx="50%" cy="48%" r="65%">
      <stop offset="0%" stop-color="${bgInner}"/>
      <stop offset="100%" stop-color="${bgOuter}"/>
    </radialGradient>
    <radialGradient id="halo" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="${accent1}" stop-opacity="0.45"/>
      <stop offset="65%" stop-color="${accent2}" stop-opacity="0.12"/>
      <stop offset="100%" stop-color="${bgOuter}" stop-opacity="0"/>
    </radialGradient>
    <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="4" stdDeviation="6" flood-color="#000000" flood-opacity="0.8"/>
    </filter>
  </defs>

  <!-- Full-bleed background -->
  <rect width="256" height="300" fill="url(#bg)"/>
  <circle cx="128" cy="148" r="110" fill="url(#halo)"/>

  <!-- Tarot Outer & Inner Borders -->
  <rect x="10" y="10" width="236" height="280" rx="14" fill="none" stroke="${accent1}" stroke-width="2.5" opacity="0.65"/>
  <rect x="17" y="17" width="222" height="266" rx="10" fill="none" stroke="${accent2}" stroke-width="1.2" stroke-dasharray="5 4" opacity="0.45"/>

  <!-- Corner Ornaments -->
  <circle cx="28" cy="28" r="4" fill="${accent1}" opacity="0.8"/>
  <circle cx="228" cy="28" r="4" fill="${accent1}" opacity="0.8"/>
  <circle cx="28" cy="242" r="4" fill="${accent1}" opacity="0.8"/>
  <circle cx="228" cy="242" r="4" fill="${accent1}" opacity="0.8"/>

  <!-- Roman Numeral Tarot Header -->
  <text x="128" y="39" text-anchor="middle" fill="${accent1}" font-family="Georgia, serif" font-size="15" font-weight="bold" letter-spacing="2" opacity="0.85">${roman}</text>

  <!-- Sacred Geometry Layer -->
  ${geometryPattern(idx, accent1, accent2)}

  <!-- Center Medallion Pedestal -->
  <circle cx="128" cy="148" r="46" fill="${bgOuter}" fill-opacity="0.72" stroke="${accent1}" stroke-width="2.5"/>

  <!-- Main Artifact Icon -->
  <text x="128" y="172" text-anchor="middle" font-size="72" filter="url(#glow)">${c.emoji}</text>
</svg>
`;
  fs.writeFileSync(path.join(OUT_DIR, `${c.id}.svg`), svg, 'utf8');
});

console.log(`Generated ${CHARM_META.length} tarot SVG files in ${OUT_DIR}`);
