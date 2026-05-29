# -*- coding: utf-8 -*-
"""Generate StudyHub product-readiness + GTM report as a styled PDF (Russian)."""
import os
from reportlab.lib.pagesizes import A4
from reportlab.lib.units import mm
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.enums import TA_LEFT, TA_CENTER
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak, HRFlowable,
)

# ── Cyrillic fonts ────────────────────────────────────────────────────────────
pdfmetrics.registerFont(TTFont("Arial", r"C:\Windows\Fonts\arial.ttf"))
pdfmetrics.registerFont(TTFont("Arial-Bold", r"C:\Windows\Fonts\arialbd.ttf"))
pdfmetrics.registerFont(TTFont("Arial-Italic", r"C:\Windows\Fonts\ariali.ttf"))
pdfmetrics.registerFontFamily("Arial", normal="Arial", bold="Arial-Bold", italic="Arial-Italic")

# ── Brand palette ─────────────────────────────────────────────────────────────
BLUE = colors.HexColor("#2563eb")
VIOLET = colors.HexColor("#7c3aed")
DARK = colors.HexColor("#0f172a")
GREY = colors.HexColor("#64748b")
LIGHT = colors.HexColor("#f1f5f9")
GREEN = colors.HexColor("#16a34a")
GREEN_BG = colors.HexColor("#dcfce7")
AMBER = colors.HexColor("#d97706")
AMBER_BG = colors.HexColor("#fef3c7")
BLUER = colors.HexColor("#2563eb")
BLUE_BG = colors.HexColor("#dbeafe")
RED = colors.HexColor("#dc2626")

styles = getSampleStyleSheet()
def S(name, **kw):
    base = kw.pop("parent", styles["Normal"])
    kw.setdefault("fontName", "Arial")
    return ParagraphStyle(name, parent=base, **kw)

H1 = S("H1", fontName="Arial-Bold", fontSize=22, textColor=DARK, spaceAfter=4, leading=26)
H2 = S("H2", fontName="Arial-Bold", fontSize=15, textColor=BLUE, spaceBefore=16, spaceAfter=8, leading=19)
H3 = S("H3", fontName="Arial-Bold", fontSize=12, textColor=DARK, spaceBefore=10, spaceAfter=4, leading=15)
BODY = S("Body", fontSize=10.5, textColor=colors.HexColor("#1e293b"), leading=15, spaceAfter=6)
SUB = S("Sub", fontSize=9.5, textColor=GREY, leading=13)
CELL = S("Cell", fontSize=9.5, leading=12.5, textColor=colors.HexColor("#1e293b"))
CELL_B = S("CellB", fontName="Arial-Bold", fontSize=9.5, leading=12.5, textColor=DARK)
WHITE_C = S("WhiteC", fontName="Arial-Bold", fontSize=9.5, leading=12.5, textColor=colors.white, alignment=TA_CENTER)
BADGE = S("Badge", fontName="Arial-Bold", fontSize=8.5, leading=11, alignment=TA_CENTER)

story = []

def hr(color=colors.HexColor("#e2e8f0"), w=0.8, sb=2, sa=8):
    story.append(HRFlowable(width="100%", thickness=w, color=color, spaceBefore=sb, spaceAfter=sa))

