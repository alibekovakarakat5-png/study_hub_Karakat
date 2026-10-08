// Local built UI with mocked API only; never sends real Telegram messages.
import { createRequire } from 'node:module'
import path from 'node:path'
import assert from 'node:assert/strict'
const require = createRequire(path.resolve('.studyhub-local/browser-test/package.json'))
const { chromium } = require('playwright')
const browser = await chromium.launch({ channel: 'msedge', headless: true })
const context = await browser.newContext({ viewport: { width: 390, height: 844 } })
let available = true; let linked = false; let generated = false; let resetSubmitted = false
const user = () => ({ id: 'synthetic', name: 'Synthetic User', role: 'admin', email: 'synthetic@example.invalid', telegramLinked: linked, isPremium: false })
await context.route('**/*', async route => {
  const url = new URL(route.request().url())
  if (url.pathname.startsWith('/api/')) {
    const body = route.request().postDataJSON()
    let result = {}
    if (url.pathname === '/api/auth/recovery-options') result = { available, botUrl: available ? 'https://t.me/SyntheticStudyHubBot?start=reset_password' : null }
    if (url.pathname === '/api/auth/me') result = { user: user() }
    if (url.pathname === '/api/auth/reset-password') { assert.match(body.token, /^tg1_/); assert.equal(body.password, 'synthetic-password'); resetSubmitted = true; result = { ok: true } }
    if (url.pathname === '/api/users/me/telegram-link') {
      assert.equal(body.currentPassword, 'synthetic-password')
      if (route.request().method() === 'POST') { generated = true; result = { code: 'A'.repeat(64), botUrl: 'https://t.me/SyntheticStudyHubBot?start=' + 'A'.repeat(64), expiresAt: new Date(Date.now() + 900000).toISOString() } }
      else { linked = false; result = { ok: true } }
    }
    return route.fulfill({ json: result })
  }
  return url.hostname === '127.0.0.1' || ['data:', 'blob:'].includes(url.protocol) ? route.continue() : route.abort()
})
const page = await context.newPage()
const errors = []
page.on('pageerror', e => errors.push(e.message))
try {
  await page.goto('http://127.0.0.1:4321/forgot-password')
  await page.getByRole('link', { name: 'Открыть Telegram' }).waitFor()
  assert.equal(await page.locator('input[type=email]').count(), 0)
  assert.match(await page.getByRole('link', { name: 'Открыть Telegram' }).getAttribute('href'), /start=reset_password/)
  await page.getByText('Telegram ещё не привязан?', { exact: true }).click()
  await page.getByText(/Восстановление по почте пока не подключено/).waitFor()
  available = false; await page.reload()
  await page.getByRole('alert').waitFor()
  assert.equal(await page.getByRole('link', { name: 'Открыть Telegram' }).count(), 0)
  available = true; await page.getByRole('button', { name: 'Проверить снова' }).click()
  await page.getByRole('link', { name: 'Открыть Telegram' }).waitFor()
  await page.screenshot({ path: '.studyhub-local/telegram-recovery-mobile.png', fullPage: true })
  await page.goto('http://127.0.0.1:4321/reset-password#token=tg1_' + 'a'.repeat(64))
  const passwords = page.locator('input[type=password]')
  await passwords.nth(0).fill('synthetic-password'); await passwords.nth(1).fill('synthetic-password')
  await page.locator('button[type=submit]').click()
  await page.waitForTimeout(300)
  assert.equal(resetSubmitted, true)
  await page.evaluate(u => {
    localStorage.setItem('studyhub-token', 'synthetic-token')
    localStorage.setItem('studyhub-storage', JSON.stringify({ state: { user: u, isAuthenticated: true }, version: 0 }))
  }, user())
  await page.goto('http://127.0.0.1:4321/settings')
  await page.getByLabel('Текущий пароль для привязки').fill('synthetic-password')
  const section = page.locator('section').filter({ has: page.getByLabel('Текущий пароль для привязки') })
  await section.getByRole('button').filter({ has: page.locator('svg.lucide-send') }).click()
  await page.locator('code').filter({ hasText: '/link ' }).waitFor()
  assert.equal(generated, true)
  assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1))
  linked = true; await page.getByRole('button', { name: 'Проверить привязку' }).click()
  await page.getByText('Telegram привязан. Восстановление пароля доступно через бота.', { exact: true }).waitFor()
  assert.equal(await page.locator('code').filter({ hasText: '/link ' }).count(), 0)
  await page.getByLabel('Текущий пароль для отключения').fill('synthetic-password')
  await page.getByRole('button', { name: /Отвязать|Отключить Telegram/i }).click()
  await page.getByLabel('Текущий пароль для привязки').waitFor()
  assert.equal(linked, false)
  assert.deepEqual(errors, [])
  console.log('PASS: mobile recovery, outage/retry, fragment reset, password-confirmed link/unlink, live linkage refresh; no real API writes')
} catch (error) { await page.screenshot({ path: '.studyhub-local/telegram-recovery-failure.png', fullPage: true }); throw error }
finally { await browser.close() }
