/* StudyHub — B2B pitch decks (RU + KK). Editorial / executive design. */
const pptxgen = require("pptxgenjs");

// ── Palette: Midnight navy + ivory + brass (stately, premium) ─────────────────
const NAVY = "12203B";      // deep midnight (dark slides)
const NAVY_SOFT = "1B2D4F";
const IVORY = "F6F3EC";     // warm off-white (light slides)
const IVORY_CARD = "FBFAF5";
const BRASS = "C2A05A";     // refined gold accent
const BRASS_SOFT = "D8C390";
const INK = "1A2233";       // primary text on light
const SLATE = "566073";     // muted text
const LINE = "D9D3C6";      // hairline on ivory
const LINE_D = "33415F";    // hairline on navy
const WHITE = "FFFFFF";
const HF = "Cambria";       // serif display (gravitas, Kazakh-safe)
const BF = "Calibri";       // clean body (Kazakh-safe)

const EM = 13.333, EH = 7.5;
const ML = 1.0; // left margin

function num(slide, x, y, n, color, size = 40) {
  slide.addText(n, { x, y, w: 1.4, h: size / 50, fontFace: HF, fontSize: size, bold: true, color, italic: true });
}
function marker(slide, x, y, color = BRASS) {
  slide.addShape("diamond", { x, y, w: 0.16, h: 0.16, fill: { color }, line: { type: "none" } });
}
function kicker(slide, text, x, y, color = BRASS) {
  slide.addText(text.toUpperCase(), { x, y, w: 9, h: 0.35, fontFace: BF, fontSize: 12, bold: true, color, charSpacing: 3 });
}

