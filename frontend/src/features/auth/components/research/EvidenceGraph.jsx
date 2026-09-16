import { useEffect, useState } from "react";

const GRAPHITE = "var(--color-graphite)";
const PAPER = "var(--color-paper)";
const EVIDENCE = "var(--color-evidence)";
const INK = "var(--color-ink)";

const CENTER = { x: 200, y: 198 };

// Source nodes scattered around the query node, like citations orbiting an
// answer — deliberately uneven radii/sizes so it reads as gathered evidence,
// not a decorative ring.
const SOURCES = [
  { angle: -68, radius: 128, size: 5 },
  { angle: -16, radius: 154, size: 4 },
  { angle: 34, radius: 118, size: 6 },
  { angle: 88, radius: 148, size: 4.5 },
  { angle: 146, radius: 122, size: 5.5 },
  { angle: 198, radius: 152, size: 4 },
  { angle: 250, radius: 116, size: 5 },
];

const CROSS_LINKS = [
  [0, 1],
  [3, 4],
  [5, 6],
];

const PRIMARY_LINKS = [0, 3];

function toPoint(angle, radius) {
  const rad = (angle * Math.PI) / 180;
  return {
    x: CENTER.x + radius * Math.cos(rad),
    y: CENTER.y + radius * Math.sin(rad),
  };
}

const points = SOURCES.map((s) => toPoint(s.angle, s.radius));

function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(
    () => window.matchMedia("(prefers-reduced-motion: reduce)").matches,
  );

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const listener = (event) => setReduced(event.matches);
    query.addEventListener("change", listener);
    return () => query.removeEventListener("change", listener);
  }, []);

  return reduced;
}

