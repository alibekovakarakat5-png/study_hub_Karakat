// ── IELTS Content Database ────────────────────────────────────────────────────
// Complete reference for the IELTS preparation section.

export type IeltsSkill = 'reading' | 'writing' | 'listening' | 'speaking'
export type IeltsBand = 5 | 5.5 | 6 | 6.5 | 7 | 7.5 | 8 | 8.5 | 9

// ── Band Descriptors ──────────────────────────────────────────────────────────

export const BAND_DESCRIPTORS: Record<number, { label: string; description: string; typical: string }> = {
  9: {
    label: 'Expert',
    description: 'Full operational command of the language. Appropriate, accurate and fluent.',
    typical: 'Native speakers, advanced academics',
  },
  8: {
    label: 'Very Good',
    description: 'Fully operational command with occasional inaccuracies. Handles complex detailed argumentation.',
    typical: 'Top universities worldwide (law, medicine)',
  },
  7: {
    label: 'Good',
    description: 'Operational command with occasional inaccuracies. Generally handles complex language well.',
    typical: 'Most UK/Australian universities, immigration to Canada/Australia',
  },
  6.5: {
    label: 'Competent+',
    description: 'Effective command in familiar situations, though some inaccuracies and misunderstandings occur.',
    typical: 'Many universities, UK student visa',
  },
  6: {
    label: 'Competent',
    description: 'Effective command overall but some inaccuracies and misunderstandings occur.',
    typical: 'General immigration, some universities',
  },
  5.5: {
    label: 'Modest+',
    description: 'Partial command, handling overall meaning in most situations.',
    typical: 'Pre-sessional English courses',
  },
  5: {
    label: 'Modest',
    description: 'Partial command, likely to make many mistakes. Basic communication possible.',
    typical: 'Foundation/pathway programs',
  },
}

// ── Test Structure ────────────────────────────────────────────────────────────

export interface IeltsSection {
  skill: IeltsSkill
  duration: string
  questions: number
  order: number
  description: string
  tips: string[]
}

export const IELTS_SECTIONS: IeltsSection[] = [
  {
    skill: 'listening',
    order: 1,
    duration: '30 min + 10 min transfer',
    questions: 40,
    description: 'Four sections of increasing difficulty. Sections 1–2 are everyday social contexts; Sections 3–4 are educational/training contexts.',
    tips: [
      'Read questions BEFORE the audio starts — predict the answer type',
      'Answers come in order — do not skip ahead',
      'Watch spelling — wrong spelling = wrong answer',
      'Section 4 (monologue/lecture) is hardest — stay focused',
      'Use 10-minute transfer time to check spelling carefully',
    ],
  },
  {
    skill: 'reading',
    order: 2,
    duration: '60 min',
    questions: 40,
    description: 'Three long passages from academic texts (books, journals, newspapers). Topics are general academic interest — no specialist knowledge required.',
    tips: [
      'Spend 20 minutes per passage — no extra time at the end',
      'Skim passage first (2 min), then read questions, then scan for answers',
      'True/False/Not Given: "Not Given" means the text does not say — not that it is false',
      'Matching Headings: do these last — they require understanding of the whole paragraph',
      'Never leave a blank — guess if necessary (no negative marking)',
    ],
  },
  {
    skill: 'writing',
    order: 3,
    duration: '60 min',
    questions: 2,
    description: 'Task 1 (20 min, 150 words): Describe a graph, chart, map or process. Task 2 (40 min, 250 words): Write an essay in response to a point of view, argument or problem.',
    tips: [
      'Task 2 is worth twice as much as Task 1 — spend more time on it',
      'Always plan before writing (5 minutes for Task 2)',
      'Task 1: Do NOT give opinions — describe what you see objectively',
      'Task 2: Give a clear position in the introduction and conclusion',
      'Count words — going under 150/250 is penalised',
    ],
  },
  {
    skill: 'speaking',
    order: 4,
    duration: '11–14 min',
    questions: 3,
    description: 'Face-to-face interview with an examiner. Part 1: General questions (4–5 min). Part 2: Long turn/cue card (3–4 min). Part 3: Two-way discussion (4–5 min).',
    tips: [
      'Speak naturally — do not memorise long scripts',
      'Extend every answer: use examples, reasons, contrasts',
      'Use discourse markers: "Having said that...", "In terms of...", "What I mean is..."',
      'Hesitation phrases sound natural: "That\'s an interesting question..." / "Let me think about that..."',
      'Part 2: Make notes during the 1-minute prep time — cover all bullet points',
    ],
  },
]