function build(deck) {
  const t = deck.t;
  const pptx = new pptxgen();
  pptx.defineLayout({ name: "W", width: EM, height: EH });
  pptx.layout = "W";
  pptx.author = "StudyHub"; pptx.company = "StudyHub";

  // ── 1. TITLE (navy, editorial) ──────────────────────────────────────────
  let s = pptx.addSlide(); s.background = { color: NAVY };
  s.addText([{ text: "STUDY", options: { color: WHITE } }, { text: "HUB", options: { color: BRASS } }],
    { x: ML, y: 0.75, w: 6, h: 0.6, fontFace: BF, fontSize: 20, bold: true, charSpacing: 4 });
  s.addShape("line", { x: ML, y: 2.55, w: 1.4, h: 0, line: { color: BRASS, width: 2.5 } });
  s.addText(t.s1_title, { x: ML, y: 2.7, w: 11.2, h: 2.4, fontFace: HF, fontSize: 44, bold: true, color: WHITE, lineSpacingMultiple: 1.05 });
  s.addText(t.s1_sub, { x: ML, y: 5.25, w: 10.6, h: 0.9, fontFace: BF, fontSize: 18, color: "C9D2E3", lineSpacingMultiple: 1.1 });
  s.addText(t.s1_tag, { x: ML, y: 6.7, w: 11, h: 0.4, fontFace: BF, fontSize: 11.5, color: "8794AD", charSpacing: 2 });

  // ── 2. PROBLEM (ivory, editorial list) ──────────────────────────────────
  s = pptx.addSlide(); s.background = { color: IVORY };
  kicker(s, t.s2_kicker, ML, 0.8);
  s.addText(t.s2_title, { x: ML, y: 1.25, w: 11.3, h: 1.9, fontFace: HF, fontSize: 33, bold: true, color: INK, lineSpacingMultiple: 1.08 });
  t.s2_pains.forEach((p, i) => {
    const y = 3.85 + i * 1.0;
    num(s, ML, y - 0.05, `0${i + 1}`, BRASS, 30);
    s.addShape("line", { x: ML + 0.92, y: y + 0.05, w: 0, h: 0.55, line: { color: LINE, width: 1 } });
    s.addText(p, { x: ML + 1.2, y: y - 0.05, w: 10.2, h: 0.7, fontFace: BF, fontSize: 19, color: INK, valign: "middle" });
  });

  // ── 3. COST OF INACTION (navy, big numerals) ────────────────────────────
  s = pptx.addSlide(); s.background = { color: NAVY_SOFT };
  kicker(s, t.s3_kicker, ML, 0.8, BRASS_SOFT);
  s.addText(t.s3_title, { x: ML, y: 1.2, w: 11.3, h: 0.9, fontFace: HF, fontSize: 30, bold: true, color: WHITE });
  t.s3_costs.forEach((c, i) => {
    const x = ML + i * 3.95;
    s.addText(c[0], { x, y: 2.7, w: 3.7, h: 1.3, fontFace: HF, fontSize: 60, bold: true, color: BRASS });
    s.addShape("line", { x: x + 0.05, y: 4.1, w: 2.6, h: 0, line: { color: LINE_D, width: 1 } });
    s.addText(c[1], { x: x + 0.05, y: 4.25, w: 3.4, h: 1.8, fontFace: BF, fontSize: 16, color: "C9D2E3", lineSpacingMultiple: 1.15, valign: "top" });
  });

  // ── 4. THE SHIFT (ivory, statement) ─────────────────────────────────────
  s = pptx.addSlide(); s.background = { color: IVORY };
  kicker(s, t.s4_kicker, ML, 1.0);
  s.addShape("line", { x: ML, y: 1.5, w: 1.4, h: 0, line: { color: BRASS, width: 2.5 } });
  s.addText(t.s4_title, { x: ML, y: 1.7, w: 11.3, h: 2.6, fontFace: HF, fontSize: 38, bold: true, color: INK, lineSpacingMultiple: 1.08 });
  s.addText(t.s4_body, { x: ML, y: 4.7, w: 10.8, h: 1.8, fontFace: BF, fontSize: 18, italic: true, color: SLATE, lineSpacingMultiple: 1.2 });

  // ── 5. SOLUTION — 4 numbered value rows (ivory) ─────────────────────────
  s = pptx.addSlide(); s.background = { color: IVORY };
  kicker(s, t.s5_kicker, ML, 0.7);
  s.addText(t.s5_title, { x: ML, y: 1.1, w: 11.3, h: 0.85, fontFace: HF, fontSize: 31, bold: true, color: INK });
  t.s5_values.forEach((v, i) => {
    const col = i % 2, row = Math.floor(i / 2);
    const x = ML + col * 5.85, y = 2.35 + row * 2.35;
    s.addText(`0${i + 1}`, { x, y, w: 1.2, h: 0.9, fontFace: HF, fontSize: 36, bold: true, italic: true, color: BRASS });
    s.addText(v[0], { x: x + 1.15, y: y + 0.05, w: 4.5, h: 0.55, fontFace: HF, fontSize: 19, bold: true, color: INK });
    s.addText(v[1], { x: x + 1.15, y: y + 0.62, w: 4.55, h: 1.5, fontFace: BF, fontSize: 13.5, color: SLATE, lineSpacingMultiple: 1.1 });
  });

  // ── 6. HOW IT WORKS — 4-step editorial flow (ivory) ─────────────────────
  s = pptx.addSlide(); s.background = { color: IVORY };
  kicker(s, t.s6_kicker, ML, 0.7);
  s.addText(t.s6_title, { x: ML, y: 1.1, w: 11.3, h: 0.85, fontFace: HF, fontSize: 31, bold: true, color: INK });
  t.s6_steps.forEach((st, i) => {
    const x = ML + i * 2.95;
    s.addText(`${i + 1}`, { x, y: 2.6, w: 1.0, h: 1.0, fontFace: HF, fontSize: 50, bold: true, italic: true, color: BRASS });
    s.addShape("line", { x, y: 3.75, w: 2.3, h: 0, line: { color: LINE, width: 1 } });
    s.addText(st, { x, y: 3.95, w: 2.55, h: 1.7, fontFace: BF, fontSize: 15, color: INK, lineSpacingMultiple: 1.1, valign: "top" });
    if (i < 3) s.addText("→", { x: x + 2.45, y: 2.75, w: 0.5, h: 0.7, fontFace: BF, fontSize: 22, color: SLATE });
  });

  // ── 7. LANGUAGES + COVERAGE (navy, markers) ─────────────────────────────
  s = pptx.addSlide(); s.background = { color: NAVY };
  kicker(s, t.s7_kicker, ML, 0.85, BRASS_SOFT);
  s.addText(t.s7_title, { x: ML, y: 1.25, w: 11.3, h: 1.5, fontFace: HF, fontSize: 32, bold: true, color: WHITE, lineSpacingMultiple: 1.06 });
  t.s7_items.forEach((c, i) => {
    const y = 3.25 + i * 0.92;
    marker(s, ML + 0.05, y + 0.22, BRASS);
    s.addText(c, { x: ML + 0.55, y, w: 11, h: 0.6, fontFace: BF, fontSize: 18.5, color: "DCE3F0", valign: "middle" });
  });

  // ── 8. PROOF (ivory, big numerals + statement) ──────────────────────────
  s = pptx.addSlide(); s.background = { color: IVORY };
  kicker(s, t.s8_kicker, ML, 0.7);
  s.addText(t.s8_title, { x: ML, y: 1.1, w: 11.3, h: 0.85, fontFace: HF, fontSize: 31, bold: true, color: INK });
  t.s8_stats.forEach((p, i) => {
    const x = ML + i * 3.85;
    s.addText(p[0], { x, y: 2.2, w: 3.6, h: 1.2, fontFace: HF, fontSize: 56, bold: true, color: BRASS });
    s.addShape("line", { x: x + 0.05, y: 3.5, w: 2.4, h: 0, line: { color: LINE, width: 1 } });
    s.addText(p[1], { x: x + 0.05, y: 3.62, w: 3.3, h: 1.0, fontFace: BF, fontSize: 14, color: SLATE, lineSpacingMultiple: 1.1 });
  });
  s.addText(t.s8_note, { x: ML, y: 5.0, w: 11.2, h: 1.6, fontFace: BF, fontSize: 16, italic: true, color: INK, lineSpacingMultiple: 1.2 });

  // ── 9. ROLLOUT (navy, numbered) ─────────────────────────────────────────
  s = pptx.addSlide(); s.background = { color: NAVY_SOFT };
  kicker(s, t.s9_kicker, ML, 0.75, BRASS_SOFT);
  s.addText(t.s9_title, { x: ML, y: 1.15, w: 11.3, h: 0.85, fontFace: HF, fontSize: 31, bold: true, color: WHITE });
  t.s9_steps.forEach((st, i) => {
    const y = 2.45 + i * 1.05;
    num(s, ML, y - 0.05, `0${i + 1}`, BRASS, 26);
    s.addShape("line", { x: ML + 0.82, y: y + 0.02, w: 0, h: 0.5, line: { color: LINE_D, width: 1 } });
    s.addText(st, { x: ML + 1.1, y: y - 0.05, w: 10.4, h: 0.65, fontFace: BF, fontSize: 18, color: "DCE3F0", valign: "middle" });
  });

  // ── 10. OFFER (ivory, refined pilot block) ──────────────────────────────
  s = pptx.addSlide(); s.background = { color: IVORY };
  kicker(s, t.s10_kicker, ML, 0.7);
  s.addText(t.s10_title, { x: ML, y: 1.1, w: 11.3, h: 0.85, fontFace: HF, fontSize: 31, bold: true, color: INK });
  s.addShape("rect", { x: ML, y: 2.1, w: 11.3, h: 1.95, fill: { color: IVORY_CARD }, line: { color: BRASS, width: 1.25 } });
  s.addShape("rect", { x: ML, y: 2.1, w: 0.12, h: 1.95, fill: { color: BRASS }, line: { type: "none" } });
  s.addText(t.s10_pilot_h, { x: ML + 0.45, y: 2.35, w: 10.6, h: 0.6, fontFace: HF, fontSize: 22, bold: true, color: INK });
  s.addText(t.s10_pilot_d, { x: ML + 0.45, y: 3.0, w: 10.6, h: 0.95, fontFace: BF, fontSize: 16, color: SLATE, lineSpacingMultiple: 1.12 });
  t.s10_tiers.forEach((tier, i) => {
    const y = 4.45 + i * 0.62;
    marker(s, ML + 0.05, y + 0.12, BRASS);
    s.addText(tier, { x: ML + 0.5, y, w: 10.9, h: 0.55, fontFace: BF, fontSize: 15.5, color: INK, valign: "middle" });
  });

  // ── 11. CTA (navy) ──────────────────────────────────────────────────────
  s = pptx.addSlide(); s.background = { color: NAVY };
  s.addShape("line", { x: ML, y: 2.4, w: 1.4, h: 0, line: { color: BRASS, width: 2.5 } });
  s.addText(t.s11_title, { x: ML, y: 2.55, w: 11.4, h: 1.9, fontFace: HF, fontSize: 44, bold: true, color: WHITE, lineSpacingMultiple: 1.04 });
  s.addShape("rect", { x: ML, y: 4.75, w: 4.7, h: 0.9, fill: { color: BRASS }, line: { type: "none" } });
  s.addText(t.s11_cta, { x: ML, y: 4.75, w: 4.7, h: 0.9, align: "center", valign: "middle", fontFace: BF, fontSize: 18, bold: true, color: NAVY });
  s.addText(t.s11_contact, { x: ML, y: 6.1, w: 11, h: 0.5, fontFace: BF, fontSize: 15, color: "C9D2E3", charSpacing: 1 });

  return pptx.writeFile({ fileName: deck.file });
}

