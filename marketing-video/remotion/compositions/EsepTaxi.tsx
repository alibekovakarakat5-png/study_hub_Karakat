import React from "react";
import {
  AbsoluteFill,
  Series,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
} from "remotion";
import { loadFont } from "@remotion/google-fonts/Inter";

const { fontFamily } = loadFont();

// ── Стиль лендинга Esep (enterprise) ──────────────────────────────────────────
const C = {
  navy0: "#0A1E33", navy1: "#0F2B46", navy2: "#0C3550",
  sky: "#38BDF8", sky2: "#0EA5E9", green: "#22C55E",
  white: "#FFFFFF", sub: "rgba(255,255,255,0.62)",
  glass: "rgba(255,255,255,0.06)", glassBorder: "rgba(255,255,255,0.12)",
};
const GRAD = `linear-gradient(135deg, ${C.sky} 0%, ${C.green} 100%)`;
const SAFE = { top: 285, bottom: 400, left: 80, right: 120 };

const useEnter = (delay = 0, config: object = { damping: 200 }) => {
  const frame = useCurrentFrame(); const { fps } = useVideoConfig();
  return spring({ frame: frame - Math.round(delay * fps), fps, config });
};
const FadeUp: React.FC<{ children: React.ReactNode; delay?: number; distance?: number }> = ({ children, delay = 0, distance = 40 }) => {
  const p = useEnter(delay);
  return <div style={{ opacity: p, transform: `translateY(${interpolate(p, [0, 1], [distance, 0])}px)` }}>{children}</div>;
};
const Pop: React.FC<{ children: React.ReactNode; delay?: number }> = ({ children, delay = 0 }) => {
  const f = useCurrentFrame(); const { fps } = useVideoConfig();
  const s = spring({ frame: f - Math.round(delay * fps), fps, config: { damping: 14, stiffness: 160 } });
  const o = interpolate(f - Math.round(delay * fps), [0, 6], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return <div style={{ opacity: o, transform: `scale(${interpolate(s, [0, 1], [0.9, 1])})` }}>{children}</div>;
};
const Grad: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <span style={{ background: GRAD, WebkitBackgroundClip: "text", backgroundClip: "text", WebkitTextFillColor: "transparent" }}>{children}</span>
);

