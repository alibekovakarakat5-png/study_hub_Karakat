import React from "react";
import {
  AbsoluteFill,
  Series,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
} from "remotion";
import { loadFont } from "@remotion/google-fonts/Manrope";

const { fontFamily } = loadFont();

// ── Brand design system ───────────────────────────────────────────────────────
const C = {
  bg0: "#070A1A",
  bg1: "#141A3A",
  bg2: "#2A1E5C",
  blue: "#3B82F6",
  violet: "#8B5CF6",
  cyan: "#22D3EE",
  green: "#34D399",
  amber: "#FBBF24",
  text: "#FFFFFF",
  sub: "rgba(255,255,255,0.62)",
  glass: "rgba(255,255,255,0.07)",
  glassBorder: "rgba(255,255,255,0.14)",
};
const GRAD = `linear-gradient(120deg, ${C.blue} 0%, ${C.violet} 100%)`;

// ── Scene durations (frames @30fps) ───────────────────────────────────────────
const HOOK = 105;     // 3.5s
const PROBLEM = 140;  // 4.7s
const SOLUTION = 290; // 9.7s
const CTA = 135;      // 4.5s
export const REELS_DURATION_IN_FRAMES = HOOK + PROBLEM + SOLUTION + CTA; // 670 ≈ 22.3s

const SAFE = { top: 285, bottom: 400, left: 80, right: 120 };

