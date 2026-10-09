// Original practice material, not a past paper or an official contest specification.
// A grade does not establish CEFR level: adapt after the initial attempt.
const q = (topic, text, options, correctAnswer, explanation) => ({ topic, text, options, correctAnswer, explanation })
const grammar = 'Грамматика', words = 'Слова и сочетания', reading = 'Чтение', logic = 'Контекст и логика'
const pack = (title, type, stage, minutes, text, questions, rubric) => ({
  title, type, description: `${minutes}–${minutes + 5} минут. Авторская практика для 6 класса; не официальный вариант олимпиады.`,
  content: { stage, minutes, ...(type === 'reading' ? { theory: text, isLesson: true, quiz: questions.map((v, i) => ({ ...v, id: `${stage}-${i + 1}` })) } : type === 'test' ? { theory: text, questions: questions.map((v, i) => ({ ...v, id: `${stage}-${i + 1}` })) } : { text, rubric }) },
})

export const englishOlympiadGrade6 = [
  pack('01 · Старт: найди языковые подсказки', 'test', 'diagnostic', 20,
    `## Твоя первая миссия
Сначала попробуй без словаря и подсказок. Если сомневаешься, выбери наиболее подходящий ответ. Это стартовая точка, а не школьная оценка и не определение уровня английского.

В вопросах встречаются времена, слова, чтение и логика. После сдачи откроется объяснение каждого ответа. Куратор выберет, чему уделить больше внимания.

## Как работать
Прочитай предложение целиком → найди подсказку → исключи неподходящие ответы → выбери один. Не торопись: здесь нет обратного отсчёта.`, [
      q(grammar, 'My brother usually ___ to school by bus.', ['go', 'goes', 'is going', 'went'], 1, 'Usually описывает привычку. В Present Simple после he/she/it у глагола появляется -s: my brother goes. Go подходит для I/you/we/they; is going — для действия сейчас; went — для прошлого.'),
      q(grammar, 'Listen! Someone ___ at the door.', ['knocks', 'knocked', 'is knocking', 'knock'], 2, 'Listen! направляет внимание на действие в этот момент: is knocking. Someone употребляется с is. Knocks — регулярное действие, knocked — прошлое.'),
      q(grammar, 'We ___ our grandparents last Sunday.', ['visit', 'visited', 'visiting', 'visits'], 1, 'Last Sunday — завершённое прошлое. Visit — правильный глагол: visited. Visits — настоящее после he/she/it; visiting не может быть сказуемым без вспомогательного глагола.'),
      q(grammar, 'There isn’t ___ milk in the fridge.', ['many', 'a few', 'an', 'much'], 3, 'Milk — неисчисляемое существительное. В отрицательном предложении подходит much. Many и a few относятся к исчисляемым предметам во множественном числе; an milk нельзя.'),
      q(grammar, 'This bag is ___ than that one.', ['heavy', 'heaviest', 'heavier', 'more heavyer'], 2, 'Than — подсказка сравнения двух предметов. Heavy → heavier: y меняется на i, добавляем -er. Heaviest — превосходная степень; двойной вариант more heavyer неверен.'),
      q(words, 'Please ___ attention to the instructions.', ['make', 'pay', 'do', 'take'], 1, 'Устойчивое сочетание — pay attention to: обращать внимание на. Запоминай целое сочетание, а не один перевод слова attention.'),
      q(words, 'The girl speaks very ___. We can understand every word.', ['clear', 'clearly', 'clearness', 'cleared'], 1, 'Слово описывает действие speaks: как говорит? Clearly — наречие. Clear обычно описывает предмет: a clear explanation. Clearness — существительное, cleared — форма глагола.'),
      q(words, 'Which word is the opposite of “borrow” in “Can I borrow your pen?”', ['lend', 'buy', 'keep', 'lose'], 0, 'Borrow — взять на время, lend — дать на время. I borrow a pen from you; you lend a pen to me. Buy — купить, keep — хранить, lose — потерять.'),
      q(reading, 'The notice says: “The library closes at 4 today, one hour earlier than usual.” When does it usually close?', ['At 3', 'At 4', 'At 5', 'At 6'], 2, 'Сегодня закрытие в 4, на час раньше обычного. Значит, обычно в 5. Earlier than usual — важная подсказка; в вопросе спрашивают usually, а не today.'),
      q(reading, '“Mia wanted to cycle, but it was raining, so she took the bus.” Why did Mia take the bus?', ['Her bicycle was broken.', 'It was raining.', 'She dislikes cycling.', 'The bus was free.'], 1, 'Причина названа прямо: it was raining. Остальные варианты возможны в жизни, но текст их не подтверждает. В чтении выбирай доказательство из текста.'),
      q(logic, '“Would you like some juice?” Choose the most suitable reply.', ['Yes, I like.', 'Yes, please.', 'I am juice.', 'Yes, I do yesterday.'], 1, 'Это предложение напитка. Вежливый ответ — Yes, please. На Do you like juice? можно ответить Yes, I do, но вопрос здесь другой.'),
      q(logic, 'Lena is older than Max. Max is older than Sam. Who is the youngest?', ['Lena', 'Max', 'Sam', 'They are the same age.'], 2, 'Построй цепочку: Lena старше Max, Max старше Sam. Самый младший — Sam. Youngest — превосходная степень от young.'),
    ]),
  pack('02 · Детектив времени: usually, now, yesterday', 'reading', 'time', 15,
    `## Дело о трёх фотографиях
Представь три снимка: обычный школьный день, действие прямо сейчас и вчерашняя поездка. Твоя задача — подобрать глагол к нужному снимку.

## Три шага
1. Найди время или смысл: every day / now / yesterday.
2. Посмотри на подлежащее: I, she, they.
3. Проверь весь глагол: окончание и вспомогательное слово.

| Смысл | Пример | На что смотреть |
|---|---|---|
| Привычка | She reads every evening. | В Present Simple: he/she/it + -s. |
| Сейчас | She is reading now. | am/is/are + глагол-ing. |
| Законченное прошлое | She read a story yesterday. | У read форма пишется одинаково, но произносится иначе. |

## Ловушка did
После did/didn’t глагол возвращается в начальную форму: Did she go? She didn’t go. Не did went!

## Пробуем вместе
“Look! The cat ___.” Подсказка Look! и действие сейчас → is sleeping. Для “The cat usually ___ here” → sleeps.

Слова-подсказки помогают, но всегда проверяй смысл всего предложения.`, [
      q(grammar, 'Every Saturday, Leo ___ football with his friends.', ['play', 'plays', 'is playing', 'played'], 1, 'Every Saturday — привычка; Leo = he → plays. Сначала время, потом подлежащее, потом окончание.'),
      q(grammar, 'Look at Nina! She ___ a picture at the moment.', ['draw', 'draws', 'drew', 'is drawing'], 3, 'At the moment и Look! показывают действие сейчас. She is drawing — полная форма Present Continuous.'),
      q(grammar, 'Yesterday we ___ to the museum.', ['go', 'went', 'gone', 'going'], 1, 'Yesterday требует прошедшего времени. Go — неправильный глагол: go → went. Gone употребляется в других конструкциях, например have gone.'),
      q(grammar, 'Choose the correct question about yesterday.', ['Did you saw the robot?', 'Did you see the robot?', 'Do you saw the robot?', 'Did you seen the robot?'], 1, 'После did — начальная форма see. Прошедшее время уже обозначено словом did. Saw и seen здесь не нужны.'),
      q(grammar, 'We didn’t ___ the answer during the quiz yesterday.', ['knew', 'known', 'know', 'knows'], 2, 'После didn’t используется начальная форма know. Не добавляй вторую отметку прошлого времени к глаголу.'),
    ]),
  pack('03 · Лаборатория слов: собираем сочетания', 'reading', 'words', 15,
    `## Слова любят компанию
В олимпиадном задании часто важно не слово по отдельности, а его соседи.

- **do homework** — выполнять домашнюю работу;
- **make a mistake** — допустить ошибку;
- **pay attention to** — обратить внимание на;
- **interested in** — интересоваться;
- **good at** — хорошо справляться с чем-то.

## Кто? Какой? Как?
**A careful student** — careful описывает ученика. **The student works carefully** — carefully описывает действие works.

Пример: “The instructions are clear. The teacher explains them clearly.”

## Мини-ловушка: borrow и lend
**I borrow a book from you** — я беру книгу у тебя. **You lend a book to me** — ты даёшь мне книгу. Сначала реши, кто отдаёт, а кто получает.

## Как запоминать
Прочитай сочетание → закрой его → придумай свой пример → проверь. Завтра попробуй вспомнить снова без подсказки.`, [
      q(words, 'I always ___ my homework before dinner.', ['make', 'do', 'take', 'pay'], 1, 'Правильное сочетание — do homework. Make сочетается, например, с a mistake или a cake.'),
      q(words, 'Emma is interested ___ space and robots.', ['at', 'on', 'in', 'for'], 2, 'Запоминаем interested in целиком. Не переносим русский предлог в английское сочетание.'),
      q(words, 'This is a ___ answer. You explained it well.', ['clearly', 'clear', 'clearerly', 'clearness'], 1, 'Answer — существительное. Его описывает прилагательное clear. Clearly описывает действие: explain clearly.'),
      q(words, 'Please read the question ___ before you answer.', ['careful', 'carefully', 'care', 'carefulness'], 1, 'Read — действие: прочитай как? Carefully. A careful reader — внимательный читатель, но read carefully — читать внимательно.'),
      q(words, 'I will return it tomorrow. Could you ___ me your dictionary?', ['borrow', 'lend', 'spend', 'learn'], 1, 'Собеседника просят дать словарь: lend me your dictionary. Borrow означало бы взять, а не дать. Return it tomorrow подтверждает временную передачу.'),
    ]),
  pack('04 · Reading Detective: исчезнувший ключ', 'reading', 'reading', 20,
    `## Читаем как детектив
Сначала пойми, что произошло. Затем прочитай вопрос и найди фразу-доказательство. Не выбирай ответ только потому, что в нём знакомое слово.

## The missing key
On Friday, Maya and Ben arrived at the school science club at half past three. Their teacher, Ms Green, was waiting outside the classroom. She could not find the key. Maya wanted to search the playground, but Ben remembered that Ms Green had used the library before lunch. They went there together. The librarian pointed to a small blue box near the window. Inside it was the key.

The club usually tested robots on Fridays. That day, however, they had only twenty minutes left, so they planned a new robot instead. Maya drew its arms, and Ben wrote a list of materials. “We did not build anything today,” Ben said. “But now we know what to do next week,” Maya replied.

## Три ловушки
- **Usually** и **that day** могут описывать разные действия.
- Точное время: **half past three = 3:30**.
- “В тексте не сказано” не означает “это точно неправда”. Не додумывай сведения.

При ответе можно возвращаться к тексту.`, [
      q(reading, 'What time did Maya and Ben arrive?', ['3:00', '3:15', '3:30', '4:30'], 2, 'Доказательство: at half past three. Half past — половина часа после указанного часа, то есть 3:30.'),
      q(reading, 'Why was Ms Green outside the classroom?', ['She was looking for Ben.', 'She could not find the key.', 'The class was over.', 'She wanted to draw outside.'], 1, 'Текст прямо связывает ожидание у кабинета с пропавшим ключом: She could not find the key. Остальные причины не названы.'),
      q(reading, 'Who suggested the useful place to search?', ['Maya', 'Ben', 'The robot', 'The librarian'], 1, 'Ben вспомнил, что учительница была в библиотеке. Maya хотела искать на площадке. Librarian показала коробку уже после их прихода.'),
      q(reading, 'What did the club do that Friday?', ['They tested their old robots.', 'They built two new robots.', 'They planned a new robot.', 'They cancelled the club forever.'], 2, 'Usually tested robots — обычный порядок. That day ... planned a new robot instead — то, что произошло именно в этот день.'),
      q(reading, 'Which statement is NOT supported by the story?', ['The key was in a blue box.', 'Maya drew the robot’s arms.', 'The librarian had hidden the key as a joke.', 'Ben made a list of materials.'], 2, 'Мы знаем только, что библиотекарь указала на коробку. Кто положил туда ключ и зачем — не сказано. Не добавляй собственную версию к фактам.'),
      q(reading, 'How does Maya see the short meeting at the end?', ['It was still useful for their next meeting.', 'It was dangerous.', 'They should stop learning science.', 'They finished building the robot.'], 0, 'Now we know what to do next week показывает пользу планирования. Она не утверждает, что робот уже построен.'),
    ]),
  pack('05 · Второй заход: новые вопросы на знакомые ловушки', 'test', 'review', 15,
    `## Сначала вспомни сама
Вернись к этому шагу на следующий день после уроков 02–04, если позволяет время. Закрой прошлые объяснения и попробуй новые вопросы.

После сдачи сравни не только проценты, но и причину ошибки: время, форма слова, сочетание или невнимательное чтение. Одна и та же ошибка дважды — сигнал разобрать ещё один пример с куратором.`, [
      q(grammar, 'My cousin ___ chess every evening.', ['plays', 'play', 'is playing', 'played'], 0, 'Every evening — привычка, my cousin = he/she, поэтому plays. Правило то же, что в уроке о времени, но пример новый.'),
      q(grammar, 'At the moment, the children ___ a model plane.', ['build', 'built', 'are building', 'builds'], 2, 'At the moment → Present Continuous. The children = they, поэтому are building.'),
      q(grammar, 'Did Anna ___ her notebook yesterday?', ['brought', 'bring', 'brings', 'bringing'], 1, 'После did — начальная форма bring. В утвердительном предложении было бы Anna brought her notebook.'),
      q(words, 'Tom is good ___ solving puzzles.', ['on', 'for', 'in', 'at'], 3, 'Правильное сочетание — good at. После предлога глагол принимает форму -ing: at solving.'),
      q(words, 'The children listened ___.', ['quiet', 'quietly', 'quietness', 'quieterly'], 1, 'Listened — действие. Наречие quietly отвечает на вопрос «как?». Quiet описывает существительное: quiet children.'),
      q(reading, '“The match starts at 2. Please arrive fifteen minutes early.” When should players arrive?', ['1:15', '1:45', '2:00', '2:15'], 1, 'На 15 минут раньше 2:00 — 1:45. Early значит раньше, не позже.'),
      q(logic, '“I can’t find my ruler.” Which reply offers help?', ['You are a ruler.', 'Let’s look in your bag.', 'Yesterday is Monday.', 'Rulers are often long.'], 1, 'Let’s look ... предлагает совместное действие и помогает решить проблему. Факт о длине линеек не является предложением помощи.'),
      q(logic, 'All the red tickets are for Saturday. Nina has a red ticket. What can we be sure of?', ['Nina’s ticket is for Saturday.', 'Nina is wearing red.', 'All Saturday tickets are red.', 'Nina bought two tickets.'], 0, 'Из «все красные билеты — на субботу» следует, что билет Нины на субботу. Обратное утверждение о всех субботних билетах не доказано.'),
    ]),
  pack('06 · Пишем сообщение: пригласи друга в клуб', 'homework', 'writing', 20,
    `## Твоя задача
Напиши на английском сообщение другу, примерно 60–80 слов. Ты приглашаешь его в школьный клуб.

Расскажи:
1. Что это за клуб и почему он тебе нравится.
2. Когда и где вы встречаетесь.
3. Что вы обычно делаете.
4. Что собираетесь сделать на следующей встрече.
5. Задай другу один вопрос.

## План без готового ответа
Приветствие → приглашение → две-три детали → вопрос → прощание.

Можно опереться на начала: “Would you like to ...?”, “We usually ...”, “Next time, we are going to ...”. Добавь свои мысли. Не копируй целое сообщение из переводчика.

## Перед отправкой
Проверь: есть ли все пять пунктов? Не пропали ли -s после he/she/it и am/is/are? Есть ли заглавные буквы и точки?

Если 60 слов пока трудно, напиши 4–5 своих предложений и обсуди сложные места с куратором.`, [],
    'Куратор оценивает вручную, максимум 100: выполнение задачи — 30; понятность и порядок мыслей — 25; грамматика — 25; слова, орфография и пунктуация — 20. Это учебная шкала, не официальные критерии неизвестной олимпиады. Комментарий: две сильные стороны, одна важная поправка и следующий шаг.'),
  pack('07 · Финальная миссия: проверь, что стало легче', 'test', 'checkpoint', 20,
    `## Новая проверка
Попробуй без прошлых разборов. Темы похожи на стартовую работу, но предложения новые. После сдачи куратор сравнит ошибки и результаты по темам.

Это короткая учебная проверка, а не полный пробник конкретной олимпиады. Listening и Speaking этот набор не оценивает.`, [
      q(grammar, 'Sara often ___ her younger brother with his homework.', ['help', 'helping', 'helps', 'is helped'], 2, 'Often — привычка. Sara = she, поэтому helps. Helping требует вспомогательного глагола; is helped значит «ей помогают» и не подходит по смыслу.'),
      q(grammar, 'Be quiet! The baby ___ right now.', ['sleeps', 'is sleeping', 'slept', 'sleep'], 1, 'Right now — сейчас. The baby = it → is sleeping. Просьба Be quiet! поддерживает этот смысл.'),
      q(grammar, 'Last weekend, our class ___ a new museum.', ['visits', 'visiting', 'visited', 'visit'], 2, 'Last weekend — завершённое прошлое. Visit → visited. Не выбирай настоящее visits только потому, что class — единственное число.'),
      q(grammar, 'How ___ apples do we need for the picnic?', ['much', 'many', 'a little', 'an'], 1, 'Apples можно посчитать, они во множественном числе. Вопрос количества: How many apples? How much используют с неисчисляемыми существительными.'),
      q(grammar, 'A train is usually ___ than a bicycle.', ['fast', 'fastest', 'faster', 'more faster'], 2, 'Than требует сравнения: faster. У fast прибавляется -er. More faster — двойная сравнительная степень, так не говорят.'),
      q(words, 'Don’t worry if you ___ a mistake. Read the explanation.', ['do', 'pay', 'make', 'take'], 2, 'Make a mistake — устойчивое сочетание. Ошибку делают с make, домашнюю работу — с do: do homework.'),
      q(words, 'The singer sang the song ___.', ['beautiful', 'beauty', 'beautifully', 'beautify'], 2, 'Sang — действие, его описывает наречие beautifully. Beautiful описывает предмет или человека: a beautiful song.'),
      q(words, 'I forgot my book. May I ___ yours until tomorrow?', ['lend', 'borrow', 'teach', 'spend'], 1, 'Говорящий просит взять книгу на время: borrow yours. Можно переформулировать: Could you lend me your book?'),
      q(reading, '“The art room opens at 10 today, two hours later than usual.” When does it usually open?', ['At 8', 'At 10', 'At 12', 'At 2'], 0, 'Сегодня в 10, на два часа позже обычного. Значит, обычно в 8. Сравни today и usually; later означает позже.'),
      q(reading, '“Dan planned to play outside. When the rain began, he stayed in and read a book.” Why did he stay inside?', ['He had lost his shoes.', 'It began to rain.', 'He always dislikes games.', 'The book was a present.'], 1, 'Текст называет дождь причиной изменения планов. Ни обувь, ни подарок, ни постоянная нелюбовь к играм не упомянуты.'),
      q(logic, '“Thank you for helping me.” Choose the most suitable reply.', ['You’re welcome.', 'I am eleven.', 'Never helping.', 'Yes, I am a help.'], 0, 'You’re welcome — обычный вежливый ответ на благодарность. Возраст и остальные варианты не отвечают на смысл реплики.'),
      q(logic, 'The blue box is heavier than the green box. The green box is heavier than the yellow box. Which is the lightest?', ['Blue', 'Green', 'Yellow', 'All three weigh the same.'], 2, 'Цепочка веса: blue > green > yellow. Самая лёгкая коробка — yellow. Внимательно прочитай lightest: спрашивают не самую тяжёлую.'),
    ]),
]

export const educatorNotes = {
  version: 1,
  goal: 'General English olympiad preparation, grade 6. Competition and official format not yet specified.',
  suggestedSequence: 'Session 1: initial quiz; session 2: time and collocations; session 3: reading; session 4: next-day retrieval and writing; session 5: checkpoint and review. Adjust workload after the initial attempt.',
  sourcesForTeachingApproach: [
    'https://ies.ed.gov/ncee/wwc/PracticeGuide/1',
    'https://learnenglishteens.britishcouncil.org/grammar/a1-a2-grammar',
    'https://learnenglishteens.britishcouncil.org/skills/reading/a2-reading',
  ],
  limitations: 'All passages and questions above are original. No official paper is reproduced. No CEFR, IELTS band or competition placing is inferred from these scores. Listening and speaking require separate material once competition requirements are known.',
}
