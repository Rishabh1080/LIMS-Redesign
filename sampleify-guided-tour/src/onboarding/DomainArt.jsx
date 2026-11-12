import { useId } from 'react';

// Small animated scenes for the lab-type tiles. Pure SVG + CSS keyframes
// (see .sgt-art-* in onboarding.css). Every scene's resting state is a
// complete picture, so reduced motion simply shows it still.

const VIEW = '0 0 200 112';

function useSvgId(prefix) {
  return `${prefix}-${useId().replace(/[^a-zA-Z0-9_-]/g, '')}`;
}

function Wheat({ x, delay }) {
  const grains = [30, 38, 46, 54];
  return (
    <g className="sgt-art-sway" style={{ animationDelay: delay }}>
      <path d={`M${x} 98 Q${x - 2} 66 ${x} 24`} className="sgt-art-stroke" fill="none" />
      {grains.map((y) => (
        <g key={y}>
          <ellipse cx={x - 4} cy={y} rx="3" ry="6" transform={`rotate(-28 ${x - 4} ${y})`} className="sgt-art-grain" />
          <ellipse cx={x + 4} cy={y + 3} rx="3" ry="6" transform={`rotate(28 ${x + 4} ${y + 3})`} className="sgt-art-grain" />
        </g>
      ))}
      <ellipse cx={x} cy="22" rx="2.6" ry="5.5" className="sgt-art-grain" />
    </g>
  );
}

export function FoodArt() {
  const colonies = [
    [128, 70, 3.2, 'amber', 0],
    [146, 64, 2.4, 'green', 0.35],
    [158, 73, 3.6, 'blue', 0.7],
    [138, 77, 2, 'green', 1.05],
    [152, 80, 2.4, 'amber', 1.4],
    [168, 67, 2, 'blue', 1.75],
  ];
  return (
    <svg viewBox={VIEW} className="sgt-art" aria-hidden="true">
      <line x1="16" y1="98" x2="96" y2="98" className="sgt-art-ground" />
      <Wheat x={34} delay="0s" />
      <Wheat x={54} delay="-0.8s" />
      <Wheat x={74} delay="-1.6s" />
      <ellipse cx="148" cy="76" rx="40" ry="17" className="sgt-art-dish" />
      <ellipse cx="148" cy="73" rx="34" ry="12.5" className="sgt-art-agar" />
      {colonies.map(([cx, cy, r, tone, delay]) => (
        <circle
          key={`${cx}-${cy}`}
          cx={cx}
          cy={cy}
          r={r}
          className={`sgt-art-pop sgt-art-fill-${tone}`}
          style={{ animationDelay: `${delay}s` }}
        />
      ))}
      <path d="M112 44 l10 0 M117 39 l0 10" className="sgt-art-sparkle" />
    </svg>
  );
}

export function PharmaArt() {
  const trace =
    'M16 90 L52 90 C58 90 60 52 64 52 C68 52 70 90 76 90 L100 90 C104 90 106 70 108 70 C110 70 112 90 116 90 L134 90 C140 90 142 32 146 32 C150 32 152 90 158 90 L184 90';
  return (
    <svg viewBox={VIEW} className="sgt-art" aria-hidden="true">
      <path d="M16 18 L16 92 L186 92" className="sgt-art-axis" fill="none" />
      {[40, 64, 88, 112, 136, 160].map((x) => (
        <line key={x} x1={x} y1="92" x2={x} y2="95" className="sgt-art-axis" />
      ))}
      <path d={`${trace} L184 92 L16 92 Z`} className="sgt-art-area" />
      <path d={trace} pathLength="1" className="sgt-art-draw sgt-art-trace" fill="none" />
      <circle cx="146" cy="32" r="3" className="sgt-art-peak-dot sgt-art-fill-amber" />
      <g className="sgt-art-float">
        <g transform="rotate(-22 46 26)">
          <rect x="30" y="20" width="32" height="13" rx="6.5" className="sgt-art-capsule-right" />
          <path d="M36.5 20 H46 V33 H36.5 A6.5 6.5 0 0 1 36.5 20 Z" className="sgt-art-fill-amber" />
        </g>
      </g>
      <g className="sgt-art-float" style={{ animationDelay: '-1.2s' }}>
        <circle cx="86" cy="30" r="8" className="sgt-art-tablet" />
        <line x1="80" y1="30" x2="92" y2="30" className="sgt-art-stroke-thin" />
      </g>
    </svg>
  );
}

