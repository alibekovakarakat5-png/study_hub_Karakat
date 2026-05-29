/* StudyHub — B2B pitch decks (RU + KK). Shared design, two content sets. */
const pptxgen = require("pptxgenjs");

// ── Brand palette (topic-informed: edtech + AI + premium) ─────────────────────
const NAVY = "0F1633";      // dark slides
const NAVY2 = "1B254B";
const BLUE = "2563EB";
const VIOLET = "7C3AED";
const CYAN = "22D3EE";
const GREEN = "16A34A";
const AMBER = "D97706";
const INK = "0F172A";       // body text on light
const SUB = "64748B";       // muted
const LIGHT = "F1F5F9";
const CARD = "F8FAFC";
const WHITE = "FFFFFF";
const HF = "Segoe UI Semibold";   // header font (full Kazakh support)
const BF = "Segoe UI";            // body font

const EM = 13.333, EH = 7.5; // wide layout inches

function circleIcon(slide, x, y, d, emoji, fill) {
  slide.addShape("ellipse", { x, y, w: d, h: d, fill: { color: fill }, line: { type: "none" } });
  slide.addText(emoji, { x, y, w: d, h: d, align: "center", valign: "middle", fontSize: d * 26, fontFace: BF });
}

function build(deck) {
  const t = deck.t; // text content
  const pptx = new pptxgen();
  pptx.defineLayout({ name: "W", width: EM, height: EH });
  pptx.layout = "W";
  pptx.author = "StudyHub";
  pptx.company = "StudyHub";

  // ── 1. TITLE (dark) ─────────────────────────────────────────────────────
  let s = pptx.addSlide();
  s.background = { color: NAVY };
  s.addShape("ellipse", { x: 9.6, y: -1.6, w: 5.2, h: 5.2, fill: { color: VIOLET, transparency: 55 }, line: { type: "none" } });
  s.addShape("ellipse", { x: -1.4, y: 4.6, w: 4.6, h: 4.6, fill: { color: BLUE, transparency: 60 }, line: { type: "none" } });
  s.addText([{ text: "Study", options: { color: WHITE } }, { text: "Hub", options: { color: "C7D2FE" } }],
    { x: 0.9, y: 0.7, w: 6, h: 0.7, fontFace: HF, fontSize: 30, bold: true });
  s.addText(t.s1_title, { x: 0.9, y: 2.5, w: 11.5, h: 2.2, fontFace: HF, fontSize: 46, bold: true, color: WHITE, lineSpacingMultiple: 1.02 });
  s.addText(t.s1_sub, { x: 0.9, y: 4.9, w: 11, h: 1, fontFace: BF, fontSize: 20, color: "C7D2FE" });
  s.addText(t.s1_tag, { x: 0.9, y: 6.5, w: 11, h: 0.5, fontFace: BF, fontSize: 13, color: "94A3B8" });

  // ── 2. PROBLEM (light) ──────────────────────────────────────────────────
  s = pptx.addSlide(); s.background = { color: WHITE };
  s.addText(t.s2_kicker, { x: 0.9, y: 0.7, w: 11, h: 0.4, fontFace: BF, fontSize: 14, bold: true, color: BLUE });
  s.addText(t.s2_title, { x: 0.9, y: 1.2, w: 11.4, h: 2.0, fontFace: HF, fontSize: 38, bold: true, color: INK, lineSpacingMultiple: 1.05 });
  const pains = t.s2_pains; // [[icon,text],...]
  pains.forEach((p, i) => {
    const y = 3.7 + i * 1.05;
    circleIcon(s, 0.9, y, 0.74, p[0], i === 0 ? "FEE2E2" : i === 1 ? "FEF3C7" : "E0E7FF");
    s.addText(p[1], { x: 1.85, y, w: 10.4, h: 0.74, fontFace: BF, fontSize: 22, color: INK, valign: "middle" });
  });

  // ── 3. COST OF INACTION (dark) ──────────────────────────────────────────
  s = pptx.addSlide(); s.background = { color: NAVY2 };
  s.addText(t.s3_title, { x: 0.9, y: 0.8, w: 11.4, h: 1.0, fontFace: HF, fontSize: 34, bold: true, color: WHITE });
  const costs = t.s3_costs; // [[stat,label],...]
  costs.forEach((c, i) => {
    const x = 0.9 + i * 4.05;
    s.addShape("roundRect", { x, y: 2.5, w: 3.7, h: 3.4, rectRadius: 0.16, fill: { color: "FFFFFF", transparency: 92 }, line: { color: "FFFFFF", transparency: 80, width: 1 } });
    s.addText(c[0], { x, y: 2.9, w: 3.7, h: 1.3, align: "center", fontFace: HF, fontSize: 52, bold: true, color: CYAN });
    s.addText(c[1], { x: x + 0.25, y: 4.2, w: 3.2, h: 1.5, align: "center", fontFace: BF, fontSize: 16, color: "CBD5E1", valign: "top" });
  });

  // ── 4. THE SHIFT (light) ────────────────────────────────────────────────
  s = pptx.addSlide(); s.background = { color: WHITE };
  s.addText(t.s4_kicker, { x: 0.9, y: 0.9, w: 11, h: 0.4, fontFace: BF, fontSize: 14, bold: true, color: VIOLET });
  s.addText(t.s4_title, { x: 0.9, y: 1.5, w: 11.4, h: 2.4, fontFace: HF, fontSize: 40, bold: true, color: INK, lineSpacingMultiple: 1.06 });
  s.addText(t.s4_body, { x: 0.9, y: 4.6, w: 11.0, h: 1.8, fontFace: BF, fontSize: 19, color: SUB, lineSpacingMultiple: 1.15 });

  // ── 5. SOLUTION — 4 value cards (light) ─────────────────────────────────
  s = pptx.addSlide(); s.background = { color: LIGHT };
  s.addText(t.s5_title, { x: 0.9, y: 0.6, w: 11.4, h: 0.9, fontFace: HF, fontSize: 32, bold: true, color: INK });
  const vals = t.s5_values; // [[icon,head,desc],...] x4
  vals.forEach((v, i) => {
    const col = i % 2, row = Math.floor(i / 2);
    const x = 0.9 + col * 5.95, y = 1.75 + row * 2.55;
    s.addShape("roundRect", { x, y, w: 5.6, h: 2.3, rectRadius: 0.14, fill: { color: WHITE }, line: { color: "E2E8F0", width: 1 }, shadow: { type: "outer", blur: 8, offset: 2, angle: 90, color: "94A3B8", opacity: 0.25 } });
    circleIcon(s, x + 0.35, y + 0.35, 0.78, v[0], i % 2 === 0 ? "DBEAFE" : "EDE9FE");
    s.addText(v[1], { x: x + 1.35, y: y + 0.42, w: 4.0, h: 0.6, fontFace: HF, fontSize: 18, bold: true, color: INK });
    s.addText(v[2], { x: x + 1.35, y: y + 1.0, w: 4.05, h: 1.1, fontFace: BF, fontSize: 13.5, color: SUB, lineSpacingMultiple: 1.08 });
  });

  // ── 6. HOW IT WORKS — 4-step flow (light) ───────────────────────────────
  s = pptx.addSlide(); s.background = { color: WHITE };
  s.addText(t.s6_title, { x: 0.9, y: 0.7, w: 11.4, h: 0.9, fontFace: HF, fontSize: 32, bold: true, color: INK });
  const steps = t.s6_steps; // [[icon,label],...] x4
  steps.forEach((st, i) => {
    const x = 0.9 + i * 3.05;
    s.addShape("roundRect", { x, y: 2.4, w: 2.7, h: 3.0, rectRadius: 0.14, fill: { color: CARD }, line: { color: "E2E8F0", width: 1 } });
    s.addShape("ellipse", { x: x + 0.95, y: 2.0, w: 0.8, h: 0.8, fill: { color: i % 2 ? VIOLET : BLUE }, line: { type: "none" } });
    s.addText(`${i + 1}`, { x: x + 0.95, y: 2.0, w: 0.8, h: 0.8, align: "center", valign: "middle", fontFace: HF, fontSize: 22, bold: true, color: WHITE });
    s.addText(st[0], { x, y: 3.1, w: 2.7, h: 0.9, align: "center", fontFace: BF, fontSize: 40 });
    s.addText(st[1], { x: x + 0.15, y: 4.0, w: 2.4, h: 1.3, align: "center", fontFace: BF, fontSize: 14, color: INK, valign: "top", lineSpacingMultiple: 1.05 });
    if (i < 3) s.addText("→", { x: x + 2.62, y: 3.4, w: 0.5, h: 0.6, align: "center", fontFace: HF, fontSize: 24, color: SUB });
  });

  // ── 7. LANGUAGES + COVERAGE (dark) ──────────────────────────────────────
  s = pptx.addSlide(); s.background = { color: NAVY };
  s.addShape("ellipse", { x: 10.0, y: 4.4, w: 4.4, h: 4.4, fill: { color: BLUE, transparency: 62 }, line: { type: "none" } });
  s.addText(t.s7_title, { x: 0.9, y: 0.9, w: 11.4, h: 1.4, fontFace: HF, fontSize: 34, bold: true, color: WHITE, lineSpacingMultiple: 1.04 });
  const covs = t.s7_items;
  covs.forEach((c, i) => {
    const y = 2.9 + i * 1.0;
    circleIcon(s, 0.9, y, 0.66, c[0], "FFFFFF");
    s.addText(c[1], { x: 1.75, y, w: 10.2, h: 0.66, fontFace: BF, fontSize: 20, color: "E2E8F0", valign: "middle" });
  });

  // ── 8. PROOF (light) ────────────────────────────────────────────────────
  s = pptx.addSlide(); s.background = { color: LIGHT };
  s.addText(t.s8_title, { x: 0.9, y: 0.6, w: 11.4, h: 0.9, fontFace: HF, fontSize: 32, bold: true, color: INK });
  const proofs = t.s8_stats; // [[num,label],...] x3
  proofs.forEach((p, i) => {
    const x = 0.9 + i * 3.95;
    s.addShape("roundRect", { x, y: 1.9, w: 3.6, h: 2.2, rectRadius: 0.14, fill: { color: WHITE }, line: { color: "E2E8F0", width: 1 } });
    s.addText(p[0], { x, y: 2.15, w: 3.6, h: 1.1, align: "center", fontFace: HF, fontSize: 46, bold: true, color: BLUE });
    s.addText(p[1], { x: x + 0.2, y: 3.2, w: 3.2, h: 0.8, align: "center", fontFace: BF, fontSize: 14, color: SUB });
  });
  s.addText(t.s8_note, { x: 0.9, y: 4.6, w: 11.2, h: 1.6, fontFace: BF, fontSize: 16, italic: true, color: INK, lineSpacingMultiple: 1.15 });

  // ── 9. ROLLOUT (light) ──────────────────────────────────────────────────
  s = pptx.addSlide(); s.background = { color: WHITE };
  s.addText(t.s9_title, { x: 0.9, y: 0.7, w: 11.4, h: 0.9, fontFace: HF, fontSize: 32, bold: true, color: INK });
  t.s9_steps.forEach((st, i) => {
    const y = 2.0 + i * 1.15;
    s.addShape("ellipse", { x: 0.9, y, w: 0.7, h: 0.7, fill: { color: GREEN }, line: { type: "none" } });
    s.addText("✓", { x: 0.9, y, w: 0.7, h: 0.7, align: "center", valign: "middle", fontFace: HF, fontSize: 22, bold: true, color: WHITE });
    s.addText(st, { x: 1.8, y, w: 10.5, h: 0.7, fontFace: BF, fontSize: 19, color: INK, valign: "middle" });
  });

  // ── 10. PRICING / OFFER (light) ─────────────────────────────────────────
  s = pptx.addSlide(); s.background = { color: LIGHT };
  s.addText(t.s10_title, { x: 0.9, y: 0.6, w: 11.4, h: 0.9, fontFace: HF, fontSize: 32, bold: true, color: INK });
  // pilot highlight card
  s.addShape("roundRect", { x: 0.9, y: 1.8, w: 11.5, h: 2.0, rectRadius: 0.16, fill: { color: "ECFDF5" }, line: { color: GREEN, width: 1.5 } });
  s.addText(t.s10_pilot_h, { x: 1.3, y: 2.05, w: 10.8, h: 0.7, fontFace: HF, fontSize: 22, bold: true, color: GREEN });
  s.addText(t.s10_pilot_d, { x: 1.3, y: 2.75, w: 10.8, h: 0.95, fontFace: BF, fontSize: 16, color: INK, lineSpacingMultiple: 1.1 });
  s.addText(t.s10_tiers, { x: 0.9, y: 4.1, w: 11.5, h: 2.2, fontFace: BF, fontSize: 16, color: INK, lineSpacingMultiple: 1.3, bullet: { characterCode: "2022", indent: 18 } });

  // ── 11. CTA (dark) ──────────────────────────────────────────────────────
  s = pptx.addSlide(); s.background = { color: NAVY };
  s.addShape("ellipse", { x: 8.8, y: 3.6, w: 6, h: 6, fill: { color: VIOLET, transparency: 55 }, line: { type: "none" } });
  s.addText(t.s11_title, { x: 0.9, y: 2.0, w: 11.5, h: 1.8, fontFace: HF, fontSize: 44, bold: true, color: WHITE, lineSpacingMultiple: 1.03 });
  s.addShape("roundRect", { x: 0.9, y: 4.2, w: 5.0, h: 0.95, rectRadius: 0.5, fill: { color: BLUE }, line: { type: "none" } });
  s.addText(t.s11_cta, { x: 0.9, y: 4.2, w: 5.0, h: 0.95, align: "center", valign: "middle", fontFace: HF, fontSize: 20, bold: true, color: WHITE });
  s.addText(t.s11_contact, { x: 0.9, y: 5.6, w: 11, h: 0.6, fontFace: BF, fontSize: 16, color: "C7D2FE" });

  return pptx.writeFile({ fileName: deck.file });
}