// ── Writing Task 1 Types ──────────────────────────────────────────────────────

export interface Task1Type {
  id: string
  name: string
  description: string
  keyVerbs: string[]
  structure: string[]
  modelOpening: string
}

export const TASK1_TYPES: Task1Type[] = [
  {
    id: 'line-graph',
    name: 'Line Graph',
    description: 'Shows changes over time. Look for trends: rise, fall, fluctuate, remain stable.',
    keyVerbs: ['rose', 'fell', 'increased', 'decreased', 'fluctuated', 'peaked', 'declined', 'levelled off'],
    structure: [
      'Introduction: paraphrase the graph title',
      'Overview: identify 2–3 main trends (highest, lowest, most dramatic change)',
      'Detail para 1: describe main trend with specific data',
      'Detail para 2: describe secondary trend with comparisons',
    ],
    modelOpening: 'The line graph illustrates [what] [time period]. Overall, [main trend], while [secondary trend].',
  },
  {
    id: 'bar-chart',
    name: 'Bar Chart',
    description: 'Shows comparisons between categories or over time. Focus on the most and least significant bars.',
    keyVerbs: ['accounted for', 'represented', 'stood at', 'was considerably higher/lower than'],
    structure: [
      'Introduction: paraphrase',
      'Overview: note the highest/lowest and any surprising comparison',
      'Body 1: describe the most prominent categories',
      'Body 2: contrast with remaining categories',
    ],
    modelOpening: 'The bar chart compares [categories] in terms of [measure]. Overall, [most notable finding].',
  },
  {
    id: 'pie-chart',
    name: 'Pie Chart',
    description: 'Shows proportions/percentages. Compare slices; often two charts are given for comparison.',
    keyVerbs: ['comprised', 'constituted', 'made up', 'accounted for', 'the largest share was'],
    structure: [
      'Introduction: what the pie chart(s) show',
      'Overview: largest and smallest segments',
      'Body 1: describe segments with exact figures',
      'Body 2: compare charts (if two given)',
    ],
    modelOpening: 'The pie chart(s) show [what]. Overall, [largest segment] dominated, accounting for [%].',
  },
  {
    id: 'table',
    name: 'Table',
    description: 'Data across multiple categories. Select the most relevant data — do NOT describe every cell.',
    keyVerbs: ['ranged from', 'varied between', 'the highest figure was', 'in contrast'],
    structure: [
      'Introduction: paraphrase',
      'Overview: overall pattern (what stands out across rows/columns)',
      'Body 1: highlight key rows/columns',
      'Body 2: notable contrasts',
    ],
    modelOpening: 'The table provides data on [what] across [categories]. Overall, [main observation].',
  },
  {
    id: 'map',
    name: 'Map / Plan',
    description: 'Shows changes to a location over time, or compares two locations. Use location language.',
    keyVerbs: ['was replaced by', 'was extended', 'a new X was built', 'remained unchanged', 'was demolished'],
    structure: [
      'Introduction: what the maps show and the time period',
      'Overview: overall change (significant development vs minor changes)',
      'Body 1: changes in one area of the map',
      'Body 2: changes in another area',
    ],
    modelOpening: 'The maps illustrate how [place] changed between [year] and [year]. Overall, the area underwent significant development.',
  },
  {
    id: 'process',
    name: 'Process Diagram',
    description: 'Shows how something is made or how a natural process works. Use passive voice and sequencers.',
    keyVerbs: ['is produced', 'is extracted', 'is converted', 'flows into', 'is then heated'],
    structure: [
      'Introduction: what process is shown',
      'Overview: number of stages + what the process produces',
      'Body 1: first half of the stages (use sequencers: first, then, subsequently)',
      'Body 2: second half of the stages',
    ],
    modelOpening: 'The diagram illustrates the process of [what]. Overall, there are [X] main stages, beginning with [first stage] and ending with [final product].',
  },
]

