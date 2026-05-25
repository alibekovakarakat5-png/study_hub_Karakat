// ── LessonRenderer ────────────────────────────────────────────────────────────
//
// Pretty rendering for AI-generated lessons: Markdown + LaTeX math + GFM tables
// with section-by-section fade-in animation. Used in both:
//   - Teacher preview (AI Урок tab, stage 2)
//   - Student lesson view (Dashboard → Задания → reading-type)

import { useMemo } from 'react'
import { motion } from 'framer-motion'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import remarkMath from 'remark-math'
import rehypeKatex from 'rehype-katex'
import 'katex/dist/katex.min.css'

interface Props {
  markdown: string
  className?: string
}

// Split a markdown doc into top-level "##" sections so we can animate them in.
function splitSections(md: string): { heading: string; body: string }[] {
  const lines = md.split('\n')
  const out: { heading: string; body: string }[] = []
  let cur: { heading: string; body: string[] } | null = null

  for (const line of lines) {
    if (line.startsWith('## ')) {
      if (cur) out.push({ heading: cur.heading, body: cur.body.join('\n').trim() })
      cur = { heading: line.replace(/^##\s*/, ''), body: [] }
    } else if (cur) {
      cur.body.push(line)
    } else {
      // Content before first heading
      if (!out.length) out.push({ heading: '', body: line })
      else out[out.length - 1]!.body += '\n' + line
    }
  }
  if (cur) out.push({ heading: cur.heading, body: cur.body.join('\n').trim() })
  return out.filter(s => s.heading || s.body)
}

// Inline-only renderer for short snippets (quiz text, options, explanations).
// Strips the wrapping <p> so it can sit inside an existing block.
export function InlineMd({ children }: { children: string }) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm, remarkMath]}
      rehypePlugins={[rehypeKatex]}
      components={{
        p:    ({ children }) => <>{children}</>,
        code: ({ children }) => (
          <code className="bg-purple-50 text-purple-900 px-1 py-0.5 rounded font-mono text-[0.9em]">{children}</code>
        ),
      }}
    >
      {children}
    </ReactMarkdown>
  )
}

export default function LessonRenderer({ markdown, className = '' }: Props) {
  const sections = useMemo(() => splitSections(markdown), [markdown])

  return (
    <div className={`lesson-renderer ${className}`}>
      {sections.map((sec, idx) => (
        <motion.section
          key={idx}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: idx * 0.06, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className="mb-6 last:mb-0"
        >
          {sec.heading && (
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3 flex items-center gap-2">
              {sec.heading}
            </h2>
          )}
          <div className="prose prose-sm sm:prose-base max-w-none
            prose-headings:text-gray-900 prose-headings:font-bold
            prose-h3:text-base prose-h3:mt-4 prose-h3:mb-2 prose-h3:text-purple-700
            prose-p:text-gray-700 prose-p:leading-relaxed
            prose-strong:text-gray-900 prose-strong:font-semibold
            prose-li:my-1 prose-li:text-gray-700
            prose-table:my-3 prose-th:bg-gray-50 prose-th:font-semibold prose-th:px-3 prose-th:py-2
            prose-td:px-3 prose-td:py-2 prose-td:border-gray-200
            prose-code:bg-purple-50 prose-code:text-purple-900 prose-code:px-1.5 prose-code:py-0.5
            prose-code:rounded prose-code:font-mono prose-code:text-sm prose-code:before:content-none prose-code:after:content-none
            prose-blockquote:border-l-4 prose-blockquote:border-purple-300 prose-blockquote:bg-purple-50/50
            prose-blockquote:px-4 prose-blockquote:py-2 prose-blockquote:rounded-r-lg prose-blockquote:not-italic
          ">
            <ReactMarkdown
              remarkPlugins={[remarkGfm, remarkMath]}
              rehypePlugins={[rehypeKatex]}
            >
              {sec.body}
            </ReactMarkdown>
          </div>
        </motion.section>
      ))}
    </div>
  )
}
