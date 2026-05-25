// Test the Claude Code CLI as an LLM provider
import { callLLM } from '../src/lib/llmProviders'

;(async () => {
  console.log('Testing Claude Code CLI as LLM provider...\n')
  const t0 = Date.now()
  const r = await callLLM<{ answer: string; reasoning: string }>({
    system: 'Ты математик. Отвечай ТОЛЬКО валидным JSON в формате {"answer": "...", "reasoning": "..."}.',
    user:   'Сколько будет 25% от 80? Дай короткое объяснение шагов.',
    maxTokens: 500,
    parseJson: true,
  })
  console.log(`✓ Provider: ${r.provider}`)
  console.log(`✓ Latency:  ${r.ms} ms (total: ${Date.now() - t0} ms)`)
  console.log(`✓ Answer:   ${r.json.answer}`)
  console.log(`✓ Reasoning: ${r.json.reasoning}`)
})().catch(e => { console.error('❌', e.message); process.exit(1) })