// ── Writing Task 2 Essay Types ────────────────────────────────────────────────

export interface EssayType {
  id: string
  name: string
  signal: string
  structure: string[]
  template: string
  bandSevenTips: string[]
}

export const ESSAY_TYPES: EssayType[] = [
  {
    id: 'opinion',
    name: 'Opinion (Agree / Disagree)',
    signal: '"To what extent do you agree or disagree?" / "Do you agree or disagree?"',
    structure: [
      'Introduction: paraphrase + clear position (agree/partially agree/disagree)',
      'Body 1: First reason supporting your view + example',
      'Body 2: Second reason supporting your view + example',
      'Body 3 (optional): Counter-argument + rebuttal (shows critical thinking)',
      'Conclusion: Restate position + summary',
    ],
    template: `In recent years, [topic] has become increasingly debated. While some argue that [opposing view], I firmly believe that [your position] for the following reasons.

To begin with, [first reason]. For instance, [example or evidence], which clearly demonstrates that [link back to argument].

Furthermore, [second reason]. A clear example of this is [example], suggesting that [link].

Although some people contend that [counter-argument], this overlooks the fact that [rebuttal].

In conclusion, [restate position]. Therefore, [recommendation or prediction].`,
    bandSevenTips: [
      'Take a clear, consistent position — do NOT sit on the fence unless it is "discuss both views"',
      'Every body paragraph needs a topic sentence, development, and example',
      'Use hedging language: "it could be argued", "evidence suggests"',
      'Avoid memorised phrases — examiners are trained to spot them',
    ],
  },
  {
    id: 'discussion',
    name: 'Discussion (Both Views)',
    signal: '"Discuss both views and give your own opinion"',
    structure: [
      'Introduction: paraphrase + state you will discuss both sides',
      'Body 1: View A — reasons + example',
      'Body 2: View B — reasons + example',
      'Body 3: YOUR opinion — which side you agree with + why',
      'Conclusion: Summary + own opinion restated',
    ],
    template: `People hold different views about [topic]. While some believe [view A], others argue [view B]. This essay will examine both perspectives before offering my own view.

On the one hand, [view A supporters] argue that [reason 1]. This is because [explanation]. For example, [evidence].

On the other hand, [view B supporters] maintain that [reason 2]. [Example or evidence].

In my opinion, [your view], because [strongest reason].

In conclusion, while both sides have merit, I believe [restate opinion]. [Future prediction or recommendation].`,
    bandSevenTips: [
      'Your own opinion must appear — usually in a separate paragraph or merged with Body 2',
      'Do NOT just list points — DEVELOP each argument with reasons and examples',
      'Link paragraphs with discourse markers: "On the contrary", "Despite this"',
    ],
  },
  {
    id: 'problem-solution',
    name: 'Problem / Solution',
    signal: '"What are the causes? What solutions can you suggest?" / "What problems does X cause and how can they be solved?"',
    structure: [
      'Introduction: paraphrase + outline (causes/solutions will be discussed)',
      'Body 1: Causes (2–3 causes with brief explanation)',
      'Body 2: Solutions (matching solutions to causes)',
      'Conclusion: Summary + overall recommendation',
    ],
    template: `[Topic] has become a major concern in recent decades. This essay will examine the key causes of this issue and propose realistic solutions.

There are several factors contributing to [problem]. Firstly, [cause 1], which leads to [consequence]. Additionally, [cause 2] has exacerbated the situation.

However, these issues are not insurmountable. One effective solution would be [solution 1], as it directly addresses [cause]. Furthermore, [solution 2] could help mitigate [cause 2].

In conclusion, [problem] stems from [causes]. Addressing this requires [solutions]. If implemented, [positive outcome].`,
    bandSevenTips: [
      'Solutions must logically match the causes you presented',
      'Use modal verbs for solutions: "could", "should", "would"',
      'Show cause-and-effect links: "This leads to...", "As a result...", "Consequently..."',
    ],
  },
  {
    id: 'advantages-disadvantages',
    name: 'Advantages / Disadvantages',
    signal: '"Discuss the advantages and disadvantages" / "Do the advantages outweigh the disadvantages?"',
    structure: [
      'Introduction: paraphrase + state both will be discussed',
      'Body 1: Advantages (2 advantages, each with example)',
      'Body 2: Disadvantages (2 disadvantages, each with example)',
      'Conclusion: Overall assessment — do advantages outweigh? + your view if asked',
    ],
    template: `[Topic] has both proponents and critics. This essay will consider the key advantages and disadvantages before reaching a conclusion.

The primary advantage of [topic] is [advantage 1]. For example, [evidence]. Moreover, [advantage 2], which means that [benefit].

Nevertheless, there are significant drawbacks. The most notable is [disadvantage 1], which can result in [negative effect]. Furthermore, [disadvantage 2] raises concerns about [issue].

In conclusion, while [topic] offers [key benefit], the [key drawback] cannot be ignored. On balance, [overall assessment].`,
    bandSevenTips: [
      'If asked "do advantages outweigh", give a clear answer in your conclusion',
      'Aim for equal balance — 2 strong advantages and 2 strong disadvantages',
      'Avoid extreme vocabulary: "devastating" / "absolutely perfect"',
    ],
  },
]

