/**
 * Shared ENT question bank — single source of truth for telegram.ts and cron.ts.
 */

import { prisma } from './prisma'

// ── Types ────────────────────────────────────────────────────────────────────

export interface Question {
  id: string
  subject: string
  q: string
  options: string[]
  correct: number
  explanation: string
}

// ── Answer labels ────────────────────────────────────────────────────────────

export const LABELS = ['A', 'B', 'C', 'D']

// ── Fallback question bank ──────────────────────────────────────────────────

export const FALLBACK_QUESTIONS: Question[] = [
  { id: 'f1',  subject: 'Математика',  q: 'Вычислите: 2³ × 2⁴',                                     options: ['2⁶','2⁷','4⁷','2¹²'],                         correct: 1, explanation: '2³ × 2⁴ = 2^(3+4) = 2⁷ = 128' },
  { id: 'f2',  subject: 'История КЗ', q: 'В каком году провозглашена независимость Казахстана?',     options: ['1990','1991','1992','1993'],                    correct: 1, explanation: '16 декабря 1991 года — День независимости' },
  { id: 'f3',  subject: 'Математика',  q: 'Дискриминант уравнения x² − 5x + 6 = 0 равен:',          options: ['1','4','25','49'],                              correct: 0, explanation: 'D = b² − 4ac = 25 − 24 = 1' },
  { id: 'f4',  subject: 'История КЗ', q: 'Кто основал Казахское ханство?',                           options: ['Аблай хан','Касым хан','Жанибек и Керей','Тауке хан'], correct: 2, explanation: 'Основано в 1465 году ханами Жанибеком и Кереем' },
  { id: 'f5',  subject: 'Математика',  q: 'Найдите 35% от числа 240.',                              options: ['72','84','96','120'],                           correct: 1, explanation: '240 × 0.35 = 84' },
  { id: 'f6',  subject: 'Физика',      q: 'Скорость света в вакууме приблизительно равна:',          options: ['3×10⁶ м/с','3×10⁸ м/с','3×10¹⁰ м/с','3×10⁵ м/с'], correct: 1, explanation: 'c ≈ 3×10⁸ м/с' },
  { id: 'f7',  subject: 'История КЗ', q: 'Столица перенесена в Астану в:',                          options: ['1995','1997','1999','2001'],                    correct: 1, explanation: 'Столица перенесена 10 декабря 1997 года' },
  { id: 'f8',  subject: 'Математика',  q: 'log₂ 32 = ?',                                            options: ['4','5','6','3'],                                correct: 1, explanation: '2⁵ = 32, значит log₂ 32 = 5' },
  { id: 'f9',  subject: 'Биология',    q: 'Какой органоид клетки называют «энергетической станцией»?', options: ['Рибосома','Митохондрия','Лизосома','Ядро'],  correct: 1, explanation: 'Митохондрии синтезируют АТФ' },
  { id: 'f10', subject: 'Химия',       q: 'Формула серной кислоты:',                                options: ['HCl','HNO₃','H₂SO₄','H₃PO₄'],                 correct: 2, explanation: 'H₂SO₄ — серная кислота' },
  { id: 'f11', subject: 'Математика',  q: 'Сумма углов треугольника равна:',                        options: ['90°','180°','270°','360°'],                    correct: 1, explanation: 'Сумма углов любого треугольника = 180°' },
  { id: 'f12', subject: 'Физика',      q: 'Единица измерения электрического сопротивления:',        options: ['Ампер','Вольт','Ом','Ватт'],                   correct: 2, explanation: 'Сопротивление измеряется в Омах (Ω)' },
  { id: 'f13', subject: 'История КЗ', q: 'Первый президент Казахстана:',                             options: ['Токаев','Назарбаев','Кунаев','Масимов'],       correct: 1, explanation: 'Нурсултан Назарбаев — первый президент РК' },
  { id: 'f14', subject: 'Математика',  q: 'Площадь круга радиусом 5 м:',                            options: ['10π м²','25π м²','50π м²','100π м²'],          correct: 1, explanation: 'S = πr² = π×5² = 25π м²' },
  { id: 'f15', subject: 'Химия',       q: 'Атомный номер кислорода:',                               options: ['6','7','8','9'],                               correct: 2, explanation: 'Кислород (O) имеет атомный номер 8' },
  { id: 'f16', subject: 'Биология',    q: 'Сколько хромосом в клетках человека?',                   options: ['23','44','46','48'],                            correct: 2, explanation: '46 хромосом = 23 пары в диплоидном наборе' },
  { id: 'f17', subject: 'Физика',      q: 'Закон Ома: I = ?',                                       options: ['U×R','U/R','R/U','U²/R'],                     correct: 1, explanation: 'I = U/R — сила тока = напряжение / сопротивление' },
  { id: 'f18', subject: 'Математика',  q: 'Производная функции y = x³ равна:',                      options: ['3x','x²','3x²','3x⁴'],                        correct: 2, explanation: '(xⁿ)\' = n·x^(n-1), значит (x³)\' = 3x²' },
  { id: 'f19', subject: 'История КЗ', q: 'Год образования Казахской ССР:',                           options: ['1920','1925','1930','1936'],                   correct: 1, explanation: 'Казахская АССР образована в 1925, ССР — 1936' },
  { id: 'f20', subject: 'Химия',       q: 'Какое вещество является катализатором в реакции Габера?', options: ['Pt','Fe','Ni','Cu'],                          correct: 1, explanation: 'В синтезе аммиака (процесс Габера) катализатор — железо (Fe)' },
]

