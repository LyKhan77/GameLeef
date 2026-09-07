export interface GameControl {
  key: string;
  action: string;
}

export interface LeaderboardEntry {
  rank: number;
  player: string;
  score: number;
  badge?: string;
  isPlayer?: boolean;
}

export interface GameItem {
  id: string;
  title: string;
  tagline: string;
  description: string;
  category: 'Simulation' | 'Arcade' | 'Action' | 'Music' | 'Chill' | 'Casual';
  genre: string; // Detail genre e.g. "Simulation, Chill", "Arcade-Gambling", etc.
  developer: string;
  developerRole?: string;
  aiEngine: string; // e.g. 'Qwen3.8 27B', 'GLM 5.3 Flash', 'Opus 5', 'Claude 3.7 Sonnet'
  thumbnail: string;
  accentColor: string;
  icon: string;
  gameUrl: string;
  playsCount: string;
  rating: number;
  releaseYear: number;
  potatoScore: string;
  humorBadges: string[];
  humorQuote: string;
  controls: GameControl[];
  featured?: boolean;
  isCustomReady?: boolean;
  metricName?: string; // e.g. "Koin Akuarium", "Total Profit", "Skor Panggung"
  metricUnit?: string; // e.g. "🪙", "💵 CREDITS", "PTS"
  leaderboard?: LeaderboardEntry[];
}

export interface Playlist {
  id: string;
  title: string;
  description: string;
  icon: string;
  gameIds: string[];
}

/**
 * =========================================================================
 * GAME LEEF CATALOG - THE INDIE & HUMOROUS HTML GAME REPOSITORY
 * Curated & Created by Lee Khan • Powered by AI Models
 * =========================================================================
 */
