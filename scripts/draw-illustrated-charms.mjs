import fs from 'node:fs';
import path from 'node:path';

const OUT_DIR = path.resolve('public/art/charms');

/** Custom hand-crafted SVG artwork (center coordinates around 128, 148) for the 20 charms */
const CUSTOM_ART = {
  'elder-branch': `
    <!-- Glowing Druid Branch & Emerald Leaves -->
    <path d="M68,210 Q105,165 128,145 Q155,120 186,82" fill="none" stroke="#8c5828" stroke-width="14" stroke-linecap="round"/>
    <path d="M118,155 Q92,130 76,105" fill="none" stroke="#8c5828" stroke-width="9" stroke-linecap="round"/>
    <path d="M145,130 Q175,140 194,155" fill="none" stroke="#8c5828" stroke-width="8" stroke-linecap="round"/>
    <path d="M76,105 C55,85 75,62 96,85 C102,95 88,108 76,105 Z" fill="#57f7a4" stroke="#d4ffea" stroke-width="2"/>
    <path d="M186,82 C175,55 208,52 210,78 C210,94 192,92 186,82 Z" fill="#57f7a4" stroke="#d4ffea" stroke-width="2"/>
    <path d="M194,155 C218,142 224,172 200,178 C188,180 186,164 194,155 Z" fill="#38d989" stroke="#d4ffea" stroke-width="2"/>
    <path d="M132,115 C118,85 148,74 156,102 C158,114 140,120 132,115 Z" fill="#80ff72" stroke="#ffffff" stroke-width="2"/>
    <circle cx="95" cy="175" r="5" fill="#b8ff70"/>
    <circle cx="162" cy="105" r="4" fill="#b8ff70"/>
  `,
  'earth-crystal': `
    <!-- Faceted Floating Amber Geomancy Crystal -->
    <polygon points="128,62 174,118 158,212 128,236 98,212 82,118" fill="#ff9f1c" stroke="#fff3b0" stroke-width="3"/>
    <polygon points="128,62 174,118 128,142 82,118" fill="#ffe169" opacity="0.85"/>
    <polygon points="128,142 174,118 158,212 128,236" fill="#d96b00" opacity="0.85"/>
    <polygon points="128,62 128,236 98,212 82,118" fill="#ffb703" opacity="0.55"/>
    <polygon points="58,155 72,138 78,172 62,182" fill="#ffd166" stroke="#fff3b0" stroke-width="1.5"/>
    <polygon points="196,142 182,128 178,162 192,170" fill="#ffd166" stroke="#fff3b0" stroke-width="1.5"/>
  `,
  'odd-candle': `
    <!-- Occult Purple Wax Candle with Ghostly Cyan Flame -->
    <rect x="98" y="132" width="60" height="92" rx="8" fill="#5e2b97" stroke="#d599ff" stroke-width="3"/>
    <path d="M98,142 Q112,165 118,146 Q128,175 138,148 Q148,166 158,142" fill="#8b4bd1" stroke="#d599ff" stroke-width="2"/>
    <line x1="128" y1="132" x2="128" y2="118" stroke="#222" stroke-width="4"/>
    <path d="M128,60 C158,92 152,122 128,122 C104,122 98,92 128,60 Z" fill="#48cae4" stroke="#caf0f8" stroke-width="2.5"/>
    <path d="M128,78 C142,96 140,116 128,116 C116,116 114,96 128,78 Z" fill="#ffffff"/>
  `,
  'even-goblet': `
    <!-- Golden Tavern Chalice with Ruby Elixir -->
    <path d="M82,86 L174,86 C172,144 150,162 128,164 C106,162 84,144 82,86 Z" fill="#ffb703" stroke="#fff3b0" stroke-width="3"/>
    <ellipse cx="128" cy="86" rx="46" ry="12" fill="#d90429" stroke="#ffe169" stroke-width="3"/>
    <rect x="118" y="162" width="20" height="44" rx="4" fill="#fb8500" stroke="#fff3b0" stroke-width="2"/>
    <path d="M88,218 Q128,196 168,218 Z" fill="#ffb703" stroke="#fff3b0" stroke-width="3"/>
    <circle cx="128" cy="126" r="10" fill="#ff0055" stroke="#fff" stroke-width="2"/>
  `,
  'copper-ring': `
    <!-- Engraved Bronze-Copper Arcane Band -->
    <circle cx="128" cy="148" r="56" fill="none" stroke="#d97736" stroke-width="22"/>
    <circle cx="128" cy="148" r="56" fill="none" stroke="#ffba82" stroke-width="4" stroke-dasharray="10 8"/>
    <circle cx="128" cy="148" r="67" fill="none" stroke="#57f7a4" stroke-width="2" opacity="0.8"/>
    <circle cx="128" cy="148" r="45" fill="none" stroke="#57f7a4" stroke-width="2" opacity="0.8"/>
    <polygon points="128,76 142,92 128,108 114,92" fill="#57f7a4" stroke="#ffffff" stroke-width="2"/>
  `,
  'trinity-amulet': `
    <!-- Glowing Golden Triquetra Talisman -->
    <circle cx="128" cy="148" r="52" fill="none" stroke="#ffd166" stroke-width="5"/>
    <path d="M128,76 C168,108 158,168 102,176 C92,132 112,92 128,76 Z" fill="none" stroke="#57f7a4" stroke-width="8"/>
    <path d="M182,178 C134,198 86,162 106,112 C148,122 174,154 182,178 Z" fill="none" stroke="#57f7a4" stroke-width="8"/>
    <path d="M74,178 C92,130 144,106 176,148 C146,182 102,188 74,178 Z" fill="none" stroke="#57f7a4" stroke-width="8"/>
    <circle cx="128" cy="148" r="12" fill="#ffe066" stroke="#ffffff" stroke-width="2"/>
  `,
  'straight-scroll': `
    <!-- Unrolled Ancient Parchment Scroll with Golden Runes -->
    <rect x="78" y="76" width="100" height="144" rx="6" fill="#f4e0b8" stroke="#c9933b" stroke-width="3"/>
    <rect x="66" y="68" width="124" height="18" rx="9" fill="#d98a2b" stroke="#fff1b8" stroke-width="2.5"/>
    <rect x="66" y="210" width="124" height="18" rx="9" fill="#d98a2b" stroke="#fff1b8" stroke-width="2.5"/>
    <line x1="94" y1="108" x2="162" y2="108" stroke="#7b2cbf" stroke-width="5" stroke-linecap="round"/>
    <line x1="94" y1="132" x2="152" y2="132" stroke="#3a86ff" stroke-width="5" stroke-linecap="round"/>
    <line x1="94" y1="156" x2="162" y2="156" stroke="#ff006e" stroke-width="5" stroke-linecap="round"/>
    <line x1="94" y1="180" x2="140" y2="180" stroke="#fb5607" stroke-width="5" stroke-linecap="round"/>
  `,
  'flush-prism': `
    <!-- Crystalline Prism Refracting Rainbow Beams -->
    <line x1="42" y1="158" x2="104" y2="142" stroke="#ffffff" stroke-width="6" stroke-linecap="round"/>
    <line x1="150" y1="132" x2="218" y2="104" stroke="#ff3366" stroke-width="6"/>
    <line x1="154" y1="142" x2="220" y2="130" stroke="#ffbe0b" stroke-width="6"/>
    <line x1="156" y1="152" x2="220" y2="156" stroke="#38b000" stroke-width="6"/>
    <line x1="154" y1="162" x2="218" y2="182" stroke="#3a86ff" stroke-width="6"/>
    <polygon points="128,74 184,196 72,196" fill="#90e0ef" fill-opacity="0.78" stroke="#ffffff" stroke-width="4"/>
    <polygon points="128,74 184,196 128,176" fill="#00b4d8" fill-opacity="0.55"/>
  `,
  'royal-dagger': `
    <!-- Jeweled Royal Ceremonial Dagger -->
    <polygon points="128,54 148,158 128,172 108,158" fill="#e0aaff" stroke="#ffffff" stroke-width="2.5"/>
    <polygon points="128,54 148,158 128,172" fill="#9d4edd" opacity="0.75"/>
    <path d="M84,162 Q128,180 172,162 L166,176 Q128,192 90,176 Z" fill="#ffd166" stroke="#fff3b0" stroke-width="2"/>
    <rect x="119" y="176" width="18" height="40" rx="5" fill="#7b2cbf" stroke="#ffd166" stroke-width="2"/>
    <circle cx="128" cy="224" r="12" fill="#ff006e" stroke="#ffd166" stroke-width="3"/>
    <circle cx="128" cy="168" r="6" fill="#00f5d4"/>
  `,
  'scholar-quill': `
    <!-- Luminous Phoenix Feather Quill -->
    <path d="M82,218 L168,72" stroke="#fff3b0" stroke-width="5" stroke-linecap="round"/>
    <path d="M168,72 C196,92 184,148 134,174 C106,188 96,192 96,192 C96,192 96,144 124,108 C142,84 156,74 168,72 Z" fill="#00bbf9" stroke="#caf0f8" stroke-width="2.5"/>
    <path d="M168,72 C178,104 164,142 126,162 C114,132 138,94 168,72 Z" fill="#fee440" opacity="0.8"/>
    <circle cx="78" cy="224" r="6" fill="#fee440"/>
  `,
  'iron-shield': `
    <!-- Heavy Runic Knight Heater Shield -->
    <path d="M74,82 L182,82 L182,144 C182,192 128,224 128,224 C128,224 74,192 74,144 Z" fill="#33415c" stroke="#90e0ef" stroke-width="5"/>
    <path d="M88,96 L168,96 L168,142 C168,178 128,204 128,204 C128,204 88,178 88,142 Z" fill="#1b263b" stroke="#00b4d8" stroke-width="2"/>
    <line x1="128" y1="86" x2="128" y2="216" stroke="#90e0ef" stroke-width="4"/>
    <line x1="78" y1="142" x2="178" y2="142" stroke="#90e0ef" stroke-width="4"/>
    <circle cx="128" cy="142" r="14" fill="#00f5d4" stroke="#ffffff" stroke-width="2"/>
  `,
  'gambler-bones': `
    <!-- Bone-Carved Dice in Spectral Green Flame -->
    <rect x="68" y="96" width="66" height="66" rx="12" transform="rotate(-12 101 129)" fill="#f8f9fa" stroke="#57f7a4" stroke-width="3"/>
    <circle cx="88" cy="116" r="5" fill="#111"/>
    <circle cx="114" cy="142" r="5" fill="#111"/>
    <rect x="122" y="132" width="66" height="66" rx="12" transform="rotate(14 155 165)" fill="#e9ecef" stroke="#57f7a4" stroke-width="3"/>
    <circle cx="142" cy="150" r="5" fill="#d90429"/>
    <circle cx="155" cy="165" r="5" fill="#111"/>
    <circle cx="168" cy="180" r="5" fill="#d90429"/>
  `,
  'last-hourglass': `
    <!-- Brass Hourglass with Glowing Magenta Sand -->
    <rect x="78" y="72" width="100" height="12" rx="5" fill="#ffd166" stroke="#fff3b0" stroke-width="2"/>
    <rect x="78" y="212" width="100" height="12" rx="5" fill="#ffd166" stroke="#fff3b0" stroke-width="2"/>
    <path d="M88,84 L168,84 L134,148 L168,212 L88,212 L122,148 Z" fill="#240046" fill-opacity="0.7" stroke="#ff9e00" stroke-width="3.5"/>
    <polygon points="104,116 152,116 128,146" fill="#ff007f"/>
    <polygon points="94,210 162,210 128,166" fill="#ff007f"/>
    <line x1="128" y1="146" x2="128" y2="176" stroke="#ff70a6" stroke-width="4" stroke-dasharray="4 3"/>
  `,
  'blood-pact': `
    <!-- Blood-Stained Contract with Crimson Wax Seal -->
    <rect x="76" y="72" width="104" height="148" rx="6" fill="#2b192e" stroke="#ff4d79" stroke-width="3"/>
    <line x1="92" y1="98" x2="164" y2="98" stroke="#ff8fa3" stroke-width="4"/>
    <line x1="92" y1="118" x2="154" y2="118" stroke="#ff8fa3" stroke-width="4"/>
    <line x1="92" y1="138" x2="160" y2="138" stroke="#ff8fa3" stroke-width="4"/>
    <circle cx="144" cy="182" r="22" fill="#d90429" stroke="#ffccd5" stroke-width="3"/>
    <polygon points="144,168 150,180 162,180 152,188 156,200 144,192 132,200 136,188 126,180 138,180" fill="#ffccd5"/>
  `,
  'ouroboros': `
    <!-- Emerald-Gold Serpent Biting Its Own Tail -->
    <circle cx="128" cy="148" r="54" fill="none" stroke="#38b000" stroke-width="22"/>
    <circle cx="128" cy="148" r="54" fill="none" stroke="#9ef01a" stroke-width="6" stroke-dasharray="12 8"/>
    <polygon points="128,78 154,94 128,110" fill="#70e000" stroke="#ffffff" stroke-width="2"/>
    <circle cx="138" cy="90" r="4" fill="#ff0055"/>
  `,
  'blood-chalice': `
    <!-- Gothic Obsidian Vampire Chalice with Levitating Blood Drops -->
    <path d="M84,96 L172,96 C168,148 148,166 128,168 C108,166 88,148 84,96 Z" fill="#2b0918" stroke="#ff477e" stroke-width="3.5"/>
    <rect x="120" y="168" width="16" height="42" fill="#590d22" stroke="#ff477e" stroke-width="2"/>
    <ellipse cx="128" cy="214" rx="38" ry="8" fill="#590d22" stroke="#ff477e" stroke-width="2.5"/>
    <path d="M128,62 C138,76 136,88 128,88 C120,88 118,76 128,62 Z" fill="#ff0a54" stroke="#ffccd5" stroke-width="1.5"/>
    <circle cx="108" cy="78" r="5" fill="#ff0a54"/>
    <circle cx="148" cy="78" r="5" fill="#ff0a54"/>
  `,
  'philosopher-stone': `
    <!-- Legendary Crimson Philosopher's Stone in Golden Alchemical Cage -->
    <circle cx="128" cy="148" r="64" fill="none" stroke="#ffd166" stroke-width="3"/>
    <polygon points="128,74 192,186 64,186" fill="none" stroke="#ffd166" stroke-width="3"/>
    <rect x="84" y="104" width="88" height="88" fill="none" stroke="#ffd166" stroke-width="2.5"/>
    <polygon points="128,96 168,148 128,200 88,148" fill="#e63946" stroke="#ffffff" stroke-width="3"/>
    <polygon points="128,96 168,148 128,148" fill="#ff758f" opacity="0.8"/>
  `,
  'archmage-staff': `
    <!-- Supreme Archmage Staff with Cosmic Mana Orb -->
    <line x1="128" y1="234" x2="128" y2="122" stroke="#ffd166" stroke-width="12" stroke-linecap="round"/>
    <path d="M92,132 C84,84 128,64 128,64 C128,64 172,84 164,132" fill="none" stroke="#ffd166" stroke-width="8" stroke-linecap="round"/>
    <circle cx="128" cy="104" r="24" fill="#00f5d4" stroke="#ffffff" stroke-width="3"/>
    <circle cx="122" cy="96" r="7" fill="#ffffff"/>
  `,
  'mimic-slime': `
    <!-- Cobalt-Blue Arcane Blueprint Scroll with Hologram Sigil -->
    <rect x="68" y="76" width="120" height="144" rx="8" fill="#003566" stroke="#4cc9f0" stroke-width="3.5"/>
    <line x1="68" y1="106" x2="188" y2="106" stroke="#4cc9f0" stroke-width="1" opacity="0.45"/>
    <line x1="68" y1="136" x2="188" y2="136" stroke="#4cc9f0" stroke-width="1" opacity="0.45"/>
    <line x1="68" y1="166" x2="188" y2="166" stroke="#4cc9f0" stroke-width="1" opacity="0.45"/>
    <line x1="98" y1="76" x2="98" y2="220" stroke="#4cc9f0" stroke-width="1" opacity="0.45"/>
    <line x1="128" y1="76" x2="128" y2="220" stroke="#4cc9f0" stroke-width="1" opacity="0.45"/>
    <line x1="158" y1="76" x2="158" y2="220" stroke="#4cc9f0" stroke-width="1" opacity="0.45"/>
    <polygon points="128,96 168,148 128,200 88,148" fill="none" stroke="#ffffff" stroke-width="3" stroke-dasharray="6 4"/>
    <circle cx="128" cy="148" r="18" fill="none" stroke="#90e0ef" stroke-width="3"/>
    <polygon points="134,138 154,148 134,158" fill="#ffffff"/>
  `,
  'echo-skull': `
    <!-- Psychic Crystal Brain-Skull Radiating Magenta Waves -->
    <circle cx="128" cy="142" r="64" fill="none" stroke="#ff70a6" stroke-width="2.5" stroke-dasharray="6 6"/>
    <path d="M86,136 C86,96 170,96 170,136 C170,158 156,168 152,182 L148,204 L108,204 L104,182 C100,168 86,158 86,136 Z" fill="#f72585" fill-opacity="0.85" stroke="#ffffff" stroke-width="3"/>
    <path d="M100,124 Q114,110 128,124 Q142,110 156,124" fill="none" stroke="#7209b7" stroke-width="4"/>
    <circle cx="112" cy="152" r="10" fill="#10002b"/>
    <circle cx="144" cy="152" r="10" fill="#10002b"/>
    <circle cx="112" cy="152" r="5" fill="#4cc9f0"/>
    <circle cx="144" cy="152" r="5" fill="#4cc9f0"/>
  `,
};

let updated = 0;
for (const [id, innerArt] of Object.entries(CUSTOM_ART)) {
  const filePath = path.join(OUT_DIR, `${id}.svg`);
  const existing = fs.readFileSync(filePath, 'utf8');
  const replaced = existing.replace(
    /<!-- Center Medallion Pedestal -->[\s\S]*?<\/svg>/,
    `<!-- Custom Illustrated Artifact -->\n  <g filter="url(#glow)">${innerArt}</g>\n</svg>`,
  );
  fs.writeFileSync(filePath, replaced, 'utf8');
  updated++;
}

console.log(`Updated ${updated} tarot SVGs with custom vector illustrations.`);
