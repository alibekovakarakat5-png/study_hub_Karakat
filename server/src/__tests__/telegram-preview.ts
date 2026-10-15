// Local acceptance server: no real database, Telegram or AI.
async function main() {
  if (process.env.STUDYHUB_TEST_PREVIEW !== '1') throw new Error('Isolated preview flag required')
  process.env.JWT_SECRET = 'telegram-review-local-only'
  process.env.ANTHROPIC_API_KEY = 'test-only'
  process.env.GROQ_API_KEY = 'test-only'
  process.env.DATABASE_URL = 'postgresql://unused:unused@127.0.0.1:1/unused'
  process.env.REVIEW_BUILD_SHA = 'aaaaaaaa'
  delete process.env.TELEGRAM_BOT_TOKEN
  global.fetch = async () => { throw new Error('External network disabled in acceptance server') }
  const { reviewFixture } = await import('./review-fixture')
  const { app, token } = reviewFixture()
  app.get('/__test/login', (_req, res) => {
    const user = { id: 'owner-a', name: 'Тестовый владелец', email: 'owner-a@example.invalid', role: 'admin', isPremium: false }
    res.type('html').send(`<script>sessionStorage.clear();localStorage.clear();localStorage.setItem('studyhub-token',${JSON.stringify(token())});localStorage.setItem('studyhub-storage',JSON.stringify({state:{user:${JSON.stringify(user)},isAuthenticated:true,onboardingCompleted:true},version:0}));location.replace('/owner-review')</script>`)
  })
  app.listen(4331, '127.0.0.1', () => console.log('Synthetic Telegram review API: http://127.0.0.1:4331'))
}
void main()