// ── Reading Question Types ────────────────────────────────────────────────────

export interface ReadingQuestionType {
  id: string
  name: string
  strategy: string
  trap: string
}

export const READING_QUESTION_TYPES: ReadingQuestionType[] = [
  {
    id: 'tfng',
    name: 'True / False / Not Given',
    strategy: 'Match the statement to a specific sentence in the text. True = matches, False = contradicts, Not Given = not mentioned.',
    trap: '"Not Given" is not the same as "False". If the text doesn\'t address it at all, it\'s Not Given.',
  },
  {
    id: 'ynng',
    name: 'Yes / No / Not Given',
    strategy: 'Agree with the writer\'s opinion/claim = Yes. Disagrees = No. Not discussed = Not Given.',
    trap: 'These test the writer\'s view, not facts. Look for opinion language.',
  },
  {
    id: 'matching-headings',
    name: 'Matching Headings',
    strategy: 'Read the paragraph first, identify the MAIN idea. Headings are about the whole paragraph, not a detail.',
    trap: 'There are always more headings than paragraphs. Eliminate obvious wrong answers first.',
  },
  {
    id: 'matching-info',
    name: 'Matching Information',
    strategy: 'Answers may not be in order. Scan for key nouns from the statement. Use letters (A, B, C) to track.',
    trap: 'Some paragraphs may be used more than once — the instructions will tell you.',
  },
  {
    id: 'sentence-completion',
    name: 'Sentence Completion',
    strategy: 'The answer is usually the exact words from the text. Check word limit (e.g. "NO MORE THAN TWO WORDS").',
    trap: 'Do not change the word form — use the exact words from the passage.',
  },
  {
    id: 'summary-completion',
    name: 'Summary / Note Completion',
    strategy: 'Summary follows the order of the passage. Predict the part of speech before looking for the answer.',
    trap: 'The words in the summary are often synonyms of passage words — recognise paraphrasing.',
  },
  {
    id: 'multiple-choice',
    name: 'Multiple Choice',
    strategy: 'Eliminate obviously wrong answers. The correct answer paraphrases the text, not copies it.',
    trap: 'Distractors often use exact words from the text but change the meaning — read carefully.',
  },
]

// ── Speaking Cue Cards (Part 2) ───────────────────────────────────────────────

export interface CueCard {
  id: string
  topic: string
  prompt: string
  bulletPoints: string[]
  modelAnswer: string
  bandSevenPhrases: string[]
}