// ══════════════════════════════════════════════════════════════════════════════
// CONTENT — RU  (no emoji; refined copy)
// ══════════════════════════════════════════════════════════════════════════════
const RU = {
  s1_title: "Искусственный интеллект\nдля учебных центров",
  s1_sub: "Подготовка к ЕНТ и IELTS под брендом вашего центра.\nВыше результаты учеников — ниже нагрузка на преподавателей.",
  s1_tag: "ПРЕЗЕНТАЦИЯ ДЛЯ УЧЕБНЫХ ЦЕНТРОВ · КАЗАХСТАН · 2026",
  s2_kicker: "Проблема",
  s2_title: "Родители платят за результат —\nа отставание ученика становится заметным слишком поздно.",
  s2_pains: [
    "Преподаватели тратят часы на ручную подготовку материалов и выгорают",
    "Нет ранней картины: кто отстаёт и по какой именно теме",
    "Сложно отстроиться от конкурирующего центра по соседству",
  ],
  s3_kicker: "Цена бездействия",
  s3_title: "Что теряет центр, оставляя всё как есть",
  s3_costs: [
    ["−25%", "удержание: ученики уходят, не увидев прогресса"],
    ["10 ч", "в неделю преподаватель тратит на ручную подготовку"],
    ["0", "отличий от соседнего центра в глазах родителя"],
  ],
  s4_kicker: "Сдвиг",
  s4_title: "Впервые персонализация подготовки доступна в масштабе всего центра",
  s4_body: "То, что прежде требовало штата репетиторов, теперь выполняет искусственный интеллект: уроки, тесты и рекомендации под каждого ученика формируются за минуты.",
  s5_kicker: "Решение",
  s5_title: "Что получает ваш центр",
  s5_values: [
    ["Уроки за две минуты", "Преподаватель задаёт тему — система формирует полный урок с теорией, формулами и проверочным тестом."],
    ["Видимость отставания", "Аналитика по каждому ученику и классу: слабые темы и риски — заблаговременно, а не после экзамена."],
    ["Доверие родителей", "Прозрачные отчёты о прогрессе ребёнка формируются автоматически и повышают удержание."],
    ["Ваш бренд", "Платформа в фирменном стиле центра — современный, технологичный образ."],
  ],
  s6_kicker: "Как это работает",
  s6_title: "Четыре шага — от темы до результата",
  s6_steps: [
    "Преподаватель формирует урок за две минуты",
    "Ученик изучает теорию и проходит тест",
    "Система оценивает результат автоматически",
    "Директор видит аналитику в реальном времени",
  ],
  s7_kicker: "Охват",
  s7_title: "Полное покрытие рынка Казахстана",
  s7_items: [
    "Русский и казахский язык — более 60% учеников сдают ЕНТ на казахском",
    "Все предметы ЕНТ и профильные пары",
    "Пробные экзамены в реальном формате: 120 вопросов, таймер",
    "ИИ-наставник Skylla отвечает ученикам круглосуточно",
  ],
  s8_kicker: "Доказательство",
  s8_title: "Это работает уже сегодня",
  s8_stats: [["31+", "готовых уроков в библиотеке"], ["120", "вопросов в пробном ЕНТ"], ["4", "роли в единой системе"]],
  s8_note: "Живая аналитика центра по преподавателям и ученикам, автоматическая проверка тестов, уроки с математической вёрсткой формул — всё это мы покажем вживую на демонстрации.",
  s9_kicker: "Внедрение",
  s9_title: "Запуск за один день",
  s9_steps: [
    "Создаёте центр и приглашаете преподавателей по коду",
    "Преподаватели формируют классы, ученики входят по коду",
    "Готовая библиотека уроков и пробных экзаменов — сразу",
    "Директор видит аналитику центра с первого дня",
  ],
  s10_kicker: "Условия",
  s10_title: "Начало сотрудничества",
  s10_pilot_h: "Бесплатный пилот на одну группу",
  s10_pilot_d: "Запускаем на одной группе и в течение месяца замеряем рост баллов пробного ЕНТ. Оплата — только при подтверждённом результате.",
  s10_tiers: [
    "После пилота — оплата за ученика в месяц или пакет на центр",
    "White-label, аналитика и безлимитная генерация уроков во всех тарифах",
    "Оплата через Kaspi · счёт-фактура по БИН",
  ],
  s11_title: "Запустим пилот\nна этой неделе",
  s11_cta: "Назначить демонстрацию",
  s11_contact: "WhatsApp +7 707 588 4651   ·   study-hub-karakat.vercel.app",
};

