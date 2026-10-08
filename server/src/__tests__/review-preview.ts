// Synthetic acceptance server. Never import from the application entrypoint.
async function main() {
  if (process.env.STUDYHUB_TEST_PREVIEW !== '1') throw new Error('Set STUDYHUB_TEST_PREVIEW=1 for isolated tests only')
  process.env.JWT_SECRET = 'studyhub-review-browser-test-only'
  process.env.GROQ_API_KEY = 'test-only-no-network'
  process.env.ANTHROPIC_API_KEY = 'test-only-no-network'
  process.env.DATABASE_URL = 'postgresql://unused:unused@127.0.0.1:1/unused'
  process.env.REVIEW_BUILD_SHA = 'aaaaaaaa'
  const { reviewFixture } = await import('./review-fixture')
  const { fixtureId } = await import('../lib/reviewStore')
  const { app, token, repo, learning } = reviewFixture()
  app.post('/__test/reset', async (_req, res) => {
    for (const owner of ['owner-a', 'owner-b']) {
      await repo.removePrefix(owner, '')
      for (const persona of ['student-a', 'student-b', 'teacher', 'parent', 'center']) await learning.removePrefix(fixtureId(owner, persona), '')
    }
    res.json({ ok: true })
  })
  app.get('/__test/login', (_req, res) => {
    const user = { id: 'owner-a', name: 'Synthetic Owner', email: 'owner-a@example.invalid', role: 'admin', isPremium: false }
    res.type('html').send(`<script>sessionStorage.clear();localStorage.clear();localStorage.setItem('studyhub-token',${JSON.stringify(token())});localStorage.setItem('studyhub-storage',JSON.stringify({state:{user:${JSON.stringify(user)},isAuthenticated:true,onboardingCompleted:true},version:0}));location.replace('/owner-review')</script>`)
  })
  app.listen(4319, '127.0.0.1', () => console.log('ISOLATED REVIEW TEST ONLY: http://127.0.0.1:4319'))
}
void main()