export const SPEAKING_CUE_CARDS: CueCard[] = [
  {
    id: 'memorable-journey',
    topic: 'A Memorable Journey',
    prompt: 'Describe a journey you remember well.',
    bulletPoints: [
      'Where you went',
      'Who you went with',
      'What you did there',
      'Why it was memorable',
    ],
    modelAnswer: `One journey that truly stands out in my memory is a trip I took to the mountains about two years ago. I went with my closest friends — there were four of us in total — and we decided to hike for three days.

What made it particularly memorable was the combination of challenge and beauty. On the second day, we reached a summit at over 3,000 metres, and the view was simply breathtaking. I remember standing there, completely exhausted but overwhelmed by a sense of achievement.

Beyond the scenery, I think what made the trip so special was the connection I felt with my friends. Without our phones working properly, we actually talked properly — about life, about our dreams. It felt very real.

I would say it changed my perspective on travel. Since then, I have always preferred experiences over luxury.`,
    bandSevenPhrases: [
      'What made it particularly memorable was...',
      'I was completely overwhelmed by...',
      'It changed my perspective on...',
      'Looking back on it now, I realise that...',
      'I would go so far as to say that...',
    ],
  },
  {
    id: 'person-admire',
    topic: 'A Person You Admire',
    prompt: 'Describe a person you admire.',
    bulletPoints: [
      'Who this person is',
      'How you know them',
      'What qualities they have',
      'Why you admire them',
    ],
    modelAnswer: `The person I admire most is my secondary school teacher, who taught mathematics. She was extraordinary in the way she made a notoriously difficult subject feel accessible and even exciting.

What set her apart was her patience. No matter how many times a student struggled with the same concept, she would find a completely different way to explain it. I never once saw her become frustrated.

Beyond her teaching ability, she had an exceptional work ethic. She arrived early, stayed late, and always provided detailed feedback on our work. But what I admire most is that she genuinely believed in every student's potential — including mine, at a time when I had little confidence in myself.

Because of her, I developed not just mathematical skills but a broader belief that hard work and the right guidance can overcome almost any obstacle.`,
    bandSevenPhrases: [
      'What set them apart was...',
      'Beyond their [quality], they...',
      'Because of them, I developed...',
      'She genuinely believed in...',
      'I admire them most for...',
    ],
  },
  {
    id: 'useful-technology',
    topic: 'A Piece of Technology You Find Useful',
    prompt: 'Describe a piece of technology you find particularly useful.',
    bulletPoints: [
      'What it is',
      'How often you use it',
      'How you use it',
      'Why it is useful to you',
    ],
    modelAnswer: `The piece of technology I find most useful is, perhaps unsurprisingly, my smartphone — though perhaps not in the ways people might expect.

I use it primarily as a learning tool. I have several language-learning and productivity apps, and I tend to study during what would otherwise be wasted time — on public transport or waiting in queues. I probably use it for this purpose about an hour and a half each day.

What makes it particularly valuable is its versatility. It functions as a dictionary, a calculator, a camera, a communication device, and an entertainment system all in one. For a student especially, having access to vast amounts of information at any moment is genuinely transformative.

That said, I am aware of the downsides — particularly the distraction it can cause. But I think, used consciously, it is probably the most useful invention of my generation.`,
    bandSevenPhrases: [
      '...perhaps unsurprisingly...',
      '...what would otherwise be wasted time...',
      'It functions as...',
      'What makes it particularly valuable is...',
      'Used consciously...',
    ],
  },
]

// ── Vocabulary Topics ─────────────────────────────────────────────────────────

export interface VocabTopic {
  id: string
  name: string
  words: Array<{ word: string; definition: string; example: string }>
}

