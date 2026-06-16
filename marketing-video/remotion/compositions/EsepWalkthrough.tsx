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

const C = {
  bg0: "#06121C", bg1: "#0A2436", bg2: "#0C3550",
  blue: "#16A6DC", cyan: "#3CC8F0", green: "#2FBF71", red: "#EC5B5B", amber: "#F2B134",
  text: "#FFFFFF", sub: "rgba(255,255,255,0.64)",
  glass: "rgba(255,255,255,0.06)", glassBorder: "rgba(255,255,255,0.16)",
};
const GRAD = `linear-gradient(120deg, ${C.blue} 0%, ${C.cyan} 100%)`;
const SAFE = { top: 250, bottom: 320, left: 80, right: 80 };

const useEnter = (delay = 0, config: object = { damping: 200 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return spring({ frame: frame - Math.round(delay * fps), fps, config });
};
const FadeInUp: React.FC<{ children: React.ReactNode; delay?: number; distance?: number }> = ({ children, delay = 0, distance = 36 }) => {
  const p = useEnter(delay);
  return <div style={{ opacity: p, transform: `translateY(${interpolate(p, [0, 1], [distance, 0])}px)` }}>{children}</div>;
};
const ScalePop: React.FC<{ children: React.ReactNode; delay?: number }> = ({ children, delay = 0 }) => {
  const frame = useCurrentFrame(); const { fps } = useVideoConfig();
  const s = spring({ frame: frame - Math.round(delay * fps), fps, config: { damping: 12, stiffness: 180 } });
  const o = interpolate(frame - Math.round(delay * fps), [0, 6], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return <div style={{ opacity: o, transform: `scale(${s})` }}>{children}</div>;
};
const Grad: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <span style={{ background: GRAD, WebkitBackgroundClip: "text", backgroundClip: "text", WebkitTextFillColor: "transparent" }}>{children}</span>
);
const CountUp: React.FC<{ to: number; delay?: number; suffix?: string; color?: string }> = ({ to, delay = 0, suffix = "", color = C.cyan }) => {
  const p = useEnter(delay, { damping: 200 });
  const v = Math.round(interpolate(p, [0, 1], [0, to]));
  return <span style={{ color, fontWeight: 800 }}>{v.toLocaleString("ru-RU")}{suffix}</span>;
};

const Background: React.FC = () => {
  const frame = useCurrentFrame();
  const drift = Math.sin(frame / 70) * 16;
  const orb = (x: number, y: number, size: number, color: string, phase: number) => {
    const fy = y + Math.sin((frame + phase) / 55) * 32;
    const fx = x + Math.cos((frame + phase) / 65) * 26;
    return <div style={{ position: "absolute", left: fx, top: fy, width: size, height: size, borderRadius: "50%", background: color, filter: "blur(120px)", opacity: 0.5 }} />;
  };
  return (
    <AbsoluteFill style={{ background: `linear-gradient(${165 + drift}deg, ${C.bg0} 0%, ${C.bg1} 55%, ${C.bg2} 100%)` }}>
      {orb(-160, 240, 600, C.blue, 0)}{orb(720, 1280, 540, C.cyan, 120)}{orb(220, 880, 400, C.blue, 240)}
      <AbsoluteFill style={{ background: "radial-gradient(ellipse at center, transparent 45%, rgba(0,0,0,0.5) 100%)" }} />
    </AbsoluteFill>
  );
};
const Logo: React.FC<{ size?: number }> = ({ size = 84 }) => (
  <div style={{ display: "flex", alignItems: "center", gap: size * 0.26 }}>
    <div style={{ width: size, height: size, borderRadius: size * 0.28, background: "#0E2A3D", border: "1.5px solid rgba(60,200,240,0.35)", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <svg width={size * 0.6} height={size * 0.6} viewBox="0 0 24 24" fill="none" stroke="#3CC8F0" strokeWidth={2.6} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M5 15 L12 8 L19 15" />
      </svg>
    </div>
    <span style={{ fontSize: size * 1.05, fontWeight: 800, color: C.text, letterSpacing: 1 }}>ESEP</span>
  </div>
);
const Phone: React.FC<{ children: React.ReactNode; title: string }> = ({ children, title }) => (
  <div style={{ width: 860, background: "#0E1E2C", border: `2px solid ${C.glassBorder}`, borderRadius: 40, padding: 36, boxShadow: "0 30px 90px rgba(0,0,0,0.5)" }}>
    <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 28 }}>
      <div style={{ width: 24, height: 24, borderRadius: "50%", background: C.blue }} />
      <span style={{ fontSize: 42, fontWeight: 800, color: C.text }}>{title}</span>
    </div>
    {children}
  </div>
);

// Кнопка/строка с подсветкой + курсором-пальцем, который наводится и «нажимает».
const Tappable: React.FC<{ children: React.ReactNode; style?: React.CSSProperties; clickDelay?: number; radius?: number }> = ({ children, style, clickDelay = 1.6, radius = 20 }) => {
  const frame = useCurrentFrame(); const { fps } = useVideoConfig();
  const move = spring({ frame: frame - Math.round(0.4 * fps), fps, config: { damping: 18, stiffness: 80 } });
  const cf = frame - Math.round(clickDelay * fps);
  const press = (cf >= 0 && cf < 9) ? Math.sin((cf / 9) * Math.PI) : 0;
  const pulse = 0.4 + 0.6 * Math.abs(Math.sin(frame / 11));
  return (
    <div style={{ position: "relative", transform: `scale(${1 - press * 0.03})`, ...style }}>
      <div style={{ position: "absolute", inset: -8, borderRadius: radius + 8, border: `3px solid ${C.cyan}`, opacity: 0.25 + pulse * 0.55, pointerEvents: "none" }} />
      {children}
      <div style={{ position: "absolute", right: "20%", bottom: -36, fontSize: 92, opacity: move, transform: `translate(${interpolate(move, [0, 1], [150, 0])}px, ${interpolate(move, [0, 1], [180, 0])}px) scale(${1 - press * 0.18})`, pointerEvents: "none" }}>👆</div>
    </div>
  );
};

const PrimaryBtn: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div style={{ background: GRAD, color: "#04222E", fontSize: 46, fontWeight: 800, padding: "30px 40px", borderRadius: 20, textAlign: "center" }}>{children}</div>
);
const OptionRow: React.FC<{ children: React.ReactNode; dim?: boolean }> = ({ children, dim }) => (
  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: C.glass, border: `1.5px solid ${C.glassBorder}`, borderRadius: 18, padding: "26px 30px", fontSize: 42, fontWeight: 700, color: dim ? C.sub : C.text, marginBottom: 16 }}>
    <span>{children}</span><span style={{ color: C.sub }}>›</span>
  </div>
);
const CheckRow: React.FC<{ name: string; value: string; color: string; delay: number }> = ({ name, value, color, delay }) => (
  <FadeInUp delay={delay} distance={20}>
    <div style={{ display: "flex", alignItems: "center", gap: 18, padding: "20px 4px", borderTop: `1.5px solid ${C.glassBorder}` }}>
      <span style={{ width: 40, height: 40, borderRadius: 10, background: C.green, color: "#04222E", fontSize: 30, fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center" }}>✓</span>
      <span style={{ fontSize: 38, fontWeight: 600, color: C.text, flex: 1 }}>{name}</span>
      <span style={{ fontSize: 38, fontWeight: 800, color }}>{value}</span>
    </div>
  </FadeInUp>
);

const TopLabel: React.FC<{ text: string }> = ({ text }) => {
  const p = useEnter(0.1);
  return (
    <div style={{ position: "absolute", top: SAFE.top, left: SAFE.left, right: SAFE.right, textAlign: "center", opacity: p, transform: `translateY(${interpolate(p, [0, 1], [-20, 0])}px)` }}>
      <span style={{ fontSize: 42, fontWeight: 800, color: "#04222E", background: GRAD, padding: "14px 38px", borderRadius: 40 }}>{text}</span>
    </div>
  );
};
const BottomCap: React.FC<{ text: string; delay?: number }> = ({ text, delay = 0.45 }) => {
  const p = useEnter(delay);
  return (
    <div style={{ position: "absolute", bottom: SAFE.bottom, left: SAFE.left, right: SAFE.right, textAlign: "center", fontSize: 48, fontWeight: 700, color: C.text, lineHeight: 1.25, opacity: p, transform: `translateY(${interpolate(p, [0, 1], [30, 0])}px)` }}>{text}</div>
  );
};
const Stage: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <AbsoluteFill style={{ padding: `${SAFE.top}px ${SAFE.right}px ${SAFE.bottom}px ${SAFE.left}px`, alignItems: "center", justifyContent: "center" }}>{children}</AbsoluteFill>
);

const S1Intro: React.FC = () => (
  <Stage>
    <ScalePop delay={0}><Logo size={100} /></ScalePop>
    <div style={{ height: 48 }} />
    <FadeInUp delay={0.5}><div style={{ fontSize: 84, fontWeight: 800, color: C.text, textAlign: "center", lineHeight: 1.12, letterSpacing: -1 }}>Загрузить выписку<br />и сдать отчёт</div></FadeInUp>
    <div style={{ height: 30 }} />
    <FadeInUp delay={1.0}><div style={{ fontSize: 50, fontWeight: 700 }}><Grad>за 5 простых шагов</Grad></div></FadeInUp>
  </Stage>
);

const S2Step1: React.FC = () => (
  <Stage>
    <TopLabel text="Шаг 1" />
    <FadeInUp delay={0.1}>
      <Phone title="Главный экран">
        <div style={{ fontSize: 36, color: C.sub, marginBottom: 26, lineHeight: 1.4 }}>1. Загрузите выписку<br />2. Esep посчитает налог<br />3. Отчёт готов</div>
        <Tappable clickDelay={1.8}><PrimaryBtn>📄 Загрузить выписку</PrimaryBtn></Tappable>
      </Phone>
    </FadeInUp>
    <BottomCap text="На главном экране нажмите «Загрузить выписку»" delay={0.5} />
  </Stage>
);

const S3Step2: React.FC = () => (
  <Stage>
    <TopLabel text="Шаг 2 · Выберите банк" />
    <FadeInUp delay={0.1}>
      <Phone title="Подключить банк">
        <Tappable clickDelay={1.8} radius={18}><OptionRow>Kaspi Business</OptionRow></Tappable>
        <OptionRow dim>Kaspi Gold</OptionRow>
        <OptionRow dim>Halyk Bank</OptionRow>
        <OptionRow dim>Forte Bank</OptionRow>
      </Phone>
    </FadeInUp>
    <BottomCap text="Выберите свой банк — например, Kaspi Business" delay={0.5} />
  </Stage>
);

const S4Step3: React.FC = () => (
  <Stage>
    <TopLabel text="Шаг 3 · Выберите файл" />
    <FadeInUp delay={0.1}>
      <Phone title="Импорт выписки">
        <div style={{ fontSize: 36, color: C.sub, marginBottom: 28, lineHeight: 1.4 }}>Скачайте выписку в банке в формате Excel (.xlsx) или CSV</div>
        <Tappable clickDelay={1.8}><PrimaryBtn>📂 Выбрать файл</PrimaryBtn></Tappable>
        <div style={{ fontSize: 30, color: C.sub, textAlign: "center", marginTop: 18 }}>.xlsx · .csv</div>
      </Phone>
    </FadeInUp>
    <BottomCap text="Нажмите «Выбрать файл» и укажите Excel из банка" delay={0.5} />
  </Stage>
);

const S5Step4: React.FC = () => (
  <Stage>
    <TopLabel text="Шаг 4 · Проверьте и импортируйте" />
    <FadeInUp delay={0.1}>
      <Phone title="Операции">
        <div style={{ display: "flex", gap: 16, marginBottom: 8 }}>
          <span style={{ fontSize: 34, fontWeight: 700, color: C.green, background: "rgba(47,191,113,.14)", padding: "10px 22px", borderRadius: 14 }}>Доходов 2 · 370 000 ₸</span>
          <span style={{ fontSize: 34, fontWeight: 700, color: C.red, background: "rgba(236,91,91,.14)", padding: "10px 22px", borderRadius: 14 }}>Расходов 2 · 95 000 ₸</span>
        </div>
        <CheckRow name="Оплата от ТОО" value="+250 000" color={C.green} delay={0.5} />
        <CheckRow name="Аренда офиса" value="−80 000" color={C.red} delay={0.8} />
        <CheckRow name="Поступление" value="+120 000" color={C.green} delay={1.1} />
        <div style={{ height: 22 }} />
        <Tappable clickDelay={2.2}><PrimaryBtn>Импортировать (4)</PrimaryBtn></Tappable>
      </Phone>
    </FadeInUp>
    <BottomCap text="Операции разнеслись сами. Проверьте и нажмите «Импортировать»" delay={0.6} />
  </Stage>
);

const S6Done: React.FC = () => (
  <Stage>
    <ScalePop delay={0.2}><div style={{ fontSize: 150 }}>✅</div></ScalePop>
    <div style={{ height: 24 }} />
    <FadeInUp delay={0.6}><div style={{ fontSize: 60, fontWeight: 800, color: C.text, textAlign: "center" }}>Готово!</div></FadeInUp>
    <div style={{ height: 26 }} />
    <FadeInUp delay={1.0}>
      <div style={{ fontSize: 52, fontWeight: 700, color: C.sub, textAlign: "center" }}>Налог 910 посчитан сам:</div>
    </FadeInUp>
    <div style={{ fontSize: 120, fontWeight: 800, marginTop: 16 }}><CountUp to={48000} delay={1.3} suffix=" ₸" /></div>
  </Stage>
);

const S7Step5: React.FC = () => (
  <Stage>
    <TopLabel text="Шаг 5 · Форма готова" />
    <FadeInUp delay={0.1}>
      <Phone title="Расчёты → Форма 910">
        <CheckRow name="Доход за период" value="" color={C.text} delay={0.5} />
        <CheckRow name="Налог к уплате" value="" color={C.text} delay={0.8} />
        <CheckRow name="Соцплатежи" value="" color={C.text} delay={1.1} />
        <div style={{ height: 22 }} />
        <Tappable clickDelay={2.0}><PrimaryBtn>Скачать форму 910</PrimaryBtn></Tappable>
      </Phone>
    </FadeInUp>
    <BottomCap text="В разделе «Расчёты» форма 910 уже заполнена — остаётся подписать ЭЦП" delay={0.6} />
  </Stage>
);

const SInvoices: React.FC = () => (
  <Stage>
    <TopLabel text="Счета и акты" />
    <FadeInUp delay={0.1}>
      <Phone title="Счета">
        <OptionRow dim>Счёт № СЧ-2026-001 · 250 000 ₸</OptionRow>
        <OptionRow dim>Акт № АКТ-2026-014 · 90 000 ₸</OptionRow>
        <div style={{ height: 22 }} />
        <Tappable clickDelay={1.8}><PrimaryBtn>+ Новый счёт</PrimaryBtn></Tappable>
      </Phone>
    </FadeInUp>
    <BottomCap text="Раздел «Счета»: выставляйте счета и акты клиентам за минуту" delay={0.5} />
  </Stage>
);

const SEsf: React.FC = () => (
  <Stage>
    <TopLabel text="ЭСФ" />
    <FadeInUp delay={0.1}>
      <Phone title="Счёт № СЧ-2026-001">
        <CheckRow name="Услуги по договору" value="250 000 ₸" color={C.text} delay={0.5} />
        <div style={{ height: 28 }} />
        <div style={{ display: "flex", gap: 16, justifyContent: "center" }}>
          <div style={{ fontSize: 36, fontWeight: 700, color: C.sub, background: C.glass, border: `1.5px solid ${C.glassBorder}`, padding: "20px 26px", borderRadius: 16 }}>Статус</div>
          <Tappable clickDelay={1.9} radius={16}>
            <div style={{ fontSize: 36, fontWeight: 800, color: "#04222E", background: GRAD, padding: "20px 36px", borderRadius: 16 }}>ЭСФ</div>
          </Tappable>
          <div style={{ fontSize: 36, fontWeight: 700, color: C.sub, background: C.glass, border: `1.5px solid ${C.glassBorder}`, padding: "20px 26px", borderRadius: 16 }}>PDF</div>
        </div>
      </Phone>
    </FadeInUp>
    <BottomCap text="Из счёта одной кнопкой — ЭСФ, готовый файл для ИС ЭСФ (подпись ЭЦП на портале)" delay={0.6} />
  </Stage>
);

const FeatureCard: React.FC<{ icon: string; title: string; sub: string; delay: number }> = ({ icon, title, sub, delay }) => (
  <FadeInUp delay={delay} distance={26}>
    <div style={{ background: C.glass, border: `1.5px solid ${C.glassBorder}`, borderRadius: 22, padding: "26px 26px", textAlign: "center" }}>
      <div style={{ fontSize: 56 }}>{icon}</div>
      <div style={{ fontSize: 36, fontWeight: 800, color: C.text, marginTop: 8 }}>{title}</div>
      <div style={{ fontSize: 28, fontWeight: 600, color: C.sub, marginTop: 4 }}>{sub}</div>
    </div>
  </FadeInUp>
);

const SFeatures: React.FC = () => (
  <Stage>
    <FadeInUp delay={0}><div style={{ fontSize: 62, fontWeight: 800, color: C.text, textAlign: "center", marginBottom: 36 }}>Что ещё умеет <Grad>Esep</Grad></div></FadeInUp>
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 22, width: 860 }}>
      <FeatureCard icon="🧮" title="Налоги" sub="910 · самозанятый · ОУР" delay={0.3} />
      <FeatureCard icon="📄" title="Формы" sub="910 · 200 · 300" delay={0.5} />
      <FeatureCard icon="🧾" title="Документы" sub="счета · акты · ЭСФ" delay={0.7} />
      <FeatureCard icon="👥" title="Зарплата" sub="ОПВ · ИПН · СО · ВОСМС" delay={0.9} />
      <FeatureCard icon="📋" title="Клиенты" sub="все на одном экране" delay={1.1} />
      <FeatureCard icon="📅" title="Дедлайны" sub="сроки и напоминания" delay={1.3} />
    </div>
  </Stage>
);