export const GAMES_CATALOG: GameItem[] = [
  {
    id: 'fishville',
    title: 'FishVille',
    tagline: 'Aquarium 3D low-poly santuy: pelihara ikan, breeding, dan panen koin.',
    description: 'Simulasi akuarium 3D santai dengan ekosistem ikan hidup, siklus makan, breeding genetik, dan penemuan peti harta karun dasar laut.',
    category: 'Simulation',
    genre: 'Simulation, Chill',
    developer: 'Lee Khan Studios',
    developerRole: 'Chief Indie Officer',
    aiEngine: 'Qwen3.8 27B',
    thumbnail: '/thumbnails/fishville.svg',
    accentColor: '#4fd1ff',
    icon: '🐠',
    gameUrl: '/games/fishville/index.html',
    playsCount: '138.4K',
    rating: 4.96,
    releaseYear: 2026,
    potatoScore: '100% Ringan (Low-Poly WebGL)',
    humorBadges: ['🐠 3D Aquarium', '🤖 AI Engine: Qwen3.8 27B', '☕ Zen & Chill', '🥔 Spek Kentang Ultra'],
    humorQuote: '"Ikan saya di FishVille lebih sejahtera daripada rekening akhir bulan." — Pengabdi Akuarium',
    controls: [
      { key: 'Mouse Drag / Touch', action: 'Orbit & Putar Kamera 3D' },
      { key: 'Scroll Wheel / Pinch', action: 'Zoom In / Out Akuarium' },
      { key: 'Tombol Pakan & Shop', action: 'Beli Flakes, Pakan, & Hiasan' },
      { key: 'Klik Ikan / Peti', action: 'Buka Hadiah & Cek Status Ikan' }
    ],
    featured: true,
    metricName: 'Koin Akuarium',
    metricUnit: '🪙',
    leaderboard: [
      { rank: 1, player: 'Lee Khan 👑', score: 14500, badge: 'Aquarium Master' },
      { rank: 2, player: 'JuraganCupang', score: 11200, badge: 'Pro Breeder' },
      { rank: 3, player: 'OyenPenyayangIkan', score: 8430, badge: 'Fish Whisperer' },
      { rank: 4, player: 'NemoLover', score: 5820, badge: 'Casual' },
      { rank: 5, player: 'Player_Santuy', score: 3200, badge: 'Rookie' }
    ]
  },
  {
    id: 'hit-and-cash',
    title: 'Hit & Cash!',
    tagline: 'Street traffic derivatives: pasang taruhan kendaraan dan raih cuan pasar jalanan!',
    description: 'Simulasi taruhan jalanan 3D Downtown 4-Way. Prediksi dan pasang taruhan pada jenis kendaraan yang melintas (Car, Bike, Truck, Cycle) dengan multiplier dinamis dan cashout instan.',
    category: 'Arcade',
    genre: 'Arcade-Gambling',
    developer: 'Lee Khan Studios',
    developerRole: 'Traffic Market Maker',
    aiEngine: 'GLM 5.3 Flash',
    thumbnail: '/thumbnails/hit-and-cash.svg',
    accentColor: '#FFA502',
    icon: '🚦',
    gameUrl: '/games/hit-and-cash/index.html',
    playsCount: '192.1K',
    rating: 4.93,
    releaseYear: 2026,
    potatoScore: 'Spek Standar (Smooth 3D Traffic)',
    humorBadges: ['🚦 3D Downtown Market', '🤖 AI Engine: GLM 5.3 Flash', '📈 Live ROI Multiplier', '🔥 High Adrenaline'],
    humorQuote: '"Trading crypto kalah seru sama nebak truk lewat di persimpangan jalan." — Pialang Santuy',
    controls: [
      { key: 'Mouse Klik / Tap', action: 'Pilih Nominal Chip & Pasang Taruhan' },
      { key: 'Drag Layar', action: 'Orbit Kamera Persimpangan 3D' },
      { key: 'Tombol Cash Out', action: 'Ambil Keuntungan Real-Time' },
      { key: 'Tombol Klakson', action: 'Bunyikan Klakson Bikin Panik Supir' }
    ],
    featured: true,
    metricName: 'Total Profit Pialang',
    metricUnit: '💵 CREDITS',
    leaderboard: [
      { rank: 1, player: 'Lee Khan 👑', score: 58000, badge: 'Market Whale' },
      { rank: 2, player: 'CuanMaksimal', score: 42300, badge: 'High Roller' },
      { rank: 3, player: 'SupirTrukKilat', score: 29800, badge: 'Traffic King' },
      { rank: 4, player: 'BikersNekat', score: 18400, badge: 'Gambler' },
      { rank: 5, player: 'TraderKopi', score: 9500, badge: 'Rookie' }
    ]
  },
  {
    id: 'mount-explosive',
    title: 'Mount Explosive Sim',
    tagline: 'Simulasi erupsi gunung berapi prosedural 3D real-time dengan lava dan asap pijar.',
    description: 'Eksplorasi vulkanologi prosedural interaktif. Kendalikan intensitas letusan magma, kecepatan angin, siklus siang-malam, dan dentuman suara letusan gunung api.',
    category: 'Simulation',
    genre: 'Simulation, Science-Physics',
    developer: 'Lee Khan Studios',
    developerRole: 'Geological Sim Architect',
    aiEngine: 'Qwen3.8 27B',
    thumbnail: '/thumbnails/mount-explosive.svg',
    accentColor: '#ff7a28',
    icon: '🌋',
    gameUrl: '/games/mount-explosive/index.html',
    playsCount: '87.6K',
    rating: 4.89,
    releaseYear: 2026,
    potatoScore: 'Ringan & Cepat (Procedural Shaders)',
    humorBadges: ['🌋 Procedural Volcano', '🤖 AI Engine: Qwen3.8 27B', '💥 Partikel Magma Pijar', '💨 Wind Physics'],
    humorQuote: '"Jangan lupa pakai kacamata las saat intensitas dinaikkan ke 100%." — Vulkanolog Amatir',
    controls: [
      { key: 'SPACE / Tombol ERUPT', action: 'Picukan Erupsi Magma Dahsyat' },
      { key: 'Slider INTENSITY & WIND', action: 'Atur Skala Letusan & Arah Angin' },
      { key: 'Drag Mouse / Touch', action: 'Orbit Kamera Gunung 360°' },
      { key: 'Tombol DAY / SOUND', action: 'Toggle Siang-Malam & Audio Bom' }
    ],
    featured: false,
    metricName: 'Jam Terbang Vulkanik',
    metricUnit: 'Erupsi & Waktu',
    leaderboard: [
      { rank: 1, player: 'Lee Khan 👑', score: 9999, badge: 'Lava Lord' },
      { rank: 2, player: 'KrakatauVibes', score: 8750, badge: 'Pyromancer' },
      { rank: 3, player: 'PetugasPosPantau', score: 7100, badge: 'Geologist' },
      { rank: 4, player: 'PencariBatuAkik', score: 5200, badge: 'Observer' },
      { rank: 5, player: 'GunungMerapiFans', score: 3400, badge: 'Tourist' }
    ]
  },
  {
    id: 'rock-n-goofy',
    title: 'Rock & Goofy!!!',
    tagline: '3D Highway rhythm game paling gahar: petik senar, tekan fret, dan raih encore penonton!',
    description: 'Game musik ritme 3D bergaya arcade klasik dengan audio synthesizer bawaan. Mainkan nada lagu di atas panggung konser megah yang dipenuhi ribuan penonton riuh.',
    category: 'Music',
    genre: 'Music, Casual',
    developer: 'Lee Khan Studios',
    developerRole: 'Rock Virtuoso',
    aiEngine: 'Opus 5',
    thumbnail: '/thumbnails/rock-n-goofy.svg',
    accentColor: '#ba1200',
    icon: '🎸',
    gameUrl: '/games/rock-n-goofy/index.html',
    playsCount: '210.8K',
    rating: 4.98,
    releaseYear: 2026,
    potatoScore: 'Optimal 60 FPS (Native Audio Synth)',
    humorBadges: ['🎸 3D Rhythm Highway', '🤖 AI Engine: Opus 5', '⚡ Native Audio Synth', '🤘 Full Metal Energy'],
    humorQuote: '"Jari jempol saya keram, tapi solo gitarnya pecah abis!" — Rocker Kamaran',
    controls: [
      { key: 'D, F, J, K, L (Ergo)', action: 'Tekan Fret Sesuai Jalur Nada' },
      { key: 'A, S, D, F, Space (Classic)', action: 'Skema Tombol Satu Tangan' },
      { key: 'Tahan Tombol', action: 'Sustain Note Sepanjang Ekor Neon' },
      { key: 'ESC / R', action: 'Jeda Lagu / Restart Cepat' }
    ],
    featured: true,
    metricName: 'Skor Panggung Musik',
    metricUnit: 'PTS',
    leaderboard: [
      { rank: 1, player: 'Lee Khan 👑', score: 98500, badge: 'Guitar God' },
      { rank: 2, player: 'SlashWannabe', score: 89200, badge: 'Shredder' },
      { rank: 3, player: 'JimiHendrixKW', score: 76400, badge: 'Rock Star' },
      { rank: 4, player: 'AnakBandDepok', score: 54300, badge: 'Rocker' },
      { rank: 5, player: 'BassBetot', score: 32100, badge: 'Roadie' }
    ]
  },
  {
    id: 'tornado-holic',
    title: 'TornadoHolic',
    tagline: 'Kendalikan amukan badai tornado fisika: hisap kota, tumbuh raksasa, sapu daratan!',
    description: 'Game aksi destruktif berbasis simulasi fisika atmosfer. Hisap dedaunan, pohon, mobil, hingga gedung pencakar langit untuk memperbesar skala pusaran angin tornado F1 hingga F5.',
    category: 'Action',
    genre: 'Action, Science-Physics',
    developer: 'Lee Khan Studios',
    developerRole: 'Storm Extraction Master',
    aiEngine: 'Qwen3.8 27B',
    thumbnail: '/thumbnails/tornado-holic.svg',
    accentColor: '#4fe3ff',
    icon: '🌪️',
    gameUrl: '/games/tornado-holic/index.html',
    playsCount: '154.2K',
    rating: 4.92,
    releaseYear: 2026,
    potatoScore: 'Halus & Ringan (Physics Optimized)',
    humorBadges: ['🌪️ Chaotic Good', '🤖 AI Engine: Qwen3.8 27B', '🏢 Atmospheric Physics', '🍃 Sapu Bersih'],
    humorQuote: '"Angin sepoi-sepoi versi kiamat kecil." — BMKG Swasta',
    controls: [
      { key: 'Mouse Drag / Touch', action: 'Gerakkan Arah Pusaran Tornado' },
      { key: 'Boost / Space', action: 'Akselerasi Kecepatan Hisap Angin' },
      { key: 'Koleksi Objek', action: 'Tumbuh dari F1 hingga Monster F5' }
    ],
    featured: false,
    metricName: 'Massa Pusaran Badai',
    metricUnit: 'Ton Vortex',
    leaderboard: [
      { rank: 1, player: 'Lee Khan 👑', score: 84200, badge: 'Storm God' },
      { rank: 2, player: 'AnginPutingBeliung', score: 67300, badge: 'F5 Catastrophe' },
      { rank: 3, player: 'PenyapuGenteng', score: 49800, badge: 'Vortex Pro' },
      { rank: 4, player: 'KipasAnginRusak', score: 32400, badge: 'Breeze' },
      { rank: 5, player: 'DaunMelayang', score: 18900, badge: 'Rookie' }
    ]
  },
  {
    id: 'leef-jumper',
    title: 'Leef Jumper: Sentuh Daun',
    tagline: 'Lompat dari daun ke daun, hindari hujan asam, raih ketenangan batin.',
    description: 'Mascot game resmi Game Leef! Bantu karakter Daun melompati dahan-dahan digital sambil mengumpulkan cangkir kopi panas.',
    category: 'Arcade',
    genre: 'Arcade, Casual',
    developer: 'Lee Khan Studios',
    developerRole: 'Chief Indie Officer',
    aiEngine: 'Claude 3.7 Sonnet',
    thumbnail: '/thumbnails/leef-jumper.svg',
    accentColor: '#1ed760',
    icon: '🌿',
    gameUrl: '/games/leef-jumper/index.html',
    playsCount: '124.5K',
    rating: 4.98,
    releaseYear: 2026,
    potatoScore: '100% Aman di Kalkulator Casio',
    humorBadges: ['🌿 Official Mascot Game', '🤖 AI Engine: Claude 3.7', '☕ 100% Kafein Murni', '🥔 Spek Kentang Ultra'],
    humorQuote: '"Lebih adiktif dari scroll TikTok jam 2 pagi." — Reviewer Gabut',
    controls: [
      { key: 'A / D atau ◄ / ►', action: 'Gerak Kiri / Kanan' },
      { key: 'SPACE / ▲', action: 'Lompat Tinggi' },
      { key: 'R', action: 'Restart Cepat Saat Kalah' }
    ],
    featured: false,
    metricName: 'Skor Lompat Daun',
    metricUnit: 'PTS',
    leaderboard: [
      { rank: 1, player: 'Lee Khan 👑', score: 9840, badge: 'Grandmaster' },
      { rank: 2, player: 'KopiAddict99', score: 7210, badge: 'Pro' },
      { rank: 3, player: 'OyenBegadang', score: 5430, badge: 'Master' },
      { rank: 4, player: 'KentangPower', score: 3820, badge: 'Indie' },
      { rank: 5, player: 'Player_Santuy', score: 2190, badge: 'Rookie' }
    ]
  }
];