def status_table(rows, col_w):
    """rows: list of [feature(Paragraph), status_key, note(Paragraph)]"""
    palette = {
        "ok":   (GREEN_BG, GREEN, "Готово ✓"),
        "dev":  (AMBER_BG, AMBER, "В работе"),
        "road": (BLUE_BG, BLUER, "На дороге"),
    }
    data = [[Paragraph("Функция", CELL_B), Paragraph("Статус", CELL_B), Paragraph("Комментарий", CELL_B)]]
    cell_styles = []
    for i, (feat, key, note) in enumerate(rows, start=1):
        bg, fg, label = palette[key]
        data.append([Paragraph(feat, CELL), Paragraph(f'<font color="#{fg.hexval()[2:]}">{label}</font>', BADGE), Paragraph(note, CELL)])
        cell_styles.append(("BACKGROUND", (1, i), (1, i), bg))
    t = Table(data, colWidths=col_w, repeatRows=1)
    ts = [
        ("BACKGROUND", (0, 0), (-1, 0), DARK),
        ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
        ("FONTNAME", (0, 0), (-1, 0), "Arial-Bold"),
        ("FONTSIZE", (0, 0), (-1, 0), 9.5),
        ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
        ("ALIGN", (1, 0), (1, -1), "CENTER"),
        ("TOPPADDING", (0, 0), (-1, -1), 7),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 7),
        ("LEFTPADDING", (0, 0), (-1, -1), 9),
        ("RIGHTPADDING", (0, 0), (-1, -1), 9),
        ("LINEBELOW", (0, 0), (-1, -1), 0.5, colors.HexColor("#e2e8f0")),
        ("ROWBACKGROUNDS", (0, 1), (0, -1), [colors.white, colors.HexColor("#f8fafc")]),
    ] + cell_styles
    t.setStyle(TableStyle(ts))
    story.append(t)
    story.append(Spacer(1, 6))

def bullets(items, style=BODY):
    for it in items:
        story.append(Paragraph(f"•&nbsp;&nbsp;{it}", style))

# ══════════════════════════════════════════════════════════════════════════════
# COVER
# ══════════════════════════════════════════════════════════════════════════════
story.append(Spacer(1, 30))
cover = Table([[Paragraph('<font color="white"><b>Study</b></font><font color="#c7d2fe"><b>Hub</b></font>', S("logo", fontName="Arial-Bold", fontSize=30, alignment=TA_CENTER))]],
              colWidths=[170*mm], rowHeights=[26*mm])
cover.setStyle(TableStyle([
    ("BACKGROUND", (0,0), (-1,-1), BLUE),
    ("VALIGN", (0,0), (-1,-1), "MIDDLE"),
    ("ALIGN", (0,0), (-1,-1), "CENTER"),
    ("ROUNDEDCORNERS", [10,10,10,10]),
]))
story.append(cover)
story.append(Spacer(1, 18))
story.append(Paragraph("Отчёт о готовности продукта", S("ct", fontName="Arial-Bold", fontSize=24, textColor=DARK, alignment=TA_CENTER, leading=28)))
story.append(Paragraph("и план продвижения", S("ct2", fontName="Arial-Bold", fontSize=24, textColor=VIOLET, alignment=TA_CENTER, leading=28)))
story.append(Spacer(1, 12))
story.append(Paragraph("AI-платформа подготовки к ЕНТ, IELTS и поступлению • Казахстан", S("ctsub", fontSize=12, textColor=GREY, alignment=TA_CENTER)))
story.append(Spacer(1, 8))
story.append(Paragraph("29 мая 2026 • для внутреннего анализа", S("ctd", fontSize=10, textColor=GREY, alignment=TA_CENTER)))
story.append(Spacer(1, 24))

# Readiness summary box
summ = Table([[
    Paragraph('<font color="white"><b>Уровень готовности</b></font>', S("sb", fontName="Arial-Bold", fontSize=11, textColor=colors.white, alignment=TA_CENTER)),
],[
    Paragraph('<font color="white"><b>MVP — Demo-Ready для B2B-пилота</b></font>', S("sb2", fontName="Arial-Bold", fontSize=15, textColor=colors.white, alignment=TA_CENTER)),
],[
    Paragraph('<font color="#dbeafe">Ядро работает end-to-end: диагностика → AI-уроки → квиз с авто-оценкой → аналитика. '
              'Монетизация пока ручная (счёт). Часть вертикалей — на дороге.</font>',
              S("sb3", fontSize=9.5, textColor=colors.white, alignment=TA_CENTER, leading=13)),
]], colWidths=[170*mm])
summ.setStyle(TableStyle([
    ("BACKGROUND", (0,0), (-1,-1), VIOLET),
    ("TOPPADDING", (0,0), (-1,-1), 8), ("BOTTOMPADDING", (0,0), (-1,-1), 8),
    ("LEFTPADDING", (0,0), (-1,-1), 16), ("RIGHTPADDING", (0,0), (-1,-1), 16),
]))
story.append(summ)
story.append(PageBreak())

