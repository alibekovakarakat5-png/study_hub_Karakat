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

// ── Esep brand ────────────────────────────────────────────────────────────────
const C = {
  bg0: "#06121C",
  bg1: "#0A2436",
  bg2: "#0C3550",
  blue: "#16A6DC",
  cyan: "#3CC8F0",
  green: "#2FBF71",
  red: "#EC5B5B",
  amber: "#F2B134",
  text: "#FFFFFF",
  sub: "rgba(255,255,255,0.64)",
  glass: "rgba(255,255,255,0.06)",
  glassBorder: "rgba(255,255,255,0.14)",
};
const GRAD = `linear-gradient(120deg, ${C.blue} 0%, ${C.cyan} 100%)`;
const SAFE = { top: 270, bottom: 380, left: 90, right: 90 };

// ── Helpers ───────────────────────────────────────────────────────────────────
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
  const s = spring({ frame: frame - Math.round(delay * fps), fps, config: { damping: 12, stiffness: 180 } });
  const opacity = interpolate(frame - Math.round(delay * fps), [0, 6], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return <div style={{ opacity, transform: `scale(${s})` }}>{children}</div>;
};

const Grad: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <span style={{ background: GRAD, WebkitBackgroundClip: "text", backgroundClip: "text", WebkitTextFillColor: "transparent" }}>
    {children}
  </span>
);

const Background: React.FC = () => {
  const frame = useCurrentFrame();
  const drift = Math.sin(frame / 70) * 16;
  const orb = (x: number, y: number, size: number, color: string, phase: number) => {
    const fy = y + Math.sin((frame + phase) / 55) * 36;
    const fx = x + Math.cos((frame + phase) / 65) * 28;
    return <div style={{ position: "absolute", left: fx, top: fy, width: size, height: size, borderRadius: "50%", background: color, filter: "blur(120px)", opacity: 0.5 }} />;
  };
  return (
    <AbsoluteFill style={{ background: `linear-gradient(${165 + drift}deg, ${C.bg0} 0%, ${C.bg1} 55%, ${C.bg2} 100%)` }}>
      {orb(-160, 240, 600, C.blue, 0)}
      {orb(720, 1280, 540, C.cyan, 120)}
      {orb(220, 880, 400, C.blue, 240)}
      <AbsoluteFill style={{ background: "radial-gradient(ellipse at center, transparent 45%, rgba(0,0,0,0.5) 100%)" }} />
    </AbsoluteFill>
  );
};

const Logo: React.FC<{ size?: number }> = ({ size = 64 }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
    <div style={{ width: size, height: size, borderRadius: size * 0.3, background: GRAD, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: `0 12px 40px ${C.blue}66` }}>
      <span style={{ fontSize: size * 0.6, fontWeight: 800, color: "#04222E" }}>e</span>
    </div>
    <span style={{ fontSize: size * 0.8, fontWeight: 800, color: C.text, letterSpacing: -1 }}>sep</span>
  </div>
);

const Glass: React.FC<{ children: React.ReactNode; style?: React.CSSProperties }> = ({ children, style }) => (
  <div style={{ background: C.glass, border: `1.5px solid ${C.glassBorder}`, borderRadius: 36, backdropFilter: "blur(20px)", boxShadow: "0 30px 80px rgba(0,0,0,0.45)", padding: 44, ...style }}>
    {children}
  </div>
);

const Chip: React.FC<{ text: string; color: string }> = ({ text, color }) => (
  <span style={{ fontSize: 38, fontWeight: 700, color, background: `${color}26`, padding: "12px 30px", borderRadius: 40 }}>{text}</span>
);

const ClientRow: React.FC<{ name: string; status: string; color: string }> = ({ name, status, color }) => (
  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "30px 4px", borderTop: `1.5px solid ${C.glassBorder}` }}>
    <span style={{ fontSize: 46, fontWeight: 600, color: C.text }}>{name}</span>
    <Chip text={status} color={color} />
  </div>
);

const Step: React.FC<{ label: string; right: React.ReactNode; delay: number }> = ({ label, right, delay }) => (
  <FadeInUp delay={delay} distance={30}>
    <div style={{ display: "flex", alignItems: "center", gap: 24, background: C.glass, border: `1.5px solid ${C.glassBorder}`, borderRadius: 28, padding: "34px 40px", marginBottom: 26 }}>
      <span style={{ fontSize: 46, fontWeight: 700, color: C.text }}>{label}</span>
      <span style={{ marginLeft: "auto", fontSize: 50 }}>{right}</span>
    </div>
  </FadeInUp>
);

const Caption: React.FC<{ text: string }> = ({ text }) => {
  const p = useEnter(0.45);
  return (
    <div style={{ position: "absolute", bottom: SAFE.bottom, left: SAFE.left, right: SAFE.right, textAlign: "center", fontSize: 52, fontWeight: 700, color: C.text, opacity: p, transform: `translateY(${interpolate(p, [0, 1], [30, 0])}px)` }}>
      {text}
    </div>
  );
};