export function WaterArt() {
  const clip = useSvgId('sgt-beaker');
  let wave = 'M30 56';
  for (let x = 30; x < 180; x += 17) wave += ` q 8.5 -5 17 0`;
  wave += ' L180 104 L30 104 Z';
  return (
    <svg viewBox={VIEW} className="sgt-art" aria-hidden="true">
      <defs>
        <clipPath id={clip}>
          <path d="M80 24 V90 Q80 98 88 98 H132 Q140 98 140 90 V24 Z" />
        </clipPath>
      </defs>
      <g className="sgt-art-cloud">
        <path d="M22 40 a9 9 0 0 1 9 -10 a12 12 0 0 1 22 2 a8 8 0 0 1 2 16 H28 a7 7 0 0 1 -6 -8 Z" className="sgt-art-cloud-shape" />
      </g>
      {[0, 0.9, 1.8].map((delay, index) => (
        <circle key={delay} cx={30 + index * 10} cy={62 + index * 6} r="1.8" className="sgt-art-drift sgt-art-fill-muted" style={{ animationDelay: `${delay}s` }} />
      ))}
      <g clipPath={`url(#${clip})`}>
        <g className="sgt-art-wave">
          <path d={wave} className="sgt-art-water" />
        </g>
        {[92, 104, 116, 128].map((cx, index) => (
          <circle key={cx} cx={cx} cy="92" r={index % 2 ? 2 : 2.8} className="sgt-art-bubble" style={{ animationDelay: `${index * 0.55}s` }} />
        ))}
      </g>
      <path d="M76 22 H80 V90 Q80 98 88 98 H132 Q140 98 140 90 V22 H144" className="sgt-art-stroke" fill="none" />
      {[40, 52, 64, 76].map((y) => (
        <line key={y} x1="132" y1={y} x2="140" y2={y} className="sgt-art-stroke-thin" />
      ))}
      <path d="M110 4 C110 4 104 12 104 16 a6 6 0 0 0 12 0 C116 12 110 4 110 4 Z" className="sgt-art-drop" />
      <g transform="translate(156 30)">
        {['#e74c3c', '#f39c12', '#f1c40f', '#7cb342', '#26a69a', '#1e88e5'].map((color, index) => (
          <rect key={color} x="0" y={index * 9} width="12" height="9" fill={color} className="sgt-art-strip" />
        ))}
        <rect x="0" y="0" width="12" height="54" rx="2" className="sgt-art-stroke-thin" fill="none" />
      </g>
    </svg>
  );
}

export function ConstructionArt() {
  return (
    <svg viewBox={VIEW} className="sgt-art" aria-hidden="true">
      <rect x="54" y="8" width="92" height="10" rx="2" className="sgt-art-frame" />
      <rect x="60" y="18" width="6" height="76" className="sgt-art-frame" />
      <rect x="134" y="18" width="6" height="76" className="sgt-art-frame" />
      <rect x="50" y="94" width="100" height="8" rx="2" className="sgt-art-frame" />
      <g className="sgt-art-press">
        <rect x="96" y="14" width="8" height="26" className="sgt-art-rod" />
        <rect x="76" y="40" width="48" height="6" rx="1.5" className="sgt-art-platen" />
      </g>
      <g className="sgt-art-squash">
        <rect x="80" y="54" width="40" height="40" rx="2" className="sgt-art-cube" />
        {[[88, 62], [104, 60], [112, 72], [92, 80], [106, 86], [86, 72]].map(([cx, cy]) => (
          <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r="2" className="sgt-art-aggregate" />
        ))}
        <path d="M98 54 L94 64 L101 72 L96 82 L100 94" className="sgt-art-crack" fill="none" />
      </g>
      <g transform="translate(172 52)">
        <circle r="15" className="sgt-art-gauge" />
        {[-60, -30, 0, 30, 60].map((angle) => (
          <line key={angle} x1="0" y1="-12" x2="0" y2="-9" transform={`rotate(${angle})`} className="sgt-art-stroke-thin" />
        ))}
        <line x1="0" y1="0" x2="0" y2="-10" className="sgt-art-needle" />
        <circle r="2" className="sgt-art-fill-navy" />
      </g>
      <text x="172" y="80" textAnchor="middle" className="sgt-art-label">kN</text>
    </svg>
  );
}