# ══════════════════════════════════════════════════════════════════════════════
# 1. ЧТО ТАКОЕ STUDYHUB
# ══════════════════════════════════════════════════════════════════════════════
story.append(Paragraph("1. Обзор продукта", H1))
hr(BLUE, 1.5)
story.append(Paragraph(
    "StudyHub — образовательная AI-платформа для подготовки школьников Казахстана к ЕНТ и IELTS. "
    "Объединяет четыре роли в одной системе: <b>ученик</b>, <b>родитель</b>, <b>учитель</b> и <b>директор учебного центра</b>. "
    "Ключевое отличие — встроенный искусственный интеллект (Claude Opus 4.8), который генерирует "
    "полноценные уроки, тесты и персональные рекомендации по запросу, поэтому контент не ограничен и масштабируется бесконечно.", BODY))
story.append(Paragraph("Для кого", H3))
bullets([
    "<b>Ученики</b> — персональная подготовка к ЕНТ/IELTS: диагностика, AI-уроки, пробные тесты, прогресс.",
    "<b>Родители</b> — прозрачность: видят реальный прогресс ребёнка, слабые темы, отчёты.",
    "<b>Учителя</b> — создание уроков и ДЗ через AI за минуты, классы, проверка, аналитика.",
    "<b>Учебные центры (B2B)</b> — управление учителями и учениками, аналитика центра, white-label.",
])

# ══════════════════════════════════════════════════════════════════════════════
# 2. ЧТО УМЕЕТ ПЛАТФОРМА
# ══════════════════════════════════════════════════════════════════════════════
story.append(Paragraph("2. Что умеет платформа", H2))
story.append(Paragraph("Возможности по ролям. Цвет статуса: "
                       '<font color="#16a34a"><b>зелёный</b></font> — проверено end-to-end, '
                       '<font color="#d97706"><b>жёлтый</b></font> — в разработке/частично, '
                       '<font color="#2563eb"><b>синий</b></font> — на дороге (roadmap).', SUB))
story.append(Spacer(1, 8))

CW = [70*mm, 24*mm, 76*mm]

story.append(Paragraph("Ученик", H3))
status_table([
    ("Регистрация и вход (JWT), роли", "ok", "Проверено"),
    ("Диагностический тест по предметам", "ok", "~270 вопросов, скоринг, разбор"),
    ("Просмотр AI-урока (теория + формулы KaTeX)", "ok", "Проверено: Никита прошёл"),
    ("Квиз по уроку с авто-оценкой", "ok", "Балл проставляется автоматически"),
    ("Пробный ЕНТ (120 вопросов, таймер)", "ok", "Реальный формат, разбор ошибок"),
    ("Аналитика прогресса (график во времени)", "ok", "Диагностики + пробные ЕНТ"),
    ("Интерактивные курсы ЕНТ (13 шт.)", "ok", "Математика, Физика, Био, Хим и др."),
    ("AI-репетитор Skylla (чат)", "ok", "Лимит для Free, безлимит Premium"),
    ("Пробный ЕНТ на 2 языках (РУС/ҚАЗ)", "dev", "Механизм готов, KK-контент генерится"),
], CW)