export function EvidenceGraph({ className = "", focusedField, status }) {
  const reducedMotion = usePrefersReducedMotion();
  const isConnecting = status === "submitting";
  const isSuccess = status === "success";
  const isActive = Boolean(focusedField) || isConnecting || isSuccess;
  const canAnimate = !reducedMotion;

  return (
    <div className={`${className} bg-ink`} aria-hidden="true">
      <style>{`
        @keyframes eg-spin { to { transform: rotate(360deg); } }
        @keyframes eg-ripple {
          from { r: 16; opacity: 0.45; }
          to { r: 172; opacity: 0; }
        }
        @keyframes eg-breathe {
          0%, 100% { opacity: 0.45; transform: scale(1); }
          50% { opacity: 0.85; transform: scale(1.12); }
        }
        @keyframes eg-flow {
          to { stroke-dashoffset: -24; }
        }
        @keyframes eg-check {
          from { stroke-dashoffset: 1; }
          to { stroke-dashoffset: 0; }
        }
      `}</style>
      <svg
        viewBox="0 0 400 400"
        className="h-full w-full"
        preserveAspectRatio="xMidYMid meet"
      >
        <defs>
          <radialGradient id="eg-fade" cx="50%" cy="46%" r="60%">
            <stop offset="0%" stopColor="#fff" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#fff" stopOpacity="0" />
          </radialGradient>
          <mask id="eg-grid-mask">
            <rect x="0" y="0" width="400" height="400" fill="url(#eg-fade)" />
          </mask>
          <linearGradient id="eg-sweep" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor={EVIDENCE} stopOpacity="0" />
            <stop offset="100%" stopColor={EVIDENCE} stopOpacity="0.32" />
          </linearGradient>
          <radialGradient id="eg-glow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor={EVIDENCE} stopOpacity="0.55" />
            <stop offset="100%" stopColor={EVIDENCE} stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* graph-paper texture, faded toward the frame */}
        <g mask="url(#eg-grid-mask)" opacity="0.5">
          {Array.from({ length: 13 }).map((_, row) =>
            Array.from({ length: 13 }).map((__, col) => (
              <circle
                key={`dot-${row}-${col}`}
                cx={20 + col * 32}
                cy={20 + row * 32}
                r="1"
                fill={GRAPHITE}
              />
            )),
          )}
        </g>

        {/* concentric scan rings */}
        {[70, 110, 150].map((r) => (
          <circle
            key={`ring-${r}`}
            cx={CENTER.x}
            cy={CENTER.y}
            r={r}
            fill="none"
            stroke={GRAPHITE}
            strokeWidth="1"
            opacity="0.12"
          />
        ))}

        {/* idle breathing glow behind the query node */}
        {canAnimate ? (
          <circle
            cx={CENTER.x}
            cy={CENTER.y}
            r="46"
            fill="url(#eg-glow)"
            style={{
              transformOrigin: `${CENTER.x}px ${CENTER.y}px`,
              animation: "eg-breathe 4s ease-in-out infinite",
            }}
          />
        ) : null}

        {/* radar sweep while submitting */}
        {isConnecting && canAnimate ? (
          <g
            style={{
              transformOrigin: `${CENTER.x}px ${CENTER.y}px`,
              animation: "eg-spin 2.1s linear infinite",
            }}
          >
            <path
              d={`M ${CENTER.x} ${CENTER.y} L ${CENTER.x + 160} ${
                CENTER.y - 46
              } A 165 165 0 0 0 ${CENTER.x + 160} ${CENTER.y + 46} Z`}
              fill="url(#eg-sweep)"
            />
          </g>
        ) : null}

        {/* ripple pings while submitting */}
        {isConnecting && canAnimate
          ? [0, 0.9].map((delay) => (
              <circle
                key={`ripple-${delay}`}
                cx={CENTER.x}
                cy={CENTER.y}
                r="16"
                fill="none"
                stroke={EVIDENCE}
                strokeWidth="1.25"
                style={{
                  animation: `eg-ripple 1.8s ease-out ${delay}s infinite`,
                }}
              />
            ))
          : null}

        {/* cross-links between sources */}
        {CROSS_LINKS.map(([a, b], i) => (
          <line
            key={`cross-${i}`}
            x1={points[a].x}
            y1={points[a].y}
            x2={points[b].x}
            y2={points[b].y}
            stroke={GRAPHITE}
            strokeWidth="1"
            opacity="0.18"
          />
        ))}

        {/* spokes from the query node to each source */}
        {points.map((p, i) => {
          const isPrimary = PRIMARY_LINKS.includes(i);
          const animate = isPrimary && isActive && canAnimate;
          return (
            <line
              key={`spoke-${i}`}
              x1={CENTER.x}
              y1={CENTER.y}
              x2={p.x}
              y2={p.y}
              stroke={isActive ? EVIDENCE : GRAPHITE}
              strokeWidth={isPrimary ? 1.25 : 1}
              opacity={isActive ? (isPrimary ? 0.7 : 0.32) : 0.24}
              strokeDasharray={animate ? "3 5" : undefined}
              style={
                animate
                  ? { animation: "eg-flow 900ms linear infinite" }
                  : { transition: "opacity 300ms ease, stroke 300ms ease" }
              }
            />
          );
        })}

        {/* source nodes */}
        {points.map((p, i) => (
          <circle
            key={`source-${i}`}
            cx={p.x}
            cy={p.y}
            r={SOURCES[i].size}
            fill={isSuccess ? EVIDENCE : isActive ? PAPER : GRAPHITE}
            opacity={isSuccess ? 0.85 : isActive ? 0.95 : 0.55}
            style={{ transition: "fill 300ms ease, opacity 300ms ease" }}
          />
        ))}

        {/* query node */}
        <circle
          cx={CENTER.x}
          cy={CENTER.y}
          r="12"
          fill={isSuccess ? EVIDENCE : isActive ? EVIDENCE : PAPER}
          opacity={isSuccess ? 1 : isActive ? 0.95 : 0.9}
          style={{ transition: "fill 300ms ease, opacity 300ms ease" }}
        />
        <circle
          cx={CENTER.x}
          cy={CENTER.y}
          r="12"
          fill="none"
          stroke={isActive ? EVIDENCE : GRAPHITE}
          strokeWidth="1.5"
          opacity={isActive ? 0.9 : 0.5}
          style={{ transition: "stroke 300ms ease, opacity 300ms ease" }}
        />

        {isSuccess ? (
          <path
            d={`M ${CENTER.x - 5} ${CENTER.y} L ${CENTER.x - 1.5} ${
              CENTER.y + 4.5
            } L ${CENTER.x + 6} ${CENTER.y - 5}`}
            fill="none"
            stroke={INK}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            pathLength="1"
            strokeDasharray="1"
            style={{
              animation: canAnimate
                ? "eg-check 380ms ease forwards"
                : undefined,
              strokeDashoffset: canAnimate ? undefined : 0,
            }}
          />
        ) : null}

        {/* corner registration marks, lab-notebook detailing */}
        {[
          { x: 24, y: 24, dx: 1, dy: 1 },
          { x: 376, y: 24, dx: -1, dy: 1 },
          { x: 24, y: 376, dx: 1, dy: -1 },
          { x: 376, y: 376, dx: -1, dy: -1 },
        ].map((c, i) => (
          <path
            key={`corner-${i}`}
            d={`M ${c.x} ${c.y + c.dy * 14} L ${c.x} ${c.y} L ${
              c.x + c.dx * 14
            } ${c.y}`}
            fill="none"
            stroke={GRAPHITE}
            strokeWidth="1"
            opacity="0.35"
          />
        ))}
      </svg>
    </div>
  );
}
