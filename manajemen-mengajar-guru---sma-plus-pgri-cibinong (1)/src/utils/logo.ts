/**
 * High-resolution vector emblem & SVG logo generator for SMA Plus PGRI Cibinong
 * Accurately matching the official heraldic shield emblem
 */
export function getSchoolLogoSvg(): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 250" width="100%" height="100%" style="overflow:visible;">
    <defs>
      <!-- Metallic silver shield bevel gradients -->
      <linearGradient id="shieldOuterBorder" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#ffffff" />
        <stop offset="20%" stop-color="#e2e8f0" />
        <stop offset="50%" stop-color="#94a3b8" />
        <stop offset="80%" stop-color="#cbd5e1" />
        <stop offset="100%" stop-color="#334155" />
      </linearGradient>

      <linearGradient id="shieldBody" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="#f8fafc" />
        <stop offset="40%" stop-color="#e2e8f0" />
        <stop offset="85%" stop-color="#cbd5e1" />
        <stop offset="100%" stop-color="#94a3b8" />
      </linearGradient>

      <!-- Gold trim gradient -->
      <linearGradient id="goldTrim" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#fef08a" />
        <stop offset="35%" stop-color="#eab308" />
        <stop offset="70%" stop-color="#ca8a04" />
        <stop offset="100%" stop-color="#854d0e" />
      </linearGradient>

      <!-- Deep navy blue star gradient -->
      <linearGradient id="navyStar" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#1e1b4b" />
        <stop offset="50%" stop-color="#0f172a" />
        <stop offset="100%" stop-color="#020617" />
      </linearGradient>

      <!-- Flame vibrant gradient -->
      <linearGradient id="pgriFlame" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="#ef4444" />
        <stop offset="50%" stop-color="#dc2626" />
        <stop offset="100%" stop-color="#991b1b" />
      </linearGradient>

      <!-- Red 3D rings gradient -->
      <linearGradient id="redRingGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#f87171" />
        <stop offset="40%" stop-color="#dc2626" />
        <stop offset="100%" stop-color="#7f1d1d" />
      </linearGradient>

      <!-- Arched text path for the top banner -->
      <path id="archTextTop" d="M 28 92 C 40 40, 160 40, 172 92" fill="none" />
      
      <!-- Drop shadows -->
      <filter id="shadowBevel" x="-10%" y="-10%" width="120%" height="120%">
        <feDropShadow dx="0" dy="2" stdDeviation="2" flood-color="#0f172a" flood-opacity="0.35"/>
      </filter>
      <filter id="textShadow" x="-10%" y="-10%" width="120%" height="120%">
        <feDropShadow dx="1" dy="1" stdDeviation="0.8" flood-color="#0f172a" flood-opacity="0.5"/>
      </filter>
    </defs>

    <!-- Outer Shield with Classic Pointed Ears and Bevel -->
    <g filter="url(#shadowBevel)">
      <!-- Outer Border / Bevel Base -->
      <path d="M 24 25 C 24 10, 48 5, 100 5 C 152 5, 176 10, 176 25 C 178 50, 184 125, 178 160 C 168 200, 130 232, 100 245 C 70 232, 32 200, 22 160 C 16 125, 22 50, 24 25 Z"
            fill="url(#shieldOuterBorder)" stroke="#1e293b" stroke-width="1.8" />

      <!-- Inner Shield Face (Silver Metallic) -->
      <path d="M 28 28 C 30 15, 52 10, 100 10 C 148 10, 170 15, 172 28 C 174 52, 178 122, 172 155 C 163 192, 128 222, 100 235 C 72 222, 37 192, 28 155 C 22 122, 26 52, 28 28 Z"
            fill="url(#shieldBody)" stroke="#94a3b8" stroke-width="1.2" />

      <!-- Top Arched Text: SMA PLUS PGRI CIBINONG -->
      <g filter="url(#textShadow)">
        <text font-family="'Plus Jakarta Sans', Arial, sans-serif" font-size="11.5" font-weight="900" fill="#1e1b4b" letter-spacing="1">
          <textPath href="#archTextTop" startOffset="50%" text-anchor="middle">
            SMA PLUS PGRI CIBINONG
          </textPath>
        </text>
      </g>

      <!-- Inverted White Triangle at lower region -->
      <polygon points="40,128 160,128 100,218" fill="#f8fafc" stroke="#cbd5e1" stroke-width="1.5" />

      <!-- Central 8-Pointed Star (Navy & Gold Emblem) -->
      <g transform="translate(100, 106)">
        <!-- Outer Gold Star Border -->
        <polygon points="0,-48 14,-20 44,-24 24,-2 48,16 20,20 20,48 0,30 -20,48 -20,20 -48,16 -24,-2 -44,-24 -14,-20"
                 fill="url(#goldTrim)" stroke="#78350f" stroke-width="1.2" />

        <!-- Inner Navy Star Body -->
        <polygon points="0,-43 12,-18 39,-21 21,-2 43,14 18,18 18,43 0,27 -18,43 -18,18 -43,14 -21,-2 -39,-21 -12,-18"
                 fill="url(#navyStar)" />

        <!-- Gold Trim Ring inside Star -->
        <circle cx="0" cy="0" r="26" fill="url(#navyStar)" stroke="url(#goldTrim)" stroke-width="1.5"/>

        <!-- Green Core Shield -->
        <path d="M -14 -12 C -14 -12, 0 -16, 14 -12 C 14 6, 10 16, 0 20 C -10 16, -14 6, -14 -12 Z"
              fill="#15803d" stroke="#facc15" stroke-width="0.8"/>

        <!-- Yellow/Gold Laurel Leaves flanking torch -->
        <path d="M -18 4 C -22 -6 -14 -16 -2 -20 C -6 -10 -12 2 -8 12 Z" fill="#eab308" opacity="0.95"/>
        <path d="M 18 4 C 22 -6 14 -16 2 -20 C 6 -10 12 2 8 12 Z" fill="#eab308" opacity="0.95"/>

        <!-- PGRI Torch Handle & Flare -->
        <rect x="-3" y="-1" width="6" height="15" rx="1" fill="#eab308" stroke="#854d0e" stroke-width="0.6"/>
        <rect x="-4.5" y="-4" width="9" height="3" rx="0.8" fill="#ca8a04"/>

        <!-- Red / Orange Torch Flame -->
        <path d="M 0 -18 C 5 -13 7 -8 3 0 C 1 -3 -2 -3 -4 0 C -8 -8 -4 -13 0 -18 Z" fill="url(#pgriFlame)"/>
        <path d="M 0 -13 C 2 -10 3 -6 1 -1 C 0 -2 -1 -2 -2 -1 C -3 -6 -1 -10 0 -13 Z" fill="#fde047"/>

        <!-- White Open Book at Torch Base -->
        <path d="M -11 10 Q 0 6 0 14 Q 0 6 11 10 L 9 14 Q 0 10 0 16 Q 0 10 -9 14 Z" 
              fill="#ffffff" stroke="#0f172a" stroke-width="0.8"/>
        <text x="0" y="14" font-family="Arial, sans-serif" font-size="4.5" font-weight="bold" fill="#0f172a" text-anchor="middle">PGRI</text>

        <!-- White / Silver Scroll Ribbon below Star -->
        <g transform="translate(0, 24)">
          <path d="M -36 0 Q 0 -4 36 0 L 32 6 Q 0 2 -32 6 Z" fill="#ffffff" stroke="#1e293b" stroke-width="0.8"/>
          <text x="0" y="4.5" font-family="'Plus Jakarta Sans', Arial, sans-serif" font-size="3.8" font-weight="900" fill="#0f172a" text-anchor="middle" letter-spacing="0.3">
            SMA PLUS PGRI CIBINONG
          </text>
        </g>
      </g>

      <!-- 5 Interconnected Red Rings (Olympic/PGRI Rings) -->
      <g stroke="url(#redRingGrad)" stroke-width="3" fill="none" filter="url(#textShadow)">
        <!-- Top 3 Rings -->
        <circle cx="56" cy="170" r="14" />
        <circle cx="100" cy="170" r="14" />
        <circle cx="144" cy="170" r="14" />
        <!-- Bottom 2 Interlocking Rings -->
        <circle cx="78" cy="184" r="14" />
        <circle cx="122" cy="184" r="14" />
      </g>
    </g>
  </svg>`;
}

export function getSchoolLogoDataUrl(): string {
  const svg = getSchoolLogoSvg();
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}