story.append(Paragraph("Учитель", H3))
status_table([
    ("Классы + приглашение по коду", "ok", "Проверено"),
    ("AI Урок: генерация → превью/редактор → публикация", "ok", "Opus 4.8, библиотека 31 урок"),
    ("Конструктор тестов (3 AI-варианта)", "ok", "Выбор варианта → назначение"),
    ("Умное ДЗ по слабым темам класса", "ok", "На основе диагностики"),
    ("Прогресс учеников: сдано N/M, ср.балл, отстающие", "ok", "Реальные данные + цветовой флаг"),
    ("Библиотека «Мои уроки» (сохранение/удаление)", "ok", "Проверено"),
    ("WhatsApp-приглашение в класс", "ok", "Готовое сообщение с кодом"),
    ("Расписание классов", "ok", "Дни/время/кабинет"),
], CW)

story.append(Paragraph("Родитель", H3))
status_table([
    ("Привязка ребёнка по 6-значному коду", "ok", "Проверено end-to-end"),
    ("Реальные данные ребёнка (диагностика, ЕНТ, активность)", "ok", "Без фейковых данных"),
    ("Отчёт прогресса (WhatsApp)", "ok", "Сводка по ребёнку"),
], CW)

story.append(Paragraph("Учебный центр (B2B)", H3))
status_table([
    ("Создание организации + инвайт учителей", "ok", "Проверено"),
    ("Аналитика центра (учителя, ученики, прогресс)", "ok", "Демо-центр: 3 учителя, 14 учеников"),
    ("Мультитенантная изоляция контента", "ok", "Материалы центра приватны"),
    ("Отчёты родителям/центру (неделя/месяц)", "ok", "HTML-отчёты, доступ по ссылке"),
    ("White-label (лого/цвет центра)", "dev", "Хранится; применение в UI частично"),
    ("Биллинг центра / счёт-фактуры (БИН) / места", "road", "Первые сделки — ручной счёт"),
], CW)

story.append(PageBreak())

# ══════════════════════════════════════════════════════════════════════════════
# 3. AI-ВОЗМОЖНОСТИ
# ══════════════════════════════════════════════════════════════════════════════
story.append(Paragraph("3. AI-ядро (ключевое преимущество)", H1))
hr(BLUE, 1.5)
status_table([
    ("Генерация уроков (теория + формулы + квиз)", "ok", "Claude Opus 4.8, ~10–16K символов"),
    ("Мульти-провайдер: Claude CLI → Gemini → Groq", "ok", "Авто-фолбэк, отказоустойчивость"),
    ("Кеш AI-уроков (экономия токенов)", "ok", "Повтор темы = 0 токенов"),
    ("Анти-тавтология + защита парсера JSON", "ok", "Фильтр плохих вопросов"),
    ("Библиотека 31 урок (Математика/Физика/Био/Хим/История)", "ok", "Сгенерировано на Opus"),
    ("AI-анализ диагностики + AI учебный план", "dev", "Базовая логика; AI-версия в планах"),
    ("Grounded-репетитор по материалам учителя", "road", "В стиле NotebookLM"),
    ("Озвучка уроков (TTS / аудио-формат)", "road", "Для обучения «на слух»"),
], [78*mm, 24*mm, 68*mm])

# ══════════════════════════════════════════════════════════════════════════════
# 4. ТЕХНОЛОГИИ И ИНФРАСТРУКТУРА
# ══════════════════════════════════════════════════════════════════════════════
story.append(Paragraph("4. Технологии и инфраструктура", H2))
bullets([
    "<b>Фронтенд:</b> React 18 + TypeScript + Vite + Tailwind + Framer Motion + i18n (RU/KK/EN).",
    "<b>Бэкенд:</b> Express + TypeScript + Prisma ORM + PostgreSQL + JWT.",
    "<b>AI:</b> Claude Opus 4.8 (через Claude Code CLI), фолбэк Gemini / Groq.",
    "<b>Деплой:</b> фронт на Vercel, бэкенд + БД на Railway, мульти-origin CORS.",
    "<b>Интеграции:</b> KaspiPay (оплата), WhatsApp, Telegram-бот.",
])

