export const grammarTopics = ['agreement', 'articles', 'plurals'] as const
export type GrammarTopic = typeof grammarTopics[number]
export const grammarPractice = {
  agreement: { title: 'Согласование подлежащего и глагола', rule: 'В Present Simple с he/she/it добавляем -s. Со множественным числом используем базовую форму.', prompt: 'The pupils ___ songs in the classroom.', choices: ['sing', 'sings', 'singing'], correct: 0, explanation: 'Pupils — множественное число: pupils sing. Но один ученик: the pupil sings.', source: 'Basic English grammar, PDF с. 11–14; варианты и объяснение адаптированы.' },
  articles: { title: 'Артикли', rule: 'Для общих понятий с неисчисляемыми существительными артикль обычно не нужен. The указывает на конкретный известный предмет; a/an — на один неопределённый исчисляемый предмет.', prompt: 'I love ___ tea. (Tea in general.)', choices: ['the', 'a', '— (без артикля)'], correct: 2, explanation: 'Tea — напиток вообще, неисчисляемое существительное: I love tea. The tea означало бы конкретный чай.', source: 'Basic English grammar, PDF с. 7–9; контекст и объяснение адаптированы.' },
  plurals: { title: 'Множественное число', rule: 'Обычно добавляем -s, но некоторые формы нужно запомнить: child → children, person → people, man → men.', prompt: 'One child → two ___.', choices: ['childs', 'children', 'childes'], correct: 1, explanation: 'Child — исключение: children. Обычное окончание -s здесь не применяется.', source: 'Basic English grammar, PDF с. 4–6; задание адаптировано.' },
} satisfies Record<GrammarTopic, { title: string; rule: string; prompt: string; choices: string[]; correct: number; explanation: string; source: string }>
export const writingTasks = [
  { id: 'gifts', kind: 2, title: 'Task 2 · Подарки молодым людям', minWords: 250,
    prompt: 'Some people think that money is the best gift to give to young people while others think other types of gifts are better for young people. Discuss both views and give your opinion.',
    source: 'IELTSTutors.org, IELTS Writing Task 2 eBook, PDF с. 13–15. Тема из присланной книги; не задание Cambridge.',
    help: 'План: введение и позиция → преимущества денег → преимущества других подарков + твоя позиция → вывод. В каждом основном абзаце нужны мысль, объяснение и пример. Обсуди обе стороны. Полезные слова: benefit, appropriate, financial, independent. Не копируй готовое эссе.' },
  { id: 'health', kind: 2, title: 'Task 2 · Спорт и здоровье', minWords: 250,
    prompt: 'Some people say that the best way to improve public health is to increase the number of sports facilities. Others, however, say that this would have little effect on public health and that other measures are required. Discuss both these views and give your own opinion.',
    source: 'IELTSTutors.org, IELTS Writing Task 2 eBook, PDF с. 37–38. Тема из присланной книги.',
    help: 'Обсуди пользу спортивных объектов и другие меры, затем вырази своё мнение. Не подменяй public health профессиональным спортом. Для каждого аргумента объясни, почему эта мера помогает людям. Связки: however, in addition, as a result. Не выдумывай исследования.' },
  { id: 'students', kind: 1, title: 'Task 1 · Таблица студентов', minWords: 150,
    prompt: 'The table shows international student enrolment in three countries in 2010, 2015 and 2020. Summarise the information by selecting and reporting the main features, and make comparisons where relevant.\n\nCountry | 2010 | 2015 | 2020\nUK | 405,000 | 437,000 | 556,000\nAustralia | 271,000 | 295,000 | 509,000\nCanada | 218,000 | 354,000 | 642,000\n\nУчебные данные, не актуальная статистика.',
    source: 'Банк Study Hub: writing-t1-bar, адаптация в таблицу. Принадлежность к официальному изданию не подтверждена.',
    help: 'План: перефразируй описание → общий обзор → два абзаца сравнений. Все три значения растут; Канада из последней становится первой. Выбери важные числа и сравнения. Не добавляй причины изменений или своё мнение. Проверь прошедшее время и точность чисел.' },
] as const
export const writingTask = (id: string) => writingTasks.find(t => t.id === id)!
export const writingWordCount = (text: string) => text.match(/[A-Za-z]+(?:['’-][A-Za-z]+)*/g)?.length ?? 0
