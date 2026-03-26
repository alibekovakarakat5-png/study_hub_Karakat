const WHATSAPP_NUMBER = '77075884651'

export function openWhatsApp(message: string): void {
  const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`
  window.open(url, '_blank')
}

export function buildSupportMessage(form: {
  name: string
  age: string
  city: string
  email: string
  story: string
  goals: string
}): string {
  return [
    '📚 *Заявка на бесплатный доступ — Study Hub*',
    '',
    `👤 *Имя:* ${form.name}`,
    `🎂 *Возраст:* ${form.age}`,
    `📍 *Город:* ${form.city}`,
    `📧 *Email:* ${form.email}`,
    '',
    `📝 *О себе:*\n${form.story}`,
    '',
    form.goals ? `🎯 *Цели и мечты:*\n${form.goals}` : '',
  ]
    .filter(Boolean)
    .join('\n')
}

export function buildPricingMessage(planName: string): string {
  return [
    '💳 *Запрос на подключение тарифа — Study Hub*',
    '',
    `📦 *Тариф:* ${planName}`,
    '',
    'Привет! Хочу подключить этот тариф. Расскажите подробнее об условиях оплаты.',
  ].join('\n')
}

export function buildDemoMessage(source: string): string {
  return [
    '🚀 *Запрос на демо-доступ — Study Hub*',
    '',
    `📌 *Откуда:* ${source}`,
    '',
    'Привет! Хочу получить бесплатный доступ к платформе Study Hub.',
  ].join('\n')
}

export function buildStudyAbroadMessage(countryName: string): string {
  return [
    '🌍 *Запрос — обучение за рубежом — Study Hub*',
    '',
    `🏳️ *Страна:* ${countryName}`,
    '',
    'Привет! Хочу узнать подробнее о возможностях обучения в этой стране. Расскажите про стипендии и условия поступления.',
  ].join('\n')
}