# ══════════════════════════════════════════════════════════════════════════════
# 5. В РАЗРАБОТКЕ / НА ДОРОГЕ
# ══════════════════════════════════════════════════════════════════════════════
story.append(Paragraph("5. В разработке и на дороге", H2))
story.append(Paragraph("В разработке (частично готово)", H3))
bullets([
    "ЕНТ на 2 языках (РУС/ҚАЗ) — переключатель готов, идёт генерация казахского контента.",
    "White-label брендинг центра — данные есть, применение в интерфейсе дорабатывается.",
    "Рекламное видео (Remotion 9:16) — превью готово; рендер mp4 блокирует системная защита Windows.",
    "Авто-оплата KaspiPay — интеграция написана, нужны мерчант-ключи центра.",
])
story.append(Paragraph("На дороге (запланировано)", H3))
bullets([
    "Биллинг учебного центра: счёт-фактуры по БИН, управление оплаченными местами (seats).",
    "Стажировки, Карьерный трекер, Кабинет работодателя — сейчас помечены «Скоро».",
    "Grounded AI-репетитор по загруженным материалам учителя (как NotebookLM).",
    "Озвучка уроков (TTS), Telegram-уведомления, флеш-карты и интервальное повторение.",
])

story.append(PageBreak())

# ══════════════════════════════════════════════════════════════════════════════
# 6. ПЛАН ПРОДВИЖЕНИЯ (GTM)
# ══════════════════════════════════════════════════════════════════════════════
story.append(Paragraph("6. План продвижения (Go-To-Market)", H1))
hr(BLUE, 1.5)
story.append(Paragraph("Принцип: не перенаполнять контент, а опираться на AI-движок (контент бесконечен). "
                       "Сначала закрыть «demo-killer» дыры → подготовить демо → продать → углублять под то, что конвертит.", BODY))

story.append(Paragraph("Очередь рынков", H3))
gtm = Table([
    [Paragraph("Рынок", CELL_B), Paragraph("Почему", CELL_B), Paragraph("Когда", CELL_B)],
    [Paragraph("<b>B2B</b> — учебные центры/школы", CELL), Paragraph("Одна продажа = 50–200 учеников. Инструменты учителя/центра уже готовы. Очевидный ROI.", CELL), Paragraph("<b>Первым</b>", CELL)],
    [Paragraph("<b>B2C</b> — ученики/родители", CELL), Paragraph("Низкий порог, виральность (WhatsApp), отзывы и обкатка. Монетизация сложнее.", CELL), Paragraph("Параллельно", CELL)],
    [Paragraph("<b>B2G</b> — МОН/госшколы", CELL), Paragraph("Высокий потолок, но тендеры и долгий цикл. Нужны кейсы из B2B/B2C.", CELL), Paragraph("Последним", CELL)],
], colWidths=[44*mm, 100*mm, 26*mm])
gtm.setStyle(TableStyle([
    ("BACKGROUND", (0,0), (-1,0), DARK), ("TEXTCOLOR", (0,0), (-1,0), colors.white),
    ("FONTNAME", (0,0), (-1,0), "Arial-Bold"),
    ("VALIGN", (0,0), (-1,-1), "MIDDLE"),
    ("TOPPADDING", (0,0), (-1,-1), 7), ("BOTTOMPADDING", (0,0), (-1,-1), 7),
    ("LEFTPADDING", (0,0), (-1,-1), 9), ("RIGHTPADDING", (0,0), (-1,-1), 9),
    ("LINEBELOW", (0,0), (-1,-1), 0.5, colors.HexColor("#e2e8f0")),
    ("ROWBACKGROUNDS", (0,1), (-1,-1), [colors.white, colors.HexColor("#f8fafc")]),
    ("BACKGROUND", (2,1), (2,1), GREEN_BG),
]))
story.append(gtm)
story.append(Spacer(1, 8))

