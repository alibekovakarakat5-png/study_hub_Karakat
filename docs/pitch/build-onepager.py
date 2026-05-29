# -*- coding: utf-8 -*-
"""StudyHub B2B one-pager leave-behind (RU + KK), 1 page each."""
import os
from reportlab.lib.pagesizes import A4
from reportlab.lib.units import mm
from reportlab.lib import colors
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.enums import TA_CENTER
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, HRFlowable

pdfmetrics.registerFont(TTFont("Arial", r"C:\Windows\Fonts\arial.ttf"))
pdfmetrics.registerFont(TTFont("Arial-Bold", r"C:\Windows\Fonts\arialbd.ttf"))
pdfmetrics.registerFont(TTFont("Arial-Italic", r"C:\Windows\Fonts\ariali.ttf"))
# Serif display for gravitas (Georgia has Cyrillic + Kazakh on Windows)
pdfmetrics.registerFont(TTFont("Serif", r"C:\Windows\Fonts\georgia.ttf"))
pdfmetrics.registerFont(TTFont("Serif-Bold", r"C:\Windows\Fonts\georgiab.ttf"))

# Premium palette: midnight navy + ivory + brass
NAVY = colors.HexColor("#12203B"); BLUE = colors.HexColor("#1B2D4F"); VIOLET = colors.HexColor("#1B2D4F")
BRASS = colors.HexColor("#B5934C")
INK = colors.HexColor("#1A2233"); SUB = colors.HexColor("#566073"); GREEN = colors.HexColor("#B5934C")
GREEN_BG = colors.HexColor("#FBFAF5"); CARD = colors.HexColor("#FBFAF5")

def st(n, **k): k.setdefault("fontName", "Arial"); return ParagraphStyle(n, **k)

TXT = {
  "ru": {
    "tag": "AI-платформа для учебных центров • ЕНТ / IELTS",
    "head": "Выше баллы ЕНТ. Меньше нагрузка на учителей. Под вашим брендом.",
    "problem_h": "Проблема",
    "problem": "Родители платят за результат, а центр узнаёт об отставании ученика слишком поздно. Учителя выгорают на ручной подготовке, а отличиться от конкурентов нечем.",
    "sol_h": "Решение",
    "sol": "StudyHub — платформа подготовки к ЕНТ/IELTS с искусственным интеллектом (Claude Opus 4.8): уроки, тесты и аналитика под каждого ученика — за минуты.",
    "diff_h": "Почему мы",
    "diffs": [
        ("Уроки за две минуты", "Преподаватель задаёт тему — система формирует полный урок с теорией, формулами и тестом."),
        ("Видимость отставания", "Аналитика по ученику и классу — заблаговременно, а не после экзамена."),
        ("Русский и казахский", "Полное покрытие: более 60% учеников сдают ЕНТ на казахском языке."),
    ],
    "proof_h": "Доказательство",
    "proof": "31+ готовых уроков · пробные ЕНТ (120 вопросов) · white-label под бренд центра · запуск за один день · живая аналитика.",
    "cta_h": "Бесплатный пилот на одну группу",
    "cta": "Запускаем на одной группе, замеряем рост баллов за месяц. Платите — только если видите результат.",
    "contact": "WhatsApp +7 707 588 4651  •  study-hub-karakat.vercel.app",
  },
  "kk": {
    "tag": "Оқу орталықтарына AI-платформа • ЕНТ / IELTS",
    "head": "ЕНТ баллы жоғары. Мұғалімге жүк аз. Сіздің брендіңізбен.",
    "problem_h": "Мәселе",
    "problem": "Ата-аналар нәтиже үшін төлейді, ал орталық оқушының артта қалғанын тым кеш біледі. Мұғалімдер қолмен дайындықтан шаршайды, бәсекелестен айырмашылық жоқ.",
    "sol_h": "Шешім",
    "sol": "StudyHub — жасанды интеллектпен (Claude Opus 4.8) ЕНТ/IELTS-ке дайындық платформасы: әр оқушыға сабақ, тест және аналитика — минут ішінде.",
    "diff_h": "Неге біз",
    "diffs": [
        ("Екі минутта сабақ", "Мұғалім тақырып береді — жүйе теория, формула және тесті бар толық сабақ жасайды."),
        ("Артта қалуды көру", "Оқушы мен сынып аналитикасы — емтиханнан кейін емес, алдын ала."),
        ("Орыс және қазақ тілі", "Толық қамту: оқушылардың 60%-дан астамы ЕНТ-ны қазақша тапсырады."),
    ],
    "proof_h": "Дәлел",
    "proof": "31+ дайын сабақ · сынақ ЕНТ (120 сұрақ) · орталық брендімен white-label · бір күнде іске қосу · тірі аналитика.",
    "cta_h": "Бір топқа тегін пилот",
    "cta": "Бір топта іске қосып, ай ішінде балл өсімін өлшейміз. Нәтиже көрсеңіз — сонда ғана төлейсіз.",
    "contact": "WhatsApp +7 707 588 4651  •  study-hub-karakat.vercel.app",
  },
}