const Stage: React.FC<{ children: React.ReactNode; center?: boolean }> = ({ children, center = true }) => (
  <AbsoluteFill style={{ padding: `${SAFE.top}px ${SAFE.right}px ${SAFE.bottom}px ${SAFE.left}px`, alignItems: "center", justifyContent: center ? "center" : "flex-start", textAlign: "center" }}>
    {children}
  </AbsoluteFill>
);

// ── Shared CTA ────────────────────────────────────────────────────────────────
const CTA: React.FC<{ line: string }> = ({ line }) => {
  const frame = useCurrentFrame();
  const bob = Math.sin(frame / 8) * 14;
  return (
    <Stage>
      <ScalePop delay={0}><Logo size={88} /></ScalePop>
      <div style={{ height: 30 }} />
      <FadeInUp delay={0.35}><div style={{ fontSize: 48, fontWeight: 700, color: C.sub }}>для бухфирм</div></FadeInUp>
      <div style={{ height: 50 }} />
      <FadeInUp delay={0.6}>
        <div style={{ fontSize: 56, fontWeight: 800, color: "#04222E", background: GRAD, padding: "28px 56px", borderRadius: 28 }}>{line}</div>
      </FadeInUp>
      <div style={{ height: 40 }} />
      <FadeInUp delay={0.85}><div style={{ fontSize: 80, transform: `translateY(${bob}px)` }}>👇</div></FadeInUp>
    </Stage>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// REEL 1 — «Хаос → порядок»
// ═══════════════════════════════════════════════════════════════════════════════
const R1Hook: React.FC = () => (
  <Stage>
    <FadeInUp delay={0.1}>
      <div style={{ fontSize: 104, fontWeight: 800, color: C.text, lineHeight: 1.08, letterSpacing: -2 }}>
        30 клиентов.<br />30 дедлайнов.
      </div>
    </FadeInUp>
    <div style={{ height: 36 }} />
    <FadeInUp delay={0.7}>
      <div style={{ fontSize: 84, fontWeight: 800, lineHeight: 1.1 }}><Grad>И всё — в голове.</Grad></div>
    </FadeInUp>
  </Stage>
);

const R1Problem: React.FC = () => (
  <Stage>
    <div style={{ display: "flex", flexDirection: "column", gap: 34 }}>
      <FadeInUp delay={0.15}><div style={{ fontSize: 66, fontWeight: 700, color: C.text }}>Кто сдал?</div></FadeInUp>
      <FadeInUp delay={0.55}><div style={{ fontSize: 66, fontWeight: 700, color: C.text }}>Кто должник?</div></FadeInUp>
      <FadeInUp delay={0.95}><div style={{ fontSize: 66, fontWeight: 700, color: C.text }}>У кого срок завтра?</div></FadeInUp>
    </div>
  </Stage>
);

const R1Cut: React.FC = () => (
  <Stage>
    <ScalePop delay={0}><div style={{ fontSize: 150, fontWeight: 800, color: C.text }}>Хватит.</div></ScalePop>
  </Stage>
);

const R1Solution: React.FC = () => (
  <Stage>
    <FadeInUp delay={0.1}>
      <Glass style={{ width: 880 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 18, marginBottom: 26 }}>
          <div style={{ width: 26, height: 26, borderRadius: "50%", background: C.blue }} />
          <span style={{ fontSize: 50, fontWeight: 800, color: C.text }}>Клиенты</span>
        </div>
        <ClientRow name="ИП Алмас" status="Сдал" color={C.green} />
        <ClientRow name="ТОО Береке" status="Должник" color={C.red} />
        <ClientRow name="ИП Сауле" status="Ждёт" color={C.amber} />
        <ClientRow name="ИП Нурлан" status="Сдал" color={C.green} />
      </Glass>
    </FadeInUp>
    <Caption text="Все клиенты — на одном экране" />
  </Stage>
);

const R1Tax: React.FC = () => (
  <Stage>
    <div style={{ width: 880 }}>
      <Step label="Выписка Kaspi" right={<span style={{ color: C.green }}>✓</span>} delay={0.15} />
      <Step label="Налог 910" right={<span style={{ color: C.cyan, fontWeight: 800 }}>48 000 ₸</span>} delay={0.75} />
      <Step label="Форма 910 готова" right={<span style={{ color: C.green }}>✓</span>} delay={1.35} />
    </div>
    <Caption text="Выписка → налог сам" />
  </Stage>
);

export const REEL1_FRAMES = 90 + 84 + 30 + 150 + 132 + 90; // 576 ≈ 19.2s
export const EsepBuhReel1: React.FC = () => (
  <AbsoluteFill style={{ fontFamily, background: C.bg0 }}>
    <Background />
    <Series>
      <Series.Sequence durationInFrames={90}><R1Hook /></Series.Sequence>
      <Series.Sequence durationInFrames={84}><R1Problem /></Series.Sequence>
      <Series.Sequence durationInFrames={30}><R1Cut /></Series.Sequence>
      <Series.Sequence durationInFrames={150}><R1Solution /></Series.Sequence>
      <Series.Sequence durationInFrames={132}><R1Tax /></Series.Sequence>
      <Series.Sequence durationInFrames={90}><CTA line="Демо-доступ бесплатно" /></Series.Sequence>
    </Series>
  </AbsoluteFill>
);

// ═══════════════════════════════════════════════════════════════════════════════
// REEL 2 — «10 секунд на клиента»
// ═══════════════════════════════════════════════════════════════════════════════
const R2Hook: React.FC = () => (
  <Stage>
    <FadeInUp delay={0.1}>
      <div style={{ fontSize: 78, fontWeight: 700, color: C.sub, lineHeight: 1.2 }}>То, на что уходил <span style={{ color: C.text }}>вечер</span> —</div>
    </FadeInUp>
    <div style={{ height: 40 }} />
    <ScalePop delay={0.85}>
      <div style={{ fontSize: 110, fontWeight: 800, letterSpacing: -2 }}><Grad>теперь минута.</Grad></div>
    </ScalePop>
  </Stage>
);

const ClientBadge: React.FC<{ n: number }> = ({ n }) => {
  const p = useEnter(0.1, { damping: 12, stiffness: 180 });
  return (
    <div style={{ position: "absolute", top: SAFE.top + 10, left: SAFE.left, right: SAFE.right, textAlign: "center", opacity: interpolate(p, [0, 1], [0, 1]), transform: `scale(${p})` }}>
      <span style={{ fontSize: 42, fontWeight: 800, color: C.green, background: `${C.green}22`, padding: "12px 34px", borderRadius: 40 }}>Клиент {n} ✓</span>
    </div>
  );
};

const R2Client1: React.FC = () => (
  <Stage>
    <ClientBadge n={1} />
    <FadeInUp delay={0.1}>
      <Glass style={{ width: 880 }}>
        <span style={{ fontSize: 46, fontWeight: 800, color: C.text }}>Выписка · ИП Алмас</span>
        <ClientRow name="Оплата от ТОО" status="+250 000" color={C.green} />
        <ClientRow name="Аренда офиса" status="−80 000" color={C.red} />
        <ClientRow name="Поступление" status="+120 000" color={C.green} />
      </Glass>
    </FadeInUp>
    <Caption text="Операции разнеслись сами" />
  </Stage>
);

const R2Client2: React.FC = () => (
  <Stage>
    <ClientBadge n={2} />
    <div style={{ width: 880 }}>
      <Step label="Налог 910" right={<span style={{ color: C.cyan, fontWeight: 800 }}>32 000 ₸</span>} delay={0.15} />
      <Step label="Соцплатежи" right={<span style={{ color: C.cyan, fontWeight: 800 }}>26 000 ₸</span>} delay={0.7} />
      <Step label="Готово к оплате" right={<span style={{ color: C.green }}>✓</span>} delay={1.25} />
    </div>
    <Caption text="Налог посчитан" />
  </Stage>
);

const R2Client3: React.FC = () => (
  <Stage>
    <ClientBadge n={3} />
    <div style={{ width: 880 }}>
      <Step label="Форма 910 заполнена" right={<span style={{ color: C.green }}>✓</span>} delay={0.15} />
      <Step label="ЭСФ из счёта" right={<span style={{ color: C.green }}>✓</span>} delay={0.7} />
      <Step label="Дедлайны под контролем" right={<span style={{ color: C.green }}>✓</span>} delay={1.25} />
    </div>
    <Caption text="Формы и ЭСФ — в один клик" />
  </Stage>
);

const R2All: React.FC = () => (
  <Stage>
    <FadeInUp delay={0.1}>
      <div style={{ fontSize: 76, fontWeight: 800, color: C.text, lineHeight: 1.2 }}>
        Зарплата · ЭСФ · дедлайны<br /><Grad>— в одном месте.</Grad>
      </div>
    </FadeInUp>
  </Stage>
);

export const REEL2_FRAMES = 78 + 84 + 84 + 84 + 90 + 90; // 510 = 17s
export const EsepBuhReel2: React.FC = () => (
  <AbsoluteFill style={{ fontFamily, background: C.bg0 }}>
    <Background />
    <Series>
      <Series.Sequence durationInFrames={78}><R2Hook /></Series.Sequence>
      <Series.Sequence durationInFrames={84}><R2Client1 /></Series.Sequence>
      <Series.Sequence durationInFrames={84}><R2Client2 /></Series.Sequence>
      <Series.Sequence durationInFrames={84}><R2Client3 /></Series.Sequence>
      <Series.Sequence durationInFrames={90}><R2All /></Series.Sequence>
      <Series.Sequence durationInFrames={90}><CTA line="Демо бесплатно" /></Series.Sequence>
    </Series>
  </AbsoluteFill>
);
