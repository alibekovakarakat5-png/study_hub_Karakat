import nodemailer from 'nodemailer'

const transporter = process.env.SMTP_HOST
  ? nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT ?? 587),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    })
  : null

const FROM = process.env.SMTP_FROM ?? 'StudyHub <noreply@studyhub.kz>'
const APP_URL = process.env.FRONTEND_URL ?? 'https://studyhub.kz'

export async function sendPasswordResetEmail(email: string, token: string, userName: string): Promise<boolean> {
  if (!transporter) {
    console.warn('[Email] SMTP not configured — reset email not sent')
    return false
  }
  const resetUrl = `${APP_URL}/reset-password?token=${token}`
  await transporter.sendMail({
    from: FROM,
    to: email,
    subject: 'StudyHub — Сброс пароля',
    html: `
      <div style="font-family: 'Inter', sans-serif; max-width: 480px; margin: 0 auto; padding: 32px; background: #f8fafc; border-radius: 16px;">
        <div style="text-align: center; margin-bottom: 24px;">
          <h1 style="color: #2563eb; font-size: 24px; margin: 0;">Study Hub</h1>
        </div>
        <h2 style="color: #1e293b; font-size: 20px;">Сброс пароля</h2>
        <p style="color: #475569;">Привет, ${userName}!</p>
        <p style="color: #475569;">Мы получили запрос на сброс пароля для вашего аккаунта.</p>
        <div style="text-align: center; margin: 24px 0;">
          <a href="${resetUrl}"
             style="display: inline-block; background: linear-gradient(135deg, #2563eb, #7c3aed); color: white; padding: 14px 32px; border-radius: 12px; text-decoration: none; font-weight: 600; font-size: 16px;">
            Сбросить пароль
          </a>
        </div>
        <p style="color: #94a3b8; font-size: 13px;">Ссылка действительна 1 час. Если вы не запрашивали сброс — проигнорируйте это письмо.</p>
        <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 24px 0;" />
        <p style="color: #94a3b8; font-size: 12px; text-align: center;">StudyHub — AI-платформа подготовки к ЕНТ и IELTS</p>
      </div>
    `,
  })
  return true
}