def make(lang):
    t = TXT[lang]
    out = os.path.join(os.path.dirname(__file__), f"StudyHub-OnePager-{lang.upper()}.pdf")
    doc = SimpleDocTemplate(out, pagesize=A4, topMargin=14*mm, bottomMargin=12*mm, leftMargin=16*mm, rightMargin=16*mm)
    W = A4[0] - 32*mm
    story = []
    # Header band
    hdr = Table([[Paragraph('<font color="white"><b>Study</b></font><font color="#c7d2fe"><b>Hub</b></font>',
                            st("lg", fontName="Arial-Bold", fontSize=22, textColor=colors.white)),
                 Paragraph(f'<font color="#c7d2fe">{t["tag"]}</font>',
                            st("tg", fontSize=9.5, textColor=colors.white, alignment=2))]],
                colWidths=[W*0.45, W*0.55])
    hdr.setStyle(TableStyle([("BACKGROUND",(0,0),(-1,-1),NAVY),("VALIGN",(0,0),(-1,-1),"MIDDLE"),
        ("TOPPADDING",(0,0),(-1,-1),10),("BOTTOMPADDING",(0,0),(-1,-1),10),
        ("LEFTPADDING",(0,0),(-1,-1),14),("RIGHTPADDING",(0,0),(-1,-1),14)]))
    story += [hdr, Spacer(1,12)]
    story.append(Paragraph(t["head"], st("h", fontName="Serif-Bold", fontSize=20, textColor=INK, leading=25)))
    story.append(Spacer(1,12))

    def block(title, body, color=BRASS):
        story.append(Paragraph(f'<font color="#{color.hexval()[2:].rjust(6,"0")}"><b>{title.upper()}</b></font>',
                               st("bh", fontName="Arial-Bold", fontSize=10.5, leading=14)))
        story.append(Paragraph(body, st("bb", fontSize=10.5, textColor=SUB, leading=14.5, spaceAfter=9)))

    block(t["problem_h"], t["problem"])
    block(t["sol_h"], t["sol"])

    story.append(Paragraph(f'<font color="#{BRASS.hexval()[2:].rjust(6,"0")}"><b>{t["diff_h"].upper()}</b></font>', st("dh", fontName="Arial-Bold", fontSize=10.5, spaceAfter=5)))
    rows = [[Paragraph(f"<b>{h}</b>", st("dc", fontName="Serif-Bold", fontSize=11.5, textColor=INK, leading=14)),
             Paragraph(d, st("dd", fontSize=9.5, textColor=SUB, leading=12))] for h,d in t["diffs"]]
    dt = Table(rows, colWidths=[W*0.34, W*0.66])
    dt.setStyle(TableStyle([("VALIGN",(0,0),(-1,-1),"TOP"),("TOPPADDING",(0,0),(-1,-1),5),("BOTTOMPADDING",(0,0),(-1,-1),5),
        ("LINEBELOW",(0,0),(-1,-2),0.4,colors.HexColor("#e2e8f0")),("LEFTPADDING",(0,0),(-1,-1),0)]))
    story += [dt, Spacer(1,10)]

    block(t["proof_h"], t["proof"], GREEN)

    # CTA box
    cta = Table([[Paragraph(f'<font color="#{INK.hexval()[2:].rjust(6,"0")}"><b>{t["cta_h"]}</b></font>', st("ch", fontName="Serif-Bold", fontSize=15, leading=18))],
                 [Paragraph(t["cta"], st("cb", fontSize=10.5, textColor=SUB, leading=14.5))]], colWidths=[W])
    cta.setStyle(TableStyle([("BACKGROUND",(0,0),(-1,-1),GREEN_BG),("BOX",(0,0),(-1,-1),1,GREEN),
        ("TOPPADDING",(0,0),(-1,-1),8),("BOTTOMPADDING",(0,0),(-1,-1),8),("LEFTPADDING",(0,0),(-1,-1),14),("RIGHTPADDING",(0,0),(-1,-1),14)]))
    story += [cta, Spacer(1,12)]
    story.append(HRFlowable(width="100%", thickness=0.6, color=colors.HexColor("#e2e8f0"), spaceAfter=6))
    story.append(Paragraph(t["contact"], st("ct", fontName="Arial-Bold", fontSize=11, textColor=BLUE, alignment=TA_CENTER)))
    doc.build(story)
    print("OK:", os.path.basename(out))

make("ru"); make("kk")