export const VOCAB_TOPICS: VocabTopic[] = [
  {
    id: 'environment',
    name: 'Environment',
    words: [
      { word: 'carbon footprint', definition: 'Total greenhouse gas emissions caused by an individual/organisation', example: 'Reducing your carbon footprint can be as simple as eating less meat.' },
      { word: 'biodiversity', definition: 'Variety of plant and animal life in a habitat', example: 'Deforestation is devastating biodiversity in tropical regions.' },
      { word: 'renewable energy', definition: 'Energy from sources that are naturally replenished', example: 'Solar and wind power are forms of renewable energy.' },
      { word: 'sustainable development', definition: 'Development that meets present needs without compromising future generations', example: 'Governments must pursue sustainable development policies.' },
      { word: 'ecosystem', definition: 'A community of interacting organisms and their environment', example: 'Pollution disrupts the delicate balance of the ecosystem.' },
    ],
  },
  {
    id: 'technology',
    name: 'Technology',
    words: [
      { word: 'artificial intelligence', definition: 'Computer systems able to perform tasks that normally require human intelligence', example: 'Artificial intelligence is transforming the healthcare industry.' },
      { word: 'automation', definition: 'Use of technology to perform tasks with minimal human input', example: 'Automation has replaced many manufacturing jobs.' },
      { word: 'digital divide', definition: 'Gap between those with and without access to digital technology', example: 'The digital divide remains a challenge in rural communities.' },
      { word: 'data privacy', definition: 'Right of individuals to control how their personal data is used', example: 'Data privacy laws have become stricter in recent years.' },
      { word: 'virtual reality', definition: 'Computer-generated simulation of a three-dimensional environment', example: 'Virtual reality is increasingly used in medical training.' },
    ],
  },
  {
    id: 'education',
    name: 'Education',
    words: [
      { word: 'critical thinking', definition: 'Objective analysis and evaluation of an issue', example: 'Universities aim to develop critical thinking skills.' },
      { word: 'academic integrity', definition: 'Adherence to ethical standards in scholarly work', example: 'Plagiarism is a serious violation of academic integrity.' },
      { word: 'curriculum', definition: 'Subjects and content taught in a school or programme', example: 'The curriculum should reflect the needs of the modern world.' },
      { word: 'lifelong learning', definition: 'Ongoing, voluntary pursuit of knowledge throughout life', example: 'Lifelong learning is essential in a rapidly changing job market.' },
      { word: 'pedagogy', definition: 'The method and practice of teaching', example: 'Modern pedagogy increasingly emphasises student-centred learning.' },
    ],
  },
  {
    id: 'health',
    name: 'Health',
    words: [
      { word: 'sedentary lifestyle', definition: 'A way of living that involves little physical activity', example: 'A sedentary lifestyle is a key risk factor for obesity.' },
      { word: 'mental well-being', definition: 'State of psychological health and emotional stability', example: 'Schools are increasingly focusing on students\' mental well-being.' },
      { word: 'preventative healthcare', definition: 'Measures taken to prevent disease rather than treat it', example: 'Investment in preventative healthcare reduces long-term costs.' },
      { word: 'life expectancy', definition: 'Average number of years a person is expected to live', example: 'Life expectancy has increased significantly in developed countries.' },
      { word: 'epidemic', definition: 'Widespread occurrence of a disease in a community', example: 'Obesity has been described as an epidemic in many Western countries.' },
    ],
  },
]

// ── Recommended Materials ─────────────────────────────────────────────────────

export interface IeltsMaterial {
  id: string
  title: string
  type: 'book' | 'website' | 'app' | 'youtube'
  description: string
  level: 'all' | 'beginner' | 'intermediate' | 'advanced'
  skill?: IeltsSkill | 'all'
  free: boolean
  url?: string
}