// ── DB → Question mapper ────────────────────────────────────────────────────

function rowToQuestion(r: { id: string; data: unknown }): Question {
  const d = r.data as Record<string, unknown>
  return {
    id: r.id,
    subject: String(d.subject ?? 'ЕНТ'),
    q: String(d.question ?? d.q ?? ''),
    options: (d.options as string[]) ?? [],
    correct: Number(d.correct ?? 0),
    explanation: String(d.explanation ?? ''),
  }
}

// ── Public API ──────────────────────────────────────────────────────────────

export async function getQuestions(count: number): Promise<Question[]> {
  try {
    const dbRows = await prisma.content.findMany({
      where: { type: 'ent_question', active: true },
      take: count * 3,
    })
    if (dbRows.length >= count) {
      return dbRows
        .sort(() => Math.random() - 0.5)
        .slice(0, count)
        .map(rowToQuestion)
    }
  } catch { /* fallback */ }

  const shuffled = [...FALLBACK_QUESTIONS].sort(() => Math.random() - 0.5)
  return shuffled.slice(0, Math.min(count, shuffled.length))
}

export async function getRandomQuestion(subject?: string): Promise<Question> {
  if (subject) {
    try {
      const dbRows = await prisma.content.findMany({ where: { type: 'ent_question', active: true }, take: 200 })
      const filtered = dbRows.filter(r => {
        const d = r.data as Record<string, unknown>
        return String(d.subject ?? '').toLowerCase().includes(subject.toLowerCase())
      })
      if (filtered.length > 0) {
        const row = filtered[Math.floor(Math.random() * filtered.length)]!
        return rowToQuestion(row)
      }
    } catch { /* fallback */ }
  }
  const [q] = await getQuestions(1)
  return q!
}

export function buildQuestionText(q: Question, prefix = '📚'): string {
  const optionLines = q.options.map((o, i) => `${LABELS[i]}. ${o}`).join('\n')
  return `${prefix} <b>${q.subject}</b>\n\n${q.q}\n\n${optionLines}`
}

export function buildQuestionKeyboard(questionId: string, optionCount = 4) {
  return {
    inline_keyboard: [
      LABELS.slice(0, optionCount).map((label, i) => ({
        text: label,
        callback_data: `ans:${questionId}:${i}`,
      })),
    ],
  }
}
