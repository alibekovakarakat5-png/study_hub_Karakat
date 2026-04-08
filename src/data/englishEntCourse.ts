// ── Английский язык ЕНТ — Полный курс ───────────────────────────────────────
// 7 модулей · 21 урок · ~130 вопросов
// Охватывает ВСЕ темы блока «Английский язык» на ЕНТ
// Теория на русском, примеры и тесты на английском

export interface QuizQ {
  q: string
  options: [string, string, string, string]
  correct: 0 | 1 | 2 | 3
  explanation: string
}

export interface Lesson {
  id: string
  title: string
  duration: number // минут
  theory: string
  keyFormulas?: { formula: string; name: string }[]
  quiz: QuizQ[]
}

export interface Module {
  id: string
  title: string
  topic: string
  emoji: string
  color: string
  lessons: Lesson[]
}

// ────────────────────────────────────────────────────────────────────────────────

export const ENGLISH_ENT_COURSE: Module[] = [

  // ══════════════════════════════════════════════════════════════════════════════
  // МОДУЛЬ 1 — ВРЕМЕНА (TENSES)
  // ══════════════════════════════════════════════════════════════════════════════
  {
    id: 'en1',
    title: 'Времена: Present Tenses',
    topic: 'Present Simple, Present Continuous, Present Perfect',
    emoji: '⏰',
    color: '#2563eb',
    lessons: [
      // ── Урок 1.1 ──────────────────────────────────────────────────────────────
      {
        id: 'en1-l1',
        title: 'Present Simple — Настоящее простое время',
        duration: 15,
        theory: `## Present Simple — Настоящее простое время

**Когда используется:**
- Регулярные, повторяющиеся действия: I go to school every day.
- Общеизвестные факты и законы природы: Water boils at 100°C.
- Расписания и графики: The train leaves at 8:00.
- Привычки и предпочтения: She likes coffee.

## Образование

| | Утверждение | Отрицание | Вопрос |
|---|---|---|---|
| I / You / We / They | I work | I do not (don't) work | Do I work? |
| He / She / It | He works | He does not (doesn't) work | Does he work? |

**Важно!** В 3-м лице единственного числа (he, she, it) к глаголу добавляется окончание **-s / -es**:
- work → works, play → plays
- go → goes, do → does, watch → watches (после -s, -ss, -sh, -ch, -x, -o)
- study → studies (согласная + y → ies), BUT: play → plays (гласная + y → ys)

## Маркеры времени (Signal Words)

always, usually, often, sometimes, rarely, seldom, never, every day/week/month/year, on Mondays, twice a week, in the morning

## Частые ошибки на ЕНТ

1. **Забывают -s в 3-м лице:** ✗ He go → ✓ He goes
2. **Двойной вспомогательный глагол:** ✗ Does he goes? → ✓ Does he go?
3. **Don't vs Doesn't:** ✗ He don't like → ✓ He doesn't like

## Примеры для запоминания

- My father **works** in a bank. (факт, регулярное действие)
- **Do** you **speak** English? (вопрос — do + подлежащее + V1)
- She **doesn't watch** TV in the morning. (отрицание — doesn't + V1)
- The Sun **rises** in the East. (факт, закон природы)

## Наречия частотности (Adverbs of Frequency)

Наречия стоят **перед основным глаголом**, но **после глагола to be**:
- She **always** comes on time. (перед глаголом)
- He **is** always late. (после to be)

Порядок по частоте: always (100%) → usually (80%) → often (60%) → sometimes (40%) → rarely (20%) → never (0%)`,
        keyFormulas: [
          { formula: 'S + V1 (+ s/es для he/she/it)', name: 'Утверждение' },
          { formula: 'S + do/does + not + V1', name: 'Отрицание' },
          { formula: 'Do/Does + S + V1?', name: 'Вопрос' },
        ],
        quiz: [
          {
            q: 'Choose the correct sentence:',
            options: [
              'She go to school every day.',
              'She goes to school every day.',
              'She going to school every day.',
              'She is go to school every day.',
            ],
            correct: 1,
            explanation: 'В Present Simple в 3-м лице (she) добавляется окончание -s/-es к глаголу: she goes.',
          },
          {
            q: 'My brother ___ football on Sundays.',
            options: ['play', 'plays', 'is playing', 'played'],
            correct: 1,
            explanation: 'My brother — 3-е лицо ед. числа (= he). Маркер "on Sundays" — регулярное действие → Present Simple → plays.',
          },
          {
            q: '___ your parents speak English?',
            options: ['Does', 'Do', 'Are', 'Is'],
            correct: 1,
            explanation: 'Your parents — множественное число (= they). Вопрос в Present Simple → Do + they + V1.',
          },
          {
            q: 'Water ___ at 100 degrees Celsius.',
            options: ['boil', 'boils', 'is boiling', 'boiled'],
            correct: 1,
            explanation: 'Научный факт → Present Simple. Water — 3-е лицо (= it) → boils.',
          },
          {
            q: 'She ___ coffee. She prefers tea.',
            options: ["don't like", "doesn't like", "isn't like", "not likes"],
            correct: 1,
            explanation: 'She — 3-е лицо. Отрицание в Present Simple: She doesn\'t + V1 (like).',
          },
          {
            q: 'The train ___ at 7:30 every morning.',
            options: ['leave', 'leaves', 'is leaving', 'will leave'],
            correct: 1,
            explanation: 'Расписание (schedule) → Present Simple. The train (= it) → leaves.',
          },
        ],
      },

      // ── Урок 1.2 ──────────────────────────────────────────────────────────────
      {
        id: 'en1-l2',
        title: 'Present Continuous — Настоящее длительное время',
        duration: 15,
        theory: `## Present Continuous — Настоящее длительное время

**Когда используется:**
- Действие происходит прямо сейчас, в момент речи: I am reading a book now.
- Временная ситуация: She is staying with her friends this week.
- Запланированное ближайшее будущее: We are meeting tomorrow at 5.
- Раздражающая привычка (с always): He is always losing his keys!
- Изменяющиеся ситуации: The weather is getting colder.

## Образование

| | Утверждение | Отрицание | Вопрос |
|---|---|---|---|
| I | I am (I'm) working | I am not working | Am I working? |
| He / She / It | He is (He's) working | He is not (isn't) working | Is he working? |
| You / We / They | They are (They're) working | They are not (aren't) working | Are they working? |

**Формула:** S + am/is/are + V-ing

## Правила добавления -ing

- work → working (обычное добавление)
- make → making (немая "e" убирается: make → mak + ing)
- sit → sitting (CVC — удвоение последней согласной: sit → sitt + ing)
- lie → lying, die → dying (ie → y + ing)
- travel → travelling (в British English удвоение l)

## Маркеры времени

now, right now, at the moment, at present, currently, today, this week/month, Look! Listen!

## Глаголы состояния (Stative Verbs) — НЕ используются в Continuous!

Эти глаголы **не** ставятся в форму -ing (в их основном значении):

| Категория | Глаголы |
|---|---|
| Чувства | like, love, hate, prefer, want, need, wish |
| Мышление | know, understand, believe, remember, forget, think (= считать) |
| Восприятие | see, hear, smell, taste (непроизвольное) |
| Принадлежность | have (= иметь), own, belong, possess |
| Другие | be, seem, appear, cost, mean, contain |

**Исключения:** Некоторые глаголы меняют значение:
- I **think** he is right. (= считаю — stative, Simple)
- I **am thinking** about the problem. (= размышляю — action, Continuous)
- She **has** a car. (= владеет — Simple)
- She **is having** dinner. (= ужинает — Continuous)

## Частые ошибки на ЕНТ

1. ✗ I am know the answer. → ✓ I know the answer. (stative verb!)
2. ✗ She is play tennis now. → ✓ She is playing tennis now. (нужен V-ing)
3. ✗ Look! He run! → ✓ Look! He is running! (нужен am/is/are)`,
        keyFormulas: [
          { formula: 'S + am/is/are + V-ing', name: 'Утверждение' },
          { formula: 'S + am/is/are + not + V-ing', name: 'Отрицание' },
          { formula: 'Am/Is/Are + S + V-ing?', name: 'Вопрос' },
        ],
        quiz: [
          {
            q: 'Look! The children ___ in the garden.',
            options: ['play', 'plays', 'are playing', 'played'],
            correct: 2,
            explanation: '"Look!" — маркер Present Continuous. The children (= they) → are playing.',
          },
          {
            q: 'I ___ this word. What does it mean?',
            options: ["am not understanding", "don't understand", "not understand", "doesn't understand"],
            correct: 1,
            explanation: '"Understand" — stative verb (глагол состояния). Не используется в Continuous → don\'t understand.',
          },
          {
            q: 'She ___ a new book at the moment.',
            options: ['reads', 'read', 'is reading', 'has read'],
            correct: 2,
            explanation: '"At the moment" — маркер Present Continuous → is reading.',
          },
          {
            q: 'Which sentence is CORRECT?',
            options: [
              'He is seeming tired.',
              'They are knowing the answer.',
              'I am having lunch right now.',
              'She is wanting a new phone.',
            ],
            correct: 2,
            explanation: '"Have" в значении "есть, принимать пищу" — action verb, можно использовать в Continuous. Seem, know, want — stative verbs.',
          },
          {
            q: 'What ___ you ___ tonight?',
            options: [
              'do ... do',
              'are ... doing',
              'is ... doing',
              'does ... do',
            ],
            correct: 1,
            explanation: 'Вопрос о запланированном действии (tonight) → Present Continuous. You → Are you doing.',
          },
          {
            q: 'The weather ___ warmer and warmer.',
            options: ['gets', 'get', 'is getting', 'has got'],
            correct: 2,
            explanation: 'Изменяющаяся ситуация (changing situation) → Present Continuous → is getting.',
          },
        ],
      },

      // ── Урок 1.3 ──────────────────────────────────────────────────────────────
      {
        id: 'en1-l3',
        title: 'Present Perfect — Настоящее совершённое время',
        duration: 15,
        theory: `## Present Perfect — Настоящее совершённое время

**Когда используется:**
- Действие произошло в прошлом, но результат важен сейчас: I have lost my key. (= У меня нет ключа сейчас)
- Жизненный опыт: She has visited Paris three times.
- Действие, которое началось в прошлом и продолжается до сих пор: I have lived here since 2010.
- Недавнее действие с наречиями just, already, yet: He has just arrived.
- С наречиями ever, never (жизненный опыт): Have you ever been to London?

## Образование

| | Утверждение | Отрицание | Вопрос |
|---|---|---|---|
| I / You / We / They | I have (I've) done | I have not (haven't) done | Have I done? |
| He / She / It | He has (He's) done | He has not (hasn't) done | Has he done? |

**Формула:** S + have/has + V3 (Past Participle)

## Past Participle (V3) — Третья форма глагола

- Правильные глаголы: V + ed (worked, played, studied)
- Неправильные глаголы — нужно учить наизусть:

| V1 | V2 | V3 | Перевод |
|---|---|---|---|
| be | was/were | been | быть |
| do | did | done | делать |
| go | went | gone | идти |
| see | saw | seen | видеть |
| take | took | taken | брать |
| write | wrote | written | писать |
| give | gave | given | давать |
| eat | ate | eaten | есть |
| break | broke | broken | ломать |
| speak | spoke | spoken | говорить |
| buy | bought | bought | покупать |
| make | made | made | делать |
| know | knew | known | знать |
| begin | began | begun | начинать |
| lose | lost | lost | терять |

## Маркеры времени

| Слово | Позиция в предложении | Пример |
|---|---|---|
| just | между have и V3 | I have **just** finished. |
| already | между have и V3 | She has **already** left. |
| yet | в конце (вопрос/отрицание) | Have you finished **yet**? / I haven't finished **yet**. |
| ever | между have и V3 (вопросы) | Have you **ever** been to Japan? |
| never | между have и V3 | I have **never** seen snow. |
| since | + момент начала | since 2015, since Monday |
| for | + период времени | for 3 years, for a long time |
| recently, lately | обычно в конце | I have been busy **recently**. |

## Present Perfect vs Past Simple — главное отличие на ЕНТ!

| Present Perfect | Past Simple |
|---|---|
| Время не указано / неважно | Конкретное время в прошлом |
| I **have been** to London. | I **went** to London **last year**. |
| She **has lost** her bag. | She **lost** her bag **yesterday**. |
| Результат важен сейчас | Факт в прошлом |

**Подсказка:** Если в предложении есть yesterday, last week, ago, in 2005, when — используйте Past Simple, а НЕ Present Perfect!

## Частые ошибки на ЕНТ

1. ✗ I have seen him yesterday. → ✓ I saw him yesterday. (yesterday → Past Simple)
2. ✗ She has went home. → ✓ She has gone home. (V3 от go = gone, не went)
3. ✗ Have you ever went to Paris? → ✓ Have you ever been to Paris? (been, не went)`,
        keyFormulas: [
          { formula: 'S + have/has + V3', name: 'Утверждение' },
          { formula: 'S + have/has + not + V3', name: 'Отрицание' },
          { formula: 'Have/Has + S + V3?', name: 'Вопрос' },
        ],
        quiz: [
          {
            q: 'I ___ never ___ to Australia.',
            options: [
              'have ... been',
              'has ... been',
              'have ... went',
              'did ... go',
            ],
            correct: 0,
            explanation: 'I → have. Жизненный опыт + never → Present Perfect. V3 от go/be = been.',
          },
          {
            q: 'She ___ just ___ her homework.',
            options: [
              'have ... finish',
              'has ... finished',
              'have ... finished',
              'is ... finishing',
            ],
            correct: 1,
            explanation: 'She → has. "Just" — маркер Present Perfect. has + just + V3 (finished).',
          },
          {
            q: '___ you ever ___ sushi?',
            options: [
              'Have ... eaten',
              'Did ... eat',
              'Has ... eaten',
              'Have ... ate',
            ],
            correct: 0,
            explanation: 'You → Have. "Ever" — маркер Present Perfect. V3 от eat = eaten.',
          },
          {
            q: 'We ___ here since 2018.',
            options: ['live', 'are living', 'have lived', 'lived'],
            correct: 2,
            explanation: '"Since 2018" — маркер Present Perfect (с момента и до сих пор) → have lived.',
          },
          {
            q: 'I ___ my keys. I can\'t find them.',
            options: ['lose', 'losed', 'have lost', 'was losing'],
            correct: 2,
            explanation: 'Результат важен сейчас (не могу найти) → Present Perfect. V3 от lose = lost.',
          },
          {
            q: 'He ___ to London last summer.',
            options: ['has gone', 'has been', 'went', 'goes'],
            correct: 2,
            explanation: '"Last summer" — конкретное время в прошлом → Past Simple → went.',
          },
          {
            q: 'They haven\'t finished the project ___.',
            options: ['already', 'just', 'yet', 'since'],
            correct: 2,
            explanation: '"Yet" используется в отрицательных предложениях и вопросах Present Perfect в конце предложения.',
          },
        ],
      },
    ],
  },

  // ══════════════════════════════════════════════════════════════════════════════
  // МОДУЛЬ 2 — PAST & FUTURE TENSES
  // ══════════════════════════════════════════════════════════════════════════════
  {
    id: 'en2',
    title: 'Времена: Past & Future Tenses',
    topic: 'Past Simple, Past Continuous, Past Perfect, Future forms',
    emoji: '🕰️',
    color: '#7c3aed',
    lessons: [
      // ── Урок 2.1 ──────────────────────────────────────────────────────────────
      {
        id: 'en2-l1',
        title: 'Past Simple & Past Continuous',
        duration: 15,
        theory: `## Past Simple — Прошедшее простое время

**Когда используется:**
- Завершённое действие в прошлом в определённое время: I visited Astana last year.
- Последовательность действий в прошлом: He woke up, brushed his teeth and had breakfast.
- Привычки и состояния в прошлом: She lived in Almaty when she was a child.

## Образование Past Simple

| | Утверждение | Отрицание | Вопрос |
|---|---|---|---|
| Все лица | I/He/They worked | I/He/They did not (didn't) work | Did I/he/they work? |

**Правильные глаголы:** V + ed
- work → worked, play → played
- stop → stopped (CVC — удвоение), study → studied (согл. + y → ied)

**Неправильные глаголы** — V2 (вторая форма):
go → went, see → saw, take → took, buy → bought, make → made, come → came, give → gave, write → wrote, read → read, put → put

**Маркеры:** yesterday, last week/month/year, ago, in 2005, when I was young

---

## Past Continuous — Прошедшее длительное время

**Когда используется:**
- Действие в процессе в определённый момент в прошлом: At 6 p.m. I was watching TV.
- Фон (background) для другого действия: While I was walking, it started to rain.
- Два параллельных действия в прошлом: While she was cooking, he was cleaning.

## Образование Past Continuous

| | Утверждение | Отрицание | Вопрос |
|---|---|---|---|
| I / He / She / It | I was working | I was not (wasn't) working | Was I working? |
| You / We / They | We were working | We were not (weren't) working | Were we working? |

**Формула:** S + was/were + V-ing

**Маркеры:** at 5 o'clock yesterday, at that moment, when, while, all day yesterday

## Past Simple vs Past Continuous — КЛЮЧЕВОЕ ПРАВИЛО для ЕНТ!

Когда **одно действие прервало другое**:
- **Длительное** (фон) → Past Continuous (was/were + V-ing)
- **Короткое** (прерывание) → Past Simple (V2)

**When + Past Simple, Past Continuous** (когда короткое действие прервало длительное):
- When the phone **rang**, I **was taking** a shower.

**While + Past Continuous, Past Simple** (пока длилось одно, произошло другое):
- While I **was sleeping**, someone **knocked** on the door.

**While + Past Continuous, Past Continuous** (два параллельных действия):
- While mum **was cooking**, dad **was reading** a newspaper.

## Частые ошибки

1. ✗ When I came home, she cooked. → ✓ When I came home, she was cooking. (фоновое действие)
2. ✗ I didn't went there. → ✓ I didn't go there. (после did/didn't → V1!)
3. ✗ Did she went? → ✓ Did she go? (после did → V1)`,
        keyFormulas: [
          { formula: 'S + V2 / V-ed', name: 'Past Simple — утверждение' },
          { formula: 'S + did not + V1', name: 'Past Simple — отрицание' },
          { formula: 'S + was/were + V-ing', name: 'Past Continuous' },
          { formula: 'When + Past Simple, + Past Continuous', name: 'Прерывание' },
        ],
        quiz: [
          {
            q: 'When I ___ home, my sister ___ TV.',
            options: [
              'came ... watched',
              'came ... was watching',
              'was coming ... watched',
              'come ... watches',
            ],
            correct: 1,
            explanation: '"When" + короткое действие (came — Past Simple), фоновое длительное (was watching — Past Continuous).',
          },
          {
            q: 'She ___ to Paris last summer.',
            options: ['has gone', 'went', 'was going', 'goes'],
            correct: 1,
            explanation: '"Last summer" — конкретное время в прошлом → Past Simple → went.',
          },
          {
            q: 'While they ___ dinner, the lights ___ out.',
            options: [
              'had ... went',
              'were having ... went',
              'have ... go',
              'had ... go',
            ],
            correct: 1,
            explanation: '"While" + длительное действие (were having — Past Continuous), короткое прерывающее (went — Past Simple).',
          },
          {
            q: 'I ___ my homework and ___ to bed.',
            options: [
              'did ... went',
              'was doing ... was going',
              'did ... was going',
              'do ... go',
            ],
            correct: 0,
            explanation: 'Последовательные действия в прошлом → оба в Past Simple: did, went.',
          },
          {
            q: 'At 8 o\'clock yesterday evening, I ___ a book.',
            options: ['read', 'was reading', 'have read', 'am reading'],
            correct: 1,
            explanation: '"At 8 o\'clock yesterday" — конкретный момент в прошлом, действие было в процессе → Past Continuous.',
          },
          {
            q: '___ you ___ the film yesterday?',
            options: [
              'Did ... see',
              'Did ... saw',
              'Have ... seen',
              'Were ... seeing',
            ],
            correct: 0,
            explanation: '"Yesterday" → Past Simple. Вопрос: Did + S + V1 (see).',
          },
        ],
      },

      // ── Урок 2.2 ──────────────────────────────────────────────────────────────
      {
        id: 'en2-l2',
        title: 'Past Perfect — Предпрошедшее время',
        duration: 15,
        theory: `## Past Perfect — Предпрошедшее время

**Когда используется:**
Past Perfect описывает действие, которое произошло **ДО** другого действия в прошлом. Это «прошлое в прошлом».

- When I arrived at the station, the train **had already left**. (Поезд уехал ДО моего прихода.)
- She told me that she **had finished** the project. (Закончила ДО того, как сказала.)
- By the time we got there, the movie **had started**. (Фильм начался ДО нашего прихода.)

## Образование

| | Утверждение | Отрицание | Вопрос |
|---|---|---|---|
| Все лица | I/He/They had (I'd) worked | I had not (hadn't) worked | Had I worked? |

**Формула:** S + had + V3 (Past Participle)

## Маркеры времени

| Маркер | Пример |
|---|---|
| by the time | By the time I woke up, she had left. |
| before | I had eaten before she came. |
| after | After he had finished, he went home. |
| already | The bus had already gone when I arrived. |
| when | When I called him, he had already heard the news. |
| by + время | By 6 p.m. they had cooked dinner. |
| never ... before | I had never seen such a big city before. |

## Past Perfect vs Past Simple — Правило двух действий

Если два действия в прошлом — какое произошло ПЕРВЫМ?

**Первое действие → Past Perfect (had + V3)**
**Второе действие → Past Simple (V2)**

Пример:
- After she **had read** the book (1-е), she **returned** it to the library (2-е).
- When we **arrived** (2-е) at the cinema, the film **had already started** (1-е).

## Когда Past Perfect НЕ нужен

Если действия идут **в хронологическом порядке** и связаны словами and, then, after that — достаточно Past Simple:
- I came home, had dinner **and** watched TV. (последовательность — всё Past Simple)

Past Perfect нужен, когда порядок в предложении **обратный** хронологическому:
- I **wasn't** hungry because I **had had** lunch. (сначала обед, потом не был голоден)

## Частые ошибки на ЕНТ

1. ✗ After he finished, he had gone home. → ✓ After he had finished, he went home. (первое действие — had finished)
2. ✗ When I arrived, the train left. → ✓ When I arrived, the train had already left. (поезд уехал ДО прихода)
3. ✗ She had went to school. → ✓ She had gone to school. (V3 от go = gone)`,
        keyFormulas: [
          { formula: 'S + had + V3', name: 'Past Perfect — утверждение' },
          { formula: 'S + had + not + V3', name: 'Past Perfect — отрицание' },
          { formula: 'Had + S + V3?', name: 'Past Perfect — вопрос' },
        ],
        quiz: [
          {
            q: 'When I got to the party, everyone ___.',
            options: ['left', 'has left', 'had left', 'was leaving'],
            correct: 2,
            explanation: 'Действие (все ушли) произошло ДО другого действия в прошлом (я пришёл) → Past Perfect: had left.',
          },
          {
            q: 'After she ___ the letter, she posted it.',
            options: ['wrote', 'had written', 'has written', 'was writing'],
            correct: 1,
            explanation: '"After" + первое действие → Past Perfect (had written), второе → Past Simple (posted).',
          },
          {
            q: 'By the time we arrived, the concert ___.',
            options: ['started', 'has started', 'had started', 'starts'],
            correct: 2,
            explanation: '"By the time" — маркер Past Perfect. Концерт начался ДО нашего прихода → had started.',
          },
          {
            q: 'I was not hungry because I ___ lunch.',
            options: ['have had', 'had had', 'had', 'was having'],
            correct: 1,
            explanation: 'Обед (had had) произошёл ДО того, как я не был голоден → Past Perfect.',
          },
          {
            q: 'She told me she ___ the film before.',
            options: ['saw', 'has seen', 'had seen', 'sees'],
            correct: 2,
            explanation: 'Она видела фильм (had seen) ДО того момента, когда сказала мне (told) → Past Perfect.',
          },
          {
            q: 'Choose the correct sentence:',
            options: [
              'When he arrived, she already cooked dinner.',
              'When he arrived, she had already cooked dinner.',
              'When he arrived, she has already cooked dinner.',
              'When he had arrived, she had already cooked dinner.',
            ],
            correct: 1,
            explanation: 'Первое действие (cooked — had cooked, Past Perfect), второе (arrived — Past Simple).',
          },
        ],
      },

      // ── Урок 2.3 ──────────────────────────────────────────────────────────────
      {
        id: 'en2-l3',
        title: 'Future Tenses — Будущее время',
        duration: 15,
        theory: `## Future Simple — Будущее простое время

**Формула:** S + will + V1

**Когда используется:**
- Спонтанные решения в момент речи: I'll help you! (решил прямо сейчас)
- Предсказания, основанные на мнении: I think it will rain tomorrow.
- Обещания: I will call you tonight.
- Предложения: Shall I open the window?

| | Утверждение | Отрицание | Вопрос |
|---|---|---|---|
| Все лица | I will (I'll) work | I will not (won't) work | Will I work? |

**Маркеры:** tomorrow, next week, in 2030, I think/hope/believe, probably, perhaps

---

## "Be going to" — Собираться что-то сделать

**Формула:** S + am/is/are + going to + V1

**Когда используется:**
- Заранее запланированные действия: I am going to visit my grandma this weekend. (уже решено)
- Предсказания, основанные на очевидных признаках: Look at the clouds! It is going to rain. (видно, что будет дождь)

---

## Will vs Going to — ВАЖНО для ЕНТ!

| Will | Be going to |
|---|---|
| Спонтанное решение | Запланированное решение |
| The phone is ringing. — I**'ll** answer it! | I**'m going to** buy a car next month. (уже решил) |
| Мнение/предположение | Очевидные признаки |
| I **think** she **will** pass the exam. | Look! He **is going to** fall! (видно) |

---

## Future Continuous — Будущее длительное

**Формула:** S + will be + V-ing

**Когда:** Действие будет в процессе в определённый момент в будущем.
- At 8 p.m. tomorrow, I **will be studying** English.
- This time next week, we **will be lying** on the beach.

---

## Future Perfect — Будущее совершённое

**Формула:** S + will have + V3

**Когда:** Действие будет завершено К определённому моменту в будущем.
- By next Friday, I **will have finished** my project.
- By 2030, they **will have built** a new school.

**Маркер:** by + время в будущем (by tomorrow, by next year, by the time...)

---

## Сводная таблица Future Tenses

| Время | Формула | Пример |
|---|---|---|
| Future Simple | will + V1 | I will help you. |
| Be going to | am/is/are + going to + V1 | She is going to travel. |
| Future Continuous | will be + V-ing | I will be working at 5. |
| Future Perfect | will have + V3 | I will have finished by 6. |

## Запомните: Present для будущего!

- **Present Simple** — для расписаний: The plane **takes off** at 9 a.m.
- **Present Continuous** — для личных планов: I **am meeting** John tonight.

## Частые ошибки

1. ✗ I will going to help. → ✓ I will help / I am going to help (не смешивать!)
2. ✗ I think it is going to rain (без визуальных признаков). → ✓ I think it will rain.
3. ✗ By next year I will finish. → ✓ By next year I will have finished. (by + Future Perfect)`,
        keyFormulas: [
          { formula: 'S + will + V1', name: 'Future Simple' },
          { formula: 'S + am/is/are + going to + V1', name: 'Be going to' },
          { formula: 'S + will be + V-ing', name: 'Future Continuous' },
          { formula: 'S + will have + V3', name: 'Future Perfect' },
        ],
        quiz: [
          {
            q: '"The phone is ringing!" — "I ___ it!"',
            options: [
              'answer',
              "'m going to answer",
              "'ll answer",
              'am answering',
            ],
            correct: 2,
            explanation: 'Спонтанное решение в момент речи → will (\'ll) + V1.',
          },
          {
            q: 'Look at those dark clouds! It ___.',
            options: [
              'will rain',
              'is going to rain',
              'rains',
              'is raining',
            ],
            correct: 1,
            explanation: 'Предсказание на основе очевидных признаков (тёмные тучи) → be going to.',
          },
          {
            q: 'By next December, she ___ from university.',
            options: [
              'will graduate',
              'will have graduated',
              'graduates',
              'is graduating',
            ],
            correct: 1,
            explanation: '"By next December" — к определённому моменту в будущем → Future Perfect (will have + V3).',
          },
          {
            q: 'This time tomorrow, I ___ on the beach.',
            options: [
              'will lie',
              'will be lying',
              'am lying',
              'lie',
            ],
            correct: 1,
            explanation: '"This time tomorrow" — действие будет в процессе в конкретный момент → Future Continuous (will be + V-ing).',
          },
          {
            q: 'I ___ buy a new laptop. I\'ve already saved enough money.',
            options: [
              'will',
              'am going to',
              'shall',
              'am going',
            ],
            correct: 1,
            explanation: 'Заранее принятое решение (уже накопил деньги) → be going to.',
          },
          {
            q: 'I think Brazil ___ the World Cup.',
            options: [
              'is going to win',
              'will win',
              'wins',
              'is winning',
            ],
            correct: 1,
            explanation: '"I think" — личное мнение/предсказание → will + V1.',
          },
          {
            q: 'The train ___ at 6:15 a.m. tomorrow. (schedule)',
            options: [
              'will leave',
              'is going to leave',
              'leaves',
              'is leaving',
            ],
            correct: 2,
            explanation: 'Расписание (schedule) → Present Simple даже для будущего: leaves.',
          },
        ],
      },
    ],
  },

  // ══════════════════════════════════════════════════════════════════════════════
  // МОДУЛЬ 3 — МОДАЛЬНЫЕ ГЛАГОЛЫ И ПАССИВНЫЙ ЗАЛОГ
  // ══════════════════════════════════════════════════════════════════════════════
  {
    id: 'en3',
    title: 'Modal Verbs & Passive Voice',
    topic: 'Модальные глаголы, пассивный залог, косвенная речь',
    emoji: '🔑',
    color: '#dc2626',
    lessons: [
      // ── Урок 3.1 ──────────────────────────────────────────────────────────────
      {
        id: 'en3-l1',
        title: 'Modal Verbs — Модальные глаголы',
        duration: 15,
        theory: `## Modal Verbs — Модальные глаголы

Модальные глаголы выражают **возможность, способность, разрешение, необходимость, совет, запрет**. Они не изменяются по лицам и не принимают окончание -s.

**Общие правила:**
- После модального глагола стоит **V1 без "to"** (кроме ought to, have to)
- Не имеют формы -ing, -ed
- Вопрос: модальный глагол выносится вперёд: Can you swim?
- Отрицание: модальный + not: You must not (mustn't) do this.

## Таблица модальных глаголов

| Глагол | Значение | Пример |
|---|---|---|
| **can** | Способность / разрешение (настоящее) | I **can** swim. / **Can** I go? |
| **could** | Способность в прошлом / вежливая просьба | She **could** read at 4. / **Could** you help me? |
| **may** | Разрешение (формальное) / вероятность | **May** I come in? / It **may** rain. |
| **might** | Небольшая вероятность | She **might** be late. (возможно) |
| **must** | Обязанность / уверенность | You **must** wear a uniform. / He **must** be tired. |
| **mustn't** | Запрет | You **mustn't** smoke here. |
| **should** | Совет | You **should** study harder. |
| **ought to** | Совет (более формальный) | You **ought to** apologize. |
| **have to** | Необходимость (внешняя) | I **have to** get up early. (правило/закон) |
| **don't have to** | Необязательно (нет необходимости) | You **don't have to** come. (не обязан) |

## Must vs Have to — ВАЖНО!

| Must | Have to |
|---|---|
| Внутреннее убеждение говорящего | Внешние обстоятельства, правила |
| I **must** study! (сам решил) | I **have to** wear a uniform. (школьное правило) |

**Отрицание — ОГРОМНАЯ разница:**
| Mustn't | Don't have to |
|---|---|
| **Запрет!** Нельзя! | **Не обязан.** Но можно. |
| You **mustn't** park here. (запрещено) | You **don't have to** wait. (не обязательно) |

## Can vs Could vs Be able to

- **Can** — настоящее время: I can drive.
- **Could** — прошедшее время: I could swim when I was 5.
- **Be able to** — заменяет can/could в других временах:
  - Future: I **will be able to** help you tomorrow.
  - Present Perfect: She **has been able to** solve the problem.

## Модальные глаголы для предположений (Deduction)

| Уверенность | Глагол | Пример |
|---|---|---|
| 100% уверен | must | He **must** be at home. (наверняка дома) |
| Возможно | may / might / could | She **may** be busy. (возможно занята) |
| Точно нет | can't | It **can't** be true! (не может быть!) |

## Частые ошибки на ЕНТ

1. ✗ She can to swim. → ✓ She can swim. (без to!)
2. ✗ He musts go. → ✓ He must go. (без -s!)
3. ✗ You mustn't come tomorrow. (если имеется в виду "не обязан") → ✓ You don't have to come tomorrow.`,
        keyFormulas: [
          { formula: 'Modal + V1 (без to)', name: 'Общая формула' },
          { formula: 'must = внутренняя необходимость', name: 'Must' },
          { formula: 'have to = внешняя необходимость', name: 'Have to' },
          { formula: "mustn't = запрет, don't have to = необязательно", name: 'Отрицания' },
        ],
        quiz: [
          {
            q: 'You ___ drive without a license. It\'s against the law.',
            options: ["don't have to", "mustn't", "shouldn't", "might not"],
            correct: 1,
            explanation: 'Запрет (against the law) → mustn\'t.',
          },
          {
            q: 'You ___ wear a tie. It\'s optional.',
            options: ["mustn't", "can't", "don't have to", "shouldn't"],
            correct: 2,
            explanation: 'Необязательно (optional) → don\'t have to.',
          },
          {
            q: 'She ___ play the piano when she was six.',
            options: ['can', 'could', 'may', 'must'],
            correct: 1,
            explanation: 'Способность в прошлом (when she was six) → could.',
          },
          {
            q: 'He\'s been working all day. He ___ be very tired.',
            options: ['can', 'must', 'might not', 'should'],
            correct: 1,
            explanation: 'Логический вывод с высокой уверенностью (работал весь день) → must be.',
          },
          {
            q: 'You ___ study harder if you want to pass the exam.',
            options: ['mustn\'t', 'can', 'should', 'might'],
            correct: 2,
            explanation: 'Совет → should.',
          },
          {
            q: '___ I use your phone, please?',
            options: ['Will', 'Must', 'Should', 'May'],
            correct: 3,
            explanation: 'Вежливая просьба о разрешении → May I...?',
          },
          {
            q: 'That ___ be Sarah. She\'s in London now.',
            options: ["must", "can't", "might", "should"],
            correct: 1,
            explanation: 'Уверенность, что это НЕ она (она в Лондоне) → can\'t be.',
          },
        ],
      },

      // ── Урок 3.2 ──────────────────────────────────────────────────────────────
      {
        id: 'en3-l2',
        title: 'Passive Voice — Пассивный (страдательный) залог',
        duration: 15,
        theory: `## Passive Voice — Пассивный (страдательный) залог

**Когда используется:**
- Когда важно не КТО делает, а ЧТО делается: The letter **was sent** yesterday.
- Когда неизвестно, кто выполняет действие: My bike **was stolen**.
- В формальных, научных и новостных текстах: The experiment **was conducted** in 2023.

## Формула Passive Voice

**S + to be (в нужном времени) + V3 (Past Participle)**

Если нужно указать, кто выполнил действие → **by + agent**:
The book was written **by** J.K. Rowling.

## Passive Voice во всех временах

| Время | Active | Passive (to be + V3) |
|---|---|---|
| Present Simple | They clean the room. | The room **is cleaned**. |
| Past Simple | They cleaned the room. | The room **was cleaned**. |
| Future Simple | They will clean the room. | The room **will be cleaned**. |
| Present Continuous | They are cleaning the room. | The room **is being cleaned**. |
| Past Continuous | They were cleaning the room. | The room **was being cleaned**. |
| Present Perfect | They have cleaned the room. | The room **has been cleaned**. |
| Past Perfect | They had cleaned the room. | The room **had been cleaned**. |
| Modal verbs | They must clean the room. | The room **must be cleaned**. |

## Как перевести Active → Passive (алгоритм)

1. Объект Active становится подлежащим Passive
2. Глагол → to be (в нужном времени) + V3
3. Подлежащее Active → by + agent (или опускается)

**Active:** Tom **wrote** the letter.
**Passive:** The letter **was written** by Tom.

**Active:** They **are building** a new school.
**Passive:** A new school **is being built**.

## Passive с модальными глаголами

**Формула: modal + be + V3**

- This work **must be done** by Friday.
- The windows **should be cleaned** every week.
- The project **can be finished** in time.

## Двойной Passive (verbs with two objects)

Некоторые глаголы имеют два объекта (give, send, show, tell, offer, teach):
- Active: They **gave** me a book.
- Passive 1: I **was given** a book. (чаще на ЕНТ)
- Passive 2: A book **was given** to me.

## Частые ошибки на ЕНТ

1. ✗ The letter sent yesterday. → ✓ The letter **was sent** yesterday. (нужен to be!)
2. ✗ The room is clean every day. → ✓ The room is **cleaned** every day. (V3, не прилагательное)
3. ✗ English is speak all over the world. → ✓ English is **spoken** all over the world. (V3 от speak = spoken)
4. ✗ The house was build in 1990. → ✓ The house was **built** in 1990. (V3 от build = built)`,
        keyFormulas: [
          { formula: 'S + to be + V3', name: 'Passive Voice — общая формула' },
          { formula: 'is/are + V3', name: 'Present Simple Passive' },
          { formula: 'was/were + V3', name: 'Past Simple Passive' },
          { formula: 'will be + V3', name: 'Future Simple Passive' },
          { formula: 'modal + be + V3', name: 'Passive с модальными' },
        ],
        quiz: [
          {
            q: 'This book ___ by Mark Twain.',
            options: ['wrote', 'was written', 'is written', 'has written'],
            correct: 1,
            explanation: 'Книга была написана (в прошлом) → Past Simple Passive: was written.',
          },
          {
            q: 'English ___ all over the world.',
            options: ['speaks', 'is speaking', 'is spoken', 'has spoken'],
            correct: 2,
            explanation: 'Общий факт в Passive → Present Simple Passive: is spoken.',
          },
          {
            q: 'The new hospital ___ next year.',
            options: ['will build', 'will be built', 'is building', 'builds'],
            correct: 1,
            explanation: 'Будущее + Passive → Future Simple Passive: will be built.',
          },
          {
            q: 'The room ___ now. Please wait.',
            options: ['is cleaned', 'is being cleaned', 'was cleaned', 'cleans'],
            correct: 1,
            explanation: 'Прямо сейчас (now) + Passive → Present Continuous Passive: is being cleaned.',
          },
          {
            q: 'The homework must ___ by tomorrow.',
            options: ['do', 'to do', 'be done', 'been done'],
            correct: 2,
            explanation: 'Modal + Passive: must + be + V3 → must be done.',
          },
          {
            q: 'She ___ a prize at the ceremony last night.',
            options: ['was given', 'gave', 'is given', 'has given'],
            correct: 0,
            explanation: 'Она получила (ей дали) приз → Passive, "last night" → Past Simple: was given.',
          },
        ],
      },

      // ── Урок 3.3 ──────────────────────────────────────────────────────────────
      {
        id: 'en3-l3',
        title: 'Reported Speech — Косвенная речь',
        duration: 15,
        theory: `## Reported Speech — Косвенная речь

Косвенная речь — это пересказ чужих слов. При переводе из прямой речи в косвенную происходят изменения:

## Правило согласования времён (Sequence of Tenses)

Если глагол-вводитель (said, told) стоит в **прошедшем времени**, времена в косвенной речи сдвигаются на один шаг назад:

| Прямая речь | Косвенная речь |
|---|---|
| Present Simple → | Past Simple |
| "I **work** here." | He said he **worked** there. |
| Present Continuous → | Past Continuous |
| "I **am working**." | He said he **was working**. |
| Present Perfect → | Past Perfect |
| "I **have finished**." | He said he **had finished**. |
| Past Simple → | Past Perfect |
| "I **bought** a car." | He said he **had bought** a car. |
| Will → | Would |
| "I **will** help." | He said he **would** help. |
| Can → | Could |
| "I **can** swim." | He said he **could** swim. |
| May → | Might |
| "I **may** come." | He said he **might** come. |

**Не изменяются:** could, would, should, might, must (в значении совета), Past Perfect, ought to

## Изменение местоимений и указателей

| Прямая речь | Косвенная речь |
|---|---|
| I, me, my | he/she, him/her, his/her |
| we, us, our | they, them, their |
| you, your | I/he/she/they (по контексту) |
| this | that |
| these | those |
| here | there |
| now | then |
| today | that day |
| yesterday | the day before / the previous day |
| tomorrow | the next day / the following day |
| ago | before |
| last week | the week before / the previous week |

## Типы предложений в Reported Speech

### 1. Утверждения (Statements)
Вводятся глаголами: said, told, explained, mentioned + **that** (можно опустить)

- "I am tired." → She **said (that)** she **was** tired.
- "We have finished." → They **told** me (that) they **had finished**.

**Важно:** said (без объекта) vs told (+ кому): He said... / He told **me**...

### 2. Вопросы (Questions)

**Общие вопросы (Yes/No)** → if / whether + прямой порядок слов:
- "Do you like coffee?" → He asked me **if** I **liked** coffee.
- "Can you help?" → She asked **whether** I **could** help.

**Специальные вопросы (Wh-)** → wh-word + прямой порядок слов:
- "Where do you live?" → He asked me **where** I **lived**.
- "What time is it?" → She asked **what time** it **was**.

**ВАЖНО:** В косвенном вопросе порядок слов **ПРЯМОЙ** (S + V), а НЕ вопросительный!
✗ He asked where did I live. → ✓ He asked where I lived.

### 3. Приказы и просьбы (Commands / Requests)
told / asked / ordered / advised + объект + **to + V1** (или **not to + V1**)

- "Open the door!" → He **told** me **to open** the door.
- "Don't touch it!" → She **told** me **not to touch** it.
- "Please help me." → She **asked** me **to help** her.

## Частые ошибки на ЕНТ

1. ✗ He asked where do I live. → ✓ He asked where I lived. (прямой порядок слов!)
2. ✗ She said me that... → ✓ She told me that... / She said that...
3. ✗ He told that... → ✓ He said that... / He told me that...`,
        keyFormulas: [
          { formula: 'S + said (that) + clause (время -1 шаг)', name: 'Утверждения' },
          { formula: 'S + asked + if/whether + S + V', name: 'Общие вопросы' },
          { formula: 'S + asked + wh-word + S + V', name: 'Специальные вопросы' },
          { formula: 'S + told + obj + (not) to + V1', name: 'Приказы/просьбы' },
        ],
        quiz: [
          {
            q: '"I am a doctor," he said. → He said that he ___ a doctor.',
            options: ['is', 'was', 'were', 'has been'],
            correct: 1,
            explanation: 'Present Simple (am) → Past Simple (was) при переводе в косвенную речь.',
          },
          {
            q: '"Where do you live?" she asked. → She asked me where I ___.',
            options: ['live', 'lived', 'do live', 'did live'],
            correct: 1,
            explanation: 'Present Simple → Past Simple. Прямой порядок слов: where I lived.',
          },
          {
            q: '"I will call you tomorrow," he said. → He said he ___ call me ___.',
            options: [
              'will ... tomorrow',
              'would ... the next day',
              'will ... the next day',
              'would ... tomorrow',
            ],
            correct: 1,
            explanation: 'will → would, tomorrow → the next day.',
          },
          {
            q: '"Don\'t open the window!" the teacher said. → The teacher told us ___.',
            options: [
              'don\'t open the window',
              'to not open the window',
              'not to open the window',
              'that not open the window',
            ],
            correct: 2,
            explanation: 'Приказ/запрет → told + object + not to + V1.',
          },
          {
            q: '"Have you ever been to London?" he asked. → He asked me ___ to London.',
            options: [
              'have I ever been',
              'if I had ever been',
              'had I ever been',
              'whether have I been',
            ],
            correct: 1,
            explanation: 'Yes/No вопрос → if/whether + прямой порядок слов. have been → had been.',
          },
          {
            q: 'She said, "I can\'t come today." → She said she ___ come ___.',
            options: [
              "can't ... today",
              "couldn't ... today",
              "couldn't ... that day",
              "can't ... that day",
            ],
            correct: 2,
            explanation: "can't → couldn't, today → that day.",
          },
        ],
      },
    ],
  },

  // ══════════════════════════════════════════════════════════════════════════════
  // МОДУЛЬ 4 — CONDITIONALS AND WISHES
  // ══════════════════════════════════════════════════════════════════════════════
  {
    id: 'en4',
    title: 'Conditionals & Wishes',
    topic: 'Условные предложения и конструкции с wish',
    emoji: '🔮',
    color: '#059669',
    lessons: [
      // ── Урок 4.1 ──────────────────────────────────────────────────────────────
      {
        id: 'en4-l1',
        title: 'Zero & First Conditional — Реальные условия',
        duration: 15,
        theory: `## Conditional Sentences — Условные предложения

Условные предложения состоят из двух частей:
- **If-clause** (условие) — придаточное предложение с if
- **Main clause** (результат) — главное предложение

Порядок может быть любым:
- **If** it rains, I will stay home.
- I will stay home **if** it rains.

(Запятая ставится, если if-clause стоит первым.)

---

## Zero Conditional — Нулевое условное

**Когда используется:**
- Общие истины, научные факты, законы природы
- То, что ВСЕГДА верно при выполнении условия

**Формула:** If + Present Simple, Present Simple

| If-clause | Main clause |
|---|---|
| If you heat water to 100°C, | it boils. |
| If it rains, | the ground gets wet. |
| If you mix red and yellow, | you get orange. |

**Можно заменить "if" на "when"** (так как результат всегда один):
- **When** you freeze water, it turns into ice.

---

## First Conditional — Первое условное

**Когда используется:**
- Реальные, возможные ситуации в будущем
- Ситуации, которые могут произойти

**Формула:** If + Present Simple, will + V1

| If-clause | Main clause |
|---|---|
| If it rains tomorrow, | I will stay home. |
| If you study hard, | you will pass the exam. |
| If she doesn't hurry, | she will be late. |

**ВАЖНО!** В if-clause **НИКОГДА не ставится will!**
✗ If it **will** rain... → ✓ If it **rains**...

**Вариации First Conditional:**

| If-clause | Main clause | Значение |
|---|---|---|
| If + Present Simple | will + V1 | Результат |
| If + Present Simple | can + V1 | Возможность |
| If + Present Simple | may + V1 | Вероятность |
| If + Present Simple | should + V1 | Совет |
| If + Present Simple | must + V1 | Обязанность |
| If + Present Simple | imperative (V1!) | Приказ/совет |

**Примеры:**
- If you finish early, you **can** leave. (возможность)
- If it rains, **take** an umbrella. (совет-приказ)
- If you feel ill, you **should** see a doctor. (совет)

## Unless = If ... not

**Unless** = если не (отрицательное условие):
- **Unless** you hurry, you will be late. = **If** you **don't** hurry, you will be late.
- I won't go **unless** you come with me. = I won't go **if** you **don't** come with me.

**Внимание:** после unless НЕ ставится отрицание!
✗ Unless you don't hurry → ✓ Unless you hurry

## Частые ошибки на ЕНТ

1. ✗ If it will rain, I will stay. → ✓ If it rains, I will stay.
2. ✗ Unless you don't study... → ✓ Unless you study...
3. Путаница Zero и First: Zero — всегда верно, First — конкретная ситуация в будущем.`,
        keyFormulas: [
          { formula: 'If + Present Simple, Present Simple', name: 'Zero Conditional' },
          { formula: 'If + Present Simple, will + V1', name: 'First Conditional' },
          { formula: 'Unless = If ... not', name: 'Unless' },
        ],
        quiz: [
          {
            q: 'If you heat ice, it ___.',
            options: ['will melt', 'melts', 'melted', 'would melt'],
            correct: 1,
            explanation: 'Научный факт (всегда верно) → Zero Conditional: If + Present Simple, Present Simple.',
          },
          {
            q: 'If it ___ tomorrow, we will cancel the picnic.',
            options: ['will rain', 'rains', 'rained', 'would rain'],
            correct: 1,
            explanation: 'First Conditional: If + Present Simple (NOT will!), will + V1.',
          },
          {
            q: '___ you study hard, you will fail the exam.',
            options: ['If', 'Unless', 'When', 'While'],
            correct: 1,
            explanation: 'Unless = If not. "Если ты НЕ будешь учиться, ты провалишь" → Unless you study.',
          },
          {
            q: 'If she ___ the bus, she will be late for work.',
            options: ['will miss', 'misses', 'missed', 'would miss'],
            correct: 1,
            explanation: 'First Conditional: If + Present Simple → misses (she — 3-е лицо).',
          },
          {
            q: 'If you mix blue and yellow, you ___ green.',
            options: ['will get', 'get', 'would get', 'got'],
            correct: 1,
            explanation: 'Факт (смешение цветов) → Zero Conditional: If + Present Simple, Present Simple → get.',
          },
          {
            q: 'I\'ll lend you my book if you ___ it back tomorrow.',
            options: ['bring', 'will bring', 'brought', 'would bring'],
            correct: 0,
            explanation: 'After "if" in First Conditional, use Present Simple: if you bring.',
          },
        ],
      },

      // ── Урок 4.2 ──────────────────────────────────────────────────────────────
      {
        id: 'en4-l2',
        title: 'Second Conditional — Нереальные условия в настоящем',
        duration: 15,
        theory: `## Second Conditional — Второе условное

**Когда используется:**
- Воображаемые, нереальные ситуации в настоящем или будущем
- Ситуации, противоречащие реальности
- Маловероятные события
- Советы: "If I were you..."

**Формула:** If + Past Simple, would + V1

| If-clause | Main clause |
|---|---|
| If I **had** a million dollars, | I **would buy** a house. |
| If she **spoke** English, | she **would get** a better job. |
| If I **were** you, | I **would study** harder. |

**ВАЖНО:** В формальном английском после I/he/she/it используется **were** (не was):
- If I **were** rich... (formal, предпочтительно на ЕНТ)
- If he **were** here... (formal)
- If I **was** rich... (разговорный, допустимо)

## Second vs First Conditional — КЛЮЧЕВОЕ РАЗЛИЧИЕ

| First Conditional (реальное) | Second Conditional (нереальное) |
|---|---|
| Реальная возможность | Воображаемая ситуация |
| If I **have** time, I **will** help. | If I **had** time, I **would** help. |
| (У меня может быть время) | (У меня нет времени — мечтаю) |
| If she **studies**, she **will** pass. | If she **studied**, she **would** pass. |
| (Она может начать учиться) | (Она не учится — нереально) |

**Подсказка:** Если ситуация возможна → First. Если невозможна/маловероятна → Second.

## Вариации с модальными глаголами

В main clause вместо would можно использовать:
- **could** (мог бы): If I had wings, I **could** fly.
- **might** (мог бы, возможно): If we left now, we **might** arrive on time.

## Выражение совета: "If I were you..."

Это одна из самых частых конструкций на ЕНТ:
- **If I were you**, I **would** apologize. (На твоём месте я бы извинился.)
- **If I were you**, I **wouldn't** go there. (Я бы на твоём месте не ходил туда.)

Синоним: I **would** + V1 **if I were you**.

## Устойчивые выражения с Second Conditional

- If I **were** in your shoes, I would... (На твоём месте...)
- What **would** you do if...? (Что бы ты сделал, если бы...?)
- I **wish** I could... = If only I **could**... (Хотел бы я...)

## Частые ошибки на ЕНТ

1. ✗ If I would have more time... → ✓ If I had more time... (в if-clause НЕ ставится would!)
2. ✗ If I was you... → ✓ If I were you... (на ЕНТ предпочтительна формальная форма were)
3. ✗ If she will study, she would pass. → ✓ If she studied, she would pass. (нельзя смешивать 1st и 2nd!)`,
        keyFormulas: [
          { formula: 'If + Past Simple, would + V1', name: 'Second Conditional' },
          { formula: 'If I were you, I would + V1', name: 'Совет' },
        ],
        quiz: [
          {
            q: 'If I ___ rich, I would travel around the world.',
            options: ['am', 'was', 'were', 'will be'],
            correct: 2,
            explanation: 'Second Conditional: If + Past Simple. С "I" формально правильно "were".',
          },
          {
            q: 'If I were you, I ___ harder for the exam.',
            options: ['study', 'will study', 'would study', 'studied'],
            correct: 2,
            explanation: '"If I were you" — совет через Second Conditional → I would study.',
          },
          {
            q: 'What ___ you do if you ___ a million dollars?',
            options: [
              'will ... win',
              'would ... won',
              'will ... won',
              'would ... win',
            ],
            correct: 1,
            explanation: 'Нереальная ситуация → Second Conditional: would + V1, if + Past Simple (won).',
          },
          {
            q: 'If she ___ English, she ___ get a better job.',
            options: [
              'speaks ... will',
              'spoke ... would',
              'speaks ... would',
              'spoke ... will',
            ],
            correct: 1,
            explanation: 'Она не говорит по-английски (нереально) → Second: If + spoke, would + get.',
          },
          {
            q: 'I ___ buy that car if it ___ so expensive.',
            options: [
              "would ... wasn't",
              "would ... weren't",
              "will ... isn't",
              "would ... isn't",
            ],
            correct: 1,
            explanation: "Second Conditional: would + buy, if + weren't (формально). Машина дорогая — нереальное условие.",
          },
          {
            q: 'If they ___ us, we could start the project.',
            options: ['help', 'helped', 'will help', 'would help'],
            correct: 1,
            explanation: 'Second Conditional: If + Past Simple (helped), could + V1.',
          },
        ],
      },

      // ── Урок 4.3 ──────────────────────────────────────────────────────────────
      {
        id: 'en4-l3',
        title: 'Third Conditional, Mixed Conditionals & I wish',
        duration: 18,
        theory: `## Third Conditional — Третье условное

**Когда используется:**
- Нереальные условия в ПРОШЛОМ (то, что уже не произошло)
- Сожаление о прошлом: "Если бы я знал тогда..."

**Формула:** If + Past Perfect, would have + V3

| If-clause | Main clause |
|---|---|
| If I **had studied** harder, | I **would have passed** the exam. |
| If she **hadn't missed** the bus, | she **wouldn't have been** late. |
| If we **had known** about it, | we **would have helped**. |

**Перевод:** «Если бы + прошедшее совершённое, то + бы + прошедшее совершённое»

---

## Mixed Conditionals — Смешанные условные

### Тип 1: Past condition → Present result
If + Past Perfect, would + V1

- If I **had studied** medicine (прошлое), I **would be** a doctor now (настоящее).
- If she **hadn't moved** to Almaty, she **would still live** in Astana.

### Тип 2: Present condition → Past result
If + Past Simple, would have + V3

- If I **were** braver (настоящее), I **would have asked** her out (прошлое).
- If he **spoke** English, he **would have got** that job.

---

## I wish / If only — Конструкции сожаления

### 1. Wish + Past Simple — сожаление о НАСТОЯЩЕМ

Хочу, чтобы сейчас было иначе (но это не так):
- I **wish** I **had** more free time. (Жаль, что у меня мало свободного времени.)
- I **wish** I **were** taller. (Жаль, что я невысокий.)
- **If only** I **knew** the answer! (Если бы только я знал ответ!)

### 2. Wish + Past Perfect — сожаление о ПРОШЛОМ

Жалею о том, что произошло (или не произошло):
- I **wish** I **had studied** harder. (Жаль, что я не учился усерднее.)
- She **wishes** she **hadn't said** that. (Жаль, что она это сказала.)
- **If only** I **had listened** to you! (Если бы только я тебя послушал!)

### 3. Wish + would — раздражение или желание изменить чужое поведение

Хочу, чтобы кто-то (другой!) изменил поведение:
- I **wish** you **would stop** making noise! (Перестань шуметь!)
- I **wish** it **would stop** raining. (Хотел бы я, чтобы дождь прекратился.)

**ВАЖНО:** Нельзя сказать: ✗ I wish I would... → ✓ I wish I could... (для себя)

---

## Сводная таблица всех Conditionals

| Тип | If-clause | Main clause | Ситуация |
|---|---|---|---|
| Zero | Present Simple | Present Simple | Факт, всегда верно |
| First | Present Simple | will + V1 | Реальное будущее |
| Second | Past Simple | would + V1 | Нереальное настоящее |
| Third | Past Perfect | would have + V3 | Нереальное прошлое |

## Частые ошибки на ЕНТ

1. ✗ If I would have known... → ✓ If I had known... (в if-clause нет would!)
2. ✗ I wish I have more time. → ✓ I wish I had more time. (wish + Past Simple!)
3. ✗ If I had studied, I would pass. → Depends on meaning! Check: past+present (mixed) or past+past (third)?`,
        keyFormulas: [
          { formula: 'If + Past Perfect, would have + V3', name: 'Third Conditional' },
          { formula: 'I wish + Past Simple', name: 'Сожаление о настоящем' },
          { formula: 'I wish + Past Perfect', name: 'Сожаление о прошлом' },
          { formula: 'I wish + would + V1', name: 'Желание изменить поведение' },
        ],
        quiz: [
          {
            q: 'If I ___ about the party, I would have come.',
            options: ['know', 'knew', 'had known', 'would know'],
            correct: 2,
            explanation: 'Third Conditional: If + Past Perfect (had known), would have + V3.',
          },
          {
            q: 'I wish I ___ taller.',
            options: ['am', 'was', 'were', 'will be'],
            correct: 2,
            explanation: 'Wish + Past Simple для сожаления о настоящем. С I формально — were.',
          },
          {
            q: 'If she had taken the medicine, she ___ better now.',
            options: [
              'would feel',
              'would have felt',
              'will feel',
              'feels',
            ],
            correct: 0,
            explanation: 'Mixed Conditional: If + Past Perfect (past), would + V1 (present result).',
          },
          {
            q: 'I wish I ___ so much money last month.',
            options: [
              "didn't spend",
              "don't spend",
              "hadn't spent",
              "wouldn't spend",
            ],
            correct: 2,
            explanation: 'Сожаление о ПРОШЛОМ → Wish + Past Perfect: hadn\'t spent.',
          },
          {
            q: 'If I had studied harder, I ___ the exam.',
            options: [
              'would pass',
              'will pass',
              'would have passed',
              'passed',
            ],
            correct: 2,
            explanation: 'Third Conditional: If + Past Perfect, would have + V3 (passed).',
          },
          {
            q: 'I wish you ___ making that noise! It\'s so annoying!',
            options: ['stop', 'stopped', 'would stop', 'had stopped'],
            correct: 2,
            explanation: 'Wish + would — раздражение, желание изменить чужое поведение → would stop.',
          },
          {
            q: 'If he ___ English well, he would have got that job last year.',
            options: ['speaks', 'spoke', 'had spoken', 'would speak'],
            correct: 1,
            explanation: 'Mixed Conditional (type 2): If + Past Simple (present condition = spoke), would have + V3 (past result).',
          },
        ],
      },
    ],
  },

  // ══════════════════════════════════════════════════════════════════════════════
  // МОДУЛЬ 5 — ARTICLES, PRONOUNS AND DETERMINERS
  // ══════════════════════════════════════════════════════════════════════════════
  {
    id: 'en5',
    title: 'Articles, Pronouns & Determiners',
    topic: 'Артикли, местоимения и определители количества',
    emoji: '📝',
    color: '#ea580c',
    lessons: [
      // ── Урок 5.1 ──────────────────────────────────────────────────────────────
      {
        id: 'en5-l1',
        title: 'Articles — Артикли (a/an, the, zero)',
        duration: 15,
        theory: `## Articles — Артикли

В английском языке три артикля:
- **a / an** — неопределённый (indefinite)
- **the** — определённый (definite)
- **Ø (zero article)** — нулевой (без артикля)

---

## A / An — Неопределённый артикль

**Когда используется:**
- Первое упоминание: I saw **a** cat in the garden.
- Один из многих (неконкретный): She is **a** student. (одна из студентов)
- С профессиями: He is **a** doctor. My sister is **an** engineer.
- С "what" в восклицаниях: What **a** beautiful day!
- Значение "один": I'll be back in **an** hour.
- После there is/was: There is **a** book on the table.

**A vs An:**
- **A** перед согласным ЗВУКОМ: a book, a university [ju:], a European
- **An** перед гласным ЗВУКОМ: an apple, an hour [aʊə], an honest man

**Внимание:** важен ЗВУК, а не буква!
- **a** university (звук [j]) — НЕ an university
- **an** hour (немая h) — НЕ a hour

---

## The — Определённый артикль

**Когда используется:**
- Повторное упоминание: I saw a cat. **The** cat was black.
- Единственный в своём роде: **the** Sun, **the** Moon, **the** Earth, **the** Internet
- С превосходной степенью: **the** best, **the** tallest, **the** most beautiful
- С порядковыми числительными: **the** first, **the** second, **the** last
- Когда понятно из контекста: Close **the** door. (дверь в комнате)
- Перед of: **the** center of the city, **the** name of the book
- С музыкальными инструментами: She plays **the** piano.
- С географическими названиями:

| С THE | Без THE |
|---|---|
| Океаны: the Pacific | Континенты: Europe |
| Моря: the Black Sea | Страны (обычно): Kazakhstan |
| Реки: the Irtysh | Города: Almaty |
| Горные цепи: the Alps | Отдельные горы: Everest |
| Пустыни: the Sahara | Озёра: Lake Balkhash |
| Группы островов: the Maldives | Отдельные острова: Madagascar |
| Страны с Republic/Kingdom/States: the USA, the UK | Парки: Central Park |

---

## Ø (Zero Article) — Нулевой артикль

**Когда используется:**
- Неисчисляемые в общем смысле: **Ø** Water is important. **Ø** Music makes me happy.
- Множественное число в общем смысле: **Ø** Dogs are loyal animals.
- Перед именами, городами, странами (обычно): **Ø** Astana, **Ø** Kazakhstan
- Дни, месяцы: on **Ø** Monday, in **Ø** January
- Приёмы пищи: have **Ø** breakfast / lunch / dinner
- Языки: speak **Ø** English
- Виды спорта: play **Ø** football
- С go to + место (как функция): go to **Ø** school / work / bed / church / hospital

**Но!** Если говорим о конкретном здании (не функции):
- He goes to **Ø** school. (он школьник — функция)
- He went to **the** school to meet the teacher. (конкретное здание)

---

## Частые ошибки на ЕНТ

1. ✗ She is doctor. → ✓ She is **a** doctor.
2. ✗ I like the music. (в общем) → ✓ I like **Ø** music.
3. ✗ He is a best student. → ✓ He is **the** best student.
4. ✗ I live in the Almaty. → ✓ I live in **Ø** Almaty.
5. ✗ An university → ✓ **A** university (звук [j])`,
        keyFormulas: [
          { formula: 'a/an — первое упоминание, профессии, один из', name: 'Неопределённый артикль' },
          { formula: 'the — повторное, единственный, superlative, ordinal', name: 'Определённый артикль' },
          { formula: 'Ø — общий смысл, имена, города, языки, спорт', name: 'Нулевой артикль' },
        ],
        quiz: [
          {
            q: 'She is ___ engineer at a big company.',
            options: ['a', 'an', 'the', '—'],
            correct: 1,
            explanation: 'Профессия → неопределённый артикль. Engineer начинается с гласного звука → an.',
          },
          {
            q: '___ Moon goes around ___ Earth.',
            options: ['A ... an', 'The ... the', '— ... —', 'The ... an'],
            correct: 1,
            explanation: 'Единственные в своём роде объекты → the Moon, the Earth.',
          },
          {
            q: 'He is ___ best student in our class.',
            options: ['a', 'an', 'the', '—'],
            correct: 2,
            explanation: 'Превосходная степень (best) → the.',
          },
          {
            q: 'I usually have ___ breakfast at 8 a.m.',
            options: ['a', 'an', 'the', '—'],
            correct: 3,
            explanation: 'Приёмы пищи без артикля: have Ø breakfast.',
          },
          {
            q: 'She plays ___ piano very well.',
            options: ['a', 'an', 'the', '—'],
            correct: 2,
            explanation: 'Музыкальные инструменты → the piano.',
          },
          {
            q: 'We visited ___ USA last summer.',
            options: ['a', 'an', 'the', '—'],
            correct: 2,
            explanation: 'Страны с Republic/States/Kingdom → the USA.',
          },
          {
            q: '___ dogs are loyal animals.',
            options: ['A', 'An', 'The', '—'],
            correct: 3,
            explanation: 'Множественное число в общем смысле (все собаки вообще) → без артикля.',
          },
        ],
      },

      // ── Урок 5.2 ──────────────────────────────────────────────────────────────
      {
        id: 'en5-l2',
        title: 'Pronouns — Местоимения',
        duration: 15,
        theory: `## Pronouns — Местоимения

## 1. Personal Pronouns — Личные местоимения

| Лицо | Subject (подлежащее) | Object (дополнение) |
|---|---|---|
| 1 ед. | I | me |
| 2 ед. | you | you |
| 3 ед. муж. | he | him |
| 3 ед. жен. | she | her |
| 3 ед. ср. | it | it |
| 1 мн. | we | us |
| 3 мн. | they | them |

- **I** like **him**. (I — подлежащее, him — дополнение)
- **She** gave **me** a book. (She — подлежащее, me — дополнение)

**Частая ошибка:** ✗ Me and Tom went... → ✓ Tom and **I** went... (подлежащее!)
✗ between you and I → ✓ between you and **me** (после предлога — object form)

---

## 2. Possessive Adjectives & Pronouns — Притяжательные

| Лицо | Adjective (перед сущ.) | Pronoun (заменяет сущ.) |
|---|---|---|
| I | my | mine |
| you | your | yours |
| he | his | his |
| she | her | hers |
| it | its | — |
| we | our | ours |
| they | their | theirs |

- This is **my** book. (adjective + noun)
- This book is **mine**. (pronoun заменяет "my book")
- Is this **your** pen? — No, it's **hers**. (= her pen)

**Частая ошибка:** ✗ it's = its. **It's** = it is/has. **Its** = его/её (для предметов и животных).

---

## 3. Reflexive Pronouns — Возвратные местоимения

| myself | yourself | himself | herself | itself | ourselves | yourselves | themselves |

**Когда используется:**
- Действие направлено на себя: She hurt **herself**.
- Усиление (= сам): I did it **myself**.
- By + reflexive = один, без помощи: He lives by **himself**.

**Частая ошибка:** ✗ He enjoyed hisself → ✓ He enjoyed **himself**

---

## 4. Relative Pronouns — Относительные местоимения

Используются для соединения частей предложения (relative clauses):

| Pronoun | Для кого/чего | Пример |
|---|---|---|
| **who** | Люди (подлежащее) | The girl **who** called you is my sister. |
| **whom** | Люди (дополнение, формальн.) | The man **whom** I met was friendly. |
| **which** | Предметы, животные | The book **which** I read was interesting. |
| **that** | Люди и предметы | The car **that** he bought is red. |
| **whose** | Принадлежность | The boy **whose** father is a doctor. |
| **where** | Место | The city **where** I was born. |
| **when** | Время | The day **when** we met. |

## Defining vs Non-defining Relative Clauses

**Defining (ограничительные)** — без запятых, необходимы для понимания:
- The man **who** lives next door is a teacher. (какой именно мужчина?)

**Non-defining (пояснительные)** — с запятыми, дополнительная информация:
- My brother, **who** lives in London, is a doctor. (мы знаем, о каком брате речь)

**Важно:** В non-defining clauses НЕЛЬЗЯ использовать **that**!
✗ My mother, that is 50, ... → ✓ My mother, **who** is 50, ...

---

## Частые ошибки на ЕНТ

1. ✗ The man which called... → ✓ The man **who/that** called... (для людей!)
2. ✗ The book who... → ✓ The book **which/that**... (для предметов!)
3. ✗ The girl whose she... → ✓ The girl **whose** father... (без дополнительного местоимения)`,
        keyFormulas: [
          { formula: 'who — люди, which — предметы, that — оба', name: 'Relative Pronouns' },
          { formula: 'my/your/his + noun, mine/yours/his (без noun)', name: 'Possessive' },
          { formula: 'myself, yourself, himself...', name: 'Reflexive Pronouns' },
        ],
        quiz: [
          {
            q: 'The woman ___ lives next door is a doctor.',
            options: ['which', 'who', 'whom', 'whose'],
            correct: 1,
            explanation: 'Для людей в роли подлежащего → who.',
          },
          {
            q: 'This is the book ___ I told you about.',
            options: ['who', 'whose', 'which', 'whom'],
            correct: 2,
            explanation: 'Для предметов → which (или that).',
          },
          {
            q: 'The boy ___ father is a pilot wants to fly too.',
            options: ['who', 'which', 'whose', 'whom'],
            correct: 2,
            explanation: 'Принадлежность (чей отец) → whose.',
          },
          {
            q: 'Is this umbrella ___?',
            options: ['your', 'you', 'yours', 'yourself'],
            correct: 2,
            explanation: 'Без существительного после → possessive pronoun: yours (= your umbrella).',
          },
          {
            q: 'She made this cake by ___.',
            options: ['her', 'hers', 'herself', 'she'],
            correct: 2,
            explanation: 'By + reflexive pronoun = сама, без помощи → by herself.',
          },
          {
            q: 'Tom and ___ went to the cinema.',
            options: ['me', 'I', 'my', 'myself'],
            correct: 1,
            explanation: 'Подлежащее → subject form: Tom and I (не "me").',
          },
        ],
      },

      // ── Урок 5.3 ──────────────────────────────────────────────────────────────
      {
        id: 'en5-l3',
        title: 'Quantifiers — Определители количества',
        duration: 15,
        theory: `## Quantifiers — Определители количества

Quantifiers указывают на количество и зависят от того, **исчисляемое** или **неисчисляемое** существительное используется.

## Исчисляемые (Countable) vs Неисчисляемые (Uncountable)

**Countable (исчисляемые):** имеют форму множественного числа
- a book → books, a child → children, a person → people

**Uncountable (неисчисляемые):** НЕТ множественного числа
- water, money, information, advice, news, furniture, luggage, homework, knowledge, music, traffic, weather, bread, rice, sugar

**Частая ошибка:** ✗ informations, advices, furnitures, homeworks → всегда ед. число!

---

## Таблица Quantifiers

| Quantifier | Countable | Uncountable | Значение |
|---|---|---|---|
| **many** | ✓ many books | ✗ | много (вопрос/отрицание) |
| **much** | ✗ | ✓ much water | много (вопрос/отрицание) |
| **a lot of / lots of** | ✓ a lot of books | ✓ a lot of water | много (утверждение) |
| **few** | ✓ few friends | ✗ | мало (негативно) |
| **a few** | ✓ a few friends | ✗ | несколько (позитивно) |
| **little** | ✗ | ✓ little time | мало (негативно) |
| **a little** | ✗ | ✓ a little time | немного (позитивно) |
| **some** | ✓ some books | ✓ some water | немного/несколько (утв.) |
| **any** | ✓ any books | ✓ any water | сколько-нибудь (вопр./отр.) |

---

## Few vs A few / Little vs A little — ВАЖНОЕ различие!

| | Negative (мало, недостаточно) | Positive (немного, достаточно) |
|---|---|---|
| Countable | **few** friends (мало, плохо) | **a few** friends (несколько, нормально) |
| Uncountable | **little** money (мало денег, плохо) | **a little** money (немного, хватит) |

- I have **few** friends. (Мало друзей — мне грустно.)
- I have **a few** friends. (Несколько друзей — мне хватает.)
- There is **little** milk left. (Мало молока — нужно купить.)
- There is **a little** milk left. (Немного есть — хватит на кофе.)

---

## Some vs Any

| | Some | Any |
|---|---|---|
| Утверждение | ✓ I have **some** friends. | ✗ |
| Вопрос | ✓ Would you like **some** tea? (предложение) | ✓ Do you have **any** questions? |
| Отрицание | ✗ | ✓ I don't have **any** money. |

**Особые случаи:**
- **Some** в вопросах: когда предлагаем или просим:
  - Would you like **some** coffee? (предложение)
  - Can I have **some** water? (просьба)
- **Any** в утверждениях: "любой":
  - You can take **any** book you want. (любую книгу)

---

## How much vs How many

- **How many** + countable: How many students are there?
- **How much** + uncountable: How much money do you need?

---

## Другие полезные quantifiers

| Quantifier | Значение | Пример |
|---|---|---|
| **all** | все | All students passed the exam. |
| **every** | каждый (+ ед. число!) | Every student has a textbook. |
| **each** | каждый (индивидуально) | Each student received a certificate. |
| **both** | оба | Both sisters are tall. |
| **either** | любой из двух | You can take either book. |
| **neither** | ни один из двух | Neither answer is correct. |
| **no** | нисколько | There is no water left. |
| **enough** | достаточно | We have enough time. |

## Частые ошибки на ЕНТ

1. ✗ much books → ✓ **many** books (countable!)
2. ✗ many water → ✓ **much** water (uncountable!)
3. ✗ I don't have some money. → ✓ I don't have **any** money. (отрицание → any)
4. ✗ Every students → ✓ Every **student** (every + ед. число!)`,
        keyFormulas: [
          { formula: 'many + countable, much + uncountable', name: 'Many vs Much' },
          { formula: 'few / a few + countable', name: 'Few vs A few' },
          { formula: 'little / a little + uncountable', name: 'Little vs A little' },
          { formula: 'some (утв.), any (вопр./отр.)', name: 'Some vs Any' },
        ],
        quiz: [
          {
            q: 'There isn\'t ___ milk in the fridge.',
            options: ['some', 'many', 'much', 'few'],
            correct: 2,
            explanation: 'Milk — uncountable. Отрицание → much (или any). Much — правильный ответ.',
          },
          {
            q: 'I have ___ friends in this city, so I feel lonely.',
            options: ['few', 'a few', 'little', 'a little'],
            correct: 0,
            explanation: 'Friends — countable. Lonely = негативный контекст → few (мало).',
          },
          {
            q: 'Would you like ___ tea?',
            options: ['any', 'some', 'many', 'few'],
            correct: 1,
            explanation: 'Предложение (offer) → some, даже в вопросе.',
          },
          {
            q: 'How ___ money do you need?',
            options: ['many', 'much', 'few', 'lot'],
            correct: 1,
            explanation: 'Money — uncountable → How much.',
          },
          {
            q: 'She speaks ___ English, enough for basic communication.',
            options: ['little', 'a little', 'few', 'a few'],
            correct: 1,
            explanation: 'English (language) — uncountable. "Enough" — позитивный контекст → a little.',
          },
          {
            q: '___ student must wear a uniform.',
            options: ['Every', 'All', 'Many', 'Any'],
            correct: 0,
            explanation: 'Every + singular noun. "Каждый ученик должен носить форму" → Every student.',
          },
        ],
      },
    ],
  },

  // ══════════════════════════════════════════════════════════════════════════════
  // МОДУЛЬ 6 — WORD FORMATION AND VOCABULARY
  // ══════════════════════════════════════════════════════════════════════════════
  {
    id: 'en6',
    title: 'Word Formation & Vocabulary',
    topic: 'Словообразование, фразовые глаголы, коллокации',
    emoji: '🔤',
    color: '#0891b2',
    lessons: [
      // ── Урок 6.1 ──────────────────────────────────────────────────────────────
      {
        id: 'en6-l1',
        title: 'Prefixes — Приставки',
        duration: 15,
        theory: `## Word Formation: Prefixes — Словообразование: Приставки

Приставки добавляются В НАЧАЛЕ слова и изменяют его значение, но обычно НЕ меняют часть речи.

## Отрицательные приставки (делают слово противоположным)

| Приставка | Значение | Примеры |
|---|---|---|
| **un-** | не- | happy → **un**happy, able → **un**able, usual → **un**usual |
| **dis-** | не-, раз- | agree → **dis**agree, like → **dis**like, appear → **dis**appear |
| **in-** | не- | correct → **in**correct, visible → **in**visible, complete → **in**complete |
| **im-** | не- (перед m, p) | possible → **im**possible, polite → **im**polite, patient → **im**patient |
| **il-** | не- (перед l) | legal → **il**legal, logical → **il**logical, literate → **il**literate |
| **ir-** | не- (перед r) | regular → **ir**regular, responsible → **ir**responsible, rational → **ir**rational |

**Правило для in-/im-/il-/ir-:**
- Перед **l** → **il-**: illegal, illogical
- Перед **m, p** → **im-**: impossible, impolite
- Перед **r** → **ir-**: irregular, irresponsible
- Перед остальными → **in-**: incorrect, invisible

---

## Другие важные приставки

| Приставка | Значение | Примеры |
|---|---|---|
| **re-** | снова, заново | write → **re**write, do → **re**do, build → **re**build |
| **mis-** | неправильно, ошибочно | understand → **mis**understand, spell → **mis**spell, lead → **mis**lead |
| **over-** | чрезмерно, сверх | work → **over**work, eat → **over**eat, sleep → **over**sleep |
| **under-** | недостаточно, под | estimate → **under**estimate, pay → **under**pay, line → **under**line |
| **pre-** | до, перед | school → **pre**school, war → **pre**war, view → **pre**view |
| **post-** | после | war → **post**war, graduate → **post**graduate |
| **out-** | превосходить | do → **out**do, run → **out**run, number → **out**number |
| **co-** | совместно | work → **co**-work, operate → **co**operate, exist → **co**exist |
| **anti-** | против | social → **anti**social, war → **anti**war, virus → **anti**virus |
| **multi-** | много | cultural → **multi**cultural, national → **multi**national |
| **inter-** | между | national → **inter**national, act → **inter**act |
| **super-** | сверх | natural → **super**natural, hero → **super**hero |

---

## Как выбрать правильную отрицательную приставку?

К сожалению, нет строгого правила. Но есть закономерности:

- **un-** — самая частая: uncomfortable, unfriendly, unhappy, unknown, unexpected
- **dis-** — часто с глаголами: disagree, disappear, disconnect, dislike
- **in-/im-/il-/ir-** — часто с прилагательными латинского происхождения: impossible, incorrect, illegal, irregular

**Нужно запоминать!** На ЕНТ часто спрашивают:
- ✗ unpossible → ✓ **im**possible
- ✗ unlegal → ✓ **il**legal
- ✗ inresponsible → ✓ **ir**responsible

---

## Слова-ловушки на ЕНТ

| Слово | НЕправильно | Правильно |
|---|---|---|
| comfortable | incomfortable | **un**comfortable |
| honest | unhonest | **dis**honest |
| pleasant | displeasant | **un**pleasant |
| patient | unpatient | **im**patient |
| lucky | dislucky | **un**lucky |
| agree | unagree | **dis**agree |
| polite | unpolite | **im**polite |
| literate | inliterate | **il**literate |

## Частые ошибки

1. ✗ I misunderstanded → ✓ I misunderstood (неправильный глагол!)
2. ✗ He is unpossible to work with → ✓ He is impossible to work with.
3. Не путайте: **invaluable** = бесценный (= очень ценный!), а НЕ "не ценный"`,
        keyFormulas: [
          { formula: 'un-, dis-, in-/im-/il-/ir- → отрицание', name: 'Отрицательные приставки' },
          { formula: 're- (снова), mis- (неправильно)', name: 'Другие приставки' },
          { formula: 'over- (чрезмерно), under- (недостаточно)', name: 'Степень' },
        ],
        quiz: [
          {
            q: 'The opposite of "possible" is:',
            options: ['unpossible', 'dispossible', 'impossible', 'inpossible'],
            correct: 2,
            explanation: 'Перед "p" используется приставка im-: impossible.',
          },
          {
            q: 'The opposite of "legal" is:',
            options: ['unlegal', 'dislegal', 'inlegal', 'illegal'],
            correct: 3,
            explanation: 'Перед "l" используется приставка il-: illegal.',
          },
          {
            q: 'Choose the correct word: He ___ the instructions and did everything wrong.',
            options: ['misunderstood', 'disunderstood', 'ununderstood', 'overunderstood'],
            correct: 0,
            explanation: 'mis- = неправильно. misunderstand → misunderstood (V2).',
          },
          {
            q: 'The teacher asked students to ___ the essay because of too many mistakes.',
            options: ['write', 'rewrite', 'miswrite', 'overwrite'],
            correct: 1,
            explanation: 're- = снова. rewrite = переписать заново.',
          },
          {
            q: 'The prefix "over-" in "overwork" means:',
            options: ['not enough', 'too much', 'again', 'wrongly'],
            correct: 1,
            explanation: 'over- = чрезмерно, слишком много. overwork = перерабатывать.',
          },
          {
            q: 'Which word is formed INCORRECTLY?',
            options: ['unhappy', 'impolite', 'disregular', 'irresponsible'],
            correct: 2,
            explanation: 'Regular → irregular (ir-, не dis-). Disregular — неправильная форма.',
          },
        ],
      },

      // ── Урок 6.2 ──────────────────────────────────────────────────────────────
      {
        id: 'en6-l2',
        title: 'Suffixes — Суффиксы и части речи',
        duration: 15,
        theory: `## Word Formation: Suffixes — Суффиксы

Суффиксы добавляются В КОНЦЕ слова и обычно **МЕНЯЮТ часть речи**.

## Суффиксы существительных (Noun Suffixes)

| Суффикс | Значение | Примеры |
|---|---|---|
| **-tion / -sion** | действие, процесс | educate → educa**tion**, decide → deci**sion** |
| **-ment** | результат действия | develop → develop**ment**, agree → agree**ment** |
| **-ness** | качество, состояние | happy → happi**ness**, kind → kind**ness** |
| **-ity** | качество | popular → popular**ity**, active → activ**ity** |
| **-er / -or** | деятель, агент | teach → teach**er**, act → act**or** |
| **-ist** | специалист | science → scient**ist**, art → art**ist** |
| **-ance / -ence** | качество, состояние | important → import**ance**, different → differ**ence** |
| **-dom** | состояние, область | free → free**dom**, king → king**dom** |
| **-ship** | отношение, статус | friend → friend**ship**, leader → leader**ship** |

## Суффиксы прилагательных (Adjective Suffixes)

| Суффикс | Значение | Примеры |
|---|---|---|
| **-ful** | полный чего-то | beauty → beauti**ful**, help → help**ful** |
| **-less** | без чего-то | home → home**less**, care → care**less** |
| **-ous** | обладающий качеством | danger → danger**ous**, fame → fam**ous** |
| **-able / -ible** | способный, возможный | comfort → comfort**able**, access → access**ible** |
| **-ive** | склонный к | act → act**ive**, create → creat**ive** |
| **-al** | относящийся к | nation → nation**al**, tradition → tradition**al** |
| **-ic** | относящийся к | science → scientif**ic**, history → histor**ic** |
| **-y** | имеющий качество | rain → rain**y**, sun → sunn**y**, health → health**y** |

## Суффиксы глаголов (Verb Suffixes)

| Суффикс | Значение | Примеры |
|---|---|---|
| **-ize / -ise** | делать | modern → modern**ize**, organ → organ**ize** |
| **-ify** | делать | simple → simpl**ify**, beauty → beaut**ify** |
| **-en** | делать (стать) | wide → wid**en**, short → short**en**, strength → strength**en** |
| **-ate** | делать | active → activ**ate**, motive → motiv**ate** |

## Суффикс наречий (Adverb Suffix)

| Суффикс | Примеры |
|---|---|
| **-ly** | slow → slow**ly**, quick → quick**ly**, happy → happi**ly** |

---

## Алгоритм для ЕНТ: как определить нужную часть речи?

1. **Перед существительным** → нужно прилагательное: a beauti**ful** day
2. **После артикля (a/the)** → нужно существительное: the develop**ment**
3. **После глагола to be** → прилагательное или существительное: She is beauti**ful** / a teach**er**
4. **Описывает глагол** → наречие: He runs quick**ly**
5. **Подлежащее или дополнение** → существительное: Happi**ness** is important.
6. **После модального глагола / вспомогательного** → глагол: They should modern**ize** it.

---

## Цепочки словообразования (Word Families)

| Noun | Verb | Adjective | Adverb |
|---|---|---|---|
| success | succeed | success**ful** | success**fully** |
| creation | create | creative | creatively |
| education | educate | educational | educationally |
| decision | decide | decisive | decisively |
| difference | differ | different | differently |
| happiness | — | happy | happily |
| danger | endanger | dangerous | dangerously |
| beauty | beautify | beautiful | beautifully |

## Частые ошибки

1. ✗ The develop of technology... → ✓ The **development** of technology... (сущ. после the)
2. ✗ She is a beauty girl. → ✓ She is a **beautiful** girl. (прилаг. перед сущ.)
3. ✗ He runs slow. → ✓ He runs **slowly**. (наречие описывает глагол)`,
        keyFormulas: [
          { formula: '-tion, -ment, -ness, -ity → noun', name: 'Суффиксы существительных' },
          { formula: '-ful, -less, -ous, -able, -ive → adjective', name: 'Суффиксы прилагательных' },
          { formula: '-ize, -ify, -en, -ate → verb', name: 'Суффиксы глаголов' },
          { formula: '-ly → adverb', name: 'Суффикс наречий' },
        ],
        quiz: [
          {
            q: 'The ___ of the project took three months. (develop)',
            options: ['develop', 'developing', 'development', 'developed'],
            correct: 2,
            explanation: 'После "the" нужно существительное → development.',
          },
          {
            q: 'She is a very ___ person. (care)',
            options: ['care', 'careful', 'carefully', 'careless'],
            correct: 1,
            explanation: 'Перед существительным "person" нужно прилагательное. "Очень заботливый" → careful.',
          },
          {
            q: 'He solved the problem ___. (easy)',
            options: ['easy', 'easily', 'easiness', 'easier'],
            correct: 1,
            explanation: 'Описывает глагол "solved" → нужно наречие → easily.',
          },
          {
            q: '___ is very important in life. (happy)',
            options: ['Happy', 'Happily', 'Happiness', 'Happier'],
            correct: 2,
            explanation: 'Подлежащее → существительное. happy → happiness.',
          },
          {
            q: 'This is a ___ idea! (wonder)',
            options: ['wonder', 'wonderful', 'wonderfully', 'wondering'],
            correct: 1,
            explanation: 'Перед существительным "idea" нужно прилагательное → wonderful.',
          },
          {
            q: 'They want to ___ the old building. (modern)',
            options: ['modern', 'modernly', 'modernize', 'modernization'],
            correct: 2,
            explanation: 'После "want to" нужен глагол → modernize.',
          },
          {
            q: 'Her ___ in the team was remarkable. (lead)',
            options: ['leading', 'leader', 'leadership', 'lead'],
            correct: 2,
            explanation: 'После "her" нужно существительное. Качество лидерства → leadership.',
          },
        ],
      },

      // ── Урок 6.3 ──────────────────────────────────────────────────────────────
      {
        id: 'en6-l3',
        title: 'Phrasal Verbs & Collocations — Фразовые глаголы и коллокации',
        duration: 15,
        theory: `## Phrasal Verbs — Фразовые глаголы

Фразовый глагол = глагол + предлог/наречие. Значение часто НЕЛЬЗЯ угадать по отдельным словам!

## ТОП-50 фразовых глаголов для ЕНТ

### Группа 1: GET
| Phrasal verb | Meaning | Example |
|---|---|---|
| **get up** | вставать | I get up at 7 a.m. |
| **get on (with)** | ладить с | She gets on well with her colleagues. |
| **get over** | оправиться, преодолеть | He got over his illness quickly. |
| **get along (with)** | ладить | Do you get along with your neighbors? |
| **get rid of** | избавиться | I want to get rid of old clothes. |

### Группа 2: LOOK
| Phrasal verb | Meaning | Example |
|---|---|---|
| **look after** | заботиться | Who looks after your children? |
| **look for** | искать | I'm looking for my keys. |
| **look forward to** | ждать с нетерпением | I look forward to seeing you. |
| **look up** | искать (в словаре) | Look up this word in the dictionary. |
| **look through** | просматривать | She looked through the report. |

### Группа 3: TAKE
| Phrasal verb | Meaning | Example |
|---|---|---|
| **take off** | взлетать / снимать | The plane took off on time. |
| **take care of** | заботиться | Take care of your health. |
| **take up** | начать заниматься | She took up yoga last month. |
| **take after** | быть похожим на | He takes after his father. |
| **take part in** | участвовать | They took part in the competition. |

### Группа 4: TURN / PUT / GIVE / BREAK / MAKE / COME
| Phrasal verb | Meaning | Example |
|---|---|---|
| **turn on / off** | включить / выключить | Turn off the light! |
| **turn up / down** | прибавить / убавить | Turn down the music, please. |
| **put on** | надевать | Put on your coat. |
| **put off** | откладывать | Don't put off your homework. |
| **give up** | бросить, сдаться | He gave up smoking. |
| **give back** | вернуть | Give back my book, please. |
| **break down** | сломаться | The car broke down on the road. |
| **break up** | расстаться | They broke up last year. |
| **make up** | помириться / придумать | They argued but made up quickly. |
| **come across** | наткнуться | I came across an old photo. |
| **come up with** | придумать | She came up with a great idea. |

### Группа 5: Другие важные
| Phrasal verb | Meaning | Example |
|---|---|---|
| **carry on** | продолжать | Carry on with your work. |
| **find out** | узнать | I found out the truth. |
| **fill in / out** | заполнить (форму) | Please fill in the application form. |
| **figure out** | разобраться | I can't figure out this problem. |
| **pick up** | подобрать / подвезти | Can you pick me up at 5? |
| **set up** | основать, установить | He set up his own business. |
| **work out** | тренироваться / решить | I work out three times a week. |
| **run out of** | закончиться (о запасе) | We've run out of milk. |
| **hold on** | подождать | Hold on, I'll check. |
| **bring up** | воспитывать / поднять тему | She was brought up by her grandparents. |

---

## Collocations — Устойчивые словосочетания

**Collocations** = слова, которые часто используются вместе.

### DO vs MAKE
| DO | MAKE |
|---|---|
| do homework | make a mistake |
| do housework | make a decision |
| do an exercise | make progress |
| do business | make money |
| do a favour | make friends |
| do research | make a phone call |
| do the dishes | make an effort |
| do your best | make a plan |
| do damage | make a noise |
| do harm | make a suggestion |

### HAVE, TAKE, PAY
| HAVE | TAKE | PAY |
|---|---|---|
| have a rest | take a break | pay attention |
| have fun | take a photo | pay a visit |
| have a look | take an exam | pay a compliment |
| have a shower | take notes | pay cash |
| have breakfast | take medicine | — |

## Частые ошибки

1. ✗ make homework → ✓ **do** homework
2. ✗ do a mistake → ✓ **make** a mistake
3. ✗ look forward to see → ✓ look forward to **seeing** (to = предлог, не частица!)`,
        keyFormulas: [
          { formula: 'look for (искать), look after (заботиться)', name: 'LOOK phrasal verbs' },
          { formula: 'give up (бросить), take up (начать)', name: 'Habits' },
          { formula: 'do homework, make a mistake', name: 'DO vs MAKE' },
        ],
        quiz: [
          {
            q: 'Who ___ your little brother when your parents are at work?',
            options: ['looks for', 'looks after', 'looks up', 'looks through'],
            correct: 1,
            explanation: 'Look after = заботиться. "Кто присматривает за братом?"',
          },
          {
            q: 'She ___ smoking last year.',
            options: ['gave up', 'gave back', 'gave in', 'gave out'],
            correct: 0,
            explanation: 'Give up = бросить (привычку). "Она бросила курить."',
          },
          {
            q: 'Don\'t forget to ___ your homework!',
            options: ['make', 'do', 'take', 'have'],
            correct: 1,
            explanation: 'Do homework (не make homework!) — устойчивая коллокация.',
          },
          {
            q: 'I\'m ___ to meeting you again!',
            options: [
              'looking forward',
              'looking for',
              'looking after',
              'looking up',
            ],
            correct: 0,
            explanation: 'Look forward to + V-ing = ждать с нетерпением.',
          },
          {
            q: 'The car ___ on the highway and we had to call a mechanic.',
            options: ['broke up', 'broke down', 'broke in', 'broke out'],
            correct: 1,
            explanation: 'Break down = сломаться (о технике).',
          },
          {
            q: 'I\'m sorry, I ___ a terrible mistake.',
            options: ['did', 'made', 'took', 'had'],
            correct: 1,
            explanation: 'Make a mistake (не do a mistake!) — устойчивая коллокация.',
          },
        ],
      },
    ],
  },

  // ══════════════════════════════════════════════════════════════════════════════
  // МОДУЛЬ 7 — READING COMPREHENSION & WRITING
  // ══════════════════════════════════════════════════════════════════════════════
  {
    id: 'en7',
    title: 'Reading & Writing Strategies',
    topic: 'Стратегии чтения, понимание текста и основы письма',
    emoji: '📖',
    color: '#be185d',
    lessons: [
      // ── Урок 7.1 ──────────────────────────────────────────────────────────────
      {
        id: 'en7-l1',
        title: 'Reading Strategies — Стратегии чтения',
        duration: 15,
        theory: `## Reading Comprehension — Понимание прочитанного

На ЕНТ задания на чтение (Reading) составляют значительную часть блока английского языка. Нужно уметь быстро находить информацию, определять главную мысль и делать выводы.

## Основные стратегии чтения

### 1. Skimming — Быстрый просмотр (для общей идеи)

**Цель:** Понять, О ЧЁМ текст в целом за 1-2 минуты.

**Как делать:**
- Прочитайте заголовок и подзаголовки
- Прочитайте ПЕРВОЕ предложение каждого абзаца (topic sentence)
- Прочитайте последний абзац (заключение)
- Обратите внимание на выделенные слова (bold, italic)

**Когда использовать на ЕНТ:** Вопросы типа "What is the main idea of the text?", "What is the best title for the text?"

### 2. Scanning — Поиск конкретной информации

**Цель:** Найти КОНКРЕТНЫЙ факт (число, имя, дату) быстро.

**Как делать:**
- Определите ключевое слово в вопросе
- Быстро пробегите глазами по тексту, ища это слово
- Прочитайте предложение вокруг найденного слова

**Когда использовать на ЕНТ:** Вопросы типа "According to the text, when...?", "How many...?"

### 3. Intensive Reading — Внимательное чтение

**Цель:** Полное понимание текста, нюансов, выводов.

**Когда использовать:** Вопросы на inference (вывод), тон автора, цель текста.

---

## Типы вопросов на ЕНТ и как с ними работать

### Main Idea (Главная мысль)
"What is the main idea / topic / best title?"
- Ответ — самая общая идея, не деталь
- Часто содержится в первом/последнем абзаце
- Неправильные ответы: слишком узкие или слишком широкие

### Detail Questions (Вопросы на детали)
"According to the text...", "The author mentions that..."
- Ответ ПРЯМО есть в тексте
- Используйте scanning
- Будьте внимательны к словам-ловушкам (similar but different)

### Inference (Выводы)
"It can be inferred that...", "The author implies that..."
- Ответ НЕ прямо в тексте, но логически следует из него
- Нужно "читать между строк"
- Не додумывайте — вывод должен быть подкреплён текстом

### Vocabulary in Context (Слово в контексте)
"The word '...' in line X is closest in meaning to..."
- Прочитайте предложение ДО и ПОСЛЕ слова
- Попробуйте подставить каждый вариант ответа
- Выберите тот, который сохраняет смысл предложения

### Reference Words (Ссылочные слова)
"The word 'they' in line 5 refers to..."
- it, they, this, that, these, those, which — указывают на что-то упомянутое ранее
- Ищите в ПРЕДЫДУЩЕМ предложении

---

## Структура типичного текста

| Часть | Содержание |
|---|---|
| Introduction | Представляет тему. Часто содержит thesis statement (главный тезис). |
| Body paragraphs | Каждый абзац = одна подтема. Topic sentence обычно первая. |
| Conclusion | Подводит итог. Может содержать мнение автора. |

## Подсказки для экономии времени на ЕНТ

1. **Сначала прочитайте вопросы**, потом текст — будете знать, что искать.
2. **Не переводите каждое слово** — достаточно понять общий смысл.
3. **Ключевые слова** в вопросе помогают найти ответ в тексте.
4. **Исключайте** явно неправильные варианты — обычно 2 из 4 легко отбросить.
5. **Если не знаете слово** — определите его значение по контексту.`,
        keyFormulas: [
          { formula: 'Skimming → общая идея (заголовки, 1-е предложения)', name: 'Skimming' },
          { formula: 'Scanning → конкретная информация (ключевые слова)', name: 'Scanning' },
          { formula: 'Сначала вопросы, потом текст', name: 'Стратегия на ЕНТ' },
        ],
        quiz: [
          {
            q: 'Read the passage: "The Amazon rainforest produces about 20% of the world\'s oxygen. It is home to millions of species. However, deforestation threatens this vital ecosystem." What is the MAIN IDEA?',
            options: [
              'The Amazon produces oxygen.',
              'The Amazon rainforest is important but in danger.',
              'Deforestation is a global problem.',
              'Many species live in the Amazon.',
            ],
            correct: 1,
            explanation: 'Главная мысль объединяет все детали: лес важен (кислород, виды), но под угрозой (вырубка).',
          },
          {
            q: 'Which reading strategy should you use to answer "When was the university founded?"',
            options: ['Skimming', 'Scanning', 'Intensive reading', 'Predicting'],
            correct: 1,
            explanation: 'Поиск конкретного факта (даты) → Scanning: ищем число/дату в тексте.',
          },
          {
            q: '"The company\'s profits doubled last year. They plan to expand internationally." The word "They" refers to:',
            options: ['The profits', 'The company', 'The workers', 'The countries'],
            correct: 1,
            explanation: '"They" — ссылочное слово, относится к подлежащему предыдущего предложения: the company.',
          },
          {
            q: '"Despite his young age, the scientist made a groundbreaking discovery." The word "groundbreaking" most likely means:',
            options: ['destroying', 'boring', 'revolutionary', 'simple'],
            correct: 2,
            explanation: 'Контекст (despite young age + discovery) указывает на что-то выдающееся → revolutionary.',
          },
          {
            q: 'What should you read FIRST when taking the ENT reading section?',
            options: [
              'The text from beginning to end',
              'The questions',
              'The title only',
              'The last paragraph',
            ],
            correct: 1,
            explanation: 'Стратегия: сначала прочитайте вопросы, чтобы знать, что искать в тексте.',
          },
          {
            q: '"Studies show that students who sleep 8 hours perform better on exams. Sleep helps consolidate memory." It can be inferred that:',
            options: [
              'All students sleep 8 hours.',
              'Sleep is not important for studying.',
              'Not getting enough sleep may hurt exam results.',
              'Exams should be taken in the morning.',
            ],
            correct: 2,
            explanation: 'Вывод (inference): если 8 часов сна помогают, то недосып может навредить результатам.',
          },
        ],
      },

      // ── Урок 7.2 ──────────────────────────────────────────────────────────────
      {
        id: 'en7-l2',
        title: 'Formal & Informal Writing — Письма и email',
        duration: 15,
        theory: `## Writing: Letters and Emails — Письма и электронные письма

На ЕНТ могут встречаться задания на понимание структуры писем. Важно знать разницу между формальным и неформальным стилем.

## Formal vs Informal — Сравнение

| | Formal (Официальное) | Informal (Неофициальное) |
|---|---|---|
| **Кому** | Работодатель, директор, незнакомый | Друг, родственник |
| **Обращение** | Dear Sir/Madam, Dear Mr. Smith, | Dear Tom, Hi! Hey! |
| **Стиль** | Полные формы, вежливый тон | Сокращения, разговорный |
| **Слова** | I would like to, I am writing to, Furthermore | I wanna, gonna, BTW |
| **Завершение** | Yours faithfully / sincerely | Best wishes, Love, Take care |

---

## Структура формального письма / email

**1. Salutation (приветствие):**
- Dear Sir/Madam, (если не знаете имя)
- Dear Mr./Mrs./Ms. Smith, (если знаете имя)

**2. Opening paragraph (вступление):**
- Цель письма: I am writing to inquire about... / to apply for... / to complain about...

**3. Body paragraphs (основная часть):**
- Каждый абзац = одна мысль
- Используйте linking words: Furthermore, Moreover, In addition, However, Nevertheless

**4. Closing paragraph (заключение):**
- I would be grateful if you could...
- I look forward to hearing from you.
- Thank you for your attention/consideration.

**5. Sign-off (завершение):**
- Yours faithfully, (если Dear Sir/Madam — не знаете имя)
- Yours sincerely, (если Dear Mr. Smith — знаете имя)
- Ваше имя

---

## Структура неформального письма / email

**1. Salutation:** Hi/Hey/Dear + имя

**2. Opening:** How are you? / Thanks for your letter! / Sorry I haven't written for so long.

**3. Body:** Основная информация, разговорный стиль, сокращения OK.

**4. Closing:** Write back soon! / Can't wait to see you!

**5. Sign-off:** Love, / Best wishes, / Take care, / See you soon, + имя

---

## Formal vs Informal — Эквиваленты

| Informal | Formal |
|---|---|
| I want to... | I would like to... |
| Can you...? | Could you possibly...? / I would appreciate it if you could... |
| Sorry about... | I apologize for... |
| Thanks! | Thank you very much. |
| I think... | In my opinion... / I believe... |
| Also... | Furthermore... / Moreover... / In addition... |
| But... | However... / Nevertheless... |
| So... | Therefore... / Consequently... |
| About... | Regarding... / With reference to... |
| A lot of | A significant number of / A considerable amount of |
| Get | Receive / Obtain |
| Ask for | Request |
| I can't / won't | I am unable to / I will not |

---

## Типы формальных писем на ЕНТ

| Тип | Opening phrase |
|---|---|
| Application | I am writing to apply for the position of... |
| Complaint | I am writing to complain about... |
| Request | I am writing to request information about... |
| Thank you | I am writing to express my gratitude for... |
| Invitation | I am writing to invite you to... |

---

## Частые ошибки

1. Смешивание стилей: ✗ Dear Sir, I wanna ask... → ✓ Dear Sir, I would like to ask...
2. Неправильное завершение: ✗ Dear Sir → Yours sincerely → ✓ Dear Sir → Yours **faithfully**
3. Отсутствие цели в начале: Сразу укажите, ЗАЧЕМ пишете.`,
        keyFormulas: [
          { formula: 'Dear Sir/Madam → Yours faithfully', name: 'Не знаете имя' },
          { formula: 'Dear Mr. X → Yours sincerely', name: 'Знаете имя' },
          { formula: 'I am writing to + цель', name: 'Вступление формального письма' },
        ],
        quiz: [
          {
            q: 'Which is the correct ending if your letter starts "Dear Sir"?',
            options: [
              'Yours sincerely',
              'Yours faithfully',
              'Love',
              'Best wishes',
            ],
            correct: 1,
            explanation: 'Dear Sir/Madam (не знаете имя) → Yours faithfully.',
          },
          {
            q: 'Which phrase is FORMAL?',
            options: [
              "I wanna know about...",
              "I would like to inquire about...",
              "Can you tell me...?",
              "Hey, what's up with...?",
            ],
            correct: 1,
            explanation: '"I would like to inquire" — формальный стиль.',
          },
          {
            q: 'Choose the correct formal synonym for "get":',
            options: ['grab', 'receive', 'take', 'pick'],
            correct: 1,
            explanation: 'Formal: get → receive (получить).',
          },
          {
            q: 'How should you begin a formal letter of complaint?',
            options: [
              'Hey, I have a problem...',
              'I am writing to complain about...',
              'Listen, I am not happy...',
              'So, the thing is...',
            ],
            correct: 1,
            explanation: 'Формальная жалоба: "I am writing to complain about..."',
          },
          {
            q: 'Which letter starts with "Dear Mrs. Johnson"?',
            options: [
              'A letter to a stranger',
              'A letter to a specific person whose name you know',
              'An informal letter to a friend',
              'A letter to a company',
            ],
            correct: 1,
            explanation: 'Dear + Mrs./Mr./Ms. + фамилия — вы знаете имя конкретного человека.',
          },
          {
            q: 'Which is the formal equivalent of "but"?',
            options: ['And', 'However', 'So', 'Also'],
            correct: 1,
            explanation: 'Formal: but → However / Nevertheless.',
          },
        ],
      },

      // ── Урок 7.3 ──────────────────────────────────────────────────────────────
      {
        id: 'en7-l3',
        title: 'Essay Writing & Linking Words — Эссе и связующие слова',
        duration: 18,
        theory: `## Essay Structure — Структура эссе

На ЕНТ важно понимать структуру эссе и уметь определять логические связи в тексте.

## Основная структура эссе

### 1. Introduction — Вступление (1 абзац)
- **Hook** — привлечь внимание читателя (вопрос, факт, цитата)
- **Background** — кратко ввести в тему
- **Thesis statement** — главная мысль/аргумент эссе

**Пример:**
"Education is often considered the key to success. In today's competitive world, a good education can open many doors. **I believe that education is the most important factor in achieving one's goals.**" (thesis)

### 2. Body Paragraphs — Основная часть (2-3 абзаца)
Каждый абзац содержит:
- **Topic sentence** — главная мысль абзаца (обычно 1-е предложение)
- **Supporting details** — примеры, факты, аргументы
- **Concluding sentence** — вывод абзаца

**Пример topic sentence:** "Firstly, education provides knowledge and skills necessary for a successful career."

### 3. Conclusion — Заключение (1 абзац)
- **Перефразируйте** thesis statement (не повторяйте!)
- Подведите **итог** аргументов
- Можно дать **рекомендацию** или призыв

**Пример:** "In conclusion, education plays a crucial role in personal and professional development. It is essential for building a successful future."

---

## Linking Words — Связующие слова

### Добавление информации (Addition)
| Word | Example |
|---|---|
| **Furthermore** | Furthermore, exercise improves mental health. |
| **Moreover** | Moreover, reading broadens your vocabulary. |
| **In addition** | In addition, students gain practical experience. |
| **Also** | It is also important to note that... |
| **Besides** | Besides, there are other benefits. |

### Противопоставление (Contrast)
| Word | Example |
|---|---|
| **However** | However, there are some disadvantages. |
| **Nevertheless** | Nevertheless, the benefits outweigh the costs. |
| **On the other hand** | On the other hand, some people disagree. |
| **Although / Though** | Although it is expensive, it is worth it. |
| **Despite / In spite of** | Despite the rain, we went outside. |
| **While / Whereas** | While some agree, others disagree. |

### Причина и следствие (Cause & Effect)
| Word | Example |
|---|---|
| **Because / Since / As** | Because it was raining, we stayed home. |
| **Therefore** | Therefore, we need to act now. |
| **Consequently** | Consequently, many students fail the exam. |
| **As a result** | As a result, the company went bankrupt. |
| **Due to / Because of** | Due to the weather, the game was cancelled. |

### Примеры (Examples)
| Word | Example |
|---|---|
| **For example / For instance** | For example, Japan has a high literacy rate. |
| **Such as** | Sports such as football and basketball... |
| **In particular** | In particular, reading helps vocabulary. |

### Порядок (Sequencing)
| Word | Example |
|---|---|
| **Firstly / First of all** | Firstly, education provides knowledge. |
| **Secondly / Next** | Secondly, it develops critical thinking. |
| **Finally / Lastly** | Finally, it prepares you for a career. |

### Заключение (Conclusion)
| Word | Example |
|---|---|
| **In conclusion** | In conclusion, education is vital. |
| **To sum up** | To sum up, there are many benefits. |
| **All in all** | All in all, it was a great experience. |
| **On the whole** | On the whole, the project was successful. |

---

## Common Writing Mistakes — Частые ошибки

### Пунктуация
- Запятая после linking word в начале предложения: **However,** not However
- Запятая перед which в non-defining clause: the book**,** which I read**,** ...
- Нет запятой перед that: the book that I read (без запятой)

### Грамматика
- ✗ Despite of → ✓ **Despite** / In spite of
- ✗ Although..., but... → ✓ **Although**... , ... (без but!)
- ✗ Because of + clause → ✓ Because of + noun / Because + clause

### Стиль
- Избегайте в эссе: I think, gonna, wanna, you know
- Используйте: In my opinion, I believe, It is widely believed that

---

## Типы эссе на ЕНТ

| Тип | Задача | Структура |
|---|---|---|
| **Opinion** (За и против) | Выразить мнение | Intro → Argument 1 → Argument 2 → Counter-argument → Conclusion |
| **Advantages / Disadvantages** | Описать плюсы и минусы | Intro → Advantages → Disadvantages → Conclusion |
| **Problem / Solution** | Описать проблему и решение | Intro → Problem → Solution(s) → Conclusion |`,
        keyFormulas: [
          { formula: 'Introduction → Body (2-3 п.) → Conclusion', name: 'Структура эссе' },
          { formula: 'However, Moreover, Therefore, In conclusion', name: 'Ключевые linking words' },
          { formula: 'Although... (без but!); Despite + noun', name: 'Частые ошибки' },
        ],
        quiz: [
          {
            q: 'Which linking word shows CONTRAST?',
            options: ['Moreover', 'Furthermore', 'However', 'Therefore'],
            correct: 2,
            explanation: 'However = однако (contrast). Moreover/Furthermore = кроме того (addition). Therefore = поэтому (result).',
          },
          {
            q: '___ the bad weather, the match was not cancelled.',
            options: ['Although', 'Despite', 'Because', 'However'],
            correct: 1,
            explanation: 'Despite + noun (the bad weather). Although + clause (although the weather was bad).',
          },
          {
            q: 'Choose the correct sentence:',
            options: [
              'Although it was raining, but we went out.',
              'Although it was raining, we went out.',
              'Despite it was raining, we went out.',
              'However it was raining, we went out.',
            ],
            correct: 1,
            explanation: 'Although + clause, clause. Нельзя: Although..., but... (двойное противопоставление).',
          },
          {
            q: 'Which sentence BEST serves as a topic sentence for a paragraph about benefits of reading?',
            options: [
              'I like reading books.',
              'Reading provides numerous benefits for personal development.',
              'My favourite book is Harry Potter.',
              'Books are sold in bookshops.',
            ],
            correct: 1,
            explanation: 'Topic sentence — общее утверждение, которое будет раскрыто в абзаце.',
          },
          {
            q: 'What is a "thesis statement"?',
            options: [
              'The first sentence of any paragraph',
              'The main argument of the essay stated in the introduction',
              'A concluding sentence',
              'A question at the beginning',
            ],
            correct: 1,
            explanation: 'Thesis statement — главный тезис/аргумент эссе, обычно в конце вступления.',
          },
          {
            q: '___ the high cost of education, many people still consider it a worthwhile investment.',
            options: ['Although', 'Despite', 'Because', 'Moreover'],
            correct: 1,
            explanation: 'Despite + noun phrase (the high cost). "Несмотря на высокую стоимость..."',
          },
          {
            q: 'Which linking word is used to introduce a CONCLUSION?',
            options: ['Furthermore', 'For example', 'To sum up', 'Firstly'],
            correct: 2,
            explanation: '"To sum up" = подводя итог — используется в заключении.',
          },
        ],
      },
    ],
  },
]