const S8Cta: React.FC = () => {
  const frame = useCurrentFrame();
  const bob = Math.sin(frame / 8) * 14;
  return (
    <Stage>
      <ScalePop delay={0}><Logo size={104} /></ScalePop>
      <div style={{ height: 40 }} />
      <FadeInUp delay={0.45}><div style={{ fontSize: 70, fontWeight: 800, color: "#04222E", background: GRAD, padding: "26px 54px", borderRadius: 28 }}>Попробуйте 7 дней бесплатно</div></FadeInUp>
      <div style={{ height: 28 }} />
      <FadeInUp delay={0.85}><div style={{ fontSize: 46, fontWeight: 600, color: C.sub, textAlign: "center" }}>Регистрация — 1 минута. Карта не нужна.</div></FadeInUp>
      <div style={{ height: 16 }} />
      <FadeInUp delay={1.15}><div style={{ fontSize: 54, fontWeight: 800, color: C.cyan }}>app.esepkz.com</div></FadeInUp>
      <div style={{ height: 26 }} />
      <FadeInUp delay={1.45}><div style={{ fontSize: 76, transform: `translateY(${bob}px)` }}>👇</div></FadeInUp>
    </Stage>
  );
};

export const WALKTHROUGH_FRAMES =
  270 + 660 + 600 + 660 + 720 + 450 + 630 + 540 + 570 + 540 + 510; // 6150 = 205s (~3:25)

export const EsepWalkthrough: React.FC = () => (
  <AbsoluteFill style={{ fontFamily, background: C.bg0 }}>
    <Background />
    <Series>
      <Series.Sequence durationInFrames={270}><S1Intro /></Series.Sequence>
      <Series.Sequence durationInFrames={660}><S2Step1 /></Series.Sequence>
      <Series.Sequence durationInFrames={600}><S3Step2 /></Series.Sequence>
      <Series.Sequence durationInFrames={660}><S4Step3 /></Series.Sequence>
      <Series.Sequence durationInFrames={720}><S5Step4 /></Series.Sequence>
      <Series.Sequence durationInFrames={450}><S6Done /></Series.Sequence>
      <Series.Sequence durationInFrames={630}><S7Step5 /></Series.Sequence>
      <Series.Sequence durationInFrames={540}><SInvoices /></Series.Sequence>
      <Series.Sequence durationInFrames={570}><SEsf /></Series.Sequence>
      <Series.Sequence durationInFrames={540}><SFeatures /></Series.Sequence>
      <Series.Sequence durationInFrames={510}><S8Cta /></Series.Sequence>
    </Series>
  </AbsoluteFill>
);
