export function wmoGroup(code: number): string {
  if (code === 0) return "clear";
  if (code <= 2) return "partly";
  if (code === 3) return "cloudy";
  if (code <= 49) return "fog";
  if (code <= 67) return "rain";
  if (code <= 77) return "snow";
  if (code <= 82) return "shower";
  return "thunder";
}

export function wmoDesc(code: number): string {
  if (code === 0) return "Ciel dégagé";
  if (code <= 2) return "Partiellement nuageux";
  if (code === 3) return "Couvert";
  if (code <= 45) return "Brouillard";
  if (code <= 49) return "Givre";
  if (code <= 55) return "Bruine";
  if (code <= 65) return "Pluie";
  if (code <= 67) return "Pluie verglaçante";
  if (code <= 77) return "Neige";
  if (code <= 82) return "Averses";
  if (code <= 86) return "Averses de neige";
  return "Orage";
}

export function svgWeather(group: string, size: number, isDay?: boolean): string {
  const s = size,
    cx = s / 2,
    cy = s / 2;
  if (isDay === undefined) isDay = true;

  if (group === "clear" && isDay)
    return `<svg width="${s}" height="${s}" viewBox="0 0 ${s} ${s}" xmlns="http://www.w3.org/2000/svg">
    <g transform="translate(${cx},${cy})">
      <circle r="${s * 0.21}" fill="#d29922">
        <animateTransform attributeName="transform" type="rotate" from="0" to="360" dur="20s" repeatCount="indefinite"/>
      </circle>
      ${[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330]
        .map(
          (a) =>
            `<line x1="${s * 0.27}" y1="0" x2="${s * 0.35}" y2="0" stroke="#d29922" stroke-width="${s * 0.045}" stroke-linecap="round" transform="rotate(${a})">
          <animate attributeName="x2" values="${s * 0.35};${s * 0.4};${s * 0.35}" dur="2.2s" begin="${((a / 360) * 2).toFixed(2)}s" repeatCount="indefinite"/>
        </line>`
        )
        .join("")}
    </g>
  </svg>`;

  if (group === "clear" && !isDay)
    return `<svg width="${s}" height="${s}" viewBox="0 0 ${s} ${s}" xmlns="http://www.w3.org/2000/svg">
    <path d="M${cx + s * 0.04},${cy - s * 0.24} a${s * 0.19},${s * 0.19} 0 1,0 ${s * 0.16},${s * 0.28} a${s * 0.15},${s * 0.15} 0 1,1 -${s * 0.16},-${s * 0.28}z" fill="#a5c8e8">
      <animateTransform attributeName="transform" type="rotate" values="-4 ${cx} ${cy};4 ${cx} ${cy};-4 ${cx} ${cy}" dur="5s" repeatCount="indefinite" calcMode="spline" keySplines="0.45 0 0.55 1;0.45 0 0.55 1"/>
    </path>
    ${[
      [cx - s * 0.2, cy - s * 0.22, 1.8],
      [cx + s * 0.22, cy - s * 0.3, 1.4],
      [cx + s * 0.3, cy - s * 0.06, 1.1],
      [cx - s * 0.06, cy + s * 0.3, 1.3],
      [cx - s * 0.32, cy + s * 0.1, 1],
    ]
      .map(
        ([x, y, r], i) =>
          `<circle cx="${x}" cy="${y}" r="${r * s * 0.024}" fill="#a5c8e8">
        <animate attributeName="opacity" values="0.4;1;0.4" dur="${(2 + i * 0.8).toFixed(1)}s" repeatCount="indefinite"/>
      </circle>`
      )
      .join("")}
  </svg>`;

  if (group === "partly")
    return `<svg width="${s}" height="${s}" viewBox="0 0 ${s} ${s}" xmlns="http://www.w3.org/2000/svg">
    <g transform="translate(${s * 0.28},${s * 0.3})">
      <circle r="${s * 0.2}" fill="#d29922">
        <animateTransform attributeName="transform" type="rotate" from="0" to="360" dur="22s" repeatCount="indefinite"/>
      </circle>
      ${[0, 45, 90, 135, 180, 225, 270, 315]
        .map(
          (a) =>
            `<line x1="${s * 0.25}" y1="0" x2="${s * 0.32}" y2="0" stroke="#d29922" stroke-width="${s * 0.04}" stroke-linecap="round" transform="rotate(${a})"/>`
        )
        .join("")}
    </g>
    <g>
      <animateTransform attributeName="transform" type="translate" values="0 0;4 0;0 0" dur="5s" repeatCount="indefinite" calcMode="spline" keySplines="0.45 0 0.55 1;0.45 0 0.55 1"/>
      <rect x="${s * 0.2}" y="${s * 0.52}" width="${s * 0.62}" height="${s * 0.22}" rx="${s * 0.11}" fill="#404853"/>
      <ellipse cx="${s * 0.4}" cy="${s * 0.53}" rx="${s * 0.19}" ry="${s * 0.15}" fill="#404853"/>
      <ellipse cx="${s * 0.6}" cy="${s * 0.5}" rx="${s * 0.16}" ry="${s * 0.13}" fill="#404853"/>
    </g>
  </svg>`;

  if (group === "cloudy" || group === "fog")
    return `<svg width="${s}" height="${s}" viewBox="0 0 ${s} ${s}" xmlns="http://www.w3.org/2000/svg">
    <g>
      <animateTransform attributeName="transform" type="translate" values="-4 0;4 0;-4 0" dur="6s" repeatCount="indefinite" calcMode="spline" keySplines="0.45 0 0.55 1;0.45 0 0.55 1"/>
      <rect x="${s * 0.12}" y="${s * 0.35}" width="${s * 0.55}" height="${s * 0.2}" rx="${s * 0.1}" fill="#404853" opacity="0.8"/>
      <ellipse cx="${s * 0.3}" cy="${s * 0.36}" rx="${s * 0.15}" ry="${s * 0.12}" fill="#404853" opacity="0.8"/>
      <ellipse cx="${s * 0.48}" cy="${s * 0.33}" rx="${s * 0.14}" ry="${s * 0.13}" fill="#404853" opacity="0.8"/>
    </g>
    <g>
      <animateTransform attributeName="transform" type="translate" values="3 0;-3 0;3 0" dur="7s" repeatCount="indefinite" calcMode="spline" keySplines="0.45 0 0.55 1;0.45 0 0.55 1"/>
      <rect x="${s * 0.22}" y="${s * 0.5}" width="${s * 0.62}" height="${s * 0.24}" rx="${s * 0.12}" fill="#7d8590"/>
      <ellipse cx="${s * 0.44}" cy="${s * 0.51}" rx="${s * 0.2}" ry="${s * 0.16}" fill="#7d8590"/>
      <ellipse cx="${s * 0.64}" cy="${s * 0.48}" rx="${s * 0.16}" ry="${s * 0.14}" fill="#7d8590"/>
    </g>
  </svg>`;

  if (group === "rain" || group === "shower") {
    const drops = [
      [cx - s * 0.12, cy + s * 0.23, 0],
      [cx + s * 0.04, cy + s * 0.3, 0.3],
      [cx + s * 0.18, cy + s * 0.23, 0.15],
      [cx - s * 0.04, cy + s * 0.4, 0.5],
      [cx + s * 0.12, cy + s * 0.37, 0.1],
    ];
    return `<svg width="${s}" height="${s}" viewBox="0 0 ${s} ${s}" xmlns="http://www.w3.org/2000/svg">
      <g>
        <animateTransform attributeName="transform" type="translate" values="-2 0;2 0;-2 0" dur="4s" repeatCount="indefinite" calcMode="spline" keySplines="0.45 0 0.55 1;0.45 0 0.55 1"/>
        <rect x="${s * 0.14}" y="${s * 0.18}" width="${s * 0.66}" height="${s * 0.26}" rx="${s * 0.13}" fill="#7d8590"/>
        <ellipse cx="${s * 0.37}" cy="${s * 0.19}" rx="${s * 0.21}" ry="${s * 0.17}" fill="#7d8590"/>
        <ellipse cx="${s * 0.6}" cy="${s * 0.16}" rx="${s * 0.17}" ry="${s * 0.15}" fill="#7d8590"/>
      </g>
      ${drops
        .map(
          ([x, y, delay]) =>
            `<line x1="${x}" y1="${y}" x2="${x - s * 0.03}" y2="${y + s * 0.11}" stroke="#58a6ff" stroke-width="${s * 0.045}" stroke-linecap="round" opacity="0">
          <animate attributeName="opacity" values="0;0.9;0" dur="1.3s" begin="${delay}s" repeatCount="indefinite"/>
          <animateTransform attributeName="transform" type="translate" values="0 -${s * 0.12};0 ${s * 0.06}" dur="1.3s" begin="${delay}s" repeatCount="indefinite"/>
        </line>`
        )
        .join("")}
    </svg>`;
  }

  if (group === "snow") {
    const flakes = [
      [cx - s * 0.1, cy + s * 0.22, 0, "✦"],
      [cx + s * 0.1, cy + s * 0.27, 0.4, "❄"],
      [cx + s * 0.2, cy + s * 0.2, 0.2, "✦"],
      [cx + s * 0.02, cy + s * 0.38, 0.6, "❄"],
      [cx - s * 0.18, cy + s * 0.32, 0.1, "✦"],
    ];
    return `<svg width="${s}" height="${s}" viewBox="0 0 ${s} ${s}" xmlns="http://www.w3.org/2000/svg">
      <g>
        <animateTransform attributeName="transform" type="translate" values="-2 0;2 0;-2 0" dur="5s" repeatCount="indefinite" calcMode="spline" keySplines="0.45 0 0.55 1;0.45 0 0.55 1"/>
        <rect x="${s * 0.14}" y="${s * 0.18}" width="${s * 0.66}" height="${s * 0.26}" rx="${s * 0.13}" fill="#7d8590"/>
        <ellipse cx="${s * 0.37}" cy="${s * 0.19}" rx="${s * 0.21}" ry="${s * 0.17}" fill="#7d8590"/>
        <ellipse cx="${s * 0.6}" cy="${s * 0.16}" rx="${s * 0.17}" ry="${s * 0.15}" fill="#7d8590"/>
      </g>
      ${flakes
        .map(
          ([x, y, delay, ch]) =>
            `<text x="${x}" y="${y}" text-anchor="middle" font-size="${s * 0.13}" fill="#a5c8e8" opacity="0">
          ${ch}
          <animate attributeName="opacity" values="0;1;0" dur="2s" begin="${delay}s" repeatCount="indefinite"/>
          <animateTransform attributeName="transform" type="translate" values="0 -${s * 0.1};0 ${s * 0.06}" dur="2s" begin="${delay}s" repeatCount="indefinite"/>
        </text>`
        )
        .join("")}
    </svg>`;
  }

  if (group === "thunder")
    return `<svg width="${s}" height="${s}" viewBox="0 0 ${s} ${s}" xmlns="http://www.w3.org/2000/svg">
    <g>
      <animateTransform attributeName="transform" type="translate" values="-2 0;2 0;-2 0" dur="3s" repeatCount="indefinite" calcMode="spline" keySplines="0.45 0 0.55 1;0.45 0 0.55 1"/>
      <rect x="${s * 0.1}" y="${s * 0.16}" width="${s * 0.72}" height="${s * 0.26}" rx="${s * 0.13}" fill="#5F5E5A"/>
      <ellipse cx="${s * 0.34}" cy="${s * 0.17}" rx="${s * 0.23}" ry="${s * 0.18}" fill="#5F5E5A"/>
      <ellipse cx="${s * 0.63}" cy="${s * 0.14}" rx="${s * 0.19}" ry="${s * 0.16}" fill="#5F5E5A"/>
    </g>
    <polygon points="${cx - s * 0.04},${cy + s * 0.12} ${cx + s * 0.13},${cy + s * 0.12} ${cx + s * 0.02},${cy + s * 0.3} ${cx + s * 0.11},${cy + s * 0.3} ${cx - s * 0.09},${cy + s * 0.52} ${cx + s * 0.01},${cy + s * 0.26} ${cx - s * 0.07},${cy + s * 0.26}" fill="#d29922">
      <animate attributeName="opacity" values="1;0.2;1;0.2;1" dur="2.8s" repeatCount="indefinite"/>
    </polygon>
  </svg>`;

  return `<svg width="${s}" height="${s}" viewBox="0 0 ${s} ${s}" xmlns="http://www.w3.org/2000/svg"><circle cx="${cx}" cy="${cy}" r="${s * 0.3}" fill="#7d8590"/></svg>`;
}