export const PLAYLISTS: Playlist[] = [
  {
    id: 'ai-masterpieces',
    title: 'AI-Powered Games',
    description: 'Koleksi game inovatif hasil rancangan Lee Khan dengan model AI terdepan.',
    icon: '🤖',
    gameIds: ['fishville', 'hit-and-cash', 'mount-explosive', 'rock-n-goofy', 'tornado-holic']
  },
  {
    id: 'lee-khan-picks',
    title: 'Pilihan Khusus Lee Khan',
    description: 'Kurasi karya terbaik dengan tingkat kreativitas dan gameplay paling seru.',
    icon: '👑',
    gameIds: ['rock-n-goofy', 'hit-and-cash', 'fishville', 'tornado-holic', 'mount-explosive']
  },
  {
    id: 'spek-kentang',
    title: '100% Spek Kentang Friendly',
    description: 'Game yang tetap lancar jaya meski dimainkan di browser spek laptop dinas.',
    icon: '🥔',
    gameIds: ['fishville', 'mount-explosive', 'tornado-holic', 'leef-jumper']
  },
  {
    id: 'anti-stress',
    title: 'Penghancur Stres & Chill',
    description: 'Lupakan beban kerja dan deadline tugas, nikmati permainan santai.',
    icon: '🌿',
    gameIds: ['fishville', 'mount-explosive', 'rock-n-goofy', 'leef-jumper']
  }
];

export const CATEGORIES = ['Semua', 'Simulation', 'Arcade', 'Action', 'Music', 'Chill'] as const;