// ══════════════════════════════════════════════════════════════════════════════
// CONTENT — RU
// ══════════════════════════════════════════════════════════════════════════════
const RU = {
  s1_title: "AI для учебных центров:\nвыше баллы ЕНТ, меньше нагрузка",
  s1_sub: "Платформа подготовки к ЕНТ и IELTS под брендом вашего центра",
  s1_tag: "Питч для учебных центров • Казахстан • 2026",
  s2_kicker: "ПРОБЛЕМА",
  s2_title: "Родители платят за результат.\nА вы узнаёте, что ученик отстаёт — когда уже поздно.",
  s2_pains: [["💸", "Репетиторы и материалы — дорого, а качество разное"], ["😵", "Учителя тратят часы на подготовку и выгорают"], ["🤷", "Нет ранней картины: кто отстаёт и по какой теме"]],
  s3_title: "Во что обходится бездействие",
  s3_costs: [["−25%", "удержание: ученики уходят, не увидев прогресса"], ["10+ ч", "в неделю учитель тратит на ручную подготовку"], ["=", "«как все»: нечем отличиться от соседнего центра"]],
  s4_kicker: "СДВИГ",
  s4_title: "AI впервые даёт персонализацию подготовки в масштабе центра",
  s4_body: "То, что раньше требовало армии репетиторов, теперь делает искусственный интеллект: уроки, тесты и рекомендации под каждого ученика — за минуты, а не часы.",
  s5_title: "Что получает ваш центр",
  s5_values: [
    ["✨", "AI-уроки за 2 минуты", "Учитель описывает тему — AI пишет полный урок с теорией, формулами и тестом. Контент не кончается."],
    ["📊", "Видно, кто отстаёт", "Аналитика по каждому ученику и классу: слабые темы, баллы, риск — за недели до экзамена."],
    ["👨‍👩‍👧", "Отчёты родителям", "Прозрачный прогресс ребёнка автоматически — выше доверие и удержание."],
    ["🏷️", "White-label", "Платформа под брендом и цветами вашего центра — выглядите технологично."],
  ],
  s6_title: "Как это работает",
  s6_steps: [["✨", "Учитель генерит урок за 2 мин"], ["📖", "Ученик читает теорию и решает"], ["✅", "Авто-оценка квиза"], ["📈", "Директор видит аналитику"]],
  s7_title: "Полный охват рынка Казахстана",
  s7_items: [["🇰🇿", "Русский + Казахский — 60%+ сдают ЕНТ на казахском"], ["📚", "Все предметы ЕНТ + профильные пары"], ["📝", "Пробные ЕНТ в реальном формате (120 вопросов, таймер)"], ["🤖", "AI-репетитор Skylla — отвечает ученикам 24/7"]],
  s8_title: "Доказательство",
  s8_stats: [["31+", "готовых AI-уроков в библиотеке"], ["120", "вопросов в пробном ЕНТ"], ["4", "роли в одной системе"]],
  s8_note: "Живой дашборд центра: реальная аналитика по учителям и ученикам, кто отстаёт — подсвечено. Уроки с формулами (KaTeX), авто-проверка тестов. Всё работает — покажем вживую на демо.",
  s9_title: "Запуск за 1 день",
  s9_steps: ["Создаёте центр и приглашаете учителей по коду", "Учителя заводят классы, ученики входят по коду", "Готовая библиотека уроков и пробных ЕНТ — сразу", "Директор видит аналитику центра с первого дня"],
  s10_title: "Условия и старт",
  s10_pilot_h: "🎁 Бесплатный пилот на 1 группу",
  s10_pilot_d: "Запускаем на одной группе, замеряем рост баллов пробного ЕНТ за месяц. Платите — только если видите результат.",
  s10_tiers: "После пилота: оплата за ученика в месяц (per-seat) или пакет на центр\nWhite-label, аналитика, безлимит AI-уроков — во всех тарифах\nОплата через Kaspi • счёт-фактура по БИН",
  s11_title: "Запустим пилот\nна этой неделе",
  s11_cta: "Договориться о демо →",
  s11_contact: "WhatsApp +7 707 588 4651 • study-hub-karakat.vercel.app",
};

