export const learningCurriculum = [
  {
    id: 'agreement', title: 'Subject–verb agreement', minutes: 20,
    rule: 'В Present Simple у he/she/it глагол получает -s. После does/doesn’t используется базовая форма. Every student — единственное число.',
    mnemonic: 'Every → one. Does уже взял -s.',
    examples: ['Every student needs practice.', 'Does she work here?', 'They work on a project.'],
    quiz: [
      { text: 'Every entrepreneur ___ challenges.', options: ['face', 'faces', 'facing'], answer: 1, why: 'Every entrepreneur — единственное число: faces.' },
      { text: 'Does she ___ English every day?', options: ['studies', 'studying', 'study'], answer: 2, why: 'После does нужна базовая форма study.' },
    ],
    writingPrompt: 'Напиши 4 предложения о привычках: о себе, о другом человеке, вопрос с does и предложение с every.',
    speakingPrompt: 'Расскажи за минуту, как ты и знакомый человек обычно учитесь.', chunks: ['work on a project', 'make progress'],
  },
  {
    id: 'articles', title: 'Articles: a / an / the / —', minutes: 20,
    rule: 'A/an — один неспецифический исчисляемый предмет, the — определённый из контекста. Для абстрактного понятия вообще артикль часто не нужен. Это стартовые ориентиры, а не все правила.',
    mnemonic: 'Один из многих? Тот самый? Понятие вообще?',
    examples: ['She is an engineer.', 'The engineer we met was helpful.', 'Experience matters.'],
    quiz: [
      { text: 'I am ___ developer.', options: ['a', 'an', '—'], answer: 0, why: 'Название профессии в единственном числе требует a/an; перед developer — a.' },
      { text: '___ success takes time. (Об успехе вообще.)', options: ['A', 'The', '—'], answer: 2, why: 'Здесь success — неисчисляемое абстрактное понятие. В других контекстах a success возможно.' },
    ],
    writingPrompt: 'Напиши 4 предложения: профессия, новая идея, та же идея во втором упоминании, успех как понятие.',
    speakingPrompt: 'Расскажи о профессии, которая тебя интересует, и почему.', chunks: ['achieve success', 'gain experience'],
  },
  {
    id: 'reading-chunks', title: 'Reading и активный словарь', minutes: 15,
    rule: 'Прочитай короткий текст, перескажи без подсказки, затем используй фразу в собственном примере.',
    mnemonic: 'Прочитать → закрыть → вспомнить → применить.',
    examples: ['Small habits can have an impact on learning. A short daily review helps students remember useful phrases. However, remembering a phrase is only the first step: students also need to use it in a new situation.'],
    quiz: [
      { text: 'По тексту, запомнить фразу достаточно для её освоения.', options: ['True', 'False', 'Not Given'], answer: 1, why: 'Текст говорит: remembering is only the first step; нужно применить в новой ситуации.' },
      { text: 'Текст сравнивает результаты экзаменов двух школ.', options: ['True', 'False', 'Not Given'], answer: 2, why: 'Данных о школах и сравнении экзаменов нет.' },
    ],
    writingPrompt: 'Закрой текст, напиши его главную мысль и собственный пример с have an impact on.',
    speakingPrompt: 'Объясни за минуту, какая привычка помогает тебе учиться.', chunks: ['have an impact on', 'in a new situation'],
  },
  {
    id: 'collocations', title: 'Prepositions и collocations', minutes: 20,
    rule: 'Запоминай сочетание целиком и проверяй смысл в контексте: depend on, interested in, work on a project. Work at a company тоже возможно, но описывает место работы.',
    mnemonic: 'Слово + его партнёр + мой пример.',
    examples: ['I work on my project.', 'I apply for a scholarship.', 'The result depends on practice.'],
    quiz: [
      { text: 'I am interested ___ engineering.', options: ['on', 'in', 'at'], answer: 1, why: 'Устойчивое сочетание: be interested in.' },
      { text: 'We are working ___ a new project.', options: ['on', 'from', 'to'], answer: 0, why: 'Разрабатывать проект: work on a project.' },
    ],
    writingPrompt: 'Напиши 4 предложения о своих целях с depend on, work on, apply for и have an impact on.',
    speakingPrompt: 'Объясни, над чем ты работаешь и от чего зависит результат.', chunks: ['depend on', 'work towards a goal', 'apply for a scholarship'],
  },
  {
    id: 'tenses', title: 'Времена через смысл', minutes: 25,
    rule: 'Выбери смысл: привычка, процесс сейчас, законченное прошлое или действие от прошлого до настоящего. Не выбирай время только по одному слову-маркеру.',
    mnemonic: 'Когда? Закончилось? Есть связь с настоящим?',
    examples: ['I study every day.', 'I am studying now.', 'I worked there last year.', 'I have been learning English for two months.'],
    quiz: [
      { text: 'Yesterday I ___ an essay.', options: ['write', 'wrote', 'have written'], answer: 1, why: 'Указано законченное прошлое — yesterday, поэтому wrote.' },
      { text: 'I have been ___ English for two months.', options: ['learn', 'learned', 'learning'], answer: 2, why: 'Present Perfect Continuous: have/has been + V-ing.' },
    ],
    writingPrompt: 'Опиши привычку, действие сейчас, законченный опыт и занятие, которое продолжается до сих пор.',
    speakingPrompt: 'Расскажи, как изменились твои занятия за последние месяцы.', chunks: ['learn from experience', 'over the past few months'],
  },
  {
    id: 'checkpoint', title: 'Checkpoint после паузы', minutes: 20,
    rule: 'Сначала вспомни без конспекта. Затем напиши новый текст: успех в выборе ответа ещё не означает свободное применение.',
    mnemonic: 'Тест + свой текст + повтор позже.',
    examples: ['Every learner needs time.', 'I enjoy working on my project.'],
    quiz: [
      { text: 'Every learner ___ a different goal.', options: ['have', 'has', 'having'], answer: 1, why: 'Every learner — единственное число: has.' },
      { text: 'She wants to ___ for a scholarship.', options: ['applying', 'applied', 'apply'], answer: 2, why: 'Want to + базовая форма.' },
    ],
    writingPrompt: 'Без конспекта напиши 80–120 слов о цели и трудности на пути к ней. Используй времена и сочетания из прошлых уроков.',
    speakingPrompt: 'За минуту перескажи свой текст без чтения.', chunks: ['take a risk', 'make a decision'],
  },
  {
    id: 'complex-sentences', title: 'Complex sentences', minutes: 25,
    rule: 'Сначала сформулируй две простые мысли. Соедини их причиной, контрастом или условием. Although + предложение; despite + существительное/V-ing.',
    mnemonic: 'Мысль → отношение → связка.',
    examples: ['Although I feel tired, I keep learning.', 'Despite feeling tired, I keep learning.', 'I practise because I want to improve.'],
    quiz: [
      { text: '___ I was tired, I finished the task.', options: ['Despite', 'Although', 'Because of'], answer: 1, why: 'После although идёт предложение I was tired.' },
      { text: 'Despite ___ difficulties, we continued.', options: ['facing', 'we face', 'face'], answer: 0, why: 'После despite здесь нужна форма V-ing: facing.' },
    ],
    writingPrompt: 'Соедини 3 пары собственных мыслей с although, despite и because. Добавь короткий вывод.',
    speakingPrompt: 'Объясни трудность, причину продолжать и возможное решение.', chunks: ['despite the difficulties', 'as a result'],
  },
  {
    id: 'verb-patterns', title: 'Day 8 · Verb patterns', minutes: 25,
    rule: 'Want/need/decide/plan + to + verb. Keep/enjoy/avoid + V-ing. Can/should/must + базовая форма без to.',
    mnemonic: 'Want to learn · keep learning · can learn.',
    examples: ['I want to test my idea.', 'I keep learning.', 'My project can grow.'],
    quiz: [
      { text: 'I want ___ my idea.', options: ['to testing', 'to test', 'test'], answer: 1, why: 'Want + to + базовая форма: to test.' },
      { text: 'She keeps ___ new skills.', options: ['learning', 'to learn', 'learn'], answer: 0, why: 'Keep + V-ing: keeps learning.' },
      { text: 'We can ___ this problem.', options: ['to solve', 'solving', 'solve'], answer: 2, why: 'После can нужна базовая форма без to.' },
    ],
    writingPrompt: 'Напиши 5–6 предложений о своей цели: что хочешь сделать, что продолжаешь делать, чего избегаешь и что можешь изменить. Используй минимум три verb patterns.',
    speakingPrompt: 'За 1–2 минуты расскажи о навыке, который хочешь освоить: зачем он нужен и как будешь учиться.', chunks: ['keep working towards a goal', 'avoid making the same mistake', 'plan to improve'],
  },
]

export function gradeLearningQuiz(topicId: string, answers: number[]) {
  const lesson = learningCurriculum.find(l => l.id === topicId)
  if (!lesson || answers.length !== lesson.quiz.length || answers.some((a, i) => !Number.isInteger(a) || a < 0 || a >= lesson.quiz[i].options.length)) return null
  return { correct: lesson.quiz.filter((q, i) => q.answer === answers[i]).length, total: lesson.quiz.length }
}
