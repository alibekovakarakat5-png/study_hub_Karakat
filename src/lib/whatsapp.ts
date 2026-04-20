export const WHATSAPP_NUMBER =
  (import.meta.env.VITE_WHATSAPP_NUMBER as string | undefined)?.replace(/\D/g, '') || ''

export function openWhatsApp(message: string): void {
  if (!WHATSAPP_NUMBER) {
    console.warn('[whatsapp] VITE_WHATSAPP_NUMBER is not set')
    return
  }
  const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`
  window.open(url, '_blank')
}

export function whatsappHref(message?: string): string {
  if (!WHATSAPP_NUMBER) return '#'
  const base = `https://wa.me/${WHATSAPP_NUMBER}`
  return message ? `${base}?text=${encodeURIComponent(message)}` : base
}

export function whatsappTelHref(): string {
  return WHATSAPP_NUMBER ? `tel:+${WHATSAPP_NUMBER}` : '#'
}

export function formatWhatsappDisplay(): string {
  const n = WHATSAPP_NUMBER
  if (n.length !== 11) return n
  return `+${n[0]} ${n.slice(1, 4)} ${n.slice(4, 7)} ${n.slice(7, 9)} ${n.slice(9, 11)}`
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

export function buildOrgActivationMessage(info: {
  orgName: string
  orgType: string
  city?: string
  teacherCount: number
  studentCount: number
  ownerName?: string
}): string {
  const typeLabel =
    info.orgType === 'tutoring_center' ? 'Учебный центр' :
    info.orgType === 'school'          ? 'Школа' :
    info.orgType === 'corporate'       ? 'Корпоративное обучение' :
    info.orgType

  return [
    '🏫 *Заявка на подключение центра — Study Hub*',
    '',
    `📋 *Центр:* ${info.orgName}`,
    `🏷 *Тип:* ${typeLabel}`,
    info.city ? `📍 *Город:* ${info.city}` : '',
    '',
    `👨‍🏫 *Учителей:* ${info.teacherCount}`,
    `🎓 *Учеников:* ${info.studentCount}`,
    '',
    info.ownerName ? `👤 *Контактное лицо:* ${info.ownerName}` : '',
    '',
    'Здравствуйте! Хочу подключить наш центр к Study Hub. Расскажите про условия — стоимость зависит от количества учеников и учителей. Когда удобно обсудить?',
  ]
    .filter(Boolean)
    .join('\n')
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