const Aurora: React.FC = () => {
  const f = useCurrentFrame();
  const blob = (x: number, y: number, s: number, col: string, ph: number, op: number) => {
    const fx = x + Math.cos((f + ph) / 80) * 60, fy = y + Math.sin((f + ph) / 70) * 50;
    return <div style={{ position: "absolute", left: fx, top: fy, width: s, height: s, borderRadius: "50%", background: col, filter: "blur(130px)", opacity: op }} />;
  };
  return (
    <AbsoluteFill style={{ background: `linear-gradient(165deg, ${C.navy0} 0%, ${C.navy1} 55%, ${C.navy2} 100%)` }}>
      {blob(-180, 360, 620, C.sky2, 0, 0.22)}
      {blob(720, 1300, 560, C.green, 140, 0.16)}
      {blob(260, 820, 460, C.sky, 260, 0.14)}
      <AbsoluteFill style={{ backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.06) 1.4px, transparent 1.4px)", backgroundSize: "46px 46px", opacity: 0.5 }} />
      <AbsoluteFill style={{ background: "radial-gradient(ellipse at center, transparent 45%, rgba(0,0,0,0.45) 100%)" }} />
    </AbsoluteFill>
  );
};
const Badge: React.FC<{ text: string }> = ({ text }) => (
  <div style={{ display: "inline-flex", alignItems: "center", gap: 12, padding: "16px 32px", borderRadius: 50, background: C.glass, border: `1.5px solid ${C.glassBorder}` }}>
    <span style={{ color: C.green, fontSize: 34 }}>✦</span>
    <span style={{ color: "rgba(255,255,255,0.82)", fontSize: 34, fontWeight: 600, letterSpacing: 2, textTransform: "uppercase" }}>{text}</span>
  </div>
);
const Glass: React.FC<{ children: React.ReactNode; style?: React.CSSProperties }> = ({ children, style }) => (
  <div style={{ background: C.glass, border: `1.5px solid ${C.glassBorder}`, borderRadius: 28, padding: 32, ...style }}>{children}</div>
);
const Logo: React.FC<{ size?: number }> = ({ size = 90 }) => (
  <div style={{ display: "flex", alignItems: "center", gap: size * 0.26 }}>
    <div style={{ width: size, height: size, borderRadius: size * 0.28, background: "#0E2A3D", border: "1.5px solid rgba(56,189,248,0.4)", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <svg width={size * 0.6} height={size * 0.6} viewBox="0 0 24 24" fill="none" stroke={C.sky} strokeWidth={2.6} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 15 L12 8 L19 15" /></svg>
    </div>
    <span style={{ fontSize: size * 1.05, fontWeight: 800, color: C.white, letterSpacing: 1 }}>ESEP</span>
  </div>
);
const Stage: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <AbsoluteFill style={{ padding: `${SAFE.top}px ${SAFE.right}px ${SAFE.bottom}px ${SAFE.left}px`, alignItems: "center", justifyContent: "center", textAlign: "center" }}>{children}</AbsoluteFill>
);

const SvcRow: React.FC<{ text: string; delay: number }> = ({ text, delay }) => (
  <FadeUp delay={delay} distance={26}>
    <div style={{ display: "flex", alignItems: "center", gap: 22, background: C.glass, border: `1.5px solid ${C.glassBorder}`, borderRadius: 22, padding: "26px 30px", marginBottom: 18, width: 880 }}>
      <span style={{ width: 46, height: 46, borderRadius: 12, background: GRAD, color: C.navy1, fontSize: 30, fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>✓</span>
      <span style={{ fontSize: 44, fontWeight: 600, color: C.white, textAlign: "left" }}>{text}</span>
    </div>
  </FadeUp>
);
const Stat: React.FC<{ v: string; l: string; delay: number }> = ({ v, l, delay }) => (
  <Pop delay={delay}>
    <div style={{ background: C.glass, border: `1.5px solid ${C.glassBorder}`, borderRadius: 24, padding: "34px 24px", textAlign: "center" }}>
      <div style={{ fontSize: 60, fontWeight: 800, color: C.white }}>{v}</div>
      <div style={{ fontSize: 28, fontWeight: 600, color: C.sub, marginTop: 8, textTransform: "uppercase", letterSpacing: 1 }}>{l}</div>
    </div>
  </Pop>
);

const S1: React.FC = () => (
  <Stage>
    <FadeUp delay={0}><Badge text="НК-2026 · для платформ" /></FadeUp>
    <div style={{ height: 50 }} />
    <FadeUp delay={0.4}>
      <div style={{ fontSize: 96, fontWeight: 800, color: C.white, lineHeight: 1.08, letterSpacing: -1 }}>
        Таксопарк теперь —<br /><Grad>налоговый агент</Grad><br />за каждого водителя
      </div>
    </FadeUp>
  </Stage>
);
const S2: React.FC = () => (
  <Stage>
    <FadeUp delay={0}><div style={{ fontSize: 50, fontWeight: 700, color: C.sub, marginBottom: 36 }}>Что закон требует с каждого парка:</div></FadeUp>
    <SvcRow text="Проверять статус водителей" delay={0.3} />
    <SvcRow text="Контролировать лимит 300 МРП" delay={0.6} />
    <SvcRow text="Выдавать фискальные чеки" delay={0.9} />
    <SvcRow text="Сдавать отчётность в КГД" delay={1.2} />
  </Stage>
);
const S3: React.FC = () => (
  <Stage>
    <FadeUp delay={0}>
      <div style={{ fontSize: 84, fontWeight: 800, color: C.white, lineHeight: 1.1, marginBottom: 44 }}>Esep закрывает всё —<br /><Grad>в одной системе</Grad></div>
    </FadeUp>
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 22, width: 880 }}>
      {[["🪪", "Проверка водителей"], ["📊", "Лимит 300 МРП"], ["🧾", "Фискальные чеки"], ["📤", "Отчётность КГД"]].map(([ic, t], i) => (
        <Pop key={i} delay={0.4 + i * 0.18}>
          <Glass style={{ textAlign: "center", padding: "30px 22px" }}>
            <div style={{ fontSize: 60 }}>{ic}</div>
            <div style={{ fontSize: 38, fontWeight: 700, color: C.white, marginTop: 10 }}>{t}</div>
          </Glass>
        </Pop>
      ))}
    </div>
  </Stage>
);
const S4: React.FC = () => (
  <Stage>
    <FadeUp delay={0}><div style={{ fontSize: 56, fontWeight: 800, color: C.white, marginBottom: 40 }}>Подключение — <Grad>за 14 дней</Grad></div></FadeUp>
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, width: 880 }}>
      <Stat v="14 дней" l="внедрение" delay={0.3} />
      <Stat v="1 договор" l="с КГД на всех" delay={0.5} />
      <Stat v="99.9%" l="доступность" delay={0.7} />
      <Stat v="<100 мс" l="скорость" delay={0.9} />
    </div>
  </Stage>
);
const S5: React.FC = () => (
  <Stage>
    <Pop delay={0}><Logo size={100} /></Pop>
    <div style={{ height: 44 }} />
    <FadeUp delay={0.4}><div style={{ fontSize: 56, fontWeight: 700, color: C.white, lineHeight: 1.25 }}>Не 6 месяцев своей разработки —<br /><Grad>а 14 дней с Esep</Grad></div></FadeUp>
    <div style={{ height: 40 }} />
    <FadeUp delay={0.8}><div style={{ fontSize: 48, fontWeight: 800, color: C.navy1, background: C.white, padding: "24px 50px", borderRadius: 50 }}>esepkz.com</div></FadeUp>
  </Stage>
);

export const TAXI_FRAMES = 160 + 200 + 190 + 130 + 130; // 810 = 27s
export const EsepTaxi: React.FC = () => (
  <AbsoluteFill style={{ fontFamily, background: C.navy1 }}>
    <Aurora />
    <Series>
      <Series.Sequence durationInFrames={160}><S1 /></Series.Sequence>
      <Series.Sequence durationInFrames={200}><S2 /></Series.Sequence>
      <Series.Sequence durationInFrames={190}><S3 /></Series.Sequence>
      <Series.Sequence durationInFrames={130}><S4 /></Series.Sequence>
      <Series.Sequence durationInFrames={130}><S5 /></Series.Sequence>
    </Series>
  </AbsoluteFill>
);