story.append(Paragraph("Demo-killer'ы для первой продажи центру", H3))
status_table([
    ("Навигация директора на дашборд центра", "ok", "Кнопка «Мой центр» + gate"),
    ("Логин на проде (CORS Vercel)", "ok", "Мульти-origin"),
    ("Отчёты родителям (ссылка не давала 401)", "ok", "Токен в query"),
    ("Живые демо-данные центра", "ok", "Демо-центр с 14 учениками"),
    ("White-label на демо (брендинг центра)", "dev", "Доработка"),
], [78*mm, 24*mm, 68*mm])

story.append(Paragraph("Сценарий демо центру (30 секунд «вау»)", H3))
bullets([
    "1. Директор → дашборд центра → живая аналитика, видно кто отстаёт (красным).",
    "2. Учитель → AI Урок → генерит урок при клиенте за ~2 минуты (Opus 4.8).",
    "3. Ученик → читает урок (формулы KaTeX) → проходит тест → авто-оценка.",
    "4. Директор → видит результат + формирует отчёт родителю.",
], SUB)

story.append(Paragraph("Монетизация", H3))
bullets([
    "Тарифы: Бесплатный / Премиум (4 990 ₸/мес) / Премиум Годовой (39 990 ₸/год).",
    "B2C self-serve: оплата через KaspiPay (нужны мерчант-ключи) — пока WhatsApp/ручной.",
    "B2B: первые сделки — ручной счёт; per-seat и счёт-фактуры по БИН — следующий этап.",
])

# ══════════════════════════════════════════════════════════════════════════════
# 7. РИСКИ И ОГРАНИЧЕНИЯ
# ══════════════════════════════════════════════════════════════════════════════
story.append(Paragraph("7. Известные ограничения и риски", H2))
bullets([
    "<b>Авто-оплата не активирована</b> — нужны мерчант-ключи KaspiPay; до этого оплата вручную.",
    "<b>AI-генерация через Claude CLI</b> привязана к подписке на рабочей машине; на проде — фолбэк Groq/Gemini.",
    "<b>Биллинг центра отсутствует</b> на платформе — счёт выставляется вне системы (ограничивает масштаб).",
    "<b>Часть вертикалей (карьера/работодатель)</b> — демо-заглушки «Скоро», не функциональны.",
    "<b>Рендер рекламного видео</b> локально блокирует Smart App Control Windows (решается на др. машине/в облаке).",
])

# ══════════════════════════════════════════════════════════════════════════════
# 8. БЛИЖАЙШИЕ ШАГИ
# ══════════════════════════════════════════════════════════════════════════════
story.append(Paragraph("8. Ближайшие шаги (приоритет)", H2))
bullets([
    "1. Завершить KK-контент для пробного ЕНТ (2 языка).",
    "2. Применить white-label центра в интерфейсе (брендинг для демо).",
    "3. Подключить мерчант-ключи KaspiPay → авто-оплата B2C.",
    "4. Провести первое демо учебному центру (B2B-пилот) и собрать обратную связь.",
    "5. По итогам пилота — биллинг центра (per-seat, счёт-фактуры).",
])
story.append(Spacer(1, 16))
hr(colors.HexColor("#e2e8f0"))
story.append(Paragraph("StudyHub • Отчёт сформирован автоматически для внутреннего анализа • "
                       "Прод: study-hub-karakat.vercel.app", S("foot", fontSize=8.5, textColor=GREY, alignment=TA_CENTER)))

# ── Build ─────────────────────────────────────────────────────────────────────
out = os.path.join(os.path.dirname(__file__), "StudyHub-Отчёт-готовности.pdf")
doc = SimpleDocTemplate(out, pagesize=A4,
                        topMargin=18*mm, bottomMargin=16*mm, leftMargin=20*mm, rightMargin=20*mm,
                        title="StudyHub — Отчёт о готовности и план продвижения", author="StudyHub")
doc.build(story)
print("OK:", out)