// ══════════════════════════════════════════════════════════════════════════════
// CONTENT — KK (Kazakh; no emoji)
// ══════════════════════════════════════════════════════════════════════════════
const KK = {
  s1_title: "Оқу орталықтарына\nарналған жасанды интеллект",
  s1_sub: "Сіздің орталық брендімен ЕНТ және IELTS-ке дайындық.\nОқушы нәтижесі жоғары — мұғалімге жүк аз.",
  s1_tag: "ОҚУ ОРТАЛЫҚТАРЫНА АРНАЛҒАН ПРЕЗЕНТАЦИЯ · ҚАЗАҚСТАН · 2026",
  s2_kicker: "Мәселе",
  s2_title: "Ата-аналар нәтиже үшін төлейді —\nал оқушының артта қалуы тым кеш байқалады.",
  s2_pains: [
    "Мұғалімдер материал дайындауға сағаттап уақыт жұмсап, шаршайды",
    "Ерте көрініс жоқ: кім және қай тақырыптан артта қалды",
    "Көрші бәсекелес орталықтан ерекшелену қиын",
  ],
  s3_kicker: "Әрекетсіздік құны",
  s3_title: "Бәрін сол күйінде қалдырса, орталық не жоғалтады",
  s3_costs: [
    ["−25%", "ұстау: оқушылар прогресс көрмей кетіп қалады"],
    ["10 сағ", "аптасына мұғалім қолмен дайындыққа жұмсайды"],
    ["0", "ата-ана көзінде көрші орталықтан айырмашылық"],
  ],
  s4_kicker: "Өзгеріс",
  s4_title: "Алғаш рет дайындықты дербестендіру бүкіл орталық ауқымында қолжетімді",
  s4_body: "Бұрын репетиторлар штатын қажет еткен нәрсені енді жасанды интеллект атқарады: әр оқушыға сабақ, тест және ұсыныстар минут ішінде қалыптасады.",
  s5_kicker: "Шешім",
  s5_title: "Орталығыңыз не алады",
  s5_values: [
    ["Екі минутта сабақ", "Мұғалім тақырып береді — жүйе теориясы, формуласы және тексеру тесті бар толық сабақ жасайды."],
    ["Артта қалуды көру", "Әр оқушы мен сынып бойынша аналитика: әлсіз тақырыптар мен тәуекелдер — емтиханнан кейін емес, алдын ала."],
    ["Ата-ана сенімі", "Бала прогресі туралы ашық есептер автоматты қалыптасып, ұстауды арттырады."],
    ["Сіздің брендіңіз", "Платформа орталықтың фирмалық стилінде — заманауи, технологиялық бейне."],
  ],
  s6_kicker: "Қалай жұмыс істейді",
  s6_title: "Тақырыптан нәтижеге дейін — төрт қадам",
  s6_steps: [
    "Мұғалім екі минутта сабақ қалыптастырады",
    "Оқушы теорияны оқып, тесттен өтеді",
    "Жүйе нәтижені автоматты бағалайды",
    "Директор аналитиканы нақты уақытта көреді",
  ],
  s7_kicker: "Қамту",
  s7_title: "Қазақстан нарығын толық қамту",
  s7_items: [
    "Орыс және қазақ тілі — оқушылардың 60%-дан астамы ЕНТ-ны қазақша тапсырады",
    "Барлық ЕНТ пәндері және бейіндік жұптар",
    "Нақты форматтағы сынақ емтихандар: 120 сұрақ, таймер",
    "Skylla ЖИ-тәлімгері оқушыларға тәулік бойы жауап береді",
  ],
  s8_kicker: "Дәлел",
  s8_title: "Бұл бүгін жұмыс істейді",
  s8_stats: [["31+", "кітапханадағы дайын сабақ"], ["120", "сынақ ЕНТ сұрағы"], ["4", "бірыңғай жүйедегі рөл"]],
  s8_note: "Мұғалімдер мен оқушылар бойынша тірі аналитика, тесттердің автоматты тексерілуі, формулалары математикалық түрде безендірілген сабақтар — мұның бәрін демонстрацияда тікелей көрсетеміз.",
  s9_kicker: "Енгізу",
  s9_title: "Бір күнде іске қосу",
  s9_steps: [
    "Орталық құрып, мұғалімдерді код арқылы шақырасыз",
    "Мұғалімдер сынып құрады, оқушылар код арқылы кіреді",
    "Дайын сабақтар мен сынақ емтихандар кітапханасы — бірден",
    "Директор бірінші күннен орталық аналитикасын көреді",
  ],
  s10_kicker: "Шарттар",
  s10_title: "Ынтымақтастықтың басталуы",
  s10_pilot_h: "Бір топқа тегін пилот",
  s10_pilot_d: "Бір топта іске қосып, ай ішінде сынақ ЕНТ балл өсімін өлшейміз. Төлем — тек расталған нәтиже болғанда.",
  s10_tiers: [
    "Пилоттан кейін — айына оқушы үшін немесе орталыққа пакет",
    "White-label, аналитика және шексіз сабақ генерациясы барлық тарифте",
    "Kaspi арқылы төлем · БСН бойынша шот-фактура",
  ],
  s11_title: "Осы аптада\nпилот іске қосамыз",
  s11_cta: "Демонстрация белгілеу",
  s11_contact: "WhatsApp +7 707 588 4651   ·   study-hub-karakat.vercel.app",
};

(async () => {
  await build({ file: "StudyHub-Pitch-RU.pptx", t: RU });
  await build({ file: "StudyHub-Pitch-KK.pptx", t: KK });
  console.log("OK: redesigned RU + KK decks");
})();