export function MetalsArt() {
  const grad = useSvgId('sgt-steel');
  const lines = [
    [116, 46, '#7c4dff', 0],
    [124, 30, '#3d5afe', 0.2],
    [131, 54, '#00b0ff', 0.4],
    [140, 38, '#00e676', 0.1],
    [148, 58, '#c6ff00', 0.5],
    [155, 26, '#ffd600', 0.3],
    [163, 44, '#ff9100', 0.6],
    [171, 34, '#ff3d00', 0.15],
  ];
  return (
    <svg viewBox={VIEW} className="sgt-art" aria-hidden="true">
      <defs>
        <linearGradient id={grad} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#e6e8eb" />
          <stop offset="1" stopColor="#9aa0a6" />
        </linearGradient>
      </defs>
      <rect x="18" y="68" width="72" height="24" rx="3" fill={`url(#${grad})`} className="sgt-art-stroke" />
      <rect x="18" y="68" width="10" height="24" className="sgt-art-sheen" />
      <rect x="49" y="18" width="10" height="34" rx="2" className="sgt-art-fill-navy" />
      <path d="M49 52 H59 L54 62 Z" className="sgt-art-fill-navy" />
      <g className="sgt-art-spark">
        <circle cx="54" cy="66" r="9" className="sgt-art-glow" />
        <path d="M54 58 L56 64 L62 62 L57 67 L60 73 L54 69 L48 73 L51 67 L46 62 L52 64 Z" className="sgt-art-fill-amber" />
      </g>
      <rect x="104" y="16" width="80" height="80" rx="6" className="sgt-art-screen" />
      <line x1="110" y1="80" x2="178" y2="80" className="sgt-art-screen-axis" />
      {lines.map(([x, top, color, delay]) => (
        <line
          key={x}
          x1={x}
          y1="80"
          x2={x}
          y2={top}
          stroke={color}
          className="sgt-art-emission"
          style={{ animationDelay: `${delay}s` }}
        />
      ))}
      <text x="144" y="91" textAnchor="middle" className="sgt-art-mono">C Si Mn Cr Ni</text>
    </svg>
  );
}

export function TextilesArt() {
  const warps = [30, 40, 50, 60, 70, 80, 90, 100];
  return (
    <svg viewBox={VIEW} className="sgt-art" aria-hidden="true">
      <rect x="22" y="18" width="88" height="76" rx="4" className="sgt-art-swatch" />
      {warps.map((x) => (
        <line key={x} x1={x} y1="18" x2={x} y2="94" className="sgt-art-warp" />
      ))}
      {[30, 42, 70, 82].map((y) => (
        <path key={y} d={`M22 ${y} q 5 -3 10 0 t 10 0 t 10 0 t 10 0 t 10 0 t 10 0 t 10 0 t 10 0 t 8 0`} className="sgt-art-weft" fill="none" />
      ))}
      <path d="M22 56 q 5 -4 10 0 t 10 0 t 10 0 t 10 0 t 10 0 t 10 0 t 10 0 t 10 0 t 8 0" pathLength="1" className="sgt-art-draw sgt-art-weft-live" fill="none" />
      <path d="M110 56 C124 56 132 50 144 50" className="sgt-art-thread" fill="none" />
      <g transform="translate(160 54)">
        <g className="sgt-art-spin">
          <circle r="22" className="sgt-art-bobbin" />
          <circle r="15" className="sgt-art-bobbin-yarn" />
          {[0, 60, 120, 180, 240, 300].map((angle) => (
            <line key={angle} x1="0" y1="-8" x2="0" y2="-15" transform={`rotate(${angle})`} className="sgt-art-bobbin-mark" />
          ))}
          <circle r="5" className="sgt-art-bobbin-hole" />
        </g>
      </g>
    </svg>
  );
}

export const domainArt = {
  food: FoodArt,
  pharma: PharmaArt,
  water: WaterArt,
  construction: ConstructionArt,
  metals: MetalsArt,
  textiles: TextilesArt,
};