export const IELTS_MATERIALS: IeltsMaterial[] = [
  // Books
  {
    id: 'cambridge-18',
    title: 'Cambridge IELTS 18 Academic',
    type: 'book',
    description: 'Official practice tests from Cambridge. The gold standard. Start with the most recent volume.',
    level: 'all',
    skill: 'all',
    free: false,
  },
  {
    id: 'cambridge-17',
    title: 'Cambridge IELTS 17 Academic',
    type: 'book',
    description: 'Previous year\'s official practice tests. Excellent for understanding real exam format.',
    level: 'all',
    skill: 'all',
    free: false,
  },
  {
    id: 'road-to-ielts',
    title: 'Road to IELTS (British Council)',
    type: 'book',
    description: '200+ interactive activities, practice tests, and video content from the exam creators.',
    level: 'intermediate',
    skill: 'all',
    free: false,
  },
  {
    id: 'writing-task2-book',
    title: 'Pauline Cullen — The Official Cambridge Guide to IELTS',
    type: 'book',
    description: 'Covers all four skills with explanations and practice. One of the most comprehensive single-volume guides.',
    level: 'all',
    skill: 'all',
    free: false,
  },
  // Websites
  {
    id: 'ielts-liz',
    title: 'IELTS Liz',
    type: 'website',
    description: 'Free tips, model answers, and video lessons for all skills. One of the most trusted free IELTS resources.',
    level: 'all',
    skill: 'all',
    free: true,
    url: 'https://ieltsliz.com',
  },
  {
    id: 'ielts-simon',
    title: 'IELTS Simon',
    type: 'website',
    description: 'Daily lessons, Writing model answers, Speaking part 3 questions. Run by a former IELTS examiner.',
    level: 'intermediate',
    skill: 'writing',
    free: true,
    url: 'https://ielts-simon.com',
  },
  {
    id: 'ielts-org',
    title: 'IELTS.org (Official)',
    type: 'website',
    description: 'Official sample test materials, test dates, registration, and preparation resources.',
    level: 'all',
    skill: 'all',
    free: true,
    url: 'https://www.ielts.org',
  },
  {
    id: 'british-council-prep',
    title: 'British Council — IELTS Prep',
    type: 'website',
    description: 'Free practice tests, vocabulary, and writing task feedback tools from official IELTS partners.',
    level: 'all',
    skill: 'all',
    free: true,
    url: 'https://www.britishcouncil.org/exam/ielts',
  },
  // Apps
  {
    id: 'magoosh-ielts',
    title: 'Magoosh IELTS',
    type: 'app',
    description: 'Video lessons, practice questions, and score predictions. Good for structured self-study.',
    level: 'intermediate',
    skill: 'all',
    free: false,
  },
  {
    id: 'ielts-prep-app',
    title: 'IELTS Prep App (IDP)',
    type: 'app',
    description: 'Official app from IDP (one of the IELTS test centres). Free full practice tests and score prediction.',
    level: 'all',
    skill: 'all',
    free: true,
  },
  // YouTube
  {
    id: 'ielts-advantage-yt',
    title: 'IELTS Advantage (YouTube)',
    type: 'youtube',
    description: 'Clear, structured videos on Writing Task 1 and Task 2. Model answers broken down step by step.',
    level: 'intermediate',
    skill: 'writing',
    free: true,
    url: 'https://youtube.com/@IELTSAdvantage',
  },
  {
    id: 'e2-ielts-yt',
    title: 'E2 IELTS (YouTube)',
    type: 'youtube',
    description: 'Daily live lessons, speaking practice recordings, and detailed test walkthroughs. Very popular.',
    level: 'all',
    skill: 'all',
    free: true,
    url: 'https://youtube.com/@E2IELTS',
  },
]

// ── Score Calculator Helpers ──────────────────────────────────────────────────

export function listeningRawToScore(raw: number): number {
  if (raw <= 5)  return 3.5
  if (raw <= 8)  return 4.0
  if (raw <= 11) return 4.5
  if (raw <= 14) return 5.0
  if (raw <= 17) return 5.5
  if (raw <= 21) return 6.0
  if (raw <= 25) return 6.5
  if (raw <= 29) return 7.0
  if (raw <= 32) return 7.5
  if (raw <= 34) return 8.0
  if (raw <= 36) return 8.5
  if (raw <= 39) return 9.0
  return 9.0
}

export function readingRawToScore(raw: number): number {
  if (raw <= 6)  return 3.5
  if (raw <= 10) return 4.0
  if (raw <= 14) return 4.5
  if (raw <= 17) return 5.0
  if (raw <= 21) return 5.5
  if (raw <= 25) return 6.0
  if (raw <= 28) return 6.5
  if (raw <= 30) return 7.0
  if (raw <= 32) return 7.5
  if (raw <= 34) return 8.0
  if (raw <= 36) return 8.5
  if (raw <= 39) return 9.0
  return 9.0
}

export function overallBand(scores: number[]): number {
  const avg = scores.reduce((a, b) => a + b, 0) / scores.length
  return Math.round(avg * 2) / 2
}