// ── Animation helpers ─────────────────────────────────────────────────────────
const useEnter = (delay = 0, config: object = { damping: 200 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return spring({ frame: frame - Math.round(delay * fps), fps, config });
};

const FadeInUp: React.FC<{ children: React.ReactNode; delay?: number; distance?: number; config?: object }> = ({
  children, delay = 0, distance = 44, config,
}) => {
  const p = useEnter(delay, config);
  return (
    <div style={{ opacity: p, transform: `translateY(${interpolate(p, [0, 1], [distance, 0])}px)` }}>
      {children}
    </div>
  );
};

const ScalePop: React.FC<{ children: React.ReactNode; delay?: number }> = ({ children, delay = 0 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({ frame: frame - Math.round(delay * fps), fps, config: { damping: 11, stiffness: 180 } });
  const opacity = interpolate(frame - Math.round(delay * fps), [0, 6], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return <div style={{ opacity, transform: `scale(${s})` }}>{children}</div>;
};

const Grad: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <span style={{ background: GRAD, WebkitBackgroundClip: "text", backgroundClip: "text", WebkitTextFillColor: "transparent" }}>
    {children}
  </span>
);

// ── Animated background: gradient + floating glow orbs ────────────────────────
const Background: React.FC = () => {
  const frame = useCurrentFrame();
  const drift = Math.sin(frame / 70) * 18;
  const orb = (x: number, y: number, size: number, color: string, phase: number) => {
    const fy = y + Math.sin((frame + phase) / 55) * 40;
    const fx = x + Math.cos((frame + phase) / 65) * 30;
    return (
      <div style={{
        position: "absolute", left: fx, top: fy, width: size, height: size,
        borderRadius: "50%", background: color, filter: "blur(120px)", opacity: 0.55,
      }} />
    );
  };
  return (
    <AbsoluteFill style={{ background: `linear-gradient(${165 + drift}deg, ${C.bg0} 0%, ${C.bg1} 52%, ${C.bg2} 100%)` }}>
      {orb(-150, 200, 620, C.violet, 0)}
      {orb(700, 1250, 560, C.blue, 120)}
      {orb(250, 820, 420, C.cyan, 240)}
      {/* subtle vignette */}
      <AbsoluteFill style={{ background: "radial-gradient(ellipse at center, transparent 45%, rgba(0,0,0,0.45) 100%)" }} />
    </AbsoluteFill>
  );
};

// ── Brand lockup ──────────────────────────────────────────────────────────────
const Logo: React.FC<{ size?: number }> = ({ size = 56 }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
    <div style={{
      width: size, height: size, borderRadius: size * 0.28, background: GRAD,
      display: "flex", alignItems: "center", justifyContent: "center",
      boxShadow: `0 12px 40px ${C.violet}66`,
    }}>
      <span style={{ fontSize: size * 0.55 }}>🎓</span>
    </div>
    <span style={{ fontSize: size * 0.78, fontWeight: 800, color: C.text, letterSpacing: -1 }}>
      Study<Grad>Hub</Grad>
    </span>
  </div>
);

// ── Glass card wrapper ────────────────────────────────────────────────────────
const Glass: React.FC<{ children: React.ReactNode; style?: React.CSSProperties }> = ({ children, style }) => (
  <div style={{
    background: C.glass, border: `1.5px solid ${C.glassBorder}`, borderRadius: 36,
    backdropFilter: "blur(20px)", boxShadow: "0 30px 80px rgba(0,0,0,0.45)", padding: 40,
    ...style,
  }}>
    {children}
  </div>
);

// ─────────────────────────────────────────────────────────────────────────────
// SCENE 1 — HOOK
// ─────────────────────────────────────────────────────────────────────────────
const SceneHook: React.FC = () => {
  const frame = useCurrentFrame();
  const days = Math.max(0, 92 - Math.floor(frame / 2)); // ticking countdown feel
  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", padding: `${SAFE.top}px ${SAFE.right}px ${SAFE.bottom}px ${SAFE.left}px`, textAlign: "center" }}>
      <ScalePop delay={0}><Logo size={64} /></ScalePop>
      <div style={{ height: 70 }} />
      <FadeInUp delay={0.45}>
        <div style={{ fontSize: 110, fontWeight: 800, color: C.text, lineHeight: 1.02, letterSpacing: -2 }}>
          До ЕНТ<br /><Grad>{days} дня</Grad>
        </div>
      </FadeInUp>
      <div style={{ height: 36 }} />
      <FadeInUp delay={0.9}>
        <div style={{ fontSize: 50, fontWeight: 600, color: C.sub, lineHeight: 1.25 }}>
          А ты уже готов?
        </div>
      </FadeInUp>
    </AbsoluteFill>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// SCENE 2 — PROBLEM
// ─────────────────────────────────────────────────────────────────────────────
const Pain: React.FC<{ icon: string; text: string; delay: number }> = ({ icon, text, delay }) => (
  <FadeInUp delay={delay} distance={36}>
    <div style={{ display: "flex", alignItems: "center", gap: 28, marginBottom: 30 }}>
      <div style={{ width: 96, height: 96, borderRadius: 26, background: "rgba(239,68,68,0.16)", border: "1.5px solid rgba(239,68,68,0.3)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 46, flexShrink: 0 }}>{icon}</div>
      <span style={{ fontSize: 50, fontWeight: 600, color: C.text, textAlign: "left", lineHeight: 1.2 }}>{text}</span>
    </div>
  </FadeInUp>
);
const SceneProblem: React.FC = () => (
  <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", padding: `${SAFE.top}px ${SAFE.right}px ${SAFE.bottom}px ${SAFE.left}px` }}>
    <div style={{ width: "100%" }}>
      <FadeInUp delay={0}>
        <div style={{ fontSize: 58, fontWeight: 800, color: C.text, marginBottom: 56, lineHeight: 1.1 }}>
          Подготовка <Grad>без плана</Grad> — это:
        </div>
      </FadeInUp>
      <Pain icon="💸" text="Репетиторы — дорого" delay={0.4} />
      <Pain icon="😵" text="Учиться одному — тяжело" delay={0.65} />
      <Pain icon="🤷" text="Непонятно с чего начать" delay={0.9} />
    </div>
  </AbsoluteFill>
);

// ─────────────────────────────────────────────────────────────────────────────
// SCENE 3 — SOLUTION (intro + feature mockups)
// ─────────────────────────────────────────────────────────────────────────────

// Mini UI mockups (recreated, not screenshots)
const DiagnosticMock: React.FC = () => {
  const bars = [
    { s: "Математика", v: 0.42, c: C.amber },
    { s: "Биология", v: 0.68, c: C.green },
    { s: "Химия", v: 0.35, c: "#F87171" },
  ];
  const frame = useCurrentFrame();
  const grow = interpolate(frame, [4, 26], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <Glass style={{ width: 720 }}>
      <div style={{ fontSize: 34, fontWeight: 700, color: C.text, marginBottom: 26 }}>📊 Диагностика уровня</div>
      {bars.map((b, i) => (
        <div key={i} style={{ marginBottom: 22 }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
            <span style={{ fontSize: 28, color: C.sub }}>{b.s}</span>
            <span style={{ fontSize: 28, fontWeight: 700, color: b.c }}>{Math.round(b.v * 100 * grow)}%</span>
          </div>
          <div style={{ height: 18, borderRadius: 10, background: "rgba(255,255,255,0.1)" }}>
            <div style={{ height: "100%", width: `${b.v * 100 * grow}%`, borderRadius: 10, background: b.c }} />
          </div>
        </div>
      ))}
    </Glass>
  );
};

const LessonMock: React.FC = () => (
  <Glass style={{ width: 720 }}>
    <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 22 }}>
      <span style={{ fontSize: 30 }}>✨</span>
      <span style={{ fontSize: 34, fontWeight: 700, color: C.text }}>AI-урок за 2 минуты</span>
    </div>
    <div style={{ fontSize: 30, color: C.sub, marginBottom: 18 }}>Квадратные уравнения</div>
    <div style={{ background: "rgba(139,92,246,0.16)", border: `1.5px solid ${C.violet}55`, borderRadius: 18, padding: "20px 26px", fontSize: 38, fontWeight: 700, color: C.text, textAlign: "center", letterSpacing: 1 }}>
      D = b² − 4ac
    </div>
    <div style={{ display: "flex", gap: 14, marginTop: 22 }}>
      {["A) 16", "B) 25", "C) 9"].map((o, i) => (
        <div key={i} style={{ flex: 1, textAlign: "center", padding: "16px 0", borderRadius: 14, fontSize: 28, fontWeight: 600,
          background: i === 0 ? "rgba(52,211,153,0.2)" : "rgba(255,255,255,0.07)",
          border: i === 0 ? `1.5px solid ${C.green}` : `1.5px solid ${C.glassBorder}`,
          color: i === 0 ? C.green : C.sub }}>{o}</div>
      ))}
    </div>
  </Glass>
);

const ProgressMock: React.FC = () => {
  const frame = useCurrentFrame();
  const pts = [30, 38, 35, 52, 61, 74, 88];
  const draw = interpolate(frame, [4, 30], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const W = 620, H = 220;
  const path = pts.map((p, i) => `${(i / (pts.length - 1)) * W},${H - (p / 100) * H}`);
  const shown = Math.max(2, Math.ceil(path.length * draw));
  return (
    <Glass style={{ width: 720 }}>
      <div style={{ fontSize: 34, fontWeight: 700, color: C.text, marginBottom: 8 }}>📈 Твой прогресс</div>
      <div style={{ fontSize: 28, color: C.green, fontWeight: 700, marginBottom: 22 }}>↑ +58% за 6 недель</div>
      <svg width={W} height={H} style={{ overflow: "visible" }}>
        <polyline points={path.slice(0, shown).join(" ")} fill="none" stroke={C.cyan} strokeWidth={6} strokeLinecap="round" strokeLinejoin="round" />
        {path.slice(0, shown).map((pt, i) => {
          const [x, y] = pt.split(",").map(Number);
          return <circle key={i} cx={x} cy={y} r={7} fill={C.cyan} />;
        })}
      </svg>
    </Glass>
  );
};

const SkyllaMock: React.FC = () => (
  <Glass style={{ width: 720 }}>
    <div style={{ display: "flex", alignItems: "center", gap: 18, marginBottom: 20 }}>
      <div style={{ width: 72, height: 72, borderRadius: 22, background: GRAD, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 38 }}>🤖</div>
      <div>
        <div style={{ fontSize: 32, fontWeight: 700, color: C.text }}>Skylla — AI-репетитор</div>
        <div style={{ fontSize: 24, color: C.green }}>● онлайн 24/7</div>
      </div>
    </div>
    <div style={{ background: "rgba(255,255,255,0.08)", borderRadius: "20px 20px 20px 6px", padding: "20px 26px", fontSize: 30, color: C.text, lineHeight: 1.35 }}>
      «Объясни теорему Виета простыми словами» — и Skylla разложит по шагам 💡
    </div>
  </Glass>
);

const FEATURES = [DiagnosticMock, LessonMock, ProgressMock, SkyllaMock];
const FEATURE_LABELS = ["Узнай свой уровень", "Учись с AI", "Расти каждый день", "Спроси что угодно"];

const SceneSolution: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  // intro 0-2s, then 4 features cycle
  const introOut = interpolate(frame, [50, 64], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const FEAT_START = 64;
  const FEAT_LEN = Math.floor((SOLUTION - FEAT_START) / FEATURES.length); // frames per feature

  const idx = Math.min(FEATURES.length - 1, Math.floor((frame - FEAT_START) / FEAT_LEN));
  const local = frame - FEAT_START - idx * FEAT_LEN;
  const Card = FEATURES[Math.max(0, idx)];
  const cardIn = spring({ frame: local, fps, config: { damping: 18, stiffness: 110 } });
  const cardOut = interpolate(local, [FEAT_LEN - 12, FEAT_LEN], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  return (
    <AbsoluteFill>
      {/* Intro line */}
      {frame < FEAT_START + 4 && (
        <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", padding: `${SAFE.top}px ${SAFE.right}px ${SAFE.bottom}px ${SAFE.left}px`, opacity: introOut }}>
          <ScalePop><Logo size={66} /></ScalePop>
          <div style={{ height: 50 }} />
          <FadeInUp delay={0.4}>
            <div style={{ fontSize: 64, fontWeight: 800, color: C.text, textAlign: "center", lineHeight: 1.08 }}>
              Готовься к ЕНТ<br />с <Grad>искусственным<br />интеллектом</Grad>
            </div>
          </FadeInUp>
        </AbsoluteFill>
      )}

      {/* Feature cards */}
      {frame >= FEAT_START && idx >= 0 && (
        <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", padding: `${SAFE.top}px 60px ${SAFE.bottom}px 60px` }}>
          <div style={{ opacity: cardOut, transform: `translateY(${interpolate(cardIn, [0, 1], [60, 0])}px) scale(${interpolate(cardIn, [0, 1], [0.92, 1])})` }}>
            <div style={{ fontSize: 56, fontWeight: 800, color: C.text, textAlign: "center", marginBottom: 34 }}>
              <Grad>{FEATURE_LABELS[idx]}</Grad>
            </div>
            <Card />
          </div>
          {/* progress dots */}
          <div style={{ display: "flex", gap: 14, marginTop: 48 }}>
            {FEATURES.map((_, i) => (
              <div key={i} style={{ width: i === idx ? 44 : 14, height: 14, borderRadius: 7, background: i === idx ? GRAD : "rgba(255,255,255,0.22)", transition: "all 0.3s" }} />
            ))}
          </div>
        </AbsoluteFill>
      )}
    </AbsoluteFill>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// SCENE 4 — CTA
// ─────────────────────────────────────────────────────────────────────────────
const SceneCTA: React.FC = () => {
  const frame = useCurrentFrame();
  const pulse = 1 + Math.sin(frame / 7) * 0.025;
  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", padding: `${SAFE.top}px ${SAFE.right}px ${SAFE.bottom}px ${SAFE.left}px`, textAlign: "center" }}>
      <ScalePop delay={0}><Logo size={70} /></ScalePop>
      <div style={{ height: 56 }} />
      <FadeInUp delay={0.35}>
        <div style={{ fontSize: 92, fontWeight: 800, color: C.text, lineHeight: 1.05, letterSpacing: -2 }}>
          Начни <Grad>бесплатно</Grad>
        </div>
      </FadeInUp>
      <div style={{ height: 30 }} />
      <FadeInUp delay={0.7}>
        <div style={{ fontSize: 42, fontWeight: 600, color: C.sub }}>
          ЕНТ • IELTS • Поступление
        </div>
      </FadeInUp>
      <div style={{ height: 64 }} />
      <ScalePop delay={1.0}>
        <div style={{ transform: `scale(${pulse})`, background: GRAD, borderRadius: 26, padding: "30px 64px", fontSize: 46, fontWeight: 800, color: "#fff", boxShadow: `0 20px 60px ${C.violet}77` }}>
          studyhub.kz →
        </div>
      </ScalePop>
    </AbsoluteFill>
  );
};

// ── Top progress timeline (whole video) ───────────────────────────────────────
const Timeline: React.FC = () => {
  const frame = useCurrentFrame();
  const pct = (frame / REELS_DURATION_IN_FRAMES) * 100;
  return (
    <div style={{ position: "absolute", top: 120, left: SAFE.left, right: SAFE.right, height: 8, borderRadius: 4, background: "rgba(255,255,255,0.14)", zIndex: 10 }}>
      <div style={{ height: "100%", width: `${pct}%`, borderRadius: 4, background: GRAD }} />
    </div>
  );
};

// ── Root composition ──────────────────────────────────────────────────────────
export const StudyHubReels: React.FC = () => {
  return (
    <AbsoluteFill style={{ fontFamily, background: C.bg0 }}>
      <Background />
      <Timeline />
      <Series>
        <Series.Sequence durationInFrames={HOOK}><SceneHook /></Series.Sequence>
        <Series.Sequence durationInFrames={PROBLEM}><SceneProblem /></Series.Sequence>
        <Series.Sequence durationInFrames={SOLUTION}><SceneSolution /></Series.Sequence>
        <Series.Sequence durationInFrames={CTA}><SceneCTA /></Series.Sequence>
      </Series>
    </AbsoluteFill>
  );
};