// ══════════════════════════════════════════════════════════════════════════════
// CONTENT — KK (Kazakh)
// ══════════════════════════════════════════════════════════════════════════════
const KK = {
  s1_title: "Оқу орталықтарына AI:\nЖОО баллы жоғары, мұғалімге жүк аз",
  s1_sub: "Сіздің орталық брендімен ЕНТ және IELTS-ке дайындық платформасы",
  s1_tag: "Оқу орталықтарына арналған питч • Қазақстан • 2026",
  s2_kicker: "МӘСЕЛЕ",
  s2_title: "Ата-аналар нәтиже үшін төлейді.\nАл оқушының артта қалғанын — кеш білесіз.",
  s2_pains: [["💸", "Репетитор мен материал — қымбат, сапасы әртүрлі"], ["😵", "Мұғалімдер дайындыққа сағаттап уақыт жұмсап, шаршайды"], ["🤷", "Ерте көрініс жоқ: кім, қай тақырыптан артта қалды"]],
  s3_title: "Әрекетсіздік неге шығын",
  s3_costs: [["−25%", "ұстау: оқушылар прогресс көрмей кетіп қалады"], ["10+ сағ", "аптасына мұғалім қолмен дайындыққа жұмсайды"], ["=", "«бәрі сияқты»: көрші орталықтан айырмашылық жоқ"]],
  s4_kicker: "ӨЗГЕРІС",
  s4_title: "AI алғаш рет дайындықты орталық ауқымында дербестендіреді",
  s4_body: "Бұрын репетиторлар әскерін қажет еткен нәрсені енді жасанды интеллект жасайды: әр оқушыға арналған сабақтар, тесттер және ұсыныстар — сағаттап емес, минут ішінде.",
  s5_title: "Орталығыңыз не алады",
  s5_values: [
    ["✨", "2 минутта AI-сабақ", "Мұғалім тақырыпты жазады — AI теориясы, формуласы және тесті бар толық сабақ дайындайды. Контент таусылмайды."],
    ["📊", "Кім артта — көрінеді", "Әр оқушы мен сынып бойынша аналитика: әлсіз тақырыптар, баллдар, тәуекел — емтиханнан апта бұрын."],
    ["👨‍👩‍👧", "Ата-анаға есеп", "Баланың прогресі автоматты түрде ашық — сенім мен ұстау жоғары."],
    ["🏷️", "White-label", "Орталығыңыздың бренді мен түсіндегі платформа — технологиялық көрінесіз."],
  ],
  s6_title: "Бұл қалай жұмыс істейді",
  s6_steps: [["✨", "Мұғалім 2 мин-та сабақ жасайды"], ["📖", "Оқушы теорияны оқып, шешеді"], ["✅", "Тесттің авто-бағасы"], ["📈", "Директор аналитиканы көреді"]],
  s7_title: "Қазақстан нарығын толық қамту",
  s7_items: [["🇰🇿", "Орысша + Қазақша — 60%+ ЕНТ-ны қазақша тапсырады"], ["📚", "Барлық ЕНТ пәндері + бейіндік жұптар"], ["📝", "Нақты форматтағы сынақ ЕНТ (120 сұрақ, таймер)"], ["🤖", "Skylla AI-репетиторы — оқушыларға 24/7 жауап береді"]],
  s8_title: "Дәлел",
  s8_stats: [["31+", "дайын AI-сабақ кітапханада"], ["120", "сұрақ сынақ ЕНТ-да"], ["4", "рөл бір жүйеде"]],
  s8_note: "Орталықтың тірі дашборды: мұғалімдер мен оқушылар бойынша нақты аналитика, кім артта — белгіленген. Формулалы сабақтар (KaTeX), тесттің авто-тексеруі. Бәрі жұмыс істейді — демо-да тікелей көрсетеміз.",
  s9_title: "1 күнде іске қосу",
  s9_steps: ["Орталық құрып, мұғалімдерді код арқылы шақырасыз", "Мұғалімдер сынып ашады, оқушылар код арқылы кіреді", "Дайын сабақтар мен сынақ ЕНТ кітапханасы — бірден", "Директор бірінші күннен аналитиканы көреді"],
  s10_title: "Шарттар мен бастау",
  s10_pilot_h: "🎁 1 топқа тегін пилот",
  s10_pilot_d: "Бір топта іске қосып, ай ішінде сынақ ЕНТ балл өсімін өлшейміз. Нәтиже көрсеңіз — сонда ғана төлейсіз.",
  s10_tiers: "Пилоттан кейін: айына оқушы үшін төлем (per-seat) немесе орталыққа пакет\nWhite-label, аналитика, шексіз AI-сабақтар — барлық тарифте\nKaspi арқылы төлем • БСН бойынша шот-фактура",
  s11_title: "Осы аптада\nпилот іске қосамыз",
  s11_cta: "Демоға келісу →",
  s11_contact: "WhatsApp +7 707 588 4651 • study-hub-karakat.vercel.app",
};

(async () => {
  await build({ file: "StudyHub-Pitch-RU.pptx", t: RU });
  await build({ file: "StudyHub-Pitch-KK.pptx", t: KK });
  console.log("OK: StudyHub-Pitch-RU.pptx + StudyHub-Pitch-KK.pptx");
})();
