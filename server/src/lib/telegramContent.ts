export const CHANNEL_URL = 'https://t.me/skyllaAI'
export const appSite = () => (process.env.APP_URL || 'https://study-hub-karakat.vercel.app').replace(/\/$/, '')
export function ieltsEntry(site: string, wordBlock = '') {
  return {
    text: '🇬🇧 <b>Практика английского и материалы IELTS</b>\n\n' +
      'В учебном кабинете можно сохранять работы, разбирать ошибки и дорабатывать текст. ' +
      'Требования к IELTS зависят от конкретной программы и типа экзамена — проверь их на сайте организации.\n\n' +
      'В этом боте пока нет проверки Speaking, полного пробника и оценки IELTS band.' + wordBlock,
    reply_markup: { inline_keyboard: [
      [{ text: '✍️ Продолжить английский', url: `${site}/ielts-coach` }],
      [{ text: '📚 Материалы IELTS', url: `${site}/ielts` }],
      [{ text: '📢 Канал Skylla.hub', url: CHANNEL_URL }],
      [{ text: '↩️ Главное меню', callback_data: 'flow:main' }],
    ] },
  }
}
export function entMiniResult(correct: number, total = 5) {
  return `📊 <b>Мини-практика ЕНТ</b>\n\nПравильных ответов: <b>${correct}/${total}</b>\n\n` +
    'Это результат только этих вопросов, не прогноз балла ЕНТ. Разбери объяснения и продолжи практику. ' +
    'Ответы этой мини-практики пока не сохраняются в истории аккаунта.'
}
export const automaticChannelPolicy = {
  enabled: false,
  reason: 'Автопубликация новостей отключена: суммы, дедлайны и истории требуют проверки первоисточников владельцем. AI-идеи остаются черновиками.',
} as const
