// ── IELTS Practice Content ──────────────────────────────────────────────────
// Comprehensive practice material: reading passages, writing tasks, speaking
// cue cards, vocabulary sets, and listening sections with transcripts.
// All content in English with occasional Russian hints for KZ students.

// ────────────────────────────────────────────────────────────────────────────
// Types
// ────────────────────────────────────────────────────────────────────────────

export interface IeltsReadingQuestion {
  id: string
  type: 'tfng' | 'ynng' | 'matching' | 'completion' | 'multiple_choice' | 'heading'
  text: string
  options?: string[]
  correctAnswer: string | number
  explanation: string
}

export interface IeltsReadingPassage {
  id: string
  title: string
  passage: string
  questions: IeltsReadingQuestion[]
}

export interface IeltsWritingTask {
  id: string
  taskType: 1 | 2
  prompt: string
  sampleAnswer: string
  tips: string[]
  keyVocabulary: string[]
  band7Criteria: string[]
}

export interface IeltsSpeakingCard {
  id: string
  part: 2 | 3
  topic: string
  card?: string
  followUpQuestions: string[]
  modelAnswer: string
  usefulPhrases: string[]
  vocabulary: string[]
}

export interface IeltsVocabSet {
  id: string
  topic: string
  words: {
    word: string
    definition: string
    example: string
    partOfSpeech: string
    synonyms: string[]
  }[]
}

export interface IeltsListeningSection {
  id: string
  section: 1 | 2 | 3 | 4
  context: string
  transcript: string
  questions: {
    id: string
    type: string
    text: string
    options?: string[]
    correctAnswer: string
    explanation: string
  }[]
}

export interface IeltsSpeakingPart1Question {
  id: string
  topic: string
  question: string
  sampleAnswer: string
  keyVocabulary: string[]
  tips: string[]
}

export interface IeltsSpeakingPart3Question {
  id: string
  topic: string
  question: string
  modelAnswer: string
  discussionPoints: string[]
}

// ════════════════════════════════════════════════════════════════════════════
// 1. READING PASSAGES (6 passages, ~55 questions total)
// ════════════════════════════════════════════════════════════════════════════

export const IELTS_READING_PASSAGES: IeltsReadingPassage[] = [
  // ── Passage 1: Climate Change ──────────────────────────────────────────
  {
    id: 'reading-1-climate',
    title: 'The Accelerating Impact of Climate Change',
    passage: `Climate change, driven primarily by the burning of fossil fuels and deforestation, has emerged as the defining challenge of the twenty-first century. Global surface temperatures have risen by approximately 1.1 degrees Celsius since pre-industrial times, and the rate of warming has accelerated markedly over the past four decades. The consequences are already visible: glaciers are retreating at unprecedented rates, sea levels are rising, and extreme weather events — from devastating wildfires to catastrophic flooding — are becoming more frequent and more severe.

The scientific consensus, as articulated by the Intergovernmental Panel on Climate Change (IPCC), is unambiguous. Human activity is the dominant cause of observed warming since the mid-twentieth century. Carbon dioxide concentrations in the atmosphere have surpassed 420 parts per million, the highest level in at least 800,000 years. Methane emissions, largely from agriculture and fossil fuel extraction, have also risen sharply.

Adaptation strategies vary widely across nations. Low-lying island states such as Tuvalu and the Maldives face existential threats from rising seas and have called for aggressive global emissions reductions. Meanwhile, wealthier nations have invested in seawalls, flood barriers, and drought-resistant crop varieties. However, critics argue that adaptation alone is insufficient without dramatic cuts in greenhouse gas emissions.

The Paris Agreement of 2015 set the goal of limiting warming to well below 2 degrees Celsius, ideally 1.5 degrees, above pre-industrial levels. Achieving this target requires a rapid transition to renewable energy sources, significant improvements in energy efficiency, and the development of carbon capture technologies. Some economists advocate for a global carbon tax as the most efficient mechanism for reducing emissions, while others emphasise the importance of direct regulation and public investment.

Young people around the world have increasingly taken up the cause, organising strikes and protests to demand more ambitious climate policies. This generational shift in awareness may ultimately prove to be one of the most significant factors in the fight against climate change.`,
    questions: [
      {
        id: 'r1-q1',
        type: 'tfng',
        text: 'Global temperatures have risen by more than 2 degrees Celsius since pre-industrial times.',
        correctAnswer: 'False',
        explanation: 'The passage states temperatures have risen by "approximately 1.1 degrees Celsius since pre-industrial times", not more than 2 degrees.',
      },
      {
        id: 'r1-q2',
        type: 'tfng',
        text: 'Carbon dioxide levels are at their highest point in 800,000 years.',
        correctAnswer: 'True',
        explanation: 'The passage says CO2 concentrations "have surpassed 420 parts per million, the highest level in at least 800,000 years."',
      },
      {
        id: 'r1-q3',
        type: 'tfng',
        text: 'The Maldives has already begun constructing seawalls to protect against rising seas.',
        correctAnswer: 'Not Given',
        explanation: 'The passage mentions that the Maldives faces existential threats and has called for emissions reductions, but does not mention seawall construction there specifically. Seawalls are mentioned in the context of "wealthier nations."',
      },
      {
        id: 'r1-q4',
        type: 'tfng',
        text: 'Methane emissions come primarily from agriculture and fossil fuel extraction.',
        correctAnswer: 'True',
        explanation: 'The passage states: "Methane emissions, largely from agriculture and fossil fuel extraction, have also risen sharply."',
      },
      {
        id: 'r1-q5',
        type: 'multiple_choice',
        text: 'According to the passage, what is the main goal of the Paris Agreement?',
        options: [
          'A) To eliminate all fossil fuel use by 2030',
          'B) To limit warming to well below 2 degrees Celsius above pre-industrial levels',
          'C) To impose a global carbon tax on all nations',
          'D) To fund adaptation projects in developing countries',
        ],
        correctAnswer: 'B',
        explanation: 'The passage clearly states: "The Paris Agreement of 2015 set the goal of limiting warming to well below 2 degrees Celsius, ideally 1.5 degrees, above pre-industrial levels."',
      },
      {
        id: 'r1-q6',
        type: 'multiple_choice',
        text: 'Critics of adaptation strategies argue that:',
        options: [
          'A) Adaptation is too expensive for developing nations',
          'B) Adaptation without emission cuts is not enough',
          'C) Seawalls are ineffective against rising sea levels',
          'D) Drought-resistant crops have not been proven to work',
        ],
        correctAnswer: 'B',
        explanation: 'The passage says: "critics argue that adaptation alone is insufficient without dramatic cuts in greenhouse gas emissions."',
      },
      {
        id: 'r1-q7',
        type: 'completion',
        text: 'Some economists believe that a global _______ would be the most efficient way to reduce emissions.',
        correctAnswer: 'carbon tax',
        explanation: 'The passage states: "Some economists advocate for a global carbon tax as the most efficient mechanism for reducing emissions."',
      },
      {
        id: 'r1-q8',
        type: 'completion',
        text: 'Achieving the Paris Agreement target requires a rapid transition to renewable energy, improvements in energy efficiency, and the development of _______ technologies.',
        correctAnswer: 'carbon capture',
        explanation: 'The passage mentions "the development of carbon capture technologies" as one of the requirements.',
      },
      {
        id: 'r1-q9',
        type: 'tfng',
        text: 'The rate of global warming has remained constant over the past century.',
        correctAnswer: 'False',
        explanation: 'The passage says "the rate of warming has accelerated markedly over the past four decades," indicating it has not remained constant.',
      },
    ],
  },

  // ── Passage 2: Technology in Education ─────────────────────────────────
  {
    id: 'reading-2-edtech',
    title: 'Technology in Education: Revolution or Distraction?',
    passage: `The integration of technology into education has transformed classrooms around the world, but the extent to which it has improved learning outcomes remains hotly debated. Proponents argue that digital tools — from interactive whiteboards to artificial intelligence tutoring systems — have the potential to personalise learning, engage students more effectively, and prepare them for an increasingly digital workplace.

One of the most significant developments has been the rise of Massive Open Online Courses (MOOCs). Platforms such as Coursera, edX, and Khan Academy have made high-quality educational content accessible to millions of learners who would otherwise lack access to prestigious institutions. A 2022 study by the Massachusetts Institute of Technology found that completion rates for MOOCs had risen to approximately 15 percent, up from just 5 percent in 2013, suggesting that the format is gradually maturing.

However, sceptics point to a growing body of research suggesting that excessive screen time can impair concentration, reduce social interaction, and even contribute to anxiety among young learners. A large-scale study conducted in Sweden in 2023 found that students who used tablets extensively in primary school performed worse in reading comprehension tests than those who relied on traditional textbooks. The Swedish government subsequently reversed its policy of promoting digital-first education in early years.

Artificial intelligence represents the next frontier. AI-powered tutoring systems can adapt in real time to a student's level, offering additional practice on weak areas and accelerating progress on topics already mastered. Early trials in mathematics instruction have shown promising results, with some studies reporting improvements of up to 30 percent in test scores. Yet concerns persist about data privacy, algorithmic bias, and the potential for AI to widen existing educational inequalities if access is unevenly distributed.

The debate is unlikely to be resolved soon. What seems clear is that technology is a tool, not a panacea. Its effectiveness depends entirely on how it is implemented, the training provided to educators, and whether it genuinely addresses the needs of the students it is designed to serve.`,
    questions: [
      {
        id: 'r2-q1',
        type: 'tfng',
        text: 'MOOC completion rates were approximately 5 percent in 2013.',
        correctAnswer: 'True',
        explanation: 'The passage states completion rates "had risen to approximately 15 percent, up from just 5 percent in 2013."',
      },
      {
        id: 'r2-q2',
        type: 'tfng',
        text: 'The Swedish study found that tablets improved reading comprehension in primary school.',
        correctAnswer: 'False',
        explanation: 'The passage states the opposite: "students who used tablets extensively in primary school performed worse in reading comprehension tests."',
      },
      {
        id: 'r2-q3',
        type: 'tfng',
        text: 'Khan Academy is an AI-powered tutoring system.',
        correctAnswer: 'Not Given',
        explanation: 'Khan Academy is mentioned as a MOOC platform, but the passage does not describe it as an AI-powered tutoring system.',
      },
      {
        id: 'r2-q4',
        type: 'multiple_choice',
        text: 'What did the Swedish government do after the 2023 study?',
        options: [
          'A) It banned all technology in schools',
          'B) It reversed its digital-first policy for early education',
          'C) It invested more in tablet-based learning',
          'D) It launched a national AI tutoring programme',
        ],
        correctAnswer: 'B',
        explanation: 'The passage says: "The Swedish government subsequently reversed its policy of promoting digital-first education in early years."',
      },
      {
        id: 'r2-q5',
        type: 'multiple_choice',
        text: 'According to the passage, AI tutoring systems can:',
        options: [
          'A) Replace teachers entirely in mathematics instruction',
          'B) Adapt in real time to a student\'s level',
          'C) Eliminate algorithmic bias in education',
          'D) Guarantee a 30 percent improvement in all subjects',
        ],
        correctAnswer: 'B',
        explanation: 'The passage states: "AI-powered tutoring systems can adapt in real time to a student\'s level."',
      },
      {
        id: 'r2-q6',
        type: 'completion',
        text: 'According to the author, technology in education is a tool, not a _______.',
        correctAnswer: 'panacea',
        explanation: 'The final paragraph states: "technology is a tool, not a panacea." (Panacea / панацея — a solution for all problems.)',
      },
      {
        id: 'r2-q7',
        type: 'tfng',
        text: 'Early AI trials in mathematics showed improvements of up to 30 percent in test scores.',
        correctAnswer: 'True',
        explanation: 'The passage confirms: "some studies reporting improvements of up to 30 percent in test scores."',
      },
      {
        id: 'r2-q8',
        type: 'completion',
        text: 'Sceptics worry that excessive screen time can impair concentration, reduce social interaction, and contribute to _______ among young learners.',
        correctAnswer: 'anxiety',
        explanation: 'The passage mentions "excessive screen time can impair concentration, reduce social interaction, and even contribute to anxiety among young learners."',
      },
      {
        id: 'r2-q9',
        type: 'multiple_choice',
        text: 'The author\'s overall view on technology in education is:',
        options: [
          'A) Strongly in favour of digital-first education',
          'B) Opposed to the use of any technology in schools',
          'C) Balanced, emphasising that effectiveness depends on implementation',
          'D) Uncertain but leaning towards banning screen time',
        ],
        correctAnswer: 'C',
        explanation: 'The final paragraph takes a balanced position: "Its effectiveness depends entirely on how it is implemented, the training provided to educators, and whether it genuinely addresses the needs of the students."',
      },
    ],
  },

  // ── Passage 3: Urbanization ────────────────────────────────────────────
  {
    id: 'reading-3-urbanization',
    title: 'The Global Urbanization Challenge',
    passage: `A) In 2008, for the first time in human history, the world's urban population exceeded its rural population. By 2050, the United Nations projects that nearly 70 percent of the global population will live in cities. This mass migration from countryside to city — urbanization — is reshaping economies, societies, and ecosystems in profound and often unpredictable ways.

B) The economic pull of cities is well documented. Urban areas generate over 80 percent of global GDP, offering higher wages, better healthcare, superior educational opportunities, and a wider range of cultural and social amenities. For millions in developing countries, moving to a city represents the most realistic path out of poverty. The growth of megacities — urban areas with populations exceeding ten million — illustrates this trend. In 1990 there were ten megacities; by 2030 there will be an estimated forty-three.

C) Yet rapid urbanization also generates severe challenges. Housing shortages have led to the proliferation of informal settlements, known colloquially as slums, which now house approximately one billion people worldwide. These communities typically lack clean water, sanitation, and electricity. Overcrowding, inadequate infrastructure, and poor waste management create conditions ripe for the spread of infectious diseases, as the COVID-19 pandemic starkly demonstrated.

D) Transportation is another critical issue. Traffic congestion in cities such as Lagos, Jakarta, and Mumbai costs billions of dollars in lost productivity annually. Air pollution from vehicles is a leading cause of respiratory illness. Many cities have responded by investing in public transit systems, cycle lanes, and pedestrian zones, but progress has been uneven, particularly in the developing world where car ownership is rising rapidly.

E) Urban planners are increasingly turning to the concept of "smart cities" — urban centres that use data, sensors, and connectivity to manage resources more efficiently. Examples include optimising traffic flow through real-time data analysis, reducing energy consumption in buildings through automated systems, and using predictive analytics for waste collection. Singapore, Barcelona, and Copenhagen are frequently cited as leading examples.

F) Despite its challenges, urbanization also offers opportunities for environmental sustainability. Dense urban living, when well planned, can be more energy-efficient per capita than suburban sprawl. District heating systems, shared transportation, and concentrated service delivery all reduce individual carbon footprints. The challenge lies in ensuring that urban growth is managed rather than left to develop chaotically.`,
    questions: [
      {
        id: 'r3-q1',
        type: 'heading',
        text: 'Which paragraph contains information about informal housing and health risks?',
        options: ['A', 'B', 'C', 'D', 'E', 'F'],
        correctAnswer: 'C',
        explanation: 'Paragraph C discusses slums, overcrowding, poor sanitation, and the spread of infectious diseases.',
      },
      {
        id: 'r3-q2',
        type: 'heading',
        text: 'Which paragraph discusses the use of technology to improve city management?',
        options: ['A', 'B', 'C', 'D', 'E', 'F'],
        correctAnswer: 'E',
        explanation: 'Paragraph E describes "smart cities" that use data, sensors, and connectivity.',
      },
      {
        id: 'r3-q3',
        type: 'heading',
        text: 'Which paragraph explains why people move to cities?',
        options: ['A', 'B', 'C', 'D', 'E', 'F'],
        correctAnswer: 'B',
        explanation: 'Paragraph B discusses the economic pull of cities: higher wages, better healthcare, education, and the path out of poverty.',
      },
      {
        id: 'r3-q4',
        type: 'tfng',
        text: 'By 2050, approximately 70 percent of people will live in urban areas.',
        correctAnswer: 'True',
        explanation: 'The passage states: "the United Nations projects that nearly 70 percent of the global population will live in cities."',
      },
      {
        id: 'r3-q5',
        type: 'tfng',
        text: 'There were forty-three megacities in 1990.',
        correctAnswer: 'False',
        explanation: 'The passage says there were ten megacities in 1990; forty-three is the projection for 2030.',
      },
      {
        id: 'r3-q6',
        type: 'tfng',
        text: 'Singapore has the most effective smart city programme in the world.',
        correctAnswer: 'Not Given',
        explanation: 'Singapore is cited as a "leading example" but the passage does not rank it as the most effective.',
      },
      {
        id: 'r3-q7',
        type: 'multiple_choice',
        text: 'According to the passage, approximately how many people live in slums?',
        options: [
          'A) 500 million',
          'B) 1 billion',
          'C) 2 billion',
          'D) 70 percent of the urban population',
        ],
        correctAnswer: 'B',
        explanation: 'The passage states informal settlements "now house approximately one billion people worldwide."',
      },
      {
        id: 'r3-q8',
        type: 'completion',
        text: 'Urban areas generate over _______ percent of global GDP.',
        correctAnswer: '80',
        explanation: 'The passage says: "Urban areas generate over 80 percent of global GDP."',
      },
      {
        id: 'r3-q9',
        type: 'multiple_choice',
        text: 'The author suggests that dense urban living can be beneficial for the environment because:',
        options: [
          'A) It reduces the number of cars on the road',
          'B) It is more energy-efficient per person than suburban sprawl',
          'C) It eliminates the need for heating systems',
          'D) Smart city technology solves all environmental problems',
        ],
        correctAnswer: 'B',
        explanation: 'Paragraph F states: "Dense urban living, when well planned, can be more energy-efficient per capita than suburban sprawl."',
      },
      {
        id: 'r3-q10',
        type: 'tfng',
        text: 'All developing-world cities have successfully invested in public transit.',
        correctAnswer: 'False',
        explanation: 'The passage says "progress has been uneven, particularly in the developing world where car ownership is rising rapidly."',
      },
    ],
  },

  // ── Passage 4: Space Exploration ───────────────────────────────────────
  {
    id: 'reading-4-space',
    title: 'The New Age of Space Exploration',
    passage: `Space exploration has entered a transformative era, driven not only by national space agencies but increasingly by private companies. The launch of SpaceX's Falcon Heavy rocket in 2018 marked a turning point, demonstrating that reusable rocket technology could dramatically reduce the cost of reaching orbit. Since then, companies such as Blue Origin, Rocket Lab, and Relativity Space have joined the competition, creating what commentators have called a "new space race."

The economic implications are substantial. The global space economy was valued at approximately $469 billion in 2021 and is projected to exceed $1 trillion by 2040. Satellite services — including communications, navigation, and Earth observation — account for the largest share. The rapid deployment of low-Earth orbit satellite constellations, such as SpaceX's Starlink network, promises to bring high-speed internet to remote and underserved regions worldwide.

Mars has become the primary focus of long-duration exploration. NASA's Perseverance rover, which landed on Mars in February 2021, has been collecting rock samples that a future mission will return to Earth for analysis. Meanwhile, SpaceX has stated its intention to send crewed missions to Mars within the coming decade, though many experts regard this timeline as optimistic. The challenges are formidable: radiation exposure during the seven-month journey, the psychological toll of isolation, and the enormous difficulty of establishing a self-sustaining habitat on a planet with no breathable atmosphere.

Closer to home, the Moon has regained attention as a stepping stone for deeper exploration. NASA's Artemis programme aims to return astronauts to the lunar surface, including the first woman and the first person of colour. The programme also envisions the construction of a lunar Gateway — an orbiting space station that would serve as a staging point for missions to Mars and beyond.

Critics of space exploration argue that the vast sums invested could be better spent addressing terrestrial problems such as poverty, disease, and climate change. Proponents counter that space technologies yield tangible benefits on Earth, from GPS and weather forecasting to medical imaging advances and water purification systems derived from space research. Furthermore, they argue, the long-term survival of humanity may depend on becoming a multi-planetary species.`,
    questions: [
      {
        id: 'r4-q1',
        type: 'tfng',
        text: 'SpaceX\'s Falcon Heavy was the first reusable rocket ever launched.',
        correctAnswer: 'Not Given',
        explanation: 'The passage says Falcon Heavy demonstrated that reusable rocket technology could reduce costs, but does not claim it was the first reusable rocket.',
      },
      {
        id: 'r4-q2',
        type: 'tfng',
        text: 'The global space economy is expected to surpass $1 trillion by 2040.',
        correctAnswer: 'True',
        explanation: 'The passage states the space economy "is projected to exceed $1 trillion by 2040."',
      },
      {
        id: 'r4-q3',
        type: 'tfng',
        text: 'NASA\'s Perseverance rover landed on Mars in 2020.',
        correctAnswer: 'False',
        explanation: 'The passage says Perseverance "landed on Mars in February 2021," not 2020.',
      },
      {
        id: 'r4-q4',
        type: 'multiple_choice',
        text: 'What is the Artemis programme\'s goal?',
        options: [
          'A) To build a permanent city on Mars',
          'B) To return astronauts to the Moon and build a lunar Gateway',
          'C) To deploy satellite constellations for internet access',
          'D) To replace the International Space Station',
        ],
        correctAnswer: 'B',
        explanation: 'The passage describes Artemis as aiming to "return astronauts to the lunar surface" and envisions "the construction of a lunar Gateway."',
      },
      {
        id: 'r4-q5',
        type: 'multiple_choice',
        text: 'Which of the following is NOT mentioned as a challenge of Mars exploration?',
        options: [
          'A) Radiation exposure',
          'B) Psychological isolation',
          'C) Lack of breathable atmosphere',
          'D) Extreme volcanic activity on Mars',
        ],
        correctAnswer: 'D',
        explanation: 'The passage mentions radiation, isolation, and no breathable atmosphere. Volcanic activity is not mentioned.',
      },
      {
        id: 'r4-q6',
        type: 'completion',
        text: 'SpaceX\'s Starlink network aims to bring high-speed _______ to remote areas worldwide.',
        correctAnswer: 'internet',
        explanation: 'The passage says Starlink "promises to bring high-speed internet to remote and underserved regions worldwide."',
      },
      {
        id: 'r4-q7',
        type: 'completion',
        text: 'The global space economy was valued at approximately $_______ billion in 2021.',
        correctAnswer: '469',
        explanation: 'The passage states the economy "was valued at approximately $469 billion in 2021."',
      },
      {
        id: 'r4-q8',
        type: 'tfng',
        text: 'Many experts believe SpaceX\'s Mars timeline is realistic.',
        correctAnswer: 'False',
        explanation: 'The passage says "many experts regard this timeline as optimistic," which implies they think it is unrealistic.',
      },
      {
        id: 'r4-q9',
        type: 'multiple_choice',
        text: 'Proponents of space exploration argue that:',
        options: [
          'A) Space exploration should replace all climate change funding',
          'B) Space technologies provide tangible benefits on Earth',
          'C) Colonising Mars is achievable within five years',
          'D) Private companies should not be involved in space',
        ],
        correctAnswer: 'B',
        explanation: 'The passage states proponents "counter that space technologies yield tangible benefits on Earth, from GPS and weather forecasting to medical imaging advances."',
      },
    ],
  },

  // ── Passage 5: Health & Nutrition ──────────────────────────────────────
  {
    id: 'reading-5-health',
    title: 'The Science of Nutrition: What We Know and What We Don\'t',
    passage: `Nutrition science has advanced enormously over the past century, yet public confusion about what constitutes a healthy diet has arguably never been greater. Conflicting headlines — "eggs are bad for you" one year, "eggs are good for you" the next — have eroded trust in dietary guidance and created fertile ground for misinformation.

Part of the problem lies in the nature of nutritional research itself. Unlike drug trials, which can use double-blind randomised controlled experiments, nutrition studies are inherently difficult to control. Researchers cannot lock participants in laboratories for decades and control every morsel of food they consume. Instead, they rely on observational studies and self-reported dietary data, both of which are subject to significant biases and inaccuracies.

Despite these limitations, several broad principles enjoy robust scientific support. First, diets rich in vegetables, fruits, whole grains, and legumes are consistently associated with lower rates of heart disease, cancer, and type 2 diabetes. Second, excessive consumption of ultra-processed foods — characterised by long ingredient lists, high levels of added sugar, salt, and unhealthy fats — is linked to obesity, inflammation, and various chronic diseases. Third, the Mediterranean diet, which emphasises olive oil, fish, nuts, and seasonal produce, has demonstrated cardiovascular benefits across numerous large-scale studies.

The role of supplements remains contentious. While certain populations benefit from targeted supplementation — for example, vitamin D for people in northern latitudes or folic acid for pregnant women — evidence for the widespread use of multivitamins in otherwise healthy adults is weak. A 2022 review by the US Preventive Services Task Force concluded that there was insufficient evidence to recommend multivitamin supplementation for the prevention of cardiovascular disease or cancer.

The emerging field of nutrigenomics, which studies the interaction between nutrition and individual genetic profiles, promises to revolutionise dietary advice. In the future, personalised nutrition plans based on an individual's DNA may replace the one-size-fits-all dietary guidelines that currently dominate public health messaging. However, the science is still in its early stages, and commercially available genetic diet tests have been criticised for overstating their accuracy and predictive power.

What nutritionists broadly agree on is deceptively simple: eat mostly plants, minimise processed foods, and be sceptical of any diet that promises miraculous results.`,
    questions: [
      {
        id: 'r5-q1',
        type: 'ynng',
        text: 'The author believes that nutritional research is as reliable as pharmaceutical research.',
        correctAnswer: 'No',
        explanation: 'The author contrasts nutrition studies unfavourably with drug trials, noting nutrition studies cannot use double-blind randomised controlled experiments and rely on observational data.',
      },
      {
        id: 'r5-q2',
        type: 'ynng',
        text: 'The author considers the Mediterranean diet to be beneficial for heart health.',
        correctAnswer: 'Yes',
        explanation: 'The passage states the Mediterranean diet "has demonstrated cardiovascular benefits across numerous large-scale studies."',
      },
      {
        id: 'r5-q3',
        type: 'ynng',
        text: 'The author thinks genetic diet tests currently available are fully reliable.',
        correctAnswer: 'No',
        explanation: 'The passage says commercially available genetic diet tests "have been criticised for overstating their accuracy and predictive power."',
      },
      {
        id: 'r5-q4',
        type: 'ynng',
        text: 'The author approves of the use of vitamin D supplements for people living in northern regions.',
        correctAnswer: 'Yes',
        explanation: 'The passage acknowledges that "certain populations benefit from targeted supplementation — for example, vitamin D for people in northern latitudes."',
      },
      {
        id: 'r5-q5',
        type: 'multiple_choice',
        text: 'What did the 2022 US Preventive Services Task Force review conclude?',
        options: [
          'A) Multivitamins prevent cardiovascular disease',
          'B) There is insufficient evidence to recommend multivitamins for preventing heart disease or cancer',
          'C) All adults should take a daily multivitamin',
          'D) Supplements are harmful for healthy adults',
        ],
        correctAnswer: 'B',
        explanation: 'The passage states the review "concluded that there was insufficient evidence to recommend multivitamin supplementation for the prevention of cardiovascular disease or cancer."',
      },
      {
        id: 'r5-q6',
        type: 'completion',
        text: 'The field that studies the interaction between nutrition and individual genetic profiles is called _______.',
        correctAnswer: 'nutrigenomics',
        explanation: 'The passage introduces "The emerging field of nutrigenomics, which studies the interaction between nutrition and individual genetic profiles." (Нутригеномика)',
      },
      {
        id: 'r5-q7',
        type: 'completion',
        text: 'Ultra-processed foods are characterised by long ingredient lists, high levels of added sugar, salt, and unhealthy _______.',
        correctAnswer: 'fats',
        explanation: 'The passage describes ultra-processed foods as having "high levels of added sugar, salt, and unhealthy fats."',
      },
      {
        id: 'r5-q8',
        type: 'multiple_choice',
        text: 'The main reason nutritional research is difficult is that:',
        options: [
          'A) Participants refuse to eat healthy food',
          'B) Researchers cannot fully control participants\' diets over long periods',
          'C) Governments refuse to fund nutrition studies',
          'D) Food companies manipulate the results',
        ],
        correctAnswer: 'B',
        explanation: 'The passage explains: "Researchers cannot lock participants in laboratories for decades and control every morsel of food they consume."',
      },
      {
        id: 'r5-q9',
        type: 'tfng',
        text: 'Conflicting headlines about nutrition have increased public trust in dietary guidance.',
        correctAnswer: 'False',
        explanation: 'The passage says conflicting headlines "have eroded trust in dietary guidance and created fertile ground for misinformation."',
      },
    ],
  },

  // ── Passage 6: Ancient Civilizations ───────────────────────────────────
  {
    id: 'reading-6-ancient',
    title: 'Lessons from Ancient Civilizations: Why Societies Collapse',
    passage: `A) The study of ancient civilizations offers more than historical curiosity; it provides cautionary lessons about the fragility of complex societies. Throughout history, seemingly invincible empires — the Roman Empire, the Maya, the Khmer Empire — have declined and ultimately collapsed. Understanding why they fell has become a subject of renewed urgency as modern societies confront their own existential challenges.

B) The archaeologist Joseph Tainter argued in his influential 1988 book, "The Collapse of Complex Societies," that collapse is fundamentally a problem of diminishing returns on complexity. As societies grow more complex, they require increasingly elaborate bureaucracies, infrastructure, and military forces to maintain themselves. Eventually, the costs of maintaining this complexity outstrip the benefits, and the society becomes vulnerable to shocks it might otherwise have absorbed.

C) Environmental degradation has been a recurring factor. The Maya civilization of Central America, which flourished between 250 and 900 CE, experienced severe deforestation as its population expanded. Pollen records from lake sediments indicate that forests were cleared extensively for agriculture and construction. Combined with a series of prolonged droughts, this environmental stress likely contributed to the abandonment of major cities such as Tikal and Calakmul.

D) The Roman Empire's decline, by contrast, was driven by a combination of political fragmentation, economic strain, and military overextension. By the fourth century CE, the empire had become so vast that effective governance from a single centre was impossible. Corruption, currency debasement, and an over-reliance on mercenary armies eroded institutional strength from within, even as external pressures from Germanic tribes and the Hunnic invasions mounted.

E) More recent scholarship has emphasised the role of disease. The Antonine Plague of 165–180 CE and the Plague of Justinian in 541 CE each killed millions, devastating the Roman Empire's workforce, military capacity, and tax base. Similarly, the collapse of indigenous civilizations in the Americas following European contact was driven overwhelmingly by smallpox and other Old World diseases, which killed an estimated 90 percent of the population.

F) Jared Diamond, in his 2005 book "Collapse," identified five factors that contribute to societal collapse: environmental damage, climate change, hostile neighbours, loss of trading partners, and a society's response to its problems. Of these, Diamond argued, the last factor is the most critical. Societies that recognise and adapt to threats survive; those that cling to failing strategies do not.`,
    questions: [
      {
        id: 'r6-q1',
        type: 'heading',
        text: 'Which paragraph discusses the role of epidemics in the decline of civilizations?',
        options: ['A', 'B', 'C', 'D', 'E', 'F'],
        correctAnswer: 'E',
        explanation: 'Paragraph E discusses the Antonine Plague, the Plague of Justinian, and the devastating impact of smallpox on indigenous American populations.',
      },
      {
        id: 'r6-q2',
        type: 'heading',
        text: 'Which paragraph presents the idea that complexity itself can lead to collapse?',
        options: ['A', 'B', 'C', 'D', 'E', 'F'],
        correctAnswer: 'B',
        explanation: 'Paragraph B discusses Tainter\'s argument about "diminishing returns on complexity."',
      },
      {
        id: 'r6-q3',
        type: 'matching',
        text: 'Match the civilization with its primary cause of decline as described in the passage: Maya civilization',
        options: ['Environmental degradation and drought', 'Political fragmentation', 'Disease epidemics', 'Loss of trading partners'],
        correctAnswer: 'Environmental degradation and drought',
        explanation: 'Paragraph C links Maya decline to deforestation and prolonged droughts.',
      },
      {
        id: 'r6-q4',
        type: 'matching',
        text: 'Match the civilization with its primary cause of decline as described in the passage: Roman Empire',
        options: ['Environmental degradation and drought', 'Political fragmentation and military overextension', 'Loss of trading partners', 'Excessive urbanization'],
        correctAnswer: 'Political fragmentation and military overextension',
        explanation: 'Paragraph D attributes Roman decline to "political fragmentation, economic strain, and military overextension."',
      },
      {
        id: 'r6-q5',
        type: 'multiple_choice',
        text: 'According to Jared Diamond, the most critical factor in societal collapse is:',
        options: [
          'A) Environmental damage',
          'B) Hostile neighbours',
          'C) A society\'s response to its problems',
          'D) Loss of trading partners',
        ],
        correctAnswer: 'C',
        explanation: 'The passage states Diamond "argued, the last factor is the most critical. Societies that recognise and adapt to threats survive."',
      },
      {
        id: 'r6-q6',
        type: 'tfng',
        text: 'The Maya civilization flourished between 250 and 900 CE.',
        correctAnswer: 'True',
        explanation: 'The passage states the Maya civilization "flourished between 250 and 900 CE."',
      },
      {
        id: 'r6-q7',
        type: 'tfng',
        text: 'Joseph Tainter published his theory of collapse in the twenty-first century.',
        correctAnswer: 'False',
        explanation: 'Tainter published "The Collapse of Complex Societies" in 1988, which is in the twentieth century.',
      },
      {
        id: 'r6-q8',
        type: 'completion',
        text: 'European diseases killed an estimated _______ percent of indigenous American populations.',
        correctAnswer: '90',
        explanation: 'The passage states Old World diseases "killed an estimated 90 percent of the population."',
      },
      {
        id: 'r6-q9',
        type: 'completion',
        text: 'Evidence of Maya deforestation comes from _______ records taken from lake sediments.',
        correctAnswer: 'pollen',
        explanation: 'The passage states: "Pollen records from lake sediments indicate that forests were cleared extensively."',
      },
    ],
  },
]

// ════════════════════════════════════════════════════════════════════════════
// 2. WRITING TASKS (4 Task 1 + 4 Task 2 = 8 total)
// ════════════════════════════════════════════════════════════════════════════

export const IELTS_WRITING_TASKS: IeltsWritingTask[] = [
  // ── Task 1: Bar Chart ──────────────────────────────────────────────────
  {
    id: 'writing-t1-bar',
    taskType: 1,
    prompt: `The bar chart below shows the number of international students enrolled in three different countries (the UK, Australia, and Canada) in the years 2010, 2015, and 2020.

Summarise the information by selecting and reporting the main features, and make comparisons where relevant.

Write at least 150 words.

[Data for the chart]
UK: 2010 — 405,000 | 2015 — 437,000 | 2020 — 556,000
Australia: 2010 — 271,000 | 2015 — 295,000 | 2020 — 509,000
Canada: 2010 — 218,000 | 2015 — 354,000 | 2020 — 642,000`,
    sampleAnswer: `The bar chart compares the number of international students enrolled in the United Kingdom, Australia, and Canada across three years: 2010, 2015, and 2020.

Overall, all three countries experienced an increase in international student numbers over the period shown. Notably, Canada overtook both the UK and Australia to become the leading destination by 2020, having started with the fewest students in 2010.

In 2010, the UK had the highest enrolment at 405,000, followed by Australia with 271,000 and Canada with 218,000. By 2015, the UK had risen modestly to 437,000, while Australia saw a comparatively small increase to 295,000. Canada, however, experienced a more substantial rise to 354,000, narrowing the gap with the other two countries.

The most dramatic changes occurred between 2015 and 2020. Canada's international student population surged to 642,000, making it the most popular destination of the three. The UK also saw considerable growth, reaching 556,000. Australia's figures rose significantly to 509,000, nearly doubling its 2010 total.

In summary, while the UK initially led in international student enrolment, Canada experienced the most rapid growth and emerged as the top destination by 2020.`,
    tips: [
      'Paraphrase the chart title in the introduction — do not copy the question word-for-word',
      'Include an overview paragraph identifying the main trend before discussing specifics',
      'Use specific data (numbers, years) to support your descriptions',
      'Compare data across categories, not just describe each one in isolation',
      'Use a range of comparison language: "significantly higher", "nearly doubled", "surged"',
    ],
    keyVocabulary: [
      'rose modestly / substantially / dramatically',
      'surged to / peaked at / reached',
      'narrowing the gap',
      'overtook / surpassed',
      'the most popular destination',
      'considerable growth / a significant rise',
    ],
    band7Criteria: [
      'Clear overview identifying the main trend (Canada overtook UK and Australia)',
      'Specific data used accurately throughout',
      'Logical organisation: overview before detail paragraphs',
      'Comparison language used, not just description of individual bars',
      'Appropriate range of vocabulary for describing change',
      'No personal opinion — purely objective reporting',
    ],
  },

  // ── Task 1: Line Graph ─────────────────────────────────────────────────
  {
    id: 'writing-t1-line',
    taskType: 1,
    prompt: `The line graph below shows the average annual temperature (in degrees Celsius) in three cities — Moscow, London, and Dubai — from 1980 to 2020.

Summarise the information by selecting and reporting the main features, and make comparisons where relevant.

Write at least 150 words.

[Data for the graph]
Moscow: 1980 — 4.5°C | 1990 — 4.8°C | 2000 — 5.4°C | 2010 — 5.9°C | 2020 — 6.5°C
London: 1980 — 10.2°C | 1990 — 10.5°C | 2000 — 11.0°C | 2010 — 11.3°C | 2020 — 11.8°C
Dubai: 1980 — 26.8°C | 1990 — 27.0°C | 2000 — 27.3°C | 2010 — 27.8°C | 2020 — 28.4°C`,
    sampleAnswer: `The line graph illustrates changes in the average annual temperature in Moscow, London, and Dubai over a 40-year period from 1980 to 2020.

Overall, all three cities experienced a gradual upward trend in temperatures throughout the period. Dubai remained by far the hottest city, while Moscow consistently recorded the lowest temperatures. Notably, Moscow experienced the greatest proportional increase.

In 1980, Dubai's average temperature stood at 26.8°C, making it considerably warmer than London at 10.2°C and Moscow at just 4.5°C. Over the following two decades, all three cities showed steady but modest increases, with Moscow rising to 5.4°C, London to 11.0°C, and Dubai to 27.3°C by the year 2000.

Between 2000 and 2020, the warming trend continued. Moscow's temperature climbed to 6.5°C, representing an increase of 2.0°C over the entire period — the largest absolute rise of the three cities. London's average reached 11.8°C, while Dubai's rose to 28.4°C. Although Dubai's total increase of 1.6°C was slightly smaller in absolute terms, it remained consistently the warmest city throughout.

In summary, while all three cities grew warmer, Moscow showed the most pronounced warming trend in both absolute and proportional terms.`,
    tips: [
      'State the time period clearly in the introduction',
      'Identify overall trends in the overview before giving specific data',
      'Group data logically — by time period or by city, not randomly',
      'Make comparisons: which city showed the most/least change?',
      'Use tenses correctly: past tense for completed periods',
    ],
    keyVocabulary: [
      'gradual upward trend',
      'stood at / recorded / reached',
      'the most pronounced warming',
      'in absolute terms / proportionally',
      'consistently / throughout the period',
      'modest / steady / considerable increase',
    ],
    band7Criteria: [
      'Overview identifies the key trend: all cities warmed, Moscow most',
      'Data is selected and grouped logically (by time period)',
      'Accurate use of specific figures throughout',
      'Comparative language used effectively',
      'Clear four-paragraph structure: intro, overview, detail, detail',
      'Cohesive devices used to link ideas smoothly',
    ],
  },

  // ── Task 1: Pie Chart ──────────────────────────────────────────────────
  {
    id: 'writing-t1-pie',
    taskType: 1,
    prompt: `The two pie charts below show the main sources of energy production in Country X in 2000 and 2020.

Summarise the information by selecting and reporting the main features, and make comparisons where relevant.

Write at least 150 words.

[Data for pie charts]
2000: Oil — 42% | Natural Gas — 25% | Coal — 20% | Nuclear — 8% | Renewables — 5%
2020: Oil — 28% | Natural Gas — 22% | Coal — 10% | Nuclear — 12% | Renewables — 28%`,
    sampleAnswer: `The two pie charts compare the main sources of energy production in Country X in the years 2000 and 2020.

Overall, there was a significant shift away from fossil fuels towards cleaner energy sources over the twenty-year period. While oil dominated the energy mix in 2000, renewables had grown to match it by 2020.

In 2000, oil was the largest energy source, accounting for 42% of total production. Natural gas comprised 25%, followed by coal at 20%. Nuclear energy and renewables made up relatively small shares, at 8% and 5% respectively.

By 2020, the energy landscape had changed considerably. Oil's share fell dramatically from 42% to 28%, and coal also declined significantly from 20% to just 10%. Natural gas experienced a more modest reduction, dropping slightly to 22%. In contrast, renewables saw the most dramatic growth, rising from a mere 5% in 2000 to 28% in 2020, making it equal to oil as the joint largest source. Nuclear energy also increased, reaching 12%.

In summary, Country X underwent a notable transformation in its energy mix, with a clear trend towards renewable and nuclear energy at the expense of fossil fuels.`,
    tips: [
      'Describe and compare BOTH pie charts — do not just describe one after the other',
      'Highlight the biggest changes between the two time periods',
      'Use percentage language accurately: "accounted for", "comprised", "made up"',
      'Write an overview that captures the overall shift, not just individual numbers',
      'Do not describe every single segment — select the most significant features',
    ],
    keyVocabulary: [
      'accounted for / comprised / constituted',
      'the largest share / the dominant source',
      'a dramatic increase / a significant decline',
      'at the expense of',
      'in contrast / conversely',
      'a mere 5% / a substantial 28%',
    ],
    band7Criteria: [
      'Both charts compared, not just described separately',
      'Overview identifies the main shift (fossil fuels to renewables)',
      'Key changes highlighted with accurate percentages',
      'Appropriate vocabulary for describing proportions',
      'Comparisons made across time periods for the same categories',
      'Logical paragraph structure',
    ],
  },

  // ── Task 1: Table ──────────────────────────────────────────────────────
  {
    id: 'writing-t1-table',
    taskType: 1,
    prompt: `The table below shows the percentage of the population aged 65 and over in five countries in 1990, 2005, and 2020.

Summarise the information by selecting and reporting the main features, and make comparisons where relevant.

Write at least 150 words.

[Table data]
         | 1990  | 2005  | 2020
Japan    | 12.0% | 20.2% | 28.7%
Germany  | 15.5% | 18.8% | 21.7%
USA      | 12.5% | 12.4% | 16.6%
Brazil   |  4.8% |  6.1% |  9.6%
Nigeria  |  2.7% |  2.9% |  2.8%`,
    sampleAnswer: `The table provides data on the proportion of the population aged 65 and above in five countries — Japan, Germany, the USA, Brazil, and Nigeria — over three decades from 1990 to 2020.

Overall, Japan experienced the most dramatic increase in its elderly population, while Nigeria's proportion remained virtually unchanged. All countries except Nigeria showed a clear ageing trend, though the rate of change varied considerably.

In 1990, Germany had the highest percentage of elderly residents at 15.5%, closely followed by the USA at 12.5% and Japan at 12.0%. Brazil and Nigeria had significantly younger populations, with just 4.8% and 2.7% respectively.

By 2020, Japan had overtaken all other countries with 28.7% of its population aged 65 and over — more than double its 1990 figure. Germany's proportion rose more steadily to 21.7%. The USA saw a notable increase to 16.6%, with most of this growth occurring between 2005 and 2020. Brazil's elderly population doubled from 4.8% to 9.6%, reflecting a developing country beginning to experience demographic ageing. Nigeria, by contrast, remained stable at approximately 2.8%, suggesting a continued high birth rate and lower life expectancy.

In summary, demographic ageing is progressing at vastly different rates across these nations, with Japan leading the trend most dramatically.`,
    tips: [
      'Do not try to describe every number — select the most significant data points',
      'Group countries by trend: those ageing rapidly vs. those remaining young',
      'Use precise figures but round where appropriate for readability',
      'Make comparisons across countries at the same time point AND over time for the same country',
      'Include an overview paragraph that captures the main pattern',
    ],
    keyVocabulary: [
      'the proportion of / the percentage of',
      'more than double / nearly tripled',
      'overtook / surpassed',
      'remained virtually unchanged / stable',
      'the most dramatic increase',
      'demographic ageing / an ageing trend',
    ],
    band7Criteria: [
      'Overview captures the key pattern: Japan ageing fastest, Nigeria stable',
      'Data selected wisely — not every cell described',
      'Meaningful comparisons across countries and time periods',
      'Appropriate vocabulary for describing trends in tables',
      'Logical grouping of data in body paragraphs',
      'At least 150 words with no repetition',
    ],
  },

  // ── Task 2: Opinion Essay ──────────────────────────────────────────────
  {
    id: 'writing-t2-opinion',
    taskType: 2,
    prompt: `Some people believe that university education should be free for all students, while others argue that students should pay tuition fees.

To what extent do you agree or disagree with the idea that university education should be free?

Write at least 250 words.`,
    sampleAnswer: `The question of whether university education should be free for all students is a matter of considerable debate. While I understand the appeal of free education, I believe that a system in which students contribute to the cost of their degrees, supported by government subsidies and income-contingent loans, is a more sustainable and equitable approach.

Proponents of free university education argue that it promotes social equality by removing financial barriers. In many countries, talented students from low-income families are deterred from pursuing higher education because they cannot afford tuition fees. By making university free, governments can ensure that access to education is determined by ability rather than by wealth. Countries such as Germany and Norway, which offer free or nearly free higher education, are frequently cited as successful models.

However, there are significant practical concerns with this approach. Firstly, university education is expensive to provide, and the cost must be borne by someone — typically the taxpayer. In a system of free education, even citizens who never attend university subsidise those who do, which raises questions of fairness. Moreover, graduates tend to earn significantly more over their lifetimes than non-graduates, meaning that free education effectively transfers wealth from lower earners to higher earners.

A more balanced solution, in my view, is an income-contingent loan system, such as that used in the United Kingdom and Australia. Under this model, students pay nothing upfront and only begin repaying their loans once they earn above a certain threshold. This ensures that education remains accessible while also ensuring that those who benefit most from their degrees contribute to the cost.

In conclusion, while the ideal of free education is admirable, the most equitable and sustainable approach is one in which costs are shared between governments and graduates. An income-contingent loan system achieves this balance effectively.`,
    tips: [
      'State your position clearly in the introduction — do not wait until the conclusion',
      'Acknowledge the opposing view before presenting your own — this shows balanced thinking',
      'Each body paragraph needs a clear topic sentence, development, and an example or evidence',
      'Your conclusion should not introduce new ideas — it should summarise and restate your position',
      'Aim for 270-300 words — going significantly over 300 wastes time without gaining marks',
    ],
    keyVocabulary: [
      'income-contingent loan',
      'social equality / equitable',
      'subsidise / borne by the taxpayer',
      'financial barriers / deterred from',
      'a sustainable approach',
      'raises questions of fairness',
      'transfers wealth',
    ],
    band7Criteria: [
      'Clear position stated in the introduction and maintained throughout',
      'Both sides of the argument addressed with relevant examples (Germany, Norway, UK, Australia)',
      'Logical paragraph structure: intro, argument for, argument against, own position, conclusion',
      'Cohesive devices used effectively: "However", "Moreover", "In my view", "In conclusion"',
      'A range of vocabulary used accurately — no repetition of simple words',
      'Complex sentence structures used naturally (e.g., "meaning that...", "Under this model...")',
      'Over 250 words with no off-topic content',
    ],
  },

  // ── Task 2: Discussion Essay ───────────────────────────────────────────
  {
    id: 'writing-t2-discussion',
    taskType: 2,
    prompt: `Some people think that the best way to reduce crime is to give longer prison sentences. Others believe that there are better alternative ways of reducing crime.

Discuss both views and give your own opinion.

Write at least 250 words.`,
    sampleAnswer: `Crime reduction remains one of the most pressing challenges for governments worldwide. While some advocate for longer prison sentences as a deterrent, others argue that alternative approaches — such as education, rehabilitation, and addressing root causes — are more effective. This essay will examine both perspectives before offering my own view.

Those who support longer prison sentences argue that they serve as a powerful deterrent. The logic is straightforward: if potential offenders know they face a lengthy term of imprisonment, they will be less likely to commit crimes. Furthermore, while offenders are incarcerated, they are unable to commit further crimes against the public, which directly reduces crime rates in the short term. In countries like Singapore, where penalties are notably severe, crime rates are indeed remarkably low.

On the other hand, critics of this approach point to evidence suggesting that long sentences do not significantly reduce reoffending rates. In the United States, which has one of the highest incarceration rates in the world, recidivism rates remain stubbornly high, with approximately two-thirds of released prisoners being rearrested within three years. This suggests that imprisonment alone does little to address the underlying causes of criminal behaviour, such as poverty, lack of education, substance abuse, and mental health issues.

In my opinion, the most effective strategy combines targeted imprisonment for serious offenders with comprehensive rehabilitation and social programmes for less dangerous criminals. Investment in education, vocational training within prisons, and robust mental health support upon release has been shown to reduce recidivism significantly in Scandinavian countries, where reoffending rates are among the lowest in the world.

In conclusion, while prison sentences have a role to play in the criminal justice system, they should be part of a broader strategy that addresses the root causes of crime. A purely punitive approach is unlikely to achieve lasting reductions in criminal behaviour.`,
    tips: [
      'Discuss BOTH views before giving your opinion — do not ignore one side',
      'Your own opinion should be clear, even if you partially agree with both sides',
      'Use real-world examples to support each view (Singapore, USA, Scandinavia)',
      'Avoid emotional language — maintain an academic, objective tone',
      'Ensure your opinion is consistent in the introduction and conclusion',
    ],
    keyVocabulary: [
      'deterrent / incarcerated / reoffending / recidivism (рецидив)',
      'root causes / underlying causes',
      'vocational training / rehabilitation',
      'a punitive approach / criminal justice system',
      'stubbornly high / remarkably low',
      'comprehensive / robust / targeted',
    ],
    band7Criteria: [
      'Both views discussed in dedicated paragraphs with development and examples',
      'Own opinion clearly stated and logically supported',
      'Real-world evidence used (USA recidivism, Scandinavian model)',
      'Academic vocabulary and tone maintained throughout',
      'Clear paragraph structure with effective linking words',
      'Complex sentences used accurately with subordinate clauses',
      'Conclusion summarises and restates position without new ideas',
    ],
  },

  // ── Task 2: Problem/Solution Essay ─────────────────────────────────────
  {
    id: 'writing-t2-problem-solution',
    taskType: 2,
    prompt: `In many countries, the proportion of elderly people is increasing rapidly.

What problems does this cause for individuals and for society? What solutions can be suggested?

Write at least 250 words.`,
    sampleAnswer: `Many nations are experiencing a significant demographic shift as the proportion of elderly citizens rises. This trend, while a testament to improved healthcare and living standards, presents considerable challenges for both individuals and society at large. This essay will examine the key problems and propose practical solutions.

One of the most pressing problems at the individual level is the decline in physical and mental health that often accompanies ageing. Elderly people are more susceptible to chronic conditions such as dementia, arthritis, and cardiovascular disease, which can severely diminish their quality of life and independence. Moreover, many elderly individuals experience social isolation, particularly if they live alone following the death of a spouse. This loneliness is not merely an emotional issue — research has shown that chronic isolation carries health risks comparable to smoking fifteen cigarettes a day.

At the societal level, the primary concern is the growing strain on healthcare systems and pension funds. As the ratio of working-age adults to retirees decreases, fewer people are contributing to the tax base that finances these services. Japan, where over 28 percent of the population is aged 65 or older, already faces severe fiscal pressures, and many European countries are moving in the same direction.

Several solutions merit consideration. Firstly, governments should encourage later retirement by raising the official retirement age and offering incentives for continued employment. Secondly, investment in preventive healthcare — such as regular health screening programmes and community exercise initiatives — can help elderly people remain healthy and independent for longer. Thirdly, fostering intergenerational programmes, such as shared housing schemes and community volunteering, can combat social isolation while strengthening community bonds.

In conclusion, the ageing population poses genuine challenges, but these can be mitigated through a combination of policy reform, healthcare investment, and community-based initiatives. Proactive planning, rather than reactive crisis management, will be essential.`,
    tips: [
      'Clearly separate problems and solutions — ideally in separate paragraphs',
      'Discuss problems at both individual AND societal levels for depth',
      'Solutions should logically address the problems you raised',
      'Avoid vague solutions like "the government should do something" — be specific',
      'Include real-world examples to strengthen your arguments',
    ],
    keyVocabulary: [
      'demographic shift / ageing population',
      'chronic conditions / cardiovascular disease / dementia',
      'social isolation / loneliness',
      'the tax base / pension funds / fiscal pressures',
      'the ratio of working-age adults to retirees',
      'preventive healthcare / intergenerational programmes',
      'mitigated / proactive planning',
    ],
    band7Criteria: [
      'Problems and solutions clearly identified and logically connected',
      'Both individual and societal impacts discussed (shows depth)',
      'Specific real-world examples used (Japan demographics)',
      'Three concrete solutions proposed, each developed with explanation',
      'Academic vocabulary used accurately and naturally',
      'Strong conclusion that summarises without introducing new points',
      'Cohesive devices create smooth flow between ideas',
    ],
  },

  // ── Task 2: Advantages/Disadvantages Essay ─────────────────────────────
  {
    id: 'writing-t2-advdisadv',
    taskType: 2,
    prompt: `In many countries, young people are choosing to work or travel for a period of time between finishing school and starting university. This is often called a "gap year."

Do the advantages of taking a gap year outweigh the disadvantages?

Write at least 250 words.`,
    sampleAnswer: `Taking a gap year between school and university has become increasingly popular among young people in many parts of the world. While this practice offers significant benefits in terms of personal development and practical experience, it also carries certain risks. On balance, I believe the advantages outweigh the disadvantages, provided the year is spent purposefully.

The most compelling advantage of a gap year is the opportunity for personal growth. Young people who travel, volunteer, or work gain a breadth of experience that is difficult to acquire within the confines of a classroom. They develop independence, cross-cultural awareness, and resilience — qualities that are increasingly valued by both universities and employers. A study by the University of Sydney found that students who took a gap year performed better academically in their first year of university than those who enrolled directly from school, suggesting that maturity gained during the year translates into stronger academic focus.

Furthermore, a gap year allows students to explore career options before committing to a degree programme. Many young people choose their university course based on limited understanding of what the field actually involves. Spending time working in a related industry can confirm or redirect their choice, potentially saving years of studying an unsuitable subject.

However, there are legitimate concerns. Some students struggle to return to academic study after a year away, finding it difficult to readapt to the discipline of formal education. There is also a financial dimension: not all families can afford to support a year of travel or unpaid work, which means gap years may reinforce socioeconomic inequality.

In conclusion, while the risk of losing academic momentum and the financial barrier are real concerns, the personal growth, practical experience, and improved academic outcomes associated with a well-planned gap year make it a worthwhile undertaking for the majority of students.`,
    tips: [
      'Answer the question directly: "Do advantages outweigh?" requires a clear yes or no',
      'Present advantages and disadvantages in balanced body paragraphs',
      'Use a study or example to support at least one argument',
      'Your conclusion must clearly state whether advantages outweigh',
      'Use hedging language where appropriate: "On balance", "provided that", "for the majority"',
    ],
    keyVocabulary: [
      'personal growth / personal development',
      'cross-cultural awareness / resilience / independence',
      'breadth of experience / within the confines of',
      'academic momentum / readapt to',
      'socioeconomic inequality / financial barrier',
      'a worthwhile undertaking / provided that',
    ],
    band7Criteria: [
      'Clear position stated: advantages outweigh, with a caveat ("provided...")',
      'Two advantages and two disadvantages developed with examples and evidence',
      'Research evidence cited (University of Sydney study)',
      'Hedging and qualifying language used for nuance',
      'Conclusion directly answers the question',
      'Wide range of academic vocabulary used accurately',
      'Complex sentence structures with subordination and relative clauses',
    ],
  },
]

// ════════════════════════════════════════════════════════════════════════════
// 3. SPEAKING CUE CARDS (15 cards — Part 2 with Part 3 follow-ups)
// ════════════════════════════════════════════════════════════════════════════

export const IELTS_SPEAKING_CARDS: IeltsSpeakingCard[] = [
  // 1 — Hometown
  {
    id: 'speak-1-hometown',
    part: 2,
    topic: 'Your Hometown',
    card: `Describe your hometown or the city you live in.

You should say:
- where it is located
- what it is famous for
- what you like and dislike about it
and explain whether you would like to live there in the future.`,
    followUpQuestions: [
      'Do you think it is better to grow up in a city or in the countryside?',
      'How do you think your hometown will change in the next 20 years?',
      'What can governments do to make cities more liveable?',
      'Do you think young people today prefer to live in cities? Why?',
    ],
    modelAnswer: `I come from Almaty, which is the largest city in Kazakhstan, located in the southeastern part of the country at the foot of the Tien Shan mountains. Although Astana is the capital, Almaty remains the cultural and economic hub.

The city is famous for several things. It was the capital of Kazakhstan until 1997, and it is sometimes called "the city of apples" because the surrounding region is considered the ancestral home of the modern apple. It is also known for its stunning mountain scenery — you can literally see snow-capped peaks from the city centre.

What I particularly enjoy about living there is the combination of urban life and nature. Within thirty minutes you can drive from a modern shopping centre to a mountain hiking trail. The food scene has also improved dramatically in recent years. However, one thing I dislike is the traffic congestion, which has become considerably worse as the city has grown. The air quality in winter can also be problematic.

As for the future, I would be happy to return there after completing my studies abroad. I think the city is developing rapidly and still has enormous potential.`,
    usefulPhrases: [
      'It is located in the southeastern part of...',
      'The city is famous for / known for / renowned for...',
      'What I particularly enjoy is...',
      'One thing I dislike is...',
      'The city has enormous potential...',
      'Within thirty minutes you can...',
    ],
    vocabulary: [
      'cultural hub (культурный центр)',
      'ancestral home (исторический ареал)',
      'traffic congestion (заторы на дорогах)',
      'developing rapidly (быстро развивается)',
      'stunning scenery (потрясающие пейзажи)',
    ],
  },

  // 2 — Technology
  {
    id: 'speak-2-technology',
    part: 2,
    topic: 'A Piece of Technology',
    card: `Describe a piece of technology that you find very useful in your daily life.

You should say:
- what it is
- how long you have had it
- what you use it for
and explain why you find it so useful.`,
    followUpQuestions: [
      'Do you think people have become too dependent on technology?',
      'How has technology changed the way people communicate?',
      'What technology do you think will be most important in the future?',
      'Should children be limited in their use of technology?',
    ],
    modelAnswer: `The piece of technology I find most indispensable is my laptop. I have had my current one — a lightweight ultrabook — for about two years, and I use it almost every single day.

I use it primarily for studying and work. I write essays, conduct research, attend online lectures, and organise my schedule through it. Beyond academic work, I also use it for creative projects — I have recently started learning video editing, which would be impossible without a reasonably powerful computer.

What makes it so useful is its versatility. Unlike a phone, which is good for quick tasks, a laptop allows me to work deeply on complex projects. The screen size, the keyboard, and the ability to run multiple programmes simultaneously make it far more productive for serious work. I also rely heavily on cloud storage, which means I can access all my files from anywhere.

I think what I value most, though, is that it serves as my connection to the wider world — through online courses, international news, and communication with friends and family who are far away. In a sense, it has become an extension of myself.`,
    usefulPhrases: [
      'The piece of technology I find most indispensable is...',
      'I have had it for approximately...',
      'Beyond [main use], I also use it for...',
      'What makes it so useful is its versatility...',
      'Unlike [alternative], it allows me to...',
      'It has become an extension of myself...',
    ],
    vocabulary: [
      'indispensable (незаменимый)',
      'versatility (универсальность)',
      'simultaneously (одновременно)',
      'cloud storage (облачное хранилище)',
      'conduct research (проводить исследование)',
    ],
  },

  // 3 — Education
  {
    id: 'speak-3-education',
    part: 2,
    topic: 'A Subject You Enjoyed at School',
    card: `Describe a subject you particularly enjoyed studying at school.

You should say:
- what the subject was
- who taught it
- what you learned
and explain why you enjoyed it so much.`,
    followUpQuestions: [
      'Do you think the education system in your country needs to change?',
      'Is it more important to study subjects you enjoy or subjects that lead to good jobs?',
      'How has teaching changed compared to when your parents were at school?',
      'Should students be allowed to choose all their own subjects?',
    ],
    modelAnswer: `The subject I enjoyed most at school was history, and specifically world history, which I studied from about the age of fourteen onwards.

Our teacher, whose name was Marat Serikovich, was the main reason I fell in love with the subject. He had a genuine passion for history that was absolutely infectious. Rather than simply making us memorise dates and events, he would tell stories — about the motivations of historical figures, about the everyday lives of ordinary people in different eras. He made the past feel alive and relevant.

I learned an enormous amount, not just about specific events like the Second World War or the Silk Road, but about how to analyse sources critically, how to construct arguments based on evidence, and how to understand cause and effect across long periods of time. These analytical skills have proven invaluable in my subsequent studies.

What I enjoyed most was the sense of perspective that history gave me. Understanding how civilizations rose and fell, how people in different cultures solved similar problems, and how the present is shaped by the past — all of this gave me a much broader understanding of the world.`,
    usefulPhrases: [
      'The subject I enjoyed most was...',
      'The main reason I fell in love with it was...',
      'Rather than simply making us [do X], he would...',
      'These skills have proven invaluable in...',
      'What I enjoyed most was the sense of...',
      'He had a genuine passion that was infectious...',
    ],
    vocabulary: [
      'infectious enthusiasm (заразительный энтузиазм)',
      'analyse sources critically (анализировать источники критически)',
      'cause and effect (причина и следствие)',
      'a broader understanding (более широкое понимание)',
      'proven invaluable (оказалось бесценным)',
    ],
  },

  // 4 — Travel
  {
    id: 'speak-4-travel',
    part: 2,
    topic: 'A Place You Would Like to Visit',
    card: `Describe a place you have never been to but would like to visit.

You should say:
- where it is
- how you learned about it
- what you would do there
and explain why you want to visit this place.`,
    followUpQuestions: [
      'Why do some people prefer to travel abroad rather than within their own country?',
      'Do you think tourism is always beneficial for local communities?',
      'How has the internet changed the way people plan their holidays?',
      'Is it better to travel alone or with other people?',
    ],
    modelAnswer: `A place I have always dreamed of visiting is Japan, and Tokyo in particular. I have been fascinated by the country for several years, ever since I watched a documentary series about Japanese culture and technology.

What draws me most is the extraordinary contrast between tradition and modernity. In Tokyo, centuries-old temples sit alongside futuristic skyscrapers, and you can experience a traditional tea ceremony in the morning and visit a cutting-edge robotics exhibition in the afternoon. I find this blend absolutely captivating.

If I were to visit, I would want to explore both the cultural and the technological sides of the city. I would definitely visit the Meiji Shrine, the Tsukiji fish market, and the Akihabara electronics district. I would also love to try authentic Japanese cuisine — sushi, ramen, and the incredible street food I have seen in so many travel videos.

The main reason I want to go is that Japan represents a culture that has managed to modernise rapidly while preserving its traditions, and I think there is a great deal that Kazakhstan, as a developing country, could learn from that approach.`,
    usefulPhrases: [
      'A place I have always dreamed of visiting is...',
      'What draws me most is...',
      'I find this blend absolutely captivating...',
      'If I were to visit, I would want to...',
      'The main reason I want to go is that...',
      'There is a great deal that [X] could learn from...',
    ],
    vocabulary: [
      'cutting-edge (передовой)',
      'captivating (захватывающий)',
      'a blend of tradition and modernity',
      'to modernise rapidly (быстро модернизироваться)',
      'authentic cuisine (подлинная кухня)',
    ],
  },

  // 5 — Hobby
  {
    id: 'speak-5-hobby',
    part: 2,
    topic: 'A Hobby or Leisure Activity',
    card: `Describe a hobby or leisure activity you enjoy doing in your free time.

You should say:
- what the activity is
- when and how often you do it
- who you do it with
and explain why you enjoy it.`,
    followUpQuestions: [
      'Do young people today have enough free time for hobbies?',
      'Are there any hobbies that are particularly popular in your country?',
      'Do you think hobbies can sometimes lead to careers?',
      'How important is it to have a balance between work and leisure?',
    ],
    modelAnswer: `The hobby I enjoy most is reading, though perhaps not in the way most people might expect. I am particularly drawn to non-fiction — books about psychology, history, and economics. I try to read for at least thirty to forty minutes every evening before bed, and I usually manage to finish about two books per month.

It is largely a solitary activity for me, but I have recently joined an online book club where we discuss one book each month. This has added a social dimension that I had not anticipated enjoying so much — hearing other people's interpretations of the same material often reveals perspectives I had completely overlooked.

What I enjoy most about reading non-fiction is that it satisfies my curiosity about how the world works. Every book I finish leaves me with new frameworks for understanding topics I thought I already knew. For example, reading "Thinking, Fast and Slow" by Daniel Kahneman completely changed the way I understand decision-making — both my own and other people's.

I would say reading is the single most valuable habit I have developed. It has broadened my vocabulary, sharpened my critical thinking, and provided me with endless topics for conversation.`,
    usefulPhrases: [
      'The hobby I enjoy most is...',
      'I am particularly drawn to...',
      'It has added a dimension that I had not anticipated...',
      'What I enjoy most about it is that it satisfies my curiosity...',
      'Every [experience] leaves me with new...',
      'I would say it is the single most valuable habit...',
    ],
    vocabulary: [
      'solitary activity (уединённое занятие)',
      'perspectives I had overlooked (точки зрения, которые я упустил)',
      'frameworks for understanding (концептуальные рамки)',
      'broadened my vocabulary (расширил мой словарный запас)',
      'sharpened my critical thinking (обострил критическое мышление)',
    ],
  },

  // 6 — Person You Admire
  {
    id: 'speak-6-person',
    part: 2,
    topic: 'A Person You Admire',
    card: `Describe a person you admire who has achieved something great.

You should say:
- who this person is
- what they achieved
- how you learned about them
and explain why you admire them.`,
    followUpQuestions: [
      'What qualities do you think make a person admirable?',
      'Do you think famous people have a responsibility to be good role models?',
      'Is it better to admire people you know personally or public figures?',
      'Do young people today have good role models?',
    ],
    modelAnswer: `The person I admire most is Marie Curie, the Polish-born physicist and chemist who became the first woman to win a Nobel Prize and the only person in history to win Nobel Prizes in two different scientific fields — physics and chemistry.

I first learned about her in a science class at school, but my admiration deepened considerably when I read a detailed biography of her life. What struck me most was not just her scientific brilliance but the extraordinary obstacles she overcame. At a time when women were largely excluded from academic institutions, she moved to Paris alone, studied at the Sorbonne despite financial hardship, and went on to make discoveries that fundamentally changed our understanding of radioactivity.

What I admire most is her relentless dedication to her work, even in the face of personal tragedy. After her husband Pierre died in an accident, she continued her research and eventually established a mobile X-ray unit during World War I that saved countless soldiers' lives.

I think she embodies qualities that are particularly relevant today: perseverance in the face of adversity, intellectual courage, and a commitment to using knowledge for the benefit of humanity. She proved that talent and determination can transcend any barrier.`,
    usefulPhrases: [
      'The person I admire most is...',
      'My admiration deepened when...',
      'What struck me most was...',
      'She embodies qualities that are particularly relevant...',
      'In the face of adversity / personal tragedy...',
      'She proved that [X] can transcend...',
    ],
    vocabulary: [
      'relentless dedication (неустанная преданность)',
      'intellectual courage (интеллектуальная смелость)',
      'perseverance (настойчивость)',
      'to transcend barriers (преодолевать барьеры)',
      'for the benefit of humanity (на благо человечества)',
    ],
  },

  // 7 — Book or Movie
  {
    id: 'speak-7-book',
    part: 2,
    topic: 'A Book or Movie That Influenced You',
    card: `Describe a book or movie that had a strong impact on you.

You should say:
- what the book/movie is about
- when you read/watched it
- what you felt after reading/watching it
and explain how it influenced you.`,
    followUpQuestions: [
      'Do you think books are more beneficial than movies for learning?',
      'How have streaming services changed the way people consume films?',
      'Should schools require students to read specific books? Why or why not?',
      'Do you think fictional stories can teach us important life lessons?',
    ],
    modelAnswer: `A book that had a profound impact on me is "1984" by George Orwell. I read it when I was about sixteen, and it completely changed the way I think about freedom, privacy, and the power of language.

The book is set in a dystopian society called Oceania, where the government — led by a figure known as Big Brother — controls every aspect of citizens' lives, including their thoughts. The protagonist, Winston Smith, works at the Ministry of Truth, where his job is to rewrite historical records to match the government's current narrative. It is a chilling depiction of totalitarianism taken to its logical extreme.

After finishing it, I felt genuinely unsettled. The book made me realise how easily language can be manipulated to control people — what Orwell called "Newspeak." It also made me think about the importance of free speech and independent thought, which I had previously taken for granted.

The influence has been lasting. I became much more attentive to how political language is used in the media and in everyday life. I started questioning narratives more carefully and developed a much deeper appreciation for freedom of expression. I think it is one of those rare books that changes not just what you know but how you think.`,
    usefulPhrases: [
      'A book that had a profound impact on me is...',
      'It completely changed the way I think about...',
      'It is a chilling depiction of...',
      'After finishing it, I felt genuinely unsettled...',
      'The influence has been lasting...',
      'It changes not just what you know but how you think...',
    ],
    vocabulary: [
      'dystopian society (антиутопия)',
      'totalitarianism (тоталитаризм)',
      'to manipulate language (манипулировать языком)',
      'freedom of expression (свобода слова)',
      'taken for granted (принимал как должное)',
    ],
  },

  // 8 — Environmental Issue
  {
    id: 'speak-8-environment',
    part: 2,
    topic: 'An Environmental Issue You Care About',
    card: `Describe an environmental problem that concerns you.

You should say:
- what the problem is
- how you became aware of it
- what effects it has
and explain what you think should be done about it.`,
    followUpQuestions: [
      'Whose responsibility is it to protect the environment — individuals or governments?',
      'Do you think young people are more environmentally conscious than older generations?',
      'Can economic growth and environmental protection coexist?',
      'What role should education play in addressing environmental problems?',
    ],
    modelAnswer: `The environmental issue that concerns me most is air pollution, specifically in large cities in Central Asia, including my own city of Almaty. During the winter months, air quality regularly reaches hazardous levels, and there have been days when visibility dropped to just a few hundred metres.

I became acutely aware of the problem about three years ago when a friend of mine developed respiratory issues that her doctor attributed directly to poor air quality. Before that, I had noticed the smog but had not fully appreciated the health consequences.

The effects are serious and wide-ranging. In the short term, poor air quality causes coughing, headaches, and aggravates conditions like asthma. In the long term, prolonged exposure to fine particulate matter has been linked to heart disease, lung cancer, and reduced life expectancy. Beyond health, air pollution also affects the local economy, as it makes cities less attractive to both tourists and businesses.

I believe a multi-faceted approach is needed. Firstly, the government should invest heavily in modernising heating infrastructure, as coal-burning in older residential areas is one of the primary sources. Secondly, public transport should be expanded and made more affordable to reduce car usage. Finally, stricter industrial emissions standards need to be enforced consistently, not just on paper.`,
    usefulPhrases: [
      'The issue that concerns me most is...',
      'I became acutely aware of the problem when...',
      'The effects are serious and wide-ranging...',
      'Beyond [direct effect], it also affects...',
      'I believe a multi-faceted approach is needed...',
      'Stricter standards need to be enforced consistently...',
    ],
    vocabulary: [
      'hazardous levels (опасные уровни)',
      'fine particulate matter (мелкие частицы PM2.5)',
      'respiratory issues (проблемы с дыханием)',
      'multi-faceted approach (многогранный подход)',
      'emissions standards (нормы выбросов)',
    ],
  },

  // 9 — Celebration
  {
    id: 'speak-9-celebration',
    part: 2,
    topic: 'A Celebration or Festival',
    card: `Describe a celebration or festival that is important in your culture.

You should say:
- what the celebration is
- when it takes place
- how people celebrate it
and explain why it is important.`,
    followUpQuestions: [
      'Do you think traditional celebrations are becoming less important to young people?',
      'How do celebrations in your country differ from those in Western countries?',
      'Should public holidays be given for cultural and religious celebrations?',
      'Do you think commercialisation has ruined some traditional festivals?',
    ],
    modelAnswer: `The celebration that means the most to me is Nauryz, which is the traditional New Year holiday in Kazakhstan and many Central Asian countries. It takes place on March 21st and 22nd, marking the spring equinox and the beginning of a new year in the traditional calendar.

The preparations begin well in advance. Families clean their homes thoroughly, which symbolises a fresh start. On the day itself, the most important tradition is the preparation of Nauryz kozhe — a special dish made from seven ingredients, including grain, meat, and fermented milk. The number seven is significant, representing the seven days of the week and symbolising prosperity.

People visit their relatives and neighbours, exchange warm wishes, and participate in various cultural events — traditional horse games, wrestling competitions, and music performances take place in public spaces throughout the country. The atmosphere is incredibly festive and communal; it feels as though the entire nation comes together.

Nauryz is important because it connects us to our nomadic heritage while also being a secular celebration that brings together people of all backgrounds and faiths. In a diverse country like Kazakhstan, with over 130 ethnic groups, it serves as a unifying cultural event that reinforces our shared identity.`,
    usefulPhrases: [
      'The celebration that means the most to me is...',
      'The preparations begin well in advance...',
      'The number [X] is significant, representing...',
      'The atmosphere is incredibly festive and communal...',
      'It connects us to our heritage while also...',
      'It serves as a unifying event that reinforces...',
    ],
    vocabulary: [
      'spring equinox (весеннее равноденствие)',
      'nomadic heritage (кочевое наследие)',
      'secular celebration (светский праздник)',
      'communal (общинный)',
      'prosperity (процветание)',
    ],
  },

  // 10 — Childhood Memory
  {
    id: 'speak-10-childhood',
    part: 2,
    topic: 'A Childhood Memory',
    card: `Describe a happy memory from your childhood.

You should say:
- what happened
- how old you were
- who was involved
and explain why this memory is special to you.`,
    followUpQuestions: [
      'Do you think children today have a different childhood compared to previous generations?',
      'How important are childhood experiences in shaping who we become?',
      'Should parents try to make every moment of childhood happy, or is some struggle beneficial?',
      'What role do grandparents play in a child\'s upbringing?',
    ],
    modelAnswer: `One of my happiest childhood memories is spending summers at my grandparents' house in a small village about four hours from the city. I was around seven or eight years old, and my younger brother and I would stay there for almost the entire summer holiday.

What made those summers so magical was the complete contrast to city life. My grandparents lived in a traditional house with a large garden and a few animals. My grandfather would wake us early and take us fishing at a nearby river. I remember the excitement of catching my first fish — it was tiny, barely bigger than my hand, but I was absolutely thrilled.

In the evenings, my grandmother would cook enormous meals, and the whole extended family would gather around a long table in the garden. There was always laughter, stories, and traditional songs. My grandmother would tell us stories about her own childhood during the Soviet era, which fascinated me even though I did not fully understand them at the time.

This memory is special because it represents a sense of simplicity and warmth that is harder to find in modern life. Looking back, I realise those summers taught me the value of family, of slowing down, and of being present in the moment rather than constantly seeking stimulation from screens and devices.`,
    usefulPhrases: [
      'One of my happiest memories is...',
      'What made it so magical was...',
      'I remember the excitement of...',
      'Looking back, I realise that...',
      'It represents a sense of simplicity and warmth...',
      'Those experiences taught me the value of...',
    ],
    vocabulary: [
      'the extended family (расширенная семья)',
      'a sense of simplicity (чувство простоты)',
      'being present in the moment (жить настоящим моментом)',
      'fascinated (увлечён / очарован)',
      'absolutely thrilled (в полном восторге)',
    ],
  },

  // 11 — Future Plans
  {
    id: 'speak-11-future',
    part: 2,
    topic: 'Your Future Plans',
    card: `Describe a plan you have for the future.

You should say:
- what the plan is
- when you hope to achieve it
- what steps you need to take
and explain why this plan is important to you.`,
    followUpQuestions: [
      'Do you think it is important for young people to have a clear plan for the future?',
      'How do you react when your plans do not work out as expected?',
      'Do you think people plan too much or too little in modern life?',
      'How have career expectations changed compared to your parents\' generation?',
    ],
    modelAnswer: `My most significant plan for the future is to study abroad — ideally in the United Kingdom or the Netherlands — and to eventually return to Kazakhstan to contribute to the development of the education sector.

I hope to begin a master's programme within the next two years. The steps I need to take are fairly clear but demanding: I need to achieve a high IELTS score — at least 7.0 overall — complete my bachelor's degree with strong grades, and secure a scholarship, as studying abroad is expensive.

I have already started preparing systematically. I study English every day, I am building my academic profile through research projects, and I am in contact with alumni from programmes I am interested in. I also plan to gain some work experience in education before applying, as most competitive programmes value practical experience.

This plan is important to me for deeply personal reasons. I grew up in a system where many aspects of education felt outdated, and I saw talented friends lose their motivation because the system did not support them. I want to gain the knowledge and skills to help modernise educational approaches in my country — not by importing foreign models wholesale, but by adapting the best international practices to the Kazakh context.`,
    usefulPhrases: [
      'My most significant plan is to...',
      'I hope to achieve this within the next...',
      'The steps I need to take are fairly clear but demanding...',
      'I have already started preparing systematically...',
      'This plan is important to me for deeply personal reasons...',
      'Not by [X] wholesale, but by adapting...',
    ],
    vocabulary: [
      'to contribute to the development of (способствовать развитию)',
      'demanding (требовательный / непростой)',
      'academic profile (академический профиль)',
      'to modernise educational approaches (модернизировать подходы к образованию)',
      'to adapt best practices (адаптировать лучшие практики)',
    ],
  },

  // 12 — Food
  {
    id: 'speak-12-food',
    part: 2,
    topic: 'A Special Meal or Dish',
    card: `Describe a meal or dish that is special to you.

You should say:
- what the dish is
- when you usually eat it
- how it is prepared
and explain why it is special to you.`,
    followUpQuestions: [
      'Do you think traditional food is disappearing as fast food becomes more popular?',
      'Should schools teach children how to cook?',
      'How important is food in bringing families together?',
      'Do you think people eat more healthily or less healthily than in the past?',
    ],
    modelAnswer: `The dish that holds the most significance for me is beshbarmak, which is the national dish of Kazakhstan. The name literally translates as "five fingers" because it is traditionally eaten with the hands.

It is typically served during important gatherings — family celebrations, holidays like Nauryz, or when welcoming important guests. The preparation is quite elaborate. Large pieces of meat, usually lamb or horse meat, are boiled for several hours until extremely tender. The broth is then used to cook thin sheets of homemade pasta. The dish is served on a large communal platter, with the meat arranged on top of the pasta and onions, accompanied by the rich broth served separately in bowls.

What makes beshbarmak special to me goes beyond the taste, although the taste is wonderful. It represents hospitality, family unity, and our nomadic traditions. In Kazakh culture, the way the meat is distributed at the table reflects social hierarchy and respect — specific cuts are offered to elders, guests of honour, and young people. This ritual transforms a simple meal into a meaningful cultural practice.

Every time I eat beshbarmak, I am reminded of family gatherings at my grandparents' home. The smell of the broth alone is enough to transport me back to those childhood memories.`,
    usefulPhrases: [
      'The dish that holds the most significance for me is...',
      'It is typically served during...',
      'The preparation is quite elaborate...',
      'What makes it special goes beyond the taste...',
      'It represents hospitality and family unity...',
      'The smell alone is enough to transport me back to...',
    ],
    vocabulary: [
      'communal platter (общее блюдо)',
      'hospitality (гостеприимство)',
      'nomadic traditions (кочевые традиции)',
      'social hierarchy (социальная иерархия)',
      'elaborate preparation (сложная подготовка)',
    ],
  },

  // 13 — Sport
  {
    id: 'speak-13-sport',
    part: 2,
    topic: 'A Sport or Physical Activity',
    card: `Describe a sport or physical activity you enjoy.

You should say:
- what the sport is
- how often you do it
- whether you do it alone or with others
and explain what benefits you get from it.`,
    followUpQuestions: [
      'Do you think physical education should be compulsory at school?',
      'Why do some people avoid exercise even though they know it is good for them?',
      'Do you think professional athletes are paid too much?',
      'How has technology changed the way people exercise?',
    ],
    modelAnswer: `The sport I enjoy most is running, specifically long-distance running. I started about three years ago, quite reluctantly if I am honest — a friend persuaded me to sign up for a five-kilometre charity run, and I could barely finish it. But something about the experience hooked me, and I gradually built up my distance.

I now run four or five times a week, usually in the early morning before my day begins. Most of the time I run alone — I actually prefer it that way, as it gives me time to think without any distractions. However, on weekends I occasionally join a local running group, which provides a social element and pushes me to run faster than I would on my own.

The benefits are both physical and mental. Physically, I am in the best shape of my life — my stamina, sleep quality, and energy levels have all improved enormously. But the mental benefits are even more significant. Running has become my primary method of managing stress. When I run, my mind gradually empties, and by the end I feel calmer and more focused. Scientists call this "runner's high," and I can confirm it is very real.

I also find that running has taught me discipline and patience. Progress is slow and incremental, and there are no shortcuts — which is a valuable lesson that applies to many other areas of life.`,
    usefulPhrases: [
      'I started quite reluctantly, if I am honest...',
      'Something about the experience hooked me...',
      'I gradually built up my...',
      'The benefits are both physical and mental...',
      'Running has become my primary method of managing stress...',
      'Progress is slow and incremental, and there are no shortcuts...',
    ],
    vocabulary: [
      'stamina (выносливость)',
      'incremental progress (постепенный прогресс)',
      'runner\'s high (эйфория бегуна)',
      'to manage stress (управлять стрессом)',
      'discipline and patience (дисциплина и терпение)',
    ],
  },

  // 14 — Music
  {
    id: 'speak-14-music',
    part: 2,
    topic: 'Music in Your Life',
    card: `Describe a type of music or a song that is important to you.

You should say:
- what type of music or song it is
- when you first heard it
- how often you listen to it
and explain why it is important to you.`,
    followUpQuestions: [
      'Do you think music education should be part of the school curriculum?',
      'How has the internet changed the music industry?',
      'Why do people from different cultures enjoy different types of music?',
      'Can music bring people from different backgrounds together?',
    ],
    modelAnswer: `The type of music that has always been most important to me is classical music, and in particular the piano works of Frédéric Chopin. I first encountered his music when I was about eleven years old, during a school concert where an older student performed his Nocturne in E-flat major. I was mesmerised — I had never heard anything so beautiful and emotionally complex.

Since then, I have listened to Chopin almost daily. I often put his music on while studying or reading, and I find it creates a perfect atmosphere for concentration. When I feel stressed or overwhelmed, his nocturnes and ballades have a genuinely calming effect.

What makes Chopin's music so important to me is its emotional depth. Each piece tells a story without words — the melancholy of the nocturnes, the passion of the ballades, the delicate beauty of the waltzes. I think music that can communicate such complex emotions without any lyrics is truly extraordinary.

On a more personal level, Chopin's music is connected to some of my most meaningful experiences. I associate certain pieces with specific memories — studying for my first university exams, travelling alone for the first time, quiet evenings with my family. In a way, his music has become the soundtrack of the most reflective moments of my life.`,
    usefulPhrases: [
      'The type of music that has always been most important to me is...',
      'I was mesmerised — I had never heard anything so...',
      'I find it creates a perfect atmosphere for...',
      'What makes it so important is its emotional depth...',
      'I associate certain pieces with specific memories...',
      'It has become the soundtrack of...',
    ],
    vocabulary: [
      'mesmerised (заворожён)',
      'emotional depth (эмоциональная глубина)',
      'melancholy (меланхолия)',
      'reflective moments (моменты для размышления)',
      'to communicate complex emotions (передавать сложные эмоции)',
    ],
  },

  // 15 — Important Decision
  {
    id: 'speak-15-decision',
    part: 2,
    topic: 'An Important Decision',
    card: `Describe an important decision you had to make.

You should say:
- what the decision was
- when you made it
- what factors you considered
and explain whether you think it was the right decision.`,
    followUpQuestions: [
      'Do you think young people make decisions differently from older people?',
      'How important is it to get advice from others before making a big decision?',
      'Do you think people today have too many choices?',
      'Is it better to make decisions quickly or to take a long time?',
    ],
    modelAnswer: `One of the most important decisions I have ever made was choosing to focus seriously on learning English rather than pursuing a second degree in a technical field. I made this decision about two years ago, when I was at a crossroads in my academic journey.

At the time, several factors influenced my thinking. I had been offered the chance to enrol in a parallel programme in information technology, which many of my friends were doing and which seemed like a safe, practical choice. On the other hand, I felt a strong pull towards investing my time in achieving a high level of English, which I believed would open doors internationally — both for study abroad and for future career opportunities.

The decision was difficult because both options had clear advantages. However, what ultimately tipped the balance was a conversation with a mentor who had studied in the UK. She pointed out that English proficiency at a high level is not just a skill but a gateway — it unlocks access to the best universities, the widest range of career opportunities, and a much broader intellectual world.

Looking back, I am confident it was the right decision. My English has improved dramatically, I am now preparing for IELTS with genuine confidence, and the opportunities that have opened up as a result — including potential scholarship applications — would not have been possible otherwise. Sometimes the less obvious choice turns out to be the most transformative.`,
    usefulPhrases: [
      'One of the most important decisions I have ever made was...',
      'I was at a crossroads in my...',
      'Several factors influenced my thinking...',
      'What ultimately tipped the balance was...',
      'Looking back, I am confident it was the right decision...',
      'Sometimes the less obvious choice turns out to be the most transformative...',
    ],
    vocabulary: [
      'at a crossroads (на перепутье)',
      'to tip the balance (склонить чашу весов)',
      'a gateway to opportunities (путь к возможностям)',
      'English proficiency (владение английским)',
      'transformative (преобразующий)',
    ],
  },
]

// ════════════════════════════════════════════════════════════════════════════
// 4. VOCABULARY SETS (8 topics, 15 words each = 120 words)
// ════════════════════════════════════════════════════════════════════════════

export const IELTS_VOCAB_SETS: IeltsVocabSet[] = [
  // ── Environment ────────────────────────────────────────────────────────
  {
    id: 'vocab-environment',
    topic: 'Environment',
    words: [
      { word: 'carbon footprint', definition: 'The total amount of greenhouse gases produced directly and indirectly by a person or organisation (углеродный след)', example: 'We can reduce our carbon footprint by using public transport instead of driving.', partOfSpeech: 'noun', synonyms: ['carbon emissions', 'greenhouse gas output'] },
      { word: 'biodiversity', definition: 'The variety of plant and animal species in an environment (биоразнообразие)', example: 'The destruction of rainforests threatens global biodiversity.', partOfSpeech: 'noun', synonyms: ['biological diversity', 'ecological variety'] },
      { word: 'deforestation', definition: 'The large-scale clearing of forests (вырубка лесов)', example: 'Deforestation in the Amazon has accelerated in recent years.', partOfSpeech: 'noun', synonyms: ['forest clearance', 'tree felling'] },
      { word: 'sustainability', definition: 'The ability to maintain ecological balance without depleting resources (устойчивость)', example: 'Companies are increasingly focusing on sustainability in their supply chains.', partOfSpeech: 'noun', synonyms: ['sustainable development', 'ecological balance'] },
      { word: 'renewable energy', definition: 'Energy from sources that are naturally replenished, such as wind or solar (возобновляемая энергия)', example: 'Investment in renewable energy has doubled over the past decade.', partOfSpeech: 'noun', synonyms: ['clean energy', 'green energy'] },
      { word: 'ecosystem', definition: 'A community of living organisms interacting with their environment (экосистема)', example: 'Coral reefs are among the most diverse ecosystems on the planet.', partOfSpeech: 'noun', synonyms: ['habitat', 'biome'] },
      { word: 'emissions', definition: 'Gases or pollutants released into the atmosphere (выбросы)', example: 'The government has pledged to cut carbon emissions by 50% by 2030.', partOfSpeech: 'noun', synonyms: ['pollution output', 'discharge'] },
      { word: 'conservation', definition: 'The protection of the natural environment and wildlife (охрана природы)', example: 'Conservation efforts have helped increase the tiger population.', partOfSpeech: 'noun', synonyms: ['preservation', 'protection'] },
      { word: 'climate change', definition: 'Long-term shifts in global temperatures and weather patterns (изменение климата)', example: 'Climate change poses a serious threat to food security worldwide.', partOfSpeech: 'noun', synonyms: ['global warming', 'climate crisis'] },
      { word: 'greenhouse effect', definition: 'The trapping of heat in the atmosphere by certain gases (парниковый эффект)', example: 'The greenhouse effect is essential for life on Earth, but human activity has intensified it dangerously.', partOfSpeech: 'noun', synonyms: ['atmospheric warming', 'heat trapping'] },
      { word: 'endangered species', definition: 'Animals or plants at risk of extinction (вымирающие виды)', example: 'The snow leopard is an endangered species found in Central Asia.', partOfSpeech: 'noun', synonyms: ['threatened species', 'at-risk wildlife'] },
      { word: 'pollution', definition: 'The introduction of harmful substances into the environment (загрязнение)', example: 'Water pollution from factories is a major concern in developing countries.', partOfSpeech: 'noun', synonyms: ['contamination', 'environmental degradation'] },
      { word: 'drought', definition: 'A prolonged period of abnormally low rainfall (засуха)', example: 'The drought lasted three years and devastated local agriculture.', partOfSpeech: 'noun', synonyms: ['dry spell', 'water shortage'] },
      { word: 'fossil fuels', definition: 'Energy sources formed from ancient organic matter, e.g., coal, oil, gas (ископаемое топливо)', example: 'Burning fossil fuels is the primary cause of rising CO2 levels.', partOfSpeech: 'noun', synonyms: ['non-renewable energy', 'hydrocarbons'] },
      { word: 'ecological footprint', definition: 'The impact of human activity on the environment measured by resource use (экологический след)', example: 'Wealthy nations tend to have a much larger ecological footprint.', partOfSpeech: 'noun', synonyms: ['environmental impact', 'resource consumption'] },
    ],
  },

  // ── Technology ─────────────────────────────────────────────────────────
  {
    id: 'vocab-technology',
    topic: 'Technology',
    words: [
      { word: 'artificial intelligence', definition: 'Computer systems that can perform tasks requiring human-like intelligence (искусственный интеллект)', example: 'Artificial intelligence is being used to diagnose diseases more accurately.', partOfSpeech: 'noun', synonyms: ['AI', 'machine intelligence'] },
      { word: 'automation', definition: 'The use of technology to perform tasks with minimal human intervention (автоматизация)', example: 'Automation in manufacturing has increased productivity but reduced jobs.', partOfSpeech: 'noun', synonyms: ['mechanisation', 'computerisation'] },
      { word: 'cybersecurity', definition: 'The practice of protecting computer systems from digital attacks (кибербезопасность)', example: 'Companies are investing heavily in cybersecurity to prevent data breaches.', partOfSpeech: 'noun', synonyms: ['information security', 'digital protection'] },
      { word: 'innovation', definition: 'The introduction of new ideas, methods, or products (инновация)', example: 'Technological innovation drives economic growth in modern economies.', partOfSpeech: 'noun', synonyms: ['invention', 'advancement'] },
      { word: 'digital literacy', definition: 'The ability to effectively use digital technology and the internet (цифровая грамотность)', example: 'Schools must prioritise digital literacy to prepare students for the modern workforce.', partOfSpeech: 'noun', synonyms: ['tech skills', 'computer literacy'] },
      { word: 'algorithm', definition: 'A set of rules followed by a computer to solve a problem (алгоритм)', example: 'Social media algorithms determine what content users see in their feeds.', partOfSpeech: 'noun', synonyms: ['computational procedure', 'formula'] },
      { word: 'obsolete', definition: 'No longer in use or out of date (устаревший)', example: 'Many technologies become obsolete within just a few years.', partOfSpeech: 'adjective', synonyms: ['outdated', 'antiquated'] },
      { word: 'data privacy', definition: 'The right of individuals to control their personal information (конфиденциальность данных)', example: 'New legislation aims to strengthen data privacy for online users.', partOfSpeech: 'noun', synonyms: ['information privacy', 'personal data protection'] },
      { word: 'biotechnology', definition: 'The use of biological systems to develop products and technologies (биотехнология)', example: 'Biotechnology has led to breakthroughs in vaccine development.', partOfSpeech: 'noun', synonyms: ['biotech', 'biological engineering'] },
      { word: 'virtual reality', definition: 'A computer-generated simulation of a three-dimensional environment (виртуальная реальность)', example: 'Virtual reality is increasingly being used for medical training simulations.', partOfSpeech: 'noun', synonyms: ['VR', 'immersive technology'] },
      { word: 'broadband', definition: 'High-speed internet connection (широкополосный интернет)', example: 'Rural communities often lack access to reliable broadband.', partOfSpeech: 'noun', synonyms: ['high-speed internet', 'fast connection'] },
      { word: 'surveillance', definition: 'Close monitoring, especially by authorities using technology (наблюдение / слежка)', example: 'The increase in surveillance cameras has raised privacy concerns.', partOfSpeech: 'noun', synonyms: ['monitoring', 'observation'] },
      { word: 'cloud computing', definition: 'The delivery of computing services over the internet (облачные вычисления)', example: 'Cloud computing allows businesses to store data without physical servers.', partOfSpeech: 'noun', synonyms: ['remote computing', 'internet-based computing'] },
      { word: 'digital divide', definition: 'The gap between those with and without access to digital technology (цифровое неравенство)', example: 'The digital divide is especially pronounced between urban and rural areas.', partOfSpeech: 'noun', synonyms: ['technology gap', 'access inequality'] },
      { word: 'disruptive technology', definition: 'An innovation that significantly alters how an industry or market operates (прорывная технология)', example: 'Smartphones were a disruptive technology that transformed communication.', partOfSpeech: 'noun', synonyms: ['game-changing innovation', 'breakthrough technology'] },
    ],
  },

  // ── Education ──────────────────────────────────────────────────────────
  {
    id: 'vocab-education',
    topic: 'Education',
    words: [
      { word: 'curriculum', definition: 'The subjects and content taught in a school or programme (учебная программа)', example: 'The national curriculum should be updated to reflect modern needs.', partOfSpeech: 'noun', synonyms: ['syllabus', 'programme of study'] },
      { word: 'pedagogy', definition: 'The method and practice of teaching (педагогика)', example: 'Modern pedagogy emphasises student-centred learning rather than lectures.', partOfSpeech: 'noun', synonyms: ['teaching methodology', 'educational approach'] },
      { word: 'critical thinking', definition: 'The objective analysis and evaluation of information to form a judgement (критическое мышление)', example: 'Employers increasingly value candidates with strong critical thinking skills.', partOfSpeech: 'noun', synonyms: ['analytical thinking', 'logical reasoning'] },
      { word: 'academic integrity', definition: 'Adherence to ethical standards in scholarly work (академическая честность)', example: 'Plagiarism is a serious violation of academic integrity.', partOfSpeech: 'noun', synonyms: ['scholarly ethics', 'intellectual honesty'] },
      { word: 'lifelong learning', definition: 'The ongoing, voluntary pursuit of knowledge throughout life (обучение на протяжении всей жизни)', example: 'In a rapidly changing economy, lifelong learning is essential.', partOfSpeech: 'noun', synonyms: ['continuous education', 'ongoing learning'] },
      { word: 'vocational training', definition: 'Education that prepares people for a specific trade or craft (профессиональное обучение)', example: 'Vocational training in plumbing and electrical work is in high demand.', partOfSpeech: 'noun', synonyms: ['technical education', 'skills training'] },
      { word: 'literacy rate', definition: 'The percentage of the population able to read and write (уровень грамотности)', example: 'The literacy rate in Kazakhstan exceeds 99 percent.', partOfSpeech: 'noun', synonyms: ['reading ability rate', 'educational attainment'] },
      { word: 'rote learning', definition: 'Memorisation through repetition without understanding (зубрёжка)', example: 'Many educators argue that rote learning is less effective than understanding concepts.', partOfSpeech: 'noun', synonyms: ['memorisation', 'learning by heart'] },
      { word: 'scholarship', definition: 'A grant of money awarded to a student for educational purposes (стипендия / грант)', example: 'She received a full scholarship to study at Oxford University.', partOfSpeech: 'noun', synonyms: ['bursary', 'grant'] },
      { word: 'tuition fees', definition: 'The cost of instruction at a school or university (плата за обучение)', example: 'Rising tuition fees are making higher education inaccessible for many.', partOfSpeech: 'noun', synonyms: ['college fees', 'educational costs'] },
      { word: 'dropout rate', definition: 'The percentage of students who leave before completing a course (процент отсева)', example: 'High dropout rates in secondary schools are a major concern.', partOfSpeech: 'noun', synonyms: ['attrition rate', 'non-completion rate'] },
      { word: 'distance learning', definition: 'Education conducted remotely, typically via the internet (дистанционное обучение)', example: 'The pandemic accelerated the adoption of distance learning worldwide.', partOfSpeech: 'noun', synonyms: ['online education', 'remote learning'] },
      { word: 'inclusive education', definition: 'An approach ensuring all students, regardless of ability, learn together (инклюзивное образование)', example: 'Inclusive education benefits both disabled and non-disabled students.', partOfSpeech: 'noun', synonyms: ['integrated education', 'accessible learning'] },
      { word: 'standardised testing', definition: 'Exams administered in a consistent manner to all students (стандартизированное тестирование)', example: 'Critics argue that standardised testing does not measure true ability.', partOfSpeech: 'noun', synonyms: ['uniform testing', 'national exams'] },
      { word: 'extracurricular', definition: 'Activities pursued outside the normal curriculum (внеклассный)', example: 'Extracurricular activities such as debate club develop soft skills.', partOfSpeech: 'adjective', synonyms: ['after-school', 'non-academic'] },
    ],
  },

  // ── Health ─────────────────────────────────────────────────────────────
  {
    id: 'vocab-health',
    topic: 'Health',
    words: [
      { word: 'sedentary lifestyle', definition: 'A way of living involving little physical activity (сидячий образ жизни)', example: 'A sedentary lifestyle increases the risk of obesity and heart disease.', partOfSpeech: 'noun', synonyms: ['inactive lifestyle', 'physically passive life'] },
      { word: 'mental health', definition: 'A person\'s psychological and emotional well-being (психическое здоровье)', example: 'Awareness of mental health issues has increased significantly in recent years.', partOfSpeech: 'noun', synonyms: ['psychological well-being', 'emotional health'] },
      { word: 'epidemic', definition: 'A widespread occurrence of a disease in a community (эпидемия)', example: 'Obesity has been described as an epidemic in many developed countries.', partOfSpeech: 'noun', synonyms: ['outbreak', 'widespread disease'] },
      { word: 'life expectancy', definition: 'The average number of years a person is expected to live (ожидаемая продолжительность жизни)', example: 'Life expectancy in Japan is among the highest in the world.', partOfSpeech: 'noun', synonyms: ['lifespan', 'longevity'] },
      { word: 'preventive medicine', definition: 'Healthcare focused on preventing disease rather than treating it (профилактическая медицина)', example: 'Investment in preventive medicine reduces long-term healthcare costs.', partOfSpeech: 'noun', synonyms: ['preventative care', 'prophylactic healthcare'] },
      { word: 'chronic disease', definition: 'A long-lasting condition that usually cannot be fully cured (хроническое заболевание)', example: 'Diabetes and hypertension are among the most common chronic diseases.', partOfSpeech: 'noun', synonyms: ['long-term illness', 'persistent condition'] },
      { word: 'malnutrition', definition: 'A condition resulting from inadequate or unbalanced diet (недоедание / неправильное питание)', example: 'Malnutrition remains a leading cause of child mortality in developing countries.', partOfSpeech: 'noun', synonyms: ['undernutrition', 'dietary deficiency'] },
      { word: 'vaccination', definition: 'The administration of a vaccine to protect against disease (вакцинация)', example: 'Vaccination programmes have eradicated smallpox worldwide.', partOfSpeech: 'noun', synonyms: ['immunisation', 'inoculation'] },
      { word: 'well-being', definition: 'The state of being comfortable, healthy, and happy (благополучие)', example: 'Employers are increasingly investing in the well-being of their workers.', partOfSpeech: 'noun', synonyms: ['welfare', 'quality of life'] },
      { word: 'obesity', definition: 'The condition of being very overweight with excess body fat (ожирение)', example: 'Childhood obesity has tripled in many countries over the past three decades.', partOfSpeech: 'noun', synonyms: ['excessive weight', 'corpulence'] },
      { word: 'substance abuse', definition: 'The harmful use of drugs or alcohol (злоупотребление психоактивными веществами)', example: 'Substance abuse is a major public health concern that affects all age groups.', partOfSpeech: 'noun', synonyms: ['drug abuse', 'addiction'] },
      { word: 'healthcare system', definition: 'The organised provision of medical care in a country (система здравоохранения)', example: 'Many countries are struggling to fund their healthcare systems adequately.', partOfSpeech: 'noun', synonyms: ['medical system', 'health service'] },
      { word: 'burnout', definition: 'Physical and emotional exhaustion caused by prolonged stress (выгорание)', example: 'Burnout among healthcare workers increased dramatically during the pandemic.', partOfSpeech: 'noun', synonyms: ['exhaustion', 'fatigue'] },
      { word: 'diagnosis', definition: 'The identification of an illness or condition (диагноз)', example: 'Early diagnosis of cancer significantly improves survival rates.', partOfSpeech: 'noun', synonyms: ['medical assessment', 'identification'] },
      { word: 'public health', definition: 'The science of protecting and improving the health of communities (общественное здоровье)', example: 'Clean water access is a fundamental public health issue.', partOfSpeech: 'noun', synonyms: ['community health', 'population health'] },
    ],
  },

  // ── Urbanization ───────────────────────────────────────────────────────
  {
    id: 'vocab-urbanization',
    topic: 'Urbanization',
    words: [
      { word: 'urbanization', definition: 'The process of making an area more urban; population shift to cities (урбанизация)', example: 'Rapid urbanization in developing countries has created enormous challenges.', partOfSpeech: 'noun', synonyms: ['urban growth', 'city expansion'] },
      { word: 'infrastructure', definition: 'The basic physical systems of a society — roads, bridges, water supply (инфраструктура)', example: 'The city needs to invest heavily in infrastructure to support its growing population.', partOfSpeech: 'noun', synonyms: ['public works', 'foundational systems'] },
      { word: 'congestion', definition: 'Overcrowding, especially of traffic on roads (заторы / пробки)', example: 'Traffic congestion in the capital costs billions in lost productivity each year.', partOfSpeech: 'noun', synonyms: ['gridlock', 'overcrowding'] },
      { word: 'urban sprawl', definition: 'The uncontrolled expansion of urban areas into surrounding countryside (неконтролируемое расширение городов)', example: 'Urban sprawl has destroyed farmland and natural habitats.', partOfSpeech: 'noun', synonyms: ['suburban spread', 'city expansion'] },
      { word: 'gentrification', definition: 'The renovation of deteriorating areas by wealthier residents, often displacing poorer ones (джентрификация)', example: 'Gentrification has improved some neighbourhoods but displaced long-term residents.', partOfSpeech: 'noun', synonyms: ['neighbourhood transformation', 'urban renewal'] },
      { word: 'slum', definition: 'A densely populated area with substandard housing and poor living conditions (трущобы)', example: 'Over a billion people worldwide live in slums without access to clean water.', partOfSpeech: 'noun', synonyms: ['shanty town', 'informal settlement'] },
      { word: 'commute', definition: 'The journey between one\'s home and workplace (поездка на работу)', example: 'Her daily commute takes nearly two hours each way.', partOfSpeech: 'noun/verb', synonyms: ['daily journey', 'travel to work'] },
      { word: 'public transit', definition: 'Shared transportation services available to the general public (общественный транспорт)', example: 'Efficient public transit systems reduce traffic congestion and pollution.', partOfSpeech: 'noun', synonyms: ['public transport', 'mass transit'] },
      { word: 'housing shortage', definition: 'An insufficient supply of homes relative to demand (нехватка жилья)', example: 'The housing shortage has driven property prices to record levels.', partOfSpeech: 'noun', synonyms: ['housing crisis', 'accommodation deficit'] },
      { word: 'megacity', definition: 'A city with a population exceeding ten million (мегаполис)', example: 'The number of megacities is projected to reach forty-three by 2030.', partOfSpeech: 'noun', synonyms: ['major metropolis', 'large urban centre'] },
      { word: 'zoning', definition: 'The division of land into areas designated for specific uses (зонирование)', example: 'Strict zoning regulations separate residential areas from industrial zones.', partOfSpeech: 'noun', synonyms: ['land-use planning', 'district designation'] },
      { word: 'urban decay', definition: 'The deterioration of a previously functional urban area (упадок городской среды)', example: 'Urban decay in former industrial cities has led to population decline.', partOfSpeech: 'noun', synonyms: ['urban blight', 'city deterioration'] },
      { word: 'density', definition: 'The degree of compactness of a substance or population (плотность)', example: 'High population density in cities requires efficient waste management systems.', partOfSpeech: 'noun', synonyms: ['concentration', 'compactness'] },
      { word: 'sustainability', definition: 'Development that meets present needs without compromising future generations (устойчивое развитие)', example: 'Urban sustainability requires balancing economic growth with environmental protection.', partOfSpeech: 'noun', synonyms: ['sustainable development', 'long-term viability'] },
      { word: 'rural-urban migration', definition: 'The movement of people from the countryside to cities (сельско-городская миграция)', example: 'Rural-urban migration is the primary driver of urbanization in Africa.', partOfSpeech: 'noun', synonyms: ['countryside-to-city migration', 'urban influx'] },
    ],
  },

  // ── Crime & Justice ────────────────────────────────────────────────────
  {
    id: 'vocab-crime',
    topic: 'Crime & Justice',
    words: [
      { word: 'deterrent', definition: 'Something that discourages an action, especially a punishment that discourages crime (сдерживающий фактор)', example: 'Supporters argue that the death penalty serves as a deterrent to serious crime.', partOfSpeech: 'noun', synonyms: ['disincentive', 'preventive measure'] },
      { word: 'rehabilitation', definition: 'The process of reintegrating offenders into society (реабилитация)', example: 'Rehabilitation programmes in prisons can significantly reduce reoffending rates.', partOfSpeech: 'noun', synonyms: ['reform', 'reintegration'] },
      { word: 'recidivism', definition: 'The tendency of a convicted criminal to reoffend (рецидивизм)', example: 'High recidivism rates suggest that imprisonment alone does not prevent future crime.', partOfSpeech: 'noun', synonyms: ['reoffending', 'repeat offending'] },
      { word: 'incarceration', definition: 'The act of imprisoning someone (заключение под стражу)', example: 'Mass incarceration has become a controversial issue in many countries.', partOfSpeech: 'noun', synonyms: ['imprisonment', 'detention'] },
      { word: 'juvenile crime', definition: 'Crime committed by young people under the age of legal adulthood (преступность несовершеннолетних)', example: 'Juvenile crime rates have fallen in many developed countries over the past decade.', partOfSpeech: 'noun', synonyms: ['youth crime', 'underage offending'] },
      { word: 'law enforcement', definition: 'The activity of ensuring compliance with the law (правоприменение)', example: 'Effective law enforcement requires both well-trained officers and community trust.', partOfSpeech: 'noun', synonyms: ['policing', 'crime prevention'] },
      { word: 'white-collar crime', definition: 'Non-violent crimes committed by business or government professionals (беловоротничковая преступность)', example: 'White-collar crime, such as fraud and embezzlement, often goes unpunished.', partOfSpeech: 'noun', synonyms: ['corporate crime', 'financial crime'] },
      { word: 'capital punishment', definition: 'The legally authorised execution of someone as punishment for a crime (смертная казнь)', example: 'The debate over capital punishment continues in many countries.', partOfSpeech: 'noun', synonyms: ['death penalty', 'execution'] },
      { word: 'community service', definition: 'Unpaid work for the benefit of the community as a criminal punishment (общественные работы)', example: 'Community service is often used as an alternative to imprisonment for minor offences.', partOfSpeech: 'noun', synonyms: ['public service', 'unpaid work sentence'] },
      { word: 'prosecution', definition: 'The institution and conducting of legal proceedings against someone (судебное преследование)', example: 'The prosecution presented strong evidence linking the defendant to the crime.', partOfSpeech: 'noun', synonyms: ['legal action', 'criminal proceedings'] },
      { word: 'cybercrime', definition: 'Criminal activities carried out using computers or the internet (киберпреступность)', example: 'Cybercrime costs the global economy hundreds of billions of dollars annually.', partOfSpeech: 'noun', synonyms: ['online crime', 'digital crime'] },
      { word: 'corruption', definition: 'Dishonest or fraudulent conduct by those in power (коррупция)', example: 'Corruption undermines public trust in government institutions.', partOfSpeech: 'noun', synonyms: ['bribery', 'dishonesty'] },
      { word: 'crime rate', definition: 'The number of crimes per unit of population in a given area (уровень преступности)', example: 'The crime rate has decreased significantly since the new policing strategy was introduced.', partOfSpeech: 'noun', synonyms: ['criminal activity level', 'offence rate'] },
      { word: 'restorative justice', definition: 'A system focused on rehabilitating offenders through reconciliation with victims (восстановительное правосудие)', example: 'Restorative justice programmes bring offenders face-to-face with their victims.', partOfSpeech: 'noun', synonyms: ['rehabilitative justice', 'reconciliation-based justice'] },
      { word: 'surveillance', definition: 'Close monitoring of a person or area, especially by police or security services (наблюдение / слежка)', example: 'Increased surveillance in public spaces has raised civil liberties concerns.', partOfSpeech: 'noun', synonyms: ['monitoring', 'observation'] },
    ],
  },

  // ── Media ──────────────────────────────────────────────────────────────
  {
    id: 'vocab-media',
    topic: 'Media',
    words: [
      { word: 'misinformation', definition: 'False or inaccurate information, regardless of intent (дезинформация)', example: 'Misinformation about health spread rapidly on social media during the pandemic.', partOfSpeech: 'noun', synonyms: ['false information', 'inaccurate reports'] },
      { word: 'censorship', definition: 'The suppression of speech or information deemed objectionable (цензура)', example: 'Internet censorship prevents citizens from accessing certain websites in some countries.', partOfSpeech: 'noun', synonyms: ['suppression', 'restriction of information'] },
      { word: 'media literacy', definition: 'The ability to critically analyse and evaluate media messages (медиаграмотность)', example: 'Teaching media literacy in schools helps students identify fake news.', partOfSpeech: 'noun', synonyms: ['information literacy', 'critical media consumption'] },
      { word: 'bias', definition: 'Unfair prejudice in favour of or against something (предвзятость)', example: 'Political bias in news reporting can mislead the public.', partOfSpeech: 'noun', synonyms: ['prejudice', 'partiality'] },
      { word: 'freedom of the press', definition: 'The right to publish news without government control (свобода прессы)', example: 'Freedom of the press is considered essential in a democratic society.', partOfSpeech: 'noun', synonyms: ['media freedom', 'press liberty'] },
      { word: 'viral content', definition: 'Material that spreads rapidly across the internet (вирусный контент)', example: 'The video went viral, receiving over ten million views in a single day.', partOfSpeech: 'noun', synonyms: ['trending content', 'widely shared material'] },
      { word: 'tabloid', definition: 'A newspaper focused on sensational stories rather than serious news (таблоид)', example: 'Tabloids often prioritise celebrity gossip over substantive journalism.', partOfSpeech: 'noun', synonyms: ['sensationalist newspaper', 'popular press'] },
      { word: 'broadcast', definition: 'To transmit a programme on television or radio (транслировать / трансляция)', example: 'The speech was broadcast live to millions of viewers worldwide.', partOfSpeech: 'verb/noun', synonyms: ['transmit', 'air'] },
      { word: 'propaganda', definition: 'Information used to promote a particular political cause, often misleading (пропаганда)', example: 'Governments have historically used propaganda to shape public opinion during wartime.', partOfSpeech: 'noun', synonyms: ['political messaging', 'indoctrination'] },
      { word: 'citizen journalism', definition: 'News gathering and reporting by ordinary people, typically via the internet (гражданская журналистика)', example: 'Citizen journalism has given a voice to communities underrepresented in mainstream media.', partOfSpeech: 'noun', synonyms: ['amateur reporting', 'grassroots journalism'] },
      { word: 'echo chamber', definition: 'An environment where a person encounters only beliefs similar to their own (информационный пузырь)', example: 'Social media algorithms can create echo chambers that reinforce existing beliefs.', partOfSpeech: 'noun', synonyms: ['filter bubble', 'closed information loop'] },
      { word: 'headline', definition: 'The title of a news article, designed to attract attention (заголовок)', example: 'Misleading headlines can give readers a distorted view of the story.', partOfSpeech: 'noun', synonyms: ['title', 'banner'] },
      { word: 'objectivity', definition: 'Reporting without bias or personal opinion (объективность)', example: 'Objectivity is a core principle of ethical journalism.', partOfSpeech: 'noun', synonyms: ['impartiality', 'neutrality'] },
      { word: 'investigative journalism', definition: 'In-depth reporting that uncovers hidden information of public interest (журналистское расследование)', example: 'Investigative journalism exposed the corruption scandal.', partOfSpeech: 'noun', synonyms: ['in-depth reporting', 'exposé journalism'] },
      { word: 'clickbait', definition: 'Online content designed to attract clicks with sensational headlines (кликбейт)', example: 'Many websites use clickbait to generate advertising revenue.', partOfSpeech: 'noun', synonyms: ['sensationalist links', 'attention-grabbing content'] },
    ],
  },

  // ── Work & Career ──────────────────────────────────────────────────────
  {
    id: 'vocab-work',
    topic: 'Work & Career',
    words: [
      { word: 'unemployment', definition: 'The state of being without paid work while available and seeking it (безработица)', example: 'Youth unemployment in some countries exceeds 30 percent.', partOfSpeech: 'noun', synonyms: ['joblessness', 'worklessness'] },
      { word: 'remote work', definition: 'Working from a location other than a central office (удалённая работа)', example: 'The pandemic normalised remote work for millions of employees.', partOfSpeech: 'noun', synonyms: ['telecommuting', 'working from home'] },
      { word: 'work-life balance', definition: 'The equilibrium between professional demands and personal life (баланс между работой и личной жизнью)', example: 'Companies that promote work-life balance tend to have lower staff turnover.', partOfSpeech: 'noun', synonyms: ['life balance', 'professional-personal equilibrium'] },
      { word: 'entrepreneurship', definition: 'The activity of setting up and running a business (предпринимательство)', example: 'Entrepreneurship is seen as a key driver of innovation and economic growth.', partOfSpeech: 'noun', synonyms: ['business ownership', 'enterprise'] },
      { word: 'freelancer', definition: 'A self-employed person who offers services to different clients (фрилансер)', example: 'The number of freelancers in the creative industries has grown enormously.', partOfSpeech: 'noun', synonyms: ['independent contractor', 'self-employed worker'] },
      { word: 'job satisfaction', definition: 'The level of contentment a person feels about their work (удовлетворённость работой)', example: 'Research shows that job satisfaction depends more on autonomy than salary.', partOfSpeech: 'noun', synonyms: ['work satisfaction', 'professional fulfillment'] },
      { word: 'minimum wage', definition: 'The lowest legal hourly pay an employer can offer (минимальная заработная плата)', example: 'The government raised the minimum wage to keep pace with inflation.', partOfSpeech: 'noun', synonyms: ['living wage', 'base pay'] },
      { word: 'career ladder', definition: 'The series of positions through which a person can progress in their career (карьерная лестница)', example: 'Climbing the career ladder often requires both skill and strategic networking.', partOfSpeech: 'noun', synonyms: ['career path', 'professional progression'] },
      { word: 'outsourcing', definition: 'Contracting work to an external organisation rather than doing it internally (аутсорсинг)', example: 'Many tech companies outsource customer support to other countries.', partOfSpeech: 'noun', synonyms: ['subcontracting', 'external sourcing'] },
      { word: 'glass ceiling', definition: 'An invisible barrier preventing women or minorities from reaching senior positions (стеклянный потолок)', example: 'Despite progress, the glass ceiling remains a reality for many women in corporate settings.', partOfSpeech: 'noun', synonyms: ['invisible barrier', 'career ceiling'] },
      { word: 'internship', definition: 'A period of work experience offered by an organisation, often unpaid (стажировка)', example: 'An internship can provide valuable experience but should not replace paid employment.', partOfSpeech: 'noun', synonyms: ['work placement', 'traineeship'] },
      { word: 'gig economy', definition: 'A labour market characterised by short-term, freelance work rather than permanent jobs (гиг-экономика)', example: 'The gig economy offers flexibility but often lacks benefits like healthcare.', partOfSpeech: 'noun', synonyms: ['freelance economy', 'on-demand work'] },
      { word: 'productivity', definition: 'The efficiency with which goods or services are produced (производительность)', example: 'Remote work has been shown to increase productivity in many sectors.', partOfSpeech: 'noun', synonyms: ['efficiency', 'output'] },
      { word: 'redundancy', definition: 'The dismissal of workers because their jobs are no longer needed (сокращение)', example: 'Automation has led to redundancies in the manufacturing sector.', partOfSpeech: 'noun', synonyms: ['layoff', 'job loss'] },
      { word: 'networking', definition: 'Building professional relationships for career advancement (нетворкинг)', example: 'Effective networking is often as important as qualifications in finding employment.', partOfSpeech: 'noun', synonyms: ['professional connections', 'relationship building'] },
    ],
  },
]

// ════════════════════════════════════════════════════════════════════════════
// 5. LISTENING SECTIONS (4 sections, 10 questions each = 40 questions)
// ════════════════════════════════════════════════════════════════════════════

export const IELTS_LISTENING_SECTIONS: IeltsListeningSection[] = [
  // ── Section 1: Social / Everyday (booking enquiry) ─────────────────────
  {
    id: 'listening-1-booking',
    section: 1,
    context: 'A phone conversation between a student and a receptionist at a language school. The student is enquiring about an intensive English course and making a booking.',
    transcript: `Receptionist: Good morning, Westbridge Language Academy. How can I help you?

Student: Hello, I'm calling to enquire about your intensive English courses. I'd like to start as soon as possible.

Receptionist: Of course. Can I take your name first?

Student: Yes, it's Alikhan Serikov. That's A-L-I-K-H-A-N, and the surname is S-E-R-I-K-O-V.

Receptionist: Thank you, Alikhan. And where are you calling from?

Student: I'm currently in Kazakhstan, but I'll be arriving in London on March the fifteenth.

Receptionist: Right. Well, our next intensive course starts on March the eighteenth. It runs for six weeks, Monday to Friday.

Student: That sounds perfect. What are the class hours?

Receptionist: Classes run from nine in the morning until three thirty in the afternoon, with a forty-five-minute lunch break at twelve fifteen.

Student: And how many students are in each class?

Receptionist: We keep the groups small — a maximum of twelve students per class. Our current intensive group has eight students.

Student: Great. What's the total fee for the six-week course?

Receptionist: The course fee is two thousand four hundred pounds. That includes all materials and a placement test. However, it does not include accommodation.

Student: Do you offer accommodation?

Receptionist: We do. We have two options: a shared apartment near the school for four hundred and fifty pounds per month, or a homestay with a local family for five hundred and twenty pounds per month. The homestay includes breakfast and dinner.

Student: I think I'd prefer the homestay. It would be good practice to speak English outside class too.

Receptionist: Absolutely, that's what most of our international students choose. Now, I'll need a deposit to secure your place. It's three hundred pounds, payable by bank transfer.

Student: That's fine. Can you give me the bank details?

Receptionist: I'll email those to you. What's your email address?

Student: It's alikhan.serikov@gmail.com.

Receptionist: Perfect. Once we receive your deposit, I'll send you a confirmation letter and a pre-course information pack. You'll also need to bring your passport and a recent photograph on the first day for your student ID card.

Student: Thank you very much. One more question — is there a test on the first day?

Receptionist: Yes, there's a placement test on Monday morning at eight thirty to determine your level. It's a written test and a short interview, and it takes about an hour altogether.

Student: Wonderful. Thank you for all the information.

Receptionist: You're welcome. We look forward to seeing you on March the eighteenth. Goodbye!

Student: Goodbye!`,
    questions: [
      { id: 'l1-q1', type: 'completion', text: 'The student\'s surname is _______.', correctAnswer: 'Serikov', explanation: 'The student spells out his surname: S-E-R-I-K-O-V.' },
      { id: 'l1-q2', type: 'completion', text: 'The student will arrive in London on March the _______.', correctAnswer: '15th', explanation: 'The student says "I\'ll be arriving in London on March the fifteenth."' },
      { id: 'l1-q3', type: 'completion', text: 'The intensive course starts on March the _______.', correctAnswer: '18th', explanation: 'The receptionist says "our next intensive course starts on March the eighteenth."' },
      { id: 'l1-q4', type: 'completion', text: 'Classes finish at _______ in the afternoon.', correctAnswer: '3:30 / three thirty', explanation: 'The receptionist says classes run "until three thirty in the afternoon."' },
      { id: 'l1-q5', type: 'completion', text: 'The maximum number of students per class is _______.', correctAnswer: '12 / twelve', explanation: 'The receptionist says "a maximum of twelve students per class."' },
      { id: 'l1-q6', type: 'completion', text: 'The total course fee is £_______.', correctAnswer: '2,400 / 2400', explanation: 'The receptionist says "the course fee is two thousand four hundred pounds."' },
      { id: 'l1-q7', type: 'completion', text: 'The homestay option costs £_______ per month.', correctAnswer: '520', explanation: 'The receptionist says "a homestay with a local family for five hundred and twenty pounds per month."' },
      { id: 'l1-q8', type: 'completion', text: 'The deposit is _______ pounds.', correctAnswer: '300 / three hundred', explanation: 'The receptionist says "it\'s three hundred pounds, payable by bank transfer."' },
      { id: 'l1-q9', type: 'completion', text: 'On the first day, students need to bring a passport and a recent _______.', correctAnswer: 'photograph', explanation: 'The receptionist says "bring your passport and a recent photograph."' },
      { id: 'l1-q10', type: 'completion', text: 'The placement test starts at _______ on Monday morning.', correctAnswer: '8:30 / eight thirty', explanation: 'The receptionist says "a placement test on Monday morning at eight thirty."' },
    ],
  },

  // ── Section 2: Social Monologue (orientation / tour guide) ─────────────
  {
    id: 'listening-2-orientation',
    section: 2,
    context: 'A university orientation talk by a student advisor, welcoming new international students and explaining campus facilities and services.',
    transcript: `Good morning, everyone, and welcome to Greenfield University! My name is Sarah Collins, and I'm the International Student Advisor. I'm here to give you an overview of the services and facilities available to you during your time here.

First of all, let me tell you about the library. Our main library, the Henderson Library, is open seven days a week. During term time, it opens at eight in the morning and closes at eleven PM on weekdays. At weekends, the hours are reduced — it opens at ten and closes at eight. The library has over two hundred computer workstations, and you can borrow up to fifteen books at a time.

Now, let's talk about health services. We have a medical centre on campus, located in the Thornton Building — that's building number seven on your campus map. It's open Monday to Friday from nine to five, and you don't need an appointment for urgent matters. However, for routine appointments, you should book at least two days in advance through the student portal.

Next, I want to mention our language support service, which I think many of you will find particularly useful. We offer free weekly English conversation classes every Wednesday from four to five thirty. There's also an academic writing workshop on Fridays from two to four. These sessions are very popular, so I'd recommend signing up early through the student services website.

Regarding accommodation, most of you are living in university halls for your first year. If you have any problems with your room — heating, plumbing, internet connection — you should report them to the Maintenance Office. That's extension four five three two, or you can use the online form on the accommodation page.

Transport is something international students often ask about. The university runs a free shuttle bus between the campus and the city centre every twenty minutes during term time. The first bus leaves campus at seven forty-five AM and the last one departs at ten PM. You'll need your student ID card to board.

For those of you who enjoy sports, the university has an excellent athletics centre with a swimming pool, gym, tennis courts, and a running track. First-year students get a discounted annual membership of just one hundred and fifty pounds — that's a saving of seventy pounds compared to the standard rate.

Finally, I'd like to remind you about our buddy programme. Each international student is paired with a current student who can help you settle in, show you around, and answer any questions you might have. Your buddy's name and contact details will be emailed to you by the end of this week.

Are there any questions?`,
    questions: [
      { id: 'l2-q1', type: 'completion', text: 'The main library is called the _______ Library.', correctAnswer: 'Henderson', explanation: 'Sarah says "Our main library, the Henderson Library."' },
      { id: 'l2-q2', type: 'completion', text: 'On weekdays during term time, the library closes at _______ PM.', correctAnswer: '11 / eleven', explanation: 'Sarah says the library "closes at eleven PM on weekdays."' },
      { id: 'l2-q3', type: 'completion', text: 'Students can borrow up to _______ books at a time.', correctAnswer: '15 / fifteen', explanation: 'Sarah says "you can borrow up to fifteen books at a time."' },
      { id: 'l2-q4', type: 'completion', text: 'The medical centre is in the _______ Building.', correctAnswer: 'Thornton', explanation: 'Sarah says "located in the Thornton Building."' },
      { id: 'l2-q5', type: 'completion', text: 'Free English conversation classes are held every _______.', correctAnswer: 'Wednesday', explanation: 'Sarah says "free weekly English conversation classes every Wednesday."' },
      { id: 'l2-q6', type: 'completion', text: 'Maintenance issues should be reported to extension _______.', correctAnswer: '4532', explanation: 'Sarah says "That\'s extension four five three two."' },
      { id: 'l2-q7', type: 'completion', text: 'The free shuttle bus runs every _______ minutes.', correctAnswer: '20 / twenty', explanation: 'Sarah says "a free shuttle bus... every twenty minutes."' },
      { id: 'l2-q8', type: 'completion', text: 'The last shuttle bus leaves campus at _______ PM.', correctAnswer: '10 / ten', explanation: 'Sarah says "the last one departs at ten PM."' },
      { id: 'l2-q9', type: 'completion', text: 'The discounted annual gym membership for first-years costs £_______.', correctAnswer: '150', explanation: 'Sarah says "a discounted annual membership of just one hundred and fifty pounds."' },
      { id: 'l2-q10', type: 'completion', text: 'Each international student is paired with a buddy through the _______ programme.', correctAnswer: 'buddy', explanation: 'Sarah says "our buddy programme. Each international student is paired with a current student."' },
    ],
  },

  // ── Section 3: Academic Discussion (2-3 speakers) ──────────────────────
  {
    id: 'listening-3-academic',
    section: 3,
    context: 'A tutorial discussion between two students (Maria and James) and their professor (Dr. Chen) about their group research project on the effects of social media on academic performance.',
    transcript: `Dr. Chen: So, Maria, James, let's review your progress on the research project. You've been investigating the relationship between social media use and academic performance among university students. Where are you up to?

Maria: Well, Dr. Chen, we've completed the literature review and we're now in the data collection phase. We designed an online questionnaire, and so far we've received one hundred and eighty-three responses out of a target of two hundred and fifty.

James: Yes, and the response rate has been quite encouraging. We distributed the questionnaire through the university email system and also posted it on the student union social media pages.

Dr. Chen: Good. And what does the questionnaire cover?

Maria: It has four sections. The first section collects demographic information — age, gender, year of study, that sort of thing. The second section asks about their social media habits — which platforms they use, how many hours per day, and at what times.

James: The third section measures self-reported academic performance — their grade point average and how they feel about their academic progress. And the fourth section is about their awareness of the impact of social media on their studying. We included some questions about whether they feel it helps or hinders their concentration.

Dr. Chen: Interesting. Now, what methodology are you using for the analysis?

James: We're planning to use a mixed-methods approach. Quantitatively, we'll use correlation analysis to look for relationships between hours of social media use and GPA. Qualitatively, we've included three open-ended questions where students can describe their experiences in their own words.

Dr. Chen: That's sensible. Have you encountered any problems so far?

Maria: Actually, yes. One issue is that the responses are heavily skewed towards female participants — about seventy percent of respondents are female. We think this is because the questionnaire was shared mostly through education and humanities departments, which have a higher proportion of female students.

James: We're planning to address this by specifically targeting science and engineering students over the next two weeks, where the gender balance is more even.

Dr. Chen: Good thinking. And what about ethical considerations?

Maria: We received ethical approval from the Research Ethics Committee in January. All responses are anonymous, and participants are informed that they can withdraw at any time. We also added a disclaimer that the research is for academic purposes only.

Dr. Chen: Excellent. Now, what's your timeline for completing the project?

James: We aim to close the questionnaire by March the thirty-first, then spend two weeks on data analysis. The first draft of our report should be ready by April the twenty-first, which gives us about ten days to revise before the final submission deadline on May the first.

Dr. Chen: That sounds like a tight but achievable schedule. I'd suggest you also consider conducting two or three brief follow-up interviews with willing participants. That would add depth to your qualitative findings.

Maria: That's a great idea. We could select participants who gave particularly interesting responses to the open-ended questions.

Dr. Chen: Exactly. Well, it sounds like you're making excellent progress. Let's schedule another meeting in two weeks to review your preliminary findings.`,
    questions: [
      { id: 'l3-q1', type: 'completion', text: 'The students are researching the relationship between social media use and _______ among university students.', correctAnswer: 'academic performance', explanation: 'Dr. Chen says they are investigating "the relationship between social media use and academic performance."' },
      { id: 'l3-q2', type: 'completion', text: 'So far they have received _______ questionnaire responses.', correctAnswer: '183', explanation: 'Maria says "we\'ve received one hundred and eighty-three responses."' },
      { id: 'l3-q3', type: 'completion', text: 'The target number of responses is _______.', correctAnswer: '250', explanation: 'Maria says "out of a target of two hundred and fifty."' },
      { id: 'l3-q4', type: 'completion', text: 'The questionnaire has _______ sections.', correctAnswer: '4 / four', explanation: 'Maria says "It has four sections."' },
      { id: 'l3-q5', type: 'completion', text: 'For quantitative analysis, the students plan to use _______ analysis.', correctAnswer: 'correlation', explanation: 'James says "we\'ll use correlation analysis to look for relationships."' },
      { id: 'l3-q6', type: 'completion', text: 'Approximately _______ percent of respondents are female.', correctAnswer: '70 / seventy', explanation: 'Maria says "about seventy percent of respondents are female."' },
      { id: 'l3-q7', type: 'completion', text: 'To fix the gender imbalance, they plan to target students from science and _______ departments.', correctAnswer: 'engineering', explanation: 'James says "specifically targeting science and engineering students."' },
      { id: 'l3-q8', type: 'completion', text: 'Ethical approval was received from the Research Ethics Committee in _______.', correctAnswer: 'January', explanation: 'Maria says "We received ethical approval from the Research Ethics Committee in January."' },
      { id: 'l3-q9', type: 'completion', text: 'The first draft of the report should be ready by April the _______.', correctAnswer: '21st / twenty-first', explanation: 'James says "The first draft of our report should be ready by April the twenty-first."' },
      { id: 'l3-q10', type: 'completion', text: 'Dr. Chen suggests conducting follow-up _______ with willing participants.', correctAnswer: 'interviews', explanation: 'Dr. Chen says "consider conducting two or three brief follow-up interviews."' },
    ],
  },

  // ── Section 4: Academic Lecture ─────────────────────────────────────────
  {
    id: 'listening-4-lecture',
    section: 4,
    context: 'An academic lecture on the psychology of decision-making, delivered by a professor in a psychology department. The lecture covers cognitive biases and their effects on everyday choices.',
    transcript: `Today I want to talk about an area of psychology that has enormous practical relevance — the psychology of decision-making, and specifically, cognitive biases. A cognitive bias is a systematic pattern of deviation from rational judgement, and it affects everyone, regardless of intelligence or education.

Let's begin with perhaps the most well-known bias: confirmation bias. This is our tendency to search for, interpret, and remember information that confirms our pre-existing beliefs while ignoring or dismissing information that contradicts them. For example, if you believe that a particular diet is effective, you're much more likely to notice and remember articles that support that claim, and to dismiss or forget studies that contradict it. Confirmation bias is particularly dangerous in the age of social media, where algorithms show us content that matches our existing preferences, creating what researchers call "filter bubbles."

The second bias I want to discuss is the anchoring effect. This occurs when we rely too heavily on the first piece of information we encounter when making a decision. A classic example comes from real estate. Studies have shown that when people are asked to estimate the value of a house, their estimates are significantly influenced by the asking price — even when the asking price is obviously unreasonable. In one experiment conducted at the University of Arizona, participants who were given a high anchor price valued the same house at an average of two hundred and fourteen thousand dollars, while those given a low anchor valued it at just one hundred and fifty-six thousand.

Third, let's consider the availability heuristic. This is our tendency to judge the likelihood of events based on how easily examples come to mind. After a plane crash receives extensive media coverage, many people overestimate the risk of flying, even though statistically, air travel is far safer than driving. The availability heuristic explains why people often fear dramatic, rare events — such as terrorist attacks or shark attacks — more than common but less sensational risks, like heart disease or road accidents.

Now, the sunk cost fallacy is particularly relevant to everyday decision-making. This is the tendency to continue investing in something because of the time, money, or effort already spent — even when it would be rational to stop. Imagine you've bought an expensive ticket to a concert, but on the night of the event you feel unwell. Rationally, the money is spent whether you go or not — it's a sunk cost. But most people will force themselves to go, simply to "get their money's worth." Businesses make this error too: companies often continue pouring resources into failing projects because they've already invested heavily, rather than cutting their losses.

The fifth and final bias I want to cover today is the Dunning-Kruger effect, named after the psychologists David Dunning and Justin Kruger, who published their research in nineteen ninety-nine. This is the phenomenon whereby people with limited knowledge or ability in a given domain tend to overestimate their competence, while genuine experts tend to underestimate theirs. Dunning and Kruger found that participants who scored in the bottom quartile on tests of logical reasoning estimated that their performance was above the sixty-second percentile. In other words, the least competent individuals were the most confident in their abilities.

Understanding these biases doesn't make us immune to them, but awareness is the first step towards better decision-making. Strategies such as actively seeking disconfirming evidence, using data rather than intuition for important decisions, and consulting others with different perspectives can all help mitigate the effects of cognitive biases in our daily lives.`,
    questions: [
      { id: 'l4-q1', type: 'completion', text: 'A cognitive bias is a systematic pattern of deviation from _______ judgement.', correctAnswer: 'rational', explanation: 'The lecturer defines a cognitive bias as "a systematic pattern of deviation from rational judgement."' },
      { id: 'l4-q2', type: 'completion', text: 'Confirmation bias is our tendency to favour information that confirms our pre-existing _______.', correctAnswer: 'beliefs', explanation: 'The lecturer says confirmation bias is "our tendency to search for, interpret, and remember information that confirms our pre-existing beliefs."' },
      { id: 'l4-q3', type: 'completion', text: 'Social media algorithms create what researchers call "_______ bubbles."', correctAnswer: 'filter', explanation: 'The lecturer mentions "what researchers call filter bubbles."' },
      { id: 'l4-q4', type: 'completion', text: 'The anchoring effect causes people to rely too heavily on the _______ piece of information they encounter.', correctAnswer: 'first', explanation: 'The lecturer says "we rely too heavily on the first piece of information we encounter."' },
      { id: 'l4-q5', type: 'completion', text: 'In the house-pricing experiment, participants given a high anchor valued the house at an average of $_______ thousand.', correctAnswer: '214', explanation: 'The lecturer says "those given a high anchor valued the same house at an average of two hundred and fourteen thousand dollars."' },
      { id: 'l4-q6', type: 'completion', text: 'The availability heuristic causes people to judge likelihood based on how easily _______ come to mind.', correctAnswer: 'examples', explanation: 'The lecturer says this bias is "our tendency to judge the likelihood of events based on how easily examples come to mind."' },
      { id: 'l4-q7', type: 'completion', text: 'The sunk cost fallacy causes people to continue investing because of time, money, or _______ already spent.', correctAnswer: 'effort', explanation: 'The lecturer describes it as "the tendency to continue investing in something because of the time, money, or effort already spent."' },
      { id: 'l4-q8', type: 'completion', text: 'Dunning and Kruger published their research in _______.', correctAnswer: '1999', explanation: 'The lecturer says "David Dunning and Justin Kruger, who published their research in nineteen ninety-nine."' },
      { id: 'l4-q9', type: 'completion', text: 'In Dunning and Kruger\'s study, participants in the bottom quartile estimated their performance was above the _______-second percentile.', correctAnswer: 'sixty / 62nd', explanation: 'The lecturer says they "estimated that their performance was above the sixty-second percentile."' },
      { id: 'l4-q10', type: 'completion', text: 'The lecturer suggests actively seeking _______ evidence as one strategy to combat cognitive biases.', correctAnswer: 'disconfirming', explanation: 'The lecturer recommends "actively seeking disconfirming evidence" as a strategy.' },
    ],
  },

  // ── Section 5: Social / Everyday (renting a flat) ─────────────────────
  {
    id: 'listening-5-rental',
    section: 1,
    context: 'A phone conversation between a young professional and a letting agent about renting a one-bedroom flat in Manchester.',
    transcript: `Agent: Good afternoon, City Lettings. This is Tom speaking.

Caller: Hi, I'm looking for a one-bedroom flat in the Manchester area. I saw your listing online for a property on Victoria Road.

Agent: Ah yes, the Victoria Road flat. That one is still available. Can I take your name?

Caller: Sure, it's Dinara Kasenova. That's D-I-N-A-R-A, and Kasenova is K-A-S-E-N-O-V-A.

Agent: Thank you, Dinara. So, the flat on Victoria Road is a one-bedroom property on the third floor of a converted Victorian house. It has a separate kitchen, a bathroom with a shower — no bathtub, I'm afraid — and a good-sized living room.

Caller: That sounds fine. What's the monthly rent?

Agent: The rent is eight hundred and seventy-five pounds per month, which includes water rates. However, you'd need to pay for electricity and gas separately. The current tenant pays about sixty pounds a month for those, so it's quite reasonable.

Caller: And is there a deposit?

Agent: Yes, the deposit is six weeks' rent, so that comes to approximately one thousand three hundred and twelve pounds. It's held in a government-approved deposit protection scheme.

Caller: OK, that's quite a lot upfront. When would it be available?

Agent: The current tenant is moving out on April the fifth, and we'd need a couple of days for cleaning and an inventory check. So realistically, you could move in from April the eighth.

Caller: That works well for me. Is the flat furnished or unfurnished?

Agent: It's partly furnished. There's a double bed, a wardrobe, and a sofa. The kitchen comes with a fridge, a cooker, and a washing machine. But there's no dining table or desk — you'd need to provide those yourself.

Caller: That's fine. I have my own desk. What about parking?

Agent: There's no private parking, but there's a residents' permit scheme for the street. The permit costs forty-five pounds per year, and you apply through the city council website.

Caller: Great. And what's the minimum lease term?

Agent: It's a twelve-month assured shorthold tenancy. After that, it rolls over to a monthly contract. You'd need to give two months' notice if you want to leave.

Caller: I see. Can I arrange a viewing?

Agent: Of course. I have availability on Thursday at two PM or Saturday at eleven AM. Which would suit you better?

Caller: Saturday at eleven would be perfect.

Agent: Excellent. I'll put that in the diary. The address is seventeen Victoria Road, and I'll meet you there. Could I have a contact number for you?

Caller: Yes, it's oh seven nine four two, three one eight, seven six five.

Agent: Lovely. I'll send you a confirmation text. See you on Saturday, Dinara.

Caller: Thank you, Tom. Goodbye.`,
    questions: [
      { id: 'l5-q1', type: 'completion', text: 'The flat is located on _______ Road.', correctAnswer: 'Victoria', explanation: 'Tom mentions "the Victoria Road flat."' },
      { id: 'l5-q2', type: 'completion', text: 'The flat is on the _______ floor.', correctAnswer: 'third', explanation: 'Tom says it is "on the third floor of a converted Victorian house."' },
      { id: 'l5-q3', type: 'completion', text: 'The monthly rent is £_______.', correctAnswer: '875', explanation: 'Tom says "the rent is eight hundred and seventy-five pounds per month."' },
      { id: 'l5-q4', type: 'completion', text: 'The deposit is equivalent to _______ weeks\' rent.', correctAnswer: '6 / six', explanation: 'Tom says "the deposit is six weeks\' rent."' },
      { id: 'l5-q5', type: 'completion', text: 'The flat will be available from April the _______.', correctAnswer: '8th / eighth', explanation: 'Tom says "you could move in from April the eighth."' },
      { id: 'l5-q6', type: 'multiple_choice', text: 'Which of the following is NOT included in the flat?', options: ['A) Washing machine', 'B) Wardrobe', 'C) Dining table', 'D) Double bed'], correctAnswer: 'C', explanation: 'Tom says "there\'s no dining table or desk — you\'d need to provide those yourself."' },
      { id: 'l5-q7', type: 'completion', text: 'A residents\' parking permit costs £_______ per year.', correctAnswer: '45 / forty-five', explanation: 'Tom says "the permit costs forty-five pounds per year."' },
      { id: 'l5-q8', type: 'completion', text: 'The minimum lease term is _______ months.', correctAnswer: '12 / twelve', explanation: 'Tom says "a twelve-month assured shorthold tenancy."' },
      { id: 'l5-q9', type: 'completion', text: 'Dinara must give _______ months\' notice to leave.', correctAnswer: '2 / two', explanation: 'Tom says "you\'d need to give two months\' notice."' },
      { id: 'l5-q10', type: 'completion', text: 'The viewing is arranged for _______ at 11 AM.', correctAnswer: 'Saturday', explanation: 'Dinara agrees to "Saturday at eleven."' },
    ],
  },

  // ── Section 6: Social Monologue (museum audio guide) ──────────────────
  {
    id: 'listening-6-museum',
    section: 2,
    context: 'An audio guide introduction at the National Museum of Science and Industry, explaining the layout and key exhibitions to visitors.',
    transcript: `Welcome to the National Museum of Science and Industry. Before you begin exploring, let me give you a brief overview of what we have on offer today.

The museum is arranged over four floors. We are currently on the ground floor, which houses the Transport Gallery. Here you will find a remarkable collection of vehicles spanning three centuries, from early steam engines to a prototype of a modern electric car. The centrepiece of this gallery is the Rocket, a replica of George Stephenson's famous locomotive from eighteen twenty-nine.

If you take the stairs or the lift to the first floor, you will reach the Communications Exhibition. This traces the history of human communication from the printing press through to the internet age. One highlight is a working model of Babbage's Difference Engine, which many consider to be the first mechanical computer. There are also interactive displays where you can try sending messages using Morse code.

The second floor is dedicated to Space and Aviation. This is our largest exhibition space and includes a full-scale model of the Apollo Lunar Module. You can also experience a simulated spacewalk using our virtual reality headsets — this is very popular with younger visitors, so I would recommend going there first if you are visiting with children. Please note that the VR experience requires a separate ticket, which costs three pounds fifty for adults and two pounds for children under sixteen.

On the third and top floor, you will find our newest exhibition, which opened just six months ago. It is called "AI and the Future" and explores the impact of artificial intelligence on medicine, transport, and creative arts. It features a live demonstration in which an AI system composes music in real time based on audience input. Demonstrations run every forty-five minutes, with the first one starting at ten thirty.

The museum café is located on the ground floor, next to the gift shop. We serve hot and cold meals from eleven AM until three PM. The gift shop is open throughout the day from nine thirty until five thirty.

One more thing — we offer free guided tours at noon and two thirty every day. Tours last approximately one hour and cover the highlights of all four floors. If you would like to join a tour, please meet at the information desk, which is just behind you.

I hope you enjoy your visit. If you have any questions at any time, our staff — identifiable by their blue lanyards — will be happy to help.`,
    questions: [
      { id: 'l6-q1', type: 'completion', text: 'The museum has _______ floors in total.', correctAnswer: '4 / four', explanation: 'The guide says "the museum is arranged over four floors."' },
      { id: 'l6-q2', type: 'completion', text: 'The ground floor houses the _______ Gallery.', correctAnswer: 'Transport', explanation: 'The guide says the ground floor "houses the Transport Gallery."' },
      { id: 'l6-q3', type: 'completion', text: 'The replica locomotive on display is called the _______.', correctAnswer: 'Rocket', explanation: 'The guide says "the centrepiece of this gallery is the Rocket."' },
      { id: 'l6-q4', type: 'matching', text: 'Match the floor with its exhibition: First floor', options: ['Transport Gallery', 'Communications Exhibition', 'Space and Aviation', 'AI and the Future'], correctAnswer: 'Communications Exhibition', explanation: 'The guide says the first floor houses "the Communications Exhibition."' },
      { id: 'l6-q5', type: 'matching', text: 'Match the floor with its exhibition: Second floor', options: ['Transport Gallery', 'Communications Exhibition', 'Space and Aviation', 'AI and the Future'], correctAnswer: 'Space and Aviation', explanation: 'The guide says "The second floor is dedicated to Space and Aviation."' },
      { id: 'l6-q6', type: 'completion', text: 'The VR experience costs £_______ for adults.', correctAnswer: '3.50 / three fifty / three pounds fifty', explanation: 'The guide says "three pounds fifty for adults."' },
      { id: 'l6-q7', type: 'completion', text: 'The "AI and the Future" exhibition opened _______ months ago.', correctAnswer: '6 / six', explanation: 'The guide says it "opened just six months ago."' },
      { id: 'l6-q8', type: 'completion', text: 'AI music demonstrations run every _______ minutes.', correctAnswer: '45 / forty-five', explanation: 'The guide says "demonstrations run every forty-five minutes."' },
      { id: 'l6-q9', type: 'completion', text: 'Free guided tours are offered at noon and _______ every day.', correctAnswer: '2:30 / two thirty', explanation: 'The guide says "free guided tours at noon and two thirty every day."' },
      { id: 'l6-q10', type: 'completion', text: 'Museum staff can be identified by their _______ lanyards.', correctAnswer: 'blue', explanation: 'The guide says "our staff — identifiable by their blue lanyards."' },
    ],
  },

  // ── Section 7: Academic Discussion (study group) ──────────────────────
  {
    id: 'listening-7-study-group',
    section: 3,
    context: 'A discussion between two postgraduate students (Aisha and Ben) and their supervisor (Professor Williams) about their dissertation progress on renewable energy adoption in developing countries.',
    transcript: `Professor Williams: Right, let's get started. Aisha, Ben, I've read your draft literature review on renewable energy adoption in developing countries. There's some good material there, but I have a few suggestions. Aisha, why don't you tell me about the framework you've decided on?

Aisha: Sure. We've settled on a multi-level framework that looks at renewable energy adoption at three levels: government policy, private sector investment, and community-level initiatives. We found that most existing research focuses only on the first two, so we wanted to emphasise grassroots adoption as well.

Professor Williams: That's a sensible approach. The community level is often overlooked in the literature. Ben, how does this connect to your case studies?

Ben: We've selected three countries as case studies: Kenya, Bangladesh, and Chile. Kenya is interesting because of its rapid adoption of solar energy in rural areas — something like thirty-five percent of the rural population now has access to off-grid solar systems. Bangladesh has the world's largest solar home system programme, with over six million installations. And Chile has become a leader in large-scale solar farms due to the Atacama Desert's exceptional solar radiation levels.

Professor Williams: Good choices. Now, I notice that your literature review relies heavily on English-language sources. Have you considered whether there might be important research published in other languages, particularly Spanish for the Chile case?

Aisha: That's a fair point. We did find a few Spanish-language studies, but we struggled with the translation. We've asked a colleague in the Spanish department to help us translate the three most relevant papers.

Professor Williams: Excellent. Now, let's discuss methodology. What approach are you taking?

Ben: We're using a comparative case study methodology. For each country, we're collecting data from three sources: government policy documents, published statistics on energy generation and consumption, and semi-structured interviews with stakeholders. We've already identified twenty-four potential interviewees — eight per country.

Aisha: The interviews will be conducted over video calls, which is practical given our budget constraints. We've prepared a standardised interview guide with fifteen core questions, but we also leave room for follow-up questions depending on the interviewee's responses.

Professor Williams: That sounds methodologically sound. What about your timeline? I'm aware the submission deadline is September the fifteenth.

Ben: We plan to complete all interviews by the end of June. July will be dedicated to data analysis — we'll be using thematic analysis for the interview data and comparative statistical analysis for the quantitative data. We're aiming to have the first complete draft ready by August the tenth, which gives us just over five weeks for revisions.

Aisha: We're also planning to present our preliminary findings at the Postgraduate Research Conference in July. We think that will be useful for getting feedback from other researchers.

Professor Williams: Absolutely, that conference is always valuable. One thing I'd recommend is that you also look at the International Renewable Energy Agency's annual reports — they have excellent country-level data that could strengthen your quantitative analysis considerably.

Ben: Thank you, Professor. We'll add that to our source list.`,
    questions: [
      { id: 'l7-q1', type: 'completion', text: 'The framework analyses renewable energy adoption at _______ levels.', correctAnswer: '3 / three', explanation: 'Aisha says the framework "looks at renewable energy adoption at three levels."' },
      { id: 'l7-q2', type: 'completion', text: 'In Kenya, approximately _______ percent of the rural population has access to off-grid solar.', correctAnswer: '35 / thirty-five', explanation: 'Ben says "something like thirty-five percent of the rural population now has access to off-grid solar systems."' },
      { id: 'l7-q3', type: 'completion', text: 'Bangladesh has over _______ million solar home system installations.', correctAnswer: '6 / six', explanation: 'Ben says "over six million installations."' },
      { id: 'l7-q4', type: 'completion', text: 'Chile benefits from the _______ Desert\'s exceptional solar radiation.', correctAnswer: 'Atacama', explanation: 'Ben mentions "the Atacama Desert\'s exceptional solar radiation levels."' },
      { id: 'l7-q5', type: 'completion', text: 'A colleague from the _______ department is helping with translations.', correctAnswer: 'Spanish', explanation: 'Aisha says "we\'ve asked a colleague in the Spanish department."' },
      { id: 'l7-q6', type: 'completion', text: 'The students have identified _______ potential interviewees in total.', correctAnswer: '24 / twenty-four', explanation: 'Ben says "we\'ve already identified twenty-four potential interviewees."' },
      { id: 'l7-q7', type: 'completion', text: 'The standardised interview guide contains _______ core questions.', correctAnswer: '15 / fifteen', explanation: 'Aisha says "a standardised interview guide with fifteen core questions."' },
      { id: 'l7-q8', type: 'completion', text: 'The submission deadline is September the _______.', correctAnswer: '15th / fifteenth', explanation: 'Professor Williams says "the submission deadline is September the fifteenth."' },
      { id: 'l7-q9', type: 'completion', text: 'The first complete draft should be ready by August the _______.', correctAnswer: '10th / tenth', explanation: 'Ben says "the first complete draft ready by August the tenth."' },
      { id: 'l7-q10', type: 'completion', text: 'Professor Williams recommends looking at the International _______ Energy Agency\'s annual reports.', correctAnswer: 'Renewable', explanation: 'The professor says "the International Renewable Energy Agency\'s annual reports."' },
    ],
  },

  // ── Section 8: Academic Lecture (marine biology) ───────────────────────
  {
    id: 'listening-8-marine',
    section: 4,
    context: 'A lecture on the decline of coral reefs worldwide, delivered by a marine biology professor. The lecture covers causes, consequences, and potential restoration strategies.',
    transcript: `Good morning. Today we turn our attention to one of the most urgent environmental crises of our time: the decline of coral reefs. Coral reefs are sometimes called the rainforests of the sea, and for good reason — although they cover less than one percent of the ocean floor, they support approximately twenty-five percent of all marine species.

Let me begin with the scale of the problem. According to a comprehensive study published in two thousand twenty-one by the Global Coral Reef Monitoring Network, the world has lost approximately fourteen percent of its coral reefs since two thousand nine. That represents an area of roughly eleven thousand seven hundred square kilometres — larger than the entire country of Jamaica.

The primary driver of coral decline is ocean warming. When sea surface temperatures rise by just one to two degrees Celsius above the normal summer maximum, corals expel the symbiotic algae that live within their tissues. These algae, known as zooxanthellae, provide corals with up to ninety percent of their energy through photosynthesis. Without them, the coral turns white — a phenomenon known as coral bleaching. If high temperatures persist for more than four to six weeks, the coral starves and dies.

The second major threat is ocean acidification. As the ocean absorbs carbon dioxide from the atmosphere, its pH level drops, making the water more acidic. This reduces the availability of calcium carbonate, which corals need to build their skeletons. Research conducted at the Australian Institute of Marine Science found that calcification rates on the Great Barrier Reef declined by approximately fourteen point two percent between nineteen ninety and two thousand five.

Localised threats also play a significant role. Overfishing disrupts the ecological balance of reef systems. For example, the removal of herbivorous fish allows algae to overgrow and smother corals. Coastal development leads to sedimentation, which blocks light and smothers coral polyps. Agricultural runoff carrying fertilisers and pesticides causes nutrient pollution, which again promotes harmful algal growth.

Now, what can be done? Several restoration approaches are showing promise. One technique, known as coral gardening, involves growing coral fragments in underwater nurseries and then transplanting them onto degraded reefs. A project in the Caribbean led by the Coral Restoration Foundation has transplanted over one hundred thousand corals of the endangered staghorn species since two thousand twelve.

Another approach involves selective breeding for heat tolerance. Scientists at the Hawaii Institute of Marine Biology have been cross-breeding coral strains that survived previous bleaching events, producing offspring that can tolerate temperatures up to two degrees higher than their parents. This technique, sometimes called "assisted evolution," is controversial because it involves human intervention in natural selection, but its proponents argue that the urgency of the crisis justifies it.

Finally, marine protected areas — or MPAs — have proven effective at allowing reefs to recover when other threats are managed. A ten-year study of fully protected marine reserves in the Philippines showed that coral cover increased by an average of two percent per year within protected zones, compared with a continued decline in unprotected areas.

The fundamental challenge, however, remains global. Unless greenhouse gas emissions are reduced significantly, even the most successful restoration projects will be fighting a losing battle. The Intergovernmental Panel on Climate Change has warned that at one point five degrees of warming, seventy to ninety percent of the world's coral reefs could be lost. At two degrees, that figure rises to more than ninety-nine percent.`,
    questions: [
      { id: 'l8-q1', type: 'completion', text: 'Coral reefs support approximately _______ percent of all marine species.', correctAnswer: '25 / twenty-five', explanation: 'The lecturer says reefs "support approximately twenty-five percent of all marine species."' },
      { id: 'l8-q2', type: 'completion', text: 'Since 2009, the world has lost roughly _______ percent of its coral reefs.', correctAnswer: '14 / fourteen', explanation: 'The lecturer says "the world has lost approximately fourteen percent of its coral reefs since two thousand nine."' },
      { id: 'l8-q3', type: 'completion', text: 'The symbiotic algae in coral tissues are called _______.', correctAnswer: 'zooxanthellae', explanation: 'The lecturer says "these algae, known as zooxanthellae."' },
      { id: 'l8-q4', type: 'completion', text: 'Zooxanthellae provide corals with up to _______ percent of their energy.', correctAnswer: '90 / ninety', explanation: 'The lecturer says they "provide corals with up to ninety percent of their energy through photosynthesis."' },
      { id: 'l8-q5', type: 'completion', text: 'If high temperatures persist for more than _______ weeks, bleached coral dies.', correctAnswer: '4 to 6 / four to six', explanation: 'The lecturer says "if high temperatures persist for more than four to six weeks, the coral starves and dies."' },
      { id: 'l8-q6', type: 'completion', text: 'Great Barrier Reef calcification rates declined by approximately _______ percent between 1990 and 2005.', correctAnswer: '14.2', explanation: 'The lecturer says "calcification rates on the Great Barrier Reef declined by approximately fourteen point two percent."' },
      { id: 'l8-q7', type: 'completion', text: 'The Coral Restoration Foundation has transplanted over _______ thousand corals since 2012.', correctAnswer: '100 / one hundred', explanation: 'The lecturer says "transplanted over one hundred thousand corals."' },
      { id: 'l8-q8', type: 'multiple_choice', text: 'The "assisted evolution" technique involves:', options: ['A) Genetically modifying corals in a laboratory', 'B) Cross-breeding corals that survived previous bleaching events', 'C) Moving corals to cooler waters', 'D) Adding chemicals to increase heat tolerance'], correctAnswer: 'B', explanation: 'The lecturer explains scientists have been "cross-breeding coral strains that survived previous bleaching events."' },
      { id: 'l8-q9', type: 'completion', text: 'In the Philippines study, coral cover in protected zones increased by _______ percent per year.', correctAnswer: '2 / two', explanation: 'The lecturer says "coral cover increased by an average of two percent per year within protected zones."' },
      { id: 'l8-q10', type: 'completion', text: 'At 2 degrees of warming, more than _______ percent of coral reefs could be lost.', correctAnswer: '99 / ninety-nine', explanation: 'The lecturer says "at two degrees, that figure rises to more than ninety-nine percent."' },
    ],
  },

  // ── Section 9: Social / Everyday (health club enquiry) ────────────────
  {
    id: 'listening-9-health-club',
    section: 1,
    context: 'A conversation between a prospective member and a staff member at a fitness centre, discussing membership options and facilities.',
    transcript: `Staff: Welcome to FitLife Health Club. How can I help you today?

Visitor: Hi, I've just moved to the area and I'm looking for a gym to join. Could you tell me about your membership options?

Staff: Of course. We have three membership tiers. The first is our Basic membership, which gives you access to the gym floor — that's all the weight machines, free weights, and cardio equipment. That costs thirty-nine pounds per month.

Visitor: OK. And the other options?

Staff: The second tier is our Plus membership at fifty-four pounds per month. That includes everything in Basic plus unlimited group fitness classes — we run over forty classes a week, including yoga, spinning, HIIT, and Pilates. You also get access to the swimming pool.

Visitor: That sounds more like what I'm after. What's the top tier?

Staff: That's our Premium membership at seventy-two pounds per month. It includes everything in Plus, plus access to the sauna and steam room, a free personal training session every month, and priority booking for all classes.

Visitor: Right. Is there a joining fee?

Staff: There is, yes. It's a one-time fee of twenty-five pounds for all membership levels. However, we're currently running a promotion — if you sign up before the end of this month, the joining fee is waived entirely.

Visitor: Oh, that's good timing. What are your opening hours?

Staff: We're open from six AM to ten PM on weekdays, and eight AM to eight PM on weekends. The swimming pool closes thirty minutes before the main gym, so that would be nine thirty PM on weekdays and seven thirty PM on weekends.

Visitor: And do you offer any free trial?

Staff: Yes, we do. You can book a free three-day trial pass. That gives you full access to all facilities — equivalent to the Premium level — so you can try everything before committing. Would you like me to set that up for you?

Visitor: That would be great, yes.

Staff: Perfect. I'll just need your full name and a form of ID — a passport or driving licence.

Visitor: My name is Yerlan Ospanov. Y-E-R-L-A-N, Ospanov is O-S-P-A-N-O-V.

Staff: Thank you, Yerlan. And when would you like to start your trial?

Visitor: Could I start tomorrow?

Staff: Absolutely. Your three days would run from tomorrow, Wednesday, through to Friday. I'll also book you in for a complimentary fitness assessment with one of our trainers at ten AM on Wednesday — that takes about forty-five minutes and includes measurements and a personalised workout plan.

Visitor: That's brilliant. Thank you very much.

Staff: You're welcome. See you tomorrow morning!`,
    questions: [
      { id: 'l9-q1', type: 'completion', text: 'The Basic membership costs £_______ per month.', correctAnswer: '39 / thirty-nine', explanation: 'The staff says "that costs thirty-nine pounds per month."' },
      { id: 'l9-q2', type: 'completion', text: 'The Plus membership includes access to the swimming pool and unlimited group _______ classes.', correctAnswer: 'fitness', explanation: 'The staff says Plus includes "unlimited group fitness classes."' },
      { id: 'l9-q3', type: 'completion', text: 'The Premium membership costs £_______ per month.', correctAnswer: '72 / seventy-two', explanation: 'The staff says "seventy-two pounds per month."' },
      { id: 'l9-q4', type: 'completion', text: 'Premium members receive a free _______ training session every month.', correctAnswer: 'personal', explanation: 'The staff says "a free personal training session every month."' },
      { id: 'l9-q5', type: 'completion', text: 'The normal joining fee is £_______.', correctAnswer: '25 / twenty-five', explanation: 'The staff says "a one-time fee of twenty-five pounds."' },
      { id: 'l9-q6', type: 'completion', text: 'On weekdays the gym opens at _______ AM.', correctAnswer: '6 / six', explanation: 'The staff says "six AM to ten PM on weekdays."' },
      { id: 'l9-q7', type: 'completion', text: 'The swimming pool closes _______ minutes before the main gym.', correctAnswer: '30 / thirty', explanation: 'The staff says "the swimming pool closes thirty minutes before the main gym."' },
      { id: 'l9-q8', type: 'completion', text: 'The free trial pass lasts _______ days.', correctAnswer: '3 / three', explanation: 'The staff says "a free three-day trial pass."' },
      { id: 'l9-q9', type: 'completion', text: 'The fitness assessment takes about _______ minutes.', correctAnswer: '45 / forty-five', explanation: 'The staff says "that takes about forty-five minutes."' },
      { id: 'l9-q10', type: 'completion', text: 'The visitor\'s surname is _______.', correctAnswer: 'Ospanov', explanation: 'The visitor spells it out: O-S-P-A-N-O-V.' },
    ],
  },

  // ── Section 10: Social Monologue (travel guide) ───────────────────────
  {
    id: 'listening-10-travel',
    section: 2,
    context: 'A recorded information message for tourists arriving at Edinburgh Waverley station, providing guidance on local transport, attractions, and visitor services.',
    transcript: `Welcome to Edinburgh! This recorded message is designed to help you make the most of your visit to Scotland's beautiful capital city.

Edinburgh Waverley is the main railway station and is centrally located between the Old Town and the New Town. When you exit the station, you'll find the Tourist Information Centre directly opposite, on Princes Street. It's open daily from nine AM to six PM in summer and nine AM to five PM during the winter months. Staff there can help with accommodation bookings, guided tours, and discount passes.

For getting around the city, you have several options. Edinburgh has an excellent bus network operated by Lothian Buses. A single fare is one pound eighty, but I'd strongly recommend the day ticket at four pounds fifty — it gives you unlimited travel on all Lothian Buses routes for twenty-four hours. You can buy tickets on the bus, but please note that you'll need exact change as drivers cannot give change.

The Edinburgh Tram runs from the airport to York Place in the city centre, with fifteen stops along the route. A single journey from the airport takes approximately thirty-five minutes and costs seven pounds. If you're arriving by air, this is usually the most convenient option.

Now, let me tell you about some of Edinburgh's top attractions. Edinburgh Castle sits at the top of the Royal Mile and is the city's most visited landmark. It's open daily from nine thirty to six PM in summer. Adult tickets cost nineteen pounds fifty, and I recommend booking online in advance, as queues can be very long during peak season.

The Royal Mile itself is a fascinating walk from the Castle down to the Palace of Holyroodhouse, the official Scottish residence of the monarch. Along the way, you'll pass St Giles' Cathedral, which is free to enter, and numerous independent shops, cafés, and whisky-tasting rooms.

For those interested in literature, the Scottish National Library on George the Fourth Bridge has a wonderful exhibition on Scottish writers, including Robert Burns and Sir Walter Scott. Entry is free.

If you enjoy walking, I'd highly recommend climbing Arthur's Seat — the extinct volcano that rises to two hundred and fifty-one metres in Holyrood Park. The walk takes approximately forty-five minutes from the base and offers spectacular panoramic views of the city and the Firth of Forth.

Finally, if you're visiting during August, Edinburgh hosts the world's largest arts festival — the Edinburgh Festival Fringe. Last year, over three thousand shows were performed across more than three hundred venues over twenty-five days. Many performances are free.

Enjoy your stay in Edinburgh!`,
    questions: [
      { id: 'l10-q1', type: 'completion', text: 'The Tourist Information Centre is on _______ Street.', correctAnswer: 'Princes', explanation: 'The message says "directly opposite, on Princes Street."' },
      { id: 'l10-q2', type: 'completion', text: 'A single bus fare costs £_______.', correctAnswer: '1.80 / one eighty / one pound eighty', explanation: 'The message says "a single fare is one pound eighty."' },
      { id: 'l10-q3', type: 'completion', text: 'A day bus ticket costs £_______.', correctAnswer: '4.50 / four fifty / four pounds fifty', explanation: 'The message says "the day ticket at four pounds fifty."' },
      { id: 'l10-q4', type: 'completion', text: 'The tram from the airport takes approximately _______ minutes.', correctAnswer: '35 / thirty-five', explanation: 'The message says "approximately thirty-five minutes."' },
      { id: 'l10-q5', type: 'completion', text: 'Edinburgh Castle adult tickets cost £_______.', correctAnswer: '19.50 / nineteen fifty / nineteen pounds fifty', explanation: 'The message says "adult tickets cost nineteen pounds fifty."' },
      { id: 'l10-q6', type: 'completion', text: 'The Palace of Holyroodhouse is the official Scottish residence of the _______.', correctAnswer: 'monarch', explanation: 'The message says "the official Scottish residence of the monarch."' },
      { id: 'l10-q7', type: 'completion', text: 'Arthur\'s Seat is an extinct _______ that rises to 251 metres.', correctAnswer: 'volcano', explanation: 'The message says "the extinct volcano that rises to two hundred and fifty-one metres."' },
      { id: 'l10-q8', type: 'completion', text: 'The walk up Arthur\'s Seat takes about _______ minutes from the base.', correctAnswer: '45 / forty-five', explanation: 'The message says "approximately forty-five minutes from the base."' },
      { id: 'l10-q9', type: 'completion', text: 'The Edinburgh Festival Fringe takes place during the month of _______.', correctAnswer: 'August', explanation: 'The message says "if you\'re visiting during August, Edinburgh hosts... the Edinburgh Festival Fringe."' },
      { id: 'l10-q10', type: 'multiple_choice', text: 'Which of the following is free to visit?', options: ['A) Edinburgh Castle', 'B) The Palace of Holyroodhouse', 'C) St Giles\' Cathedral', 'D) The Edinburgh Tram'], correctAnswer: 'C', explanation: 'The message says St Giles\' Cathedral "is free to enter."' },
    ],
  },

  // ── Section 11: Academic Discussion (psychology seminar) ──────────────
  {
    id: 'listening-11-psychology',
    section: 3,
    context: 'A seminar discussion between a psychology lecturer (Dr. Moran) and two students (Kira and Samat) about their presentation on the effects of sleep deprivation on cognitive function.',
    transcript: `Dr. Moran: Kira, Samat, your presentation on sleep deprivation and cognitive function is scheduled for next Tuesday. How are your preparations going?

Kira: Quite well, Dr. Moran. We've divided the presentation into four main sections. I'm covering the first two — the physiology of sleep and the research on how sleep deprivation affects memory consolidation. Samat is handling the sections on attention and decision-making.

Samat: That's right. We've reviewed about thirty-five journal articles between us. The most significant finding from the literature is that even moderate sleep deprivation — getting six hours instead of the recommended seven to nine — can reduce cognitive performance by up to twenty-five percent. That was from a two thousand three study by Van Dongen and colleagues.

Dr. Moran: That's a well-known study. Did you also look at the work by Matthew Walker?

Kira: Yes, Walker's book "Why We Sleep" was actually our starting point. He argues that sleep is not a luxury but a biological necessity. One statistic that really stood out to us is that after seventeen hours of sustained wakefulness, cognitive impairment is equivalent to having a blood alcohol level of point zero five percent — which is above the legal driving limit in many countries.

Dr. Moran: That's a powerful comparison. How are you structuring the presentation visually?

Samat: We've prepared twenty-two slides. We're using mostly graphs and diagrams rather than blocks of text. For the memory section, Kira has created a flowchart showing the different stages of memory consolidation during REM and non-REM sleep. I've prepared a bar chart comparing reaction times in sleep-deprived versus well-rested participants, based on data from five different studies.

Dr. Moran: Good. Visual data is much more engaging. What about the practical implications section?

Kira: We're concluding with recommendations for university students specifically. We have data showing that students who consistently sleep fewer than six hours per night have an average GPA that is point four lower than those who sleep seven hours or more. We're also going to discuss the impact of blue light from screens on melatonin production — research shows that using a phone or laptop within two hours of bedtime delays sleep onset by an average of forty-five minutes.

Dr. Moran: That's very relevant for your audience. One suggestion — you might want to include a brief section on napping. There's interesting research from NASA showing that a twenty-six-minute nap improved pilot performance by thirty-four percent. It would add a practical element.

Samat: That's a great idea. We can fit that into the recommendations section easily.

Dr. Moran: How long will the presentation be?

Kira: We're aiming for twenty-five minutes, plus ten minutes for questions. We've rehearsed it twice so far and it runs to about twenty-three minutes, so we have a bit of room to add the napping section.

Dr. Moran: Perfect. I look forward to seeing it on Tuesday.`,
    questions: [
      { id: 'l11-q1', type: 'completion', text: 'The students have reviewed about _______ journal articles.', correctAnswer: '35 / thirty-five', explanation: 'Samat says "we\'ve reviewed about thirty-five journal articles."' },
      { id: 'l11-q2', type: 'completion', text: 'Moderate sleep deprivation can reduce cognitive performance by up to _______ percent.', correctAnswer: '25 / twenty-five', explanation: 'Samat says it "can reduce cognitive performance by up to twenty-five percent."' },
      { id: 'l11-q3', type: 'completion', text: 'After 17 hours awake, cognitive impairment equals a blood alcohol level of _______ percent.', correctAnswer: '0.05 / point zero five', explanation: 'Kira says "equivalent to having a blood alcohol level of point zero five percent."' },
      { id: 'l11-q4', type: 'completion', text: 'The presentation has _______ slides.', correctAnswer: '22 / twenty-two', explanation: 'Samat says "we\'ve prepared twenty-two slides."' },
      { id: 'l11-q5', type: 'completion', text: 'Kira has created a _______ showing stages of memory consolidation.', correctAnswer: 'flowchart', explanation: 'Samat says "Kira has created a flowchart showing the different stages of memory consolidation."' },
      { id: 'l11-q6', type: 'completion', text: 'Students sleeping fewer than 6 hours have a GPA that is _______ lower on average.', correctAnswer: '0.4 / point four', explanation: 'Kira says "an average GPA that is point four lower."' },
      { id: 'l11-q7', type: 'completion', text: 'Using screens before bed delays sleep onset by an average of _______ minutes.', correctAnswer: '45 / forty-five', explanation: 'Kira says "delays sleep onset by an average of forty-five minutes."' },
      { id: 'l11-q8', type: 'completion', text: 'NASA research found that a _______-minute nap improved pilot performance by 34%.', correctAnswer: '26 / twenty-six', explanation: 'Dr. Moran says "a twenty-six-minute nap improved pilot performance by thirty-four percent."' },
      { id: 'l11-q9', type: 'completion', text: 'The presentation is planned to last _______ minutes plus 10 minutes for questions.', correctAnswer: '25 / twenty-five', explanation: 'Kira says "we\'re aiming for twenty-five minutes, plus ten minutes for questions."' },
      { id: 'l11-q10', type: 'multiple_choice', text: 'Which researcher wrote the book "Why We Sleep"?', options: ['A) Van Dongen', 'B) Matthew Walker', 'C) Dr. Moran', 'D) Dunning and Kruger'], correctAnswer: 'B', explanation: 'Kira says "Walker\'s book \'Why We Sleep\' was actually our starting point."' },
    ],
  },

  // ── Section 12: Academic Lecture (economics of water) ─────────────────
  {
    id: 'listening-12-water-economics',
    section: 4,
    context: 'A university lecture on the economics and geopolitics of freshwater scarcity, examining supply challenges, pricing mechanisms, and international disputes.',
    transcript: `Today I want to discuss a resource that we often take for granted but which may well define the geopolitics of the twenty-first century: freshwater. Although approximately seventy-one percent of the Earth's surface is covered by water, only two point five percent of all water on the planet is fresh, and of that, just one percent is readily accessible for human use. The rest is locked up in glaciers, ice caps, and deep underground aquifers.

Let's start with the demand side. Global freshwater consumption has increased by roughly six times over the past century, driven by population growth, agricultural expansion, and industrialisation. Agriculture alone accounts for approximately seventy percent of all freshwater withdrawals worldwide. In some arid regions — the Middle East and North Africa, for example — that figure exceeds eighty-five percent.

The supply side presents equally significant challenges. Climate change is altering precipitation patterns, making some regions wetter and others drier. The World Resources Institute estimates that by two thousand forty, thirty-three countries will face extremely high water stress. Many of these are in regions that are already politically unstable, raising concerns about potential water conflicts.

Now, economists have long debated how best to manage water scarcity. One school of thought advocates for market-based pricing — treating water as an economic good and allowing prices to reflect its true scarcity value. The argument is that when water is priced cheaply or subsidised, it tends to be wasted. Australia pioneered this approach with its water trading system in the Murray-Darling Basin, where farmers can buy and sell water rights. Studies have shown that this system improved water-use efficiency by approximately eighteen percent over a fifteen-year period.

However, critics argue that water is a fundamental human right and should not be subject to market forces. The United Nations General Assembly recognised access to clean water as a human right in two thousand ten. If water is priced too high, the poorest members of society may be unable to afford it. This tension between efficiency and equity is at the heart of the debate.

Transboundary water disputes represent another dimension of the challenge. Over two hundred and sixty river basins are shared by two or more countries, and these shared resources have historically been sources of both cooperation and conflict. The Nile River, shared by eleven countries, illustrates this perfectly. Egypt, which depends on the Nile for roughly ninety-seven percent of its freshwater, has repeatedly clashed with Ethiopia over the Grand Ethiopian Renaissance Dam — a massive hydroelectric project that Ethiopia began building in two thousand eleven. Egypt fears that the dam will reduce its water supply, while Ethiopia argues it has a sovereign right to develop its own resources.

Technology offers some grounds for optimism. Desalination — the process of removing salt from seawater — has become increasingly cost-effective. Israel now produces approximately fifty-five percent of its domestic water through desalination, at a cost of about fifty-three cents per cubic metre, down from over two dollars a decade ago. However, desalination is energy-intensive and produces a concentrated brine waste that can harm marine ecosystems if not managed properly.

In conclusion, freshwater scarcity is not simply an environmental issue — it is an economic, political, and ethical challenge that will require unprecedented levels of international cooperation to address.`,
    questions: [
      { id: 'l12-q1', type: 'completion', text: 'Only _______ percent of all water on Earth is fresh.', correctAnswer: '2.5 / two point five', explanation: 'The lecturer says "only two point five percent of all water on the planet is fresh."' },
      { id: 'l12-q2', type: 'completion', text: 'Just _______ percent of freshwater is readily accessible for human use.', correctAnswer: '1 / one', explanation: 'The lecturer says "just one percent is readily accessible for human use."' },
      { id: 'l12-q3', type: 'completion', text: 'Agriculture accounts for approximately _______ percent of global freshwater withdrawals.', correctAnswer: '70 / seventy', explanation: 'The lecturer says "agriculture alone accounts for approximately seventy percent."' },
      { id: 'l12-q4', type: 'completion', text: 'By 2040, _______ countries will face extremely high water stress.', correctAnswer: '33 / thirty-three', explanation: 'The lecturer says "thirty-three countries will face extremely high water stress."' },
      { id: 'l12-q5', type: 'completion', text: 'Australia\'s water trading system improved water-use efficiency by approximately _______ percent.', correctAnswer: '18 / eighteen', explanation: 'The lecturer says "improved water-use efficiency by approximately eighteen percent."' },
      { id: 'l12-q6', type: 'completion', text: 'The UN recognised access to clean water as a human right in _______.', correctAnswer: '2010', explanation: 'The lecturer says "The United Nations General Assembly recognised access to clean water as a human right in two thousand ten."' },
      { id: 'l12-q7', type: 'completion', text: 'Over _______ river basins are shared by two or more countries.', correctAnswer: '260 / two hundred and sixty', explanation: 'The lecturer says "over two hundred and sixty river basins."' },
      { id: 'l12-q8', type: 'completion', text: 'Egypt depends on the Nile for approximately _______ percent of its freshwater.', correctAnswer: '97 / ninety-seven', explanation: 'The lecturer says "Egypt, which depends on the Nile for roughly ninety-seven percent of its freshwater."' },
      { id: 'l12-q9', type: 'completion', text: 'Israel produces approximately _______ percent of its domestic water through desalination.', correctAnswer: '55 / fifty-five', explanation: 'The lecturer says "approximately fifty-five percent of its domestic water through desalination."' },
      { id: 'l12-q10', type: 'multiple_choice', text: 'According to the lecturer, what is the main argument AGAINST market-based water pricing?', options: ['A) It is too complex to implement', 'B) It may make water unaffordable for the poorest people', 'C) Farmers refuse to participate', 'D) It has never been tried before'], correctAnswer: 'B', explanation: 'The lecturer says "if water is priced too high, the poorest members of society may be unable to afford it."' },
    ],
  },
]

// ════════════════════════════════════════════════════════════════════════════
// 6. SPEAKING PART 1 — Interview Questions (15 questions)
// ════════════════════════════════════════════════════════════════════════════

export const IELTS_SPEAKING_PART1: IeltsSpeakingPart1Question[] = [
  // 1 — Hometown
  {
    id: 'sp1-1-hometown',
    topic: 'Hometown',
    question: 'Can you describe your hometown for me?',
    sampleAnswer: `I come from Aktau, which is a city on the eastern shore of the Caspian Sea in western Kazakhstan. It is a relatively small city compared to Almaty or Astana, with a population of around 190,000 people. It was originally built in the 1960s as a planned Soviet city to support the oil and gas industry. What makes it unusual is that the streets don't have traditional names — instead, they are identified by numbers, so you might live on "microdistrict 5" rather than "Oak Street." The climate is quite extreme — very hot and dry in summer, reaching over 40 degrees, and windy in winter. Despite its remoteness, I'm quite fond of it because the seaside location gives it a unique character, and the sunsets over the Caspian are genuinely spectacular.`,
    keyVocabulary: [
      'eastern shore (восточный берег)',
      'planned city (город, построенный по плану)',
      'remoteness (удалённость)',
      'unique character (уникальный характер)',
      'quite fond of (довольно привязан к)',
    ],
    tips: [
      'Speak for at least 3-4 sentences — don\'t give one-word answers',
      'Add personal feelings or opinions to make your answer more natural',
      'Use descriptive adjectives: "relatively small", "genuinely spectacular"',
      'Mention both positive and negative aspects to show balanced thinking',
    ],
  },

  // 2 — Studies
  {
    id: 'sp1-2-studies',
    topic: 'Studies',
    question: 'What are you studying at the moment, and why did you choose this subject?',
    sampleAnswer: `I'm currently in my third year of a bachelor's degree in international relations at a university in Astana. I chose this subject because I've always been interested in how countries interact with each other — trade, diplomacy, conflicts — and I wanted to understand the bigger picture of global politics. I also felt it would be a practical choice for Kazakhstan, since our country is positioned between major powers like Russia and China, and international relations skills are increasingly in demand. So far I've really enjoyed it, particularly the modules on Central Asian geopolitics and international economic policy.`,
    keyVocabulary: [
      'bachelor\'s degree (степень бакалавра)',
      'international relations (международные отношения)',
      'diplomacy (дипломатия)',
      'geopolitics (геополитика)',
      'increasingly in demand (всё более востребованный)',
    ],
    tips: [
      'State what you study AND give a reason for your choice',
      'Connect your subject to your country or personal experience for authenticity',
      'Use present continuous for current activities: "I\'m studying..."',
      'Mention specific aspects you enjoy to add depth',
    ],
  },

  // 3 — Work
  {
    id: 'sp1-3-work',
    topic: 'Work',
    question: 'Do you work, or are you a full-time student? What do you do?',
    sampleAnswer: `I'm primarily a full-time student, but I also work part-time as a freelance translator. I translate documents and articles from Russian and Kazakh into English, mostly for small businesses and academic researchers. I started doing this about a year ago, partly to earn some extra income and partly to improve my English skills in a practical way. I usually work about ten to fifteen hours a week, mostly in the evenings and on weekends. It can be challenging to balance work and studies, but I find that the translation work actually complements my academic studies because it forces me to think carefully about language and meaning.`,
    keyVocabulary: [
      'freelance translator (переводчик-фрилансер)',
      'extra income (дополнительный доход)',
      'to balance work and studies (совмещать работу и учёбу)',
      'complements (дополняет)',
      'in a practical way (на практике)',
    ],
    tips: [
      'If you both study and work, mention both and explain how they connect',
      'Include specific details: hours, tasks, how long you\'ve done it',
      'Show awareness of challenges and benefits',
      'Use linking phrases: "partly to... and partly to..."',
    ],
  },

  // 4 — Hobbies
  {
    id: 'sp1-4-hobbies',
    topic: 'Hobbies',
    question: 'What do you enjoy doing in your free time?',
    sampleAnswer: `In my free time, I mainly enjoy two things: playing chess and going hiking. Chess is something I've played since I was quite young — my father taught me when I was about seven, and I still play regularly, mostly online these days. I find it mentally stimulating and it helps me relax, oddly enough, because it requires such intense focus that I forget about everything else. Hiking is more of a weekend activity. If the weather permits, I like to go to the mountains near Almaty — places like Big Almaty Lake or the trails in Ile-Alatau National Park. Being in nature is the best way I know to recharge after a busy week.`,
    keyVocabulary: [
      'mentally stimulating (умственно стимулирующий)',
      'intense focus (интенсивная концентрация)',
      'if the weather permits (если погода позволяет)',
      'to recharge (восстановить силы)',
      'oddly enough (как ни странно)',
    ],
    tips: [
      'Mention 2-3 hobbies rather than just one to show range',
      'Explain WHY you enjoy them, not just what they are',
      'Use natural phrases: "oddly enough", "mostly these days"',
      'Include specific details: names of places, how long you\'ve done the activity',
    ],
  },

  // 5 — Technology
  {
    id: 'sp1-5-technology',
    topic: 'Technology',
    question: 'How important is technology in your daily life?',
    sampleAnswer: `Technology is extremely important in my daily life — I honestly don't think I could function without it. My smartphone is probably the device I use most. I rely on it for communication, navigation, managing my schedule, and even studying through educational apps. I also use my laptop extensively for university work — writing assignments, attending online lectures, and conducting research. However, I do try to set boundaries. I've started leaving my phone in another room when I study because I noticed that constant notifications were destroying my concentration. So while technology is essential, I think it's important to use it mindfully rather than letting it control you.`,
    keyVocabulary: [
      'I rely on it for (я полагаюсь на это для)',
      'set boundaries (устанавливать границы)',
      'constant notifications (постоянные уведомления)',
      'use it mindfully (использовать осознанно)',
      'destroying my concentration (разрушая мою концентрацию)',
    ],
    tips: [
      'Give a clear overall assessment first, then provide details',
      'Show both positive and negative aspects of technology use',
      'Use specific examples rather than general statements',
      'Demonstrate awareness and critical thinking about your own habits',
    ],
  },

  // 6 — Food
  {
    id: 'sp1-6-food',
    topic: 'Food',
    question: 'What kind of food do you like to eat? Do you prefer cooking at home or eating out?',
    sampleAnswer: `I enjoy a wide variety of food, but I particularly love Central Asian cuisine — things like plov, laghman, and manti. I grew up eating these dishes, so they have a strong nostalgic element for me. In terms of cooking versus eating out, I'd say I do both, but I've been trying to cook at home more recently. It's not only cheaper but also healthier, because I can control what goes into the food. I'm not a particularly skilled cook, to be honest, but I can make a decent plov and a few pasta dishes. When I do eat out, I tend to choose smaller local restaurants rather than fast food chains. I think the food is usually better quality and it's more interesting.`,
    keyVocabulary: [
      'nostalgic element (элемент ностальгии)',
      'in terms of (что касается)',
      'not particularly skilled (не особо умелый)',
      'decent (приличный / неплохой)',
      'fast food chains (сети фастфуда)',
    ],
    tips: [
      'Answer BOTH parts of a two-part question',
      'Be honest — admitting you\'re not a great cook sounds natural and authentic',
      'Use comparative structures: "not only... but also..."',
      'Include cultural references to make your answer distinctive',
    ],
  },

  // 7 — Weather
  {
    id: 'sp1-7-weather',
    topic: 'Weather',
    question: 'What is the weather like in your country? Do you have a favourite season?',
    sampleAnswer: `Kazakhstan has a continental climate, which means we get quite extreme temperatures in both directions. Summers can be very hot — temperatures regularly exceed 35 degrees Celsius in the south — and winters are bitterly cold, with temperatures dropping to minus 20 or even minus 30 in some regions. My favourite season is autumn, particularly September and October. The heat of summer has passed, the air is crisp and clear, and the landscape turns beautiful shades of gold and red. It's also a quieter time — the rush of the new academic year has settled down, and there's a sense of calm before winter arrives. I find the light in autumn particularly beautiful — it has a warm, golden quality that makes everything look more appealing.`,
    keyVocabulary: [
      'continental climate (континентальный климат)',
      'bitterly cold (жестоко холодный)',
      'crisp and clear (свежий и ясный)',
      'shades of gold and red (оттенки золотого и красного)',
      'a sense of calm (чувство спокойствия)',
    ],
    tips: [
      'Include specific details: temperatures, months, regions',
      'Use sensory language: how things look, feel, smell',
      'Explain WHY you like a particular season, not just which one',
      'Use descriptive phrases: "bitterly cold", "crisp and clear", "warm, golden quality"',
    ],
  },

  // 8 — Sports
  {
    id: 'sp1-8-sports',
    topic: 'Sports',
    question: 'Do you play any sports or follow any sports teams?',
    sampleAnswer: `I play football quite regularly — usually twice a week with a group of friends. We rent a small indoor pitch in winter and play outdoors when the weather is warmer. I'm not particularly talented, but I enjoy the exercise and the social aspect of it. In terms of following sports, I'm a big fan of boxing, which is hugely popular in Kazakhstan. We've produced some outstanding boxers — Gennady Golovkin is probably the most well-known internationally. I watched his fights growing up, and he was a real inspiration. I also follow the Premier League casually, though I wouldn't call myself a dedicated fan of any particular team. I think sports are important not just for physical health but also for building discipline and teamwork.`,
    keyVocabulary: [
      'quite regularly (довольно регулярно)',
      'the social aspect (социальный аспект)',
      'hugely popular (чрезвычайно популярный)',
      'a real inspiration (настоящее вдохновение)',
      'building discipline (воспитание дисциплины)',
    ],
    tips: [
      'Distinguish between playing and watching/following sports',
      'Include cultural context: what sports are popular in your country',
      'Be honest about your skill level — it sounds more natural',
      'End with a broader reflection to show depth of thinking',
    ],
  },

  // 9 — Music
  {
    id: 'sp1-9-music',
    topic: 'Music',
    question: 'What kind of music do you listen to? Has your taste in music changed over the years?',
    sampleAnswer: `My music taste is quite eclectic, actually. I listen to everything from hip-hop and R&B to classical piano music. On a typical day, I might listen to Kendrick Lamar while commuting and then switch to Chopin when I'm studying — they serve completely different purposes for me. My taste has definitely changed over the years. When I was a teenager, I listened almost exclusively to Russian pop music and whatever was popular on TikTok. As I got older and started learning English more seriously, I naturally gravitated towards English-language music, and I think that actually helped my listening comprehension quite a lot. I also developed an appreciation for classical music through a friend who plays piano — it's something I never would have discovered on my own.`,
    keyVocabulary: [
      'eclectic (эклектичный / разнообразный)',
      'serve different purposes (служат разным целям)',
      'almost exclusively (почти исключительно)',
      'gravitated towards (тяготел к)',
      'developed an appreciation for (обрёл вкус к)',
    ],
    tips: [
      'Answer both parts of the question: current taste AND how it has changed',
      'Give specific examples of artists or genres',
      'Explain what you use different music for — studying, commuting, relaxing',
      'Show how your taste evolved with a personal story',
    ],
  },

  // 10 — Travel
  {
    id: 'sp1-10-travel',
    topic: 'Travel',
    question: 'Do you enjoy travelling? Where was the last place you visited?',
    sampleAnswer: `Yes, I absolutely love travelling, though I don't get to do it as often as I'd like due to budget constraints. The last place I visited was Turkistan, which is a historic city in southern Kazakhstan. I went there about three months ago with a couple of university friends. The main attraction is the Mausoleum of Khoja Ahmed Yasawi, which is a UNESCO World Heritage Site. It was built in the fourteenth century and it's an absolutely stunning piece of Islamic architecture. What struck me most was how well-preserved it is — and the intricate tile work on the facade was genuinely breathtaking. It made me realise how much of my own country I haven't seen yet. I think domestic travel is often underrated — people dream of going to Paris or Tokyo but overlook incredible sites in their own country.`,
    keyVocabulary: [
      'budget constraints (бюджетные ограничения)',
      'UNESCO World Heritage Site (объект Всемирного наследия ЮНЕСКО)',
      'intricate tile work (замысловатая изразцовая работа)',
      'genuinely breathtaking (поистине захватывающий)',
      'domestic travel is underrated (внутренний туризм недооценён)',
    ],
    tips: [
      'Give a specific recent example rather than speaking generally',
      'Include sensory details and personal reactions',
      'End with a broader reflection or opinion',
      'Use past tenses accurately: "I went", "it was", "what struck me was"',
    ],
  },

  // 11 — Family
  {
    id: 'sp1-11-family',
    topic: 'Family',
    question: 'Can you tell me about your family?',
    sampleAnswer: `I come from a fairly typical Kazakh family. There are five of us: my parents, my older sister, my younger brother, and myself. My father works as an engineer at an oil company, and my mother is a secondary school teacher — she teaches mathematics. My older sister graduated from university two years ago and now works in banking in Almaty. My younger brother is still in school — he's fourteen and absolutely mad about video games and football. We're quite a close family, though we don't all live together anymore since my sister and I have both moved away for work and studies. We try to get together for holidays, especially Nauryz and New Year. Family is extremely important in Kazakh culture, and I'd say that's reflected in my own life — I call my parents almost every day.`,
    keyVocabulary: [
      'fairly typical (довольно типичная)',
      'absolutely mad about (без ума от)',
      'a close family (дружная семья)',
      'get together for holidays (собираться на праздники)',
      'reflected in my own life (отражается в моей жизни)',
    ],
    tips: [
      'Give a brief overview of family members, then add interesting details',
      'Don\'t just list people — describe relationships and personalities',
      'Connect to cultural context where relevant',
      'Use natural informal phrases: "mad about", "get together"',
    ],
  },

  // 12 — Daily Routine
  {
    id: 'sp1-12-routine',
    topic: 'Daily Routine',
    question: 'Can you describe a typical day for you?',
    sampleAnswer: `On a typical weekday, I wake up at about seven and usually start the day with a quick exercise routine — just fifteen to twenty minutes of stretching and bodyweight exercises. Then I have breakfast, which is usually something simple like porridge or toast with tea. I leave for university at about eight thirty, and classes generally run from nine until about two in the afternoon. After classes, I usually go to the library to study for a couple of hours. I find it much easier to concentrate there than at home. I get back to my flat around five or six, cook dinner, and then either continue studying or work on my translation projects. In the evening, I try to read for about thirty minutes before bed — currently I'm reading a book about behavioural economics. I usually fall asleep around midnight. It's not the most exciting routine, but I find that having structure helps me stay productive.`,
    keyVocabulary: [
      'exercise routine (комплекс упражнений)',
      'bodyweight exercises (упражнения с собственным весом)',
      'a couple of hours (пару часов)',
      'having structure (иметь структуру / распорядок)',
      'stay productive (оставаться продуктивным)',
    ],
    tips: [
      'Use time markers to structure your answer: "at about seven", "around five or six"',
      'Include a mix of activities: study, exercise, leisure',
      'Add a personal reflection at the end',
      'Use present simple for habitual actions: "I wake up", "I usually go"',
    ],
  },

  // 13 — Shopping
  {
    id: 'sp1-13-shopping',
    topic: 'Shopping',
    question: 'Do you enjoy shopping? Do you prefer shopping online or in physical stores?',
    sampleAnswer: `To be perfectly honest, I'm not really a fan of shopping. I tend to see it more as a necessity than a pleasure. When I do need to buy something, I much prefer shopping online. I find it far more convenient — you can compare prices easily, read reviews from other customers, and have things delivered to your door. I do most of my shopping through Kaspi, which is a very popular platform in Kazakhstan, and occasionally through international sites for things I can't find locally. The only exception is food — I prefer to buy food in person at the local bazaar because I like to see the quality before I buy, and the experience of walking through a traditional market is actually quite enjoyable. But for clothes, electronics, and books, online shopping is my definite preference.`,
    keyVocabulary: [
      'a necessity rather than a pleasure (необходимость, а не удовольствие)',
      'compare prices (сравнивать цены)',
      'delivered to your door (доставлено до двери)',
      'the only exception (единственное исключение)',
      'definite preference (однозначное предпочтение)',
    ],
    tips: [
      'It\'s fine to say you don\'t enjoy something — honesty sounds natural',
      'Compare the two options and explain your reasoning',
      'Mention specific platforms or shops to add authenticity',
      'Use contrast phrases: "the only exception", "but for..."',
    ],
  },

  // 14 — Reading
  {
    id: 'sp1-14-reading',
    topic: 'Reading',
    question: 'Do you like reading? What kinds of books do you prefer?',
    sampleAnswer: `Yes, I really enjoy reading, and I'd say it's one of my most consistent habits. I mostly read non-fiction — books about psychology, economics, and history. I find them intellectually stimulating and I like the feeling of learning something concrete that I can apply to my own life. My favourite book in recent years was "Sapiens" by Yuval Noah Harari, which completely changed the way I think about human history and civilisation. I do occasionally read fiction as well — I went through a phase of reading Russian literary classics like Dostoevsky and Tolstoy, which I found brilliant but quite demanding. These days, I read on my Kindle most of the time. I was resistant to e-readers at first, but the convenience won me over — being able to carry hundreds of books in my bag is incredibly practical.`,
    keyVocabulary: [
      'consistent habit (постоянная привычка)',
      'intellectually stimulating (интеллектуально стимулирующий)',
      'something concrete (нечто конкретное)',
      'went through a phase (прошёл через период)',
      'the convenience won me over (удобство меня убедило)',
    ],
    tips: [
      'Mention specific titles and authors to demonstrate genuine interest',
      'Use a range of adjectives: "stimulating", "demanding", "practical"',
      'Show how your reading habits have evolved',
      'Include both what you read AND how you read (format, when, where)',
    ],
  },

  // 15 — Future Plans
  {
    id: 'sp1-15-future',
    topic: 'Future Plans',
    question: 'What are your plans for the future? Where do you see yourself in five years?',
    sampleAnswer: `In the short term, my main goal is to achieve a high IELTS score — ideally 7.5 or above — so that I can apply for a master's programme abroad. I'm particularly interested in studying in the UK or the Netherlands, as both countries have excellent programmes in my field. In five years, I hope to have completed my master's degree and gained some international work experience — perhaps at an international organisation like the UN or in the private sector. Ultimately, I'd like to return to Kazakhstan and contribute to the country's development in some meaningful way. I'm not entirely sure what exact form that will take yet — perhaps working in policy, perhaps in education — but I feel strongly about giving back to my country. Of course, plans don't always work out exactly as you imagine, so I try to stay flexible while keeping the overall direction clear.`,
    keyVocabulary: [
      'in the short term (в краткосрочной перспективе)',
      'international work experience (международный опыт работы)',
      'contribute to the country\'s development (внести вклад в развитие страны)',
      'giving back (отдавать долг / возвращать)',
      'stay flexible (оставаться гибким)',
    ],
    tips: [
      'Structure your answer: short-term, then long-term goals',
      'Be specific about timelines and targets where possible',
      'Show awareness that plans may change — this sounds mature',
      'Use future forms correctly: "I hope to have completed", "I\'d like to"',
    ],
  },
]

// ════════════════════════════════════════════════════════════════════════════
// 7. SPEAKING PART 3 — Discussion Questions (15 questions)
// ════════════════════════════════════════════════════════════════════════════

export const IELTS_SPEAKING_PART3: IeltsSpeakingPart3Question[] = [
  // 1 — Related to Hometown (Part 2 card 1)
  {
    id: 'sp3-1-urbanization',
    topic: 'Urbanization & Hometown',
    question: 'Why do you think so many young people leave their hometowns to move to bigger cities?',
    modelAnswer: `I think there are several interconnected reasons for this trend. The most obvious one is economic opportunity — larger cities tend to offer a wider range of jobs, higher salaries, and better career prospects, particularly in industries like technology, finance, and the creative arts that simply don't exist in smaller towns. There's also an educational factor: the best universities are overwhelmingly concentrated in major cities, so young people often move to study and then stay because they've built a social network there.

Beyond economics, I think there's a cultural pull as well. Cities offer a lifestyle that appeals to young people — more entertainment options, greater diversity, a sense of anonymity and freedom that you might not have in a small community where everyone knows your business. In Kazakhstan specifically, I've noticed that many young people from rural areas feel that moving to Almaty or Astana is almost a rite of passage — a necessary step towards building an independent adult identity.

However, I think it's worth noting that this migration creates significant problems for the places people leave behind. Rural depopulation leads to declining services, closed schools, and an ageing population. So while the individual decision to move makes sense, the collective effect can be quite destructive.`,
    discussionPoints: [
      'Economic opportunities: jobs, salaries, career growth',
      'Educational concentration in major cities',
      'Cultural and lifestyle appeal: entertainment, diversity, anonymity',
      'Social migration as a "rite of passage" in some cultures',
      'Negative consequences: rural depopulation, declining services',
      'Tension between individual benefit and collective harm',
    ],
  },

  // 2 — Related to Technology (Part 2 card 2)
  {
    id: 'sp3-2-technology-dependence',
    topic: 'Technology & Society',
    question: 'Do you think society has become too dependent on technology?',
    modelAnswer: `This is a nuanced question, and I don't think the answer is a simple yes or no. On one hand, our dependence on technology is undeniable. Most people would struggle to navigate, communicate, or even manage their finances without a smartphone. During the pandemic, we saw just how reliant we had become — when internet connections failed, people couldn't work, study, or even access healthcare.

However, I would argue that dependence isn't necessarily a bad thing in itself. We are also "dependent" on electricity, running water, and modern medicine, and nobody would seriously suggest we should give those up. The real issue, in my view, is not dependence but rather the quality of that dependence. Are we using technology to enhance our capabilities and solve real problems? Or are we using it passively — scrolling through social media, consuming algorithmically curated content that narrows our thinking?

I think the greatest risk is what some psychologists call "cognitive offloading" — the tendency to stop memorising information or thinking critically because we know we can just Google the answer. If we outsource too much of our thinking to machines, we may gradually lose the very cognitive skills that make us effective thinkers. So the question isn't whether we should use technology, but whether we're using it wisely.`,
    discussionPoints: [
      'Undeniable dependence: communication, navigation, finance',
      'Pandemic exposed depth of reliance',
      'Dependence is not inherently negative (analogy with electricity, medicine)',
      'Distinction between active and passive technology use',
      'Cognitive offloading and the erosion of thinking skills',
      'Key issue: using technology wisely versus passively consuming',
    ],
  },

  // 3 — Related to Education (Part 2 card 3)
  {
    id: 'sp3-3-education-system',
    topic: 'Education Reform',
    question: 'How do you think the education system should change to better prepare students for the modern world?',
    modelAnswer: `I believe education systems in many countries, including Kazakhstan, are still largely based on a nineteenth-century model that prioritises memorisation and standardised testing over the skills that are actually needed in the twenty-first century. The most important change, in my opinion, would be to place far greater emphasis on critical thinking, problem-solving, and creativity.

Currently, many students are rewarded for reproducing information rather than for analysing it. But in a world where information is freely available online, the ability to memorise facts is far less valuable than the ability to evaluate sources, construct arguments, and think independently. I think schools should also integrate digital literacy and financial literacy into the core curriculum — these are essential life skills that most young people currently learn informally, if at all.

Another change I'd advocate for is a greater focus on collaborative learning and project-based work. In the real workplace, people rarely work alone on standardised tasks — they work in teams on complex, open-ended problems. If schools replicated this more closely, graduates would be much better prepared.

That said, I recognise that reforming education is enormously difficult in practice. Teachers need training, curricula need to be redesigned, and there is always political resistance to change. But the direction of reform seems clear — the question is whether governments have the courage to implement it.`,
    discussionPoints: [
      'Current systems prioritise memorisation over critical thinking',
      'Information is freely available — evaluation skills matter more',
      'Digital and financial literacy as core curriculum subjects',
      'Collaborative learning and project-based work',
      'Gap between education and workplace requirements',
      'Practical barriers to reform: teacher training, political will',
    ],
  },

  // 4 — Related to Travel (Part 2 card 4)
  {
    id: 'sp3-4-tourism-impact',
    topic: 'Tourism & Culture',
    question: 'What impact does mass tourism have on local cultures and communities?',
    modelAnswer: `Mass tourism is a double-edged sword. On the positive side, it brings substantial economic benefits — jobs, investment, infrastructure development, and foreign currency. For many developing countries and small communities, tourism is the primary source of income. It can also promote cultural exchange and increase international understanding.

However, the negative impacts are significant and often underestimated. When a place becomes a popular tourist destination, the local culture can become commodified — traditional practices are performed for tourists rather than for their original cultural purpose, turning living traditions into a kind of spectacle. This is sometimes called "cultural museumification."

There's also the problem of overtourism, which we've seen in cities like Venice, Barcelona, and Dubrovnik. When visitor numbers overwhelm a place, it drives up housing costs, forces out local residents, and can cause significant environmental damage. Venice, for example, has seen its permanent population decline from approximately 175,000 in the 1950s to under 50,000 today, largely because the city has been transformed into what is essentially an open-air theme park.

I think the solution lies in sustainable and regulated tourism — limiting visitor numbers, ensuring that tourism revenue benefits local communities rather than just international hotel chains, and encouraging tourists to engage meaningfully with local culture rather than simply consuming it.`,
    discussionPoints: [
      'Economic benefits: jobs, investment, infrastructure',
      'Cultural commodification: traditions as spectacle',
      'Overtourism: Venice, Barcelona as cautionary examples',
      'Housing price inflation driving out local residents',
      'Environmental damage from excessive visitor numbers',
      'Solutions: sustainable tourism, visitor limits, local revenue sharing',
    ],
  },

  // 5 — Related to Hobbies/Leisure (Part 2 card 5)
  {
    id: 'sp3-5-work-life-balance',
    topic: 'Work-Life Balance',
    question: 'Do you think people today have enough leisure time? How important is work-life balance?',
    modelAnswer: `I think this varies enormously depending on where you live and what kind of work you do. In many developed countries, people actually work fewer hours than their grandparents did, but paradoxically they often feel busier. Part of this is because technology has blurred the boundary between work and personal life — emails and messages follow us everywhere, and there's an expectation that we should be constantly available.

In countries like Kazakhstan, where economic conditions often require people to work long hours or hold multiple jobs, the situation is different. Leisure time is genuinely scarce for many working-class families, and the concept of "work-life balance" can feel like a luxury.

I believe work-life balance is extremely important — not just for individual well-being but for productivity as well. Research consistently shows that overworked employees are less creative, make more errors, and are more likely to burn out. Countries with shorter working hours, like Denmark and the Netherlands, consistently rank among the happiest and most productive in the world.

The challenge is cultural as much as structural. In many societies, there's a deeply ingrained belief that long working hours are a sign of dedication and commitment. Changing that mindset requires both policy changes — such as enforcing maximum working hours and guaranteeing paid leave — and a broader cultural shift towards valuing quality of life over mere productivity.`,
    discussionPoints: [
      'Technology blurring work-life boundaries',
      'Paradox: fewer hours but feeling busier',
      'Economic inequality in access to leisure time',
      'Research linking shorter hours to higher productivity',
      'Cultural glorification of overwork',
      'Policy solutions: working hour limits, guaranteed paid leave',
    ],
  },

  // 6 — Related to Admiration (Part 2 card 6)
  {
    id: 'sp3-6-role-models',
    topic: 'Role Models & Fame',
    question: 'Do you think celebrities and social media influencers are good role models for young people?',
    modelAnswer: `This is a question that deserves a careful answer, because the situation is more complex than it might appear. Some celebrities are genuinely excellent role models — people who have achieved success through talent, hard work, and perseverance, and who use their platform to advocate for important causes. I'm thinking of figures like Malala Yousafzai or Marcus Rashford, who have used their public profiles to fight for education and against child poverty respectively.

However, many social media influencers promote a lifestyle that is fundamentally misleading. The curated, filtered images of luxury, beauty, and effortless success that dominate platforms like Instagram create unrealistic expectations. Research has consistently linked heavy social media use among teenagers to increased rates of anxiety, depression, and body dissatisfaction. When young people compare their ordinary lives to the artificially perfect lives they see online, the psychological impact can be significant.

I think the fundamental problem is that fame and influence have become disconnected from genuine achievement. In the past, role models were typically people who had accomplished something extraordinary — scientists, athletes, activists. Today, it is possible to become famous simply for being famous, and the values promoted are often superficial: appearance, wealth, and consumption.

The responsibility lies partly with parents and educators to help young people develop media literacy and critical thinking, so they can distinguish between genuine inspiration and manufactured image.`,
    discussionPoints: [
      'Some celebrities are genuinely positive role models (Malala, Rashford)',
      'Social media influencers often promote misleading lifestyles',
      'Research linking social media to anxiety and body dissatisfaction',
      'Fame disconnected from genuine achievement',
      'Superficial values: appearance, wealth, consumption',
      'Need for media literacy education among young people',
    ],
  },

  // 7 — Related to Books/Movies (Part 2 card 7)
  {
    id: 'sp3-7-reading-decline',
    topic: 'Reading & Media Consumption',
    question: 'Do you think reading books is becoming less important in the age of digital media?',
    modelAnswer: `I would argue that reading books is actually becoming more important, not less — precisely because digital media tends to encourage shallow, fragmented thinking, while books demand sustained attention and deep engagement. In a world where most information is consumed in short bursts — a tweet, a headline, a thirty-second video — the ability to concentrate on a long, complex text for hours is becoming an increasingly rare and valuable skill.

That said, I think we need to be honest about the fact that reading habits are changing. People do read less long-form content than they used to, particularly among younger generations. The average attention span appears to be declining, and many students struggle to read an entire book when they're accustomed to the instant gratification of social media.

However, I don't think the issue is really books versus screens. The format matters less than the quality of what's being read. Reading a thoughtful, well-researched article online is probably more beneficial than reading a poorly written novel. What concerns me is not the medium but the depth — are people engaging with complex ideas, or are they only consuming content that confirms their existing views and requires no intellectual effort?

I think the solution is not to force people to read books for the sake of it, but to cultivate a culture that values thoughtful, sustained engagement with ideas — whether that happens through books, long-form journalism, podcasts, or documentaries.`,
    discussionPoints: [
      'Books demand sustained attention versus fragmented digital consumption',
      'Reading as a rare and increasingly valuable cognitive skill',
      'Declining attention spans and changing reading habits',
      'Quality of content matters more than format (print vs. digital)',
      'Risk of shallow consumption that confirms existing views',
      'Cultivating a culture of deep engagement with ideas',
    ],
  },

  // 8 — Related to Environment (Part 2 card 8)
  {
    id: 'sp3-8-individual-vs-government',
    topic: 'Environmental Responsibility',
    question: 'Should individuals or governments bear the primary responsibility for protecting the environment?',
    modelAnswer: `I think both have important roles to play, but if I had to choose, I would argue that governments bear the primary responsibility. The reason is simple: the scale of environmental problems like climate change, deforestation, and ocean pollution is so vast that individual actions, while admirable, are insufficient on their own.

Consider the numbers. Just one hundred companies are responsible for approximately seventy-one percent of global greenhouse gas emissions. An individual recycling their plastic bottles or taking shorter showers, while commendable, cannot offset the environmental damage caused by industrial-scale pollution. This is where government intervention becomes essential — through regulation, taxation, and investment in clean technology.

However, this does not mean individuals are off the hook. Individual choices do matter, especially in aggregate. Consumer demand drives corporate behaviour. If millions of people choose to buy sustainable products, reduce their meat consumption, or switch to renewable energy providers, companies will respond. The problem is that individual change alone is too slow and too unevenly distributed to solve the crisis in the time we have available.

I think the most effective approach combines both: governments set the rules and create the incentives — carbon taxes, emissions standards, subsidies for renewables — while individuals make conscious choices within that framework. Placing all responsibility on individuals risks letting the biggest polluters escape accountability, while expecting governments to solve everything without public support is equally unrealistic.`,
    discussionPoints: [
      'Scale of environmental problems exceeds individual capacity',
      '100 companies responsible for 71% of emissions — systemic issue',
      'Government tools: regulation, taxation, investment',
      'Individual choices matter in aggregate through consumer demand',
      'Individual action alone is too slow and uneven',
      'Most effective approach: combined government rules + individual conscious choices',
    ],
  },

  // 9 — Related to Celebrations (Part 2 card 9)
  {
    id: 'sp3-9-traditions-modernity',
    topic: 'Traditions & Modernity',
    question: 'Do you think traditional customs and festivals are losing their significance in the modern world?',
    modelAnswer: `I think the relationship between tradition and modernity is more complex than a simple narrative of decline. Some traditional customs are certainly fading — particularly those that are tied to agricultural cycles or religious practices that fewer people observe. But others are evolving, adapting to modern contexts, and in some cases becoming even more significant.

In Kazakhstan, for example, Nauryz has arguably grown in importance since independence in 1991. It was suppressed during the Soviet era, and its revival has become part of a broader project of national identity-building. Today, it is celebrated more widely and more enthusiastically than ever before. So rather than disappearing, the tradition has been reinvented for a new context.

What I do observe, however, is that the meaning of celebrations is changing. Many festivals are becoming increasingly commercialised — Christmas in Western countries being the most obvious example — where the focus shifts from community, spirituality, and family to consumption and spending. When the original meaning of a celebration is hollowed out and replaced by commercial activity, I think something valuable is lost.

I believe the challenge for modern societies is to maintain the emotional and communal core of their traditions while allowing the forms to evolve naturally. Traditions that are preserved artificially, like museum exhibits, tend to feel hollow. The ones that survive are those that continue to serve a genuine social or emotional function — connecting people to their community, their history, and to each other.`,
    discussionPoints: [
      'Some traditions fade, others evolve and adapt',
      'Post-independence revival of traditions (Nauryz example)',
      'Commercialisation hollowing out the meaning of celebrations',
      'Distinction between the form and the core meaning of traditions',
      'Artificially preserved traditions feel hollow',
      'Surviving traditions serve genuine social or emotional functions',
    ],
  },

  // 10 — Related to Childhood (Part 2 card 10)
  {
    id: 'sp3-10-modern-childhood',
    topic: 'Modern Childhood',
    question: 'How has childhood changed compared to previous generations, and is the change positive or negative?',
    modelAnswer: `Childhood has changed dramatically in several key respects. The most obvious change is the role of technology. Children today grow up immersed in digital environments from a very early age — many toddlers can navigate a tablet before they can read. They have access to virtually unlimited information and entertainment, which previous generations could not have imagined.

The second major change is in the structure of childhood itself. In previous generations, children had significantly more unstructured free time — they played outside unsupervised, invented games, and navigated social situations independently. Today, children's lives are far more structured and supervised, with packed schedules of academic tutoring, extracurricular activities, and organised sports. Some developmental psychologists argue that this loss of free play has negative consequences for creativity, resilience, and social skills.

Whether these changes are positive or negative depends on what we value. In terms of safety, education, and access to information, today's children are undoubtedly better off. Child mortality has plummeted, educational access has expanded, and children are generally more aware of the wider world.

However, there are genuine concerns about mental health. Rates of anxiety, depression, and loneliness among children and adolescents have risen significantly in many countries. Whether this is caused by technology, academic pressure, reduced free play, or some combination of all three is still debated. But the trend itself is worrying.

My own view is that neither generation had it perfectly right. The key is to combine the best elements of both: the safety and educational resources of the modern era with the freedom, independence, and outdoor play that characterised earlier childhoods.`,
    discussionPoints: [
      'Technology immersion from an early age',
      'Loss of unstructured free time and unsupervised play',
      'Overly structured schedules: tutoring, activities, organised sports',
      'Improvements: safety, education, access to information',
      'Rising mental health concerns among children and adolescents',
      'Ideal approach combines modern resources with traditional freedom',
    ],
  },

  // 11 — Related to Future Plans (Part 2 card 11)
  {
    id: 'sp3-11-career-expectations',
    topic: 'Career & Ambition',
    question: 'Do you think young people today have realistic expectations about their careers?',
    modelAnswer: `I think many young people have a somewhat distorted view of what career success looks like, and I'd argue that social media is largely responsible for this. Platforms like Instagram and TikTok are filled with stories of young entrepreneurs who built million-dollar businesses, influencers who earn enormous sums seemingly effortlessly, and the general narrative that if you just "follow your passion," success will follow. The reality, of course, is far more mundane — most successful careers are built gradually through years of consistent, often unglamorous work.

At the same time, I think it would be unfair to blame young people entirely. The economic landscape has genuinely changed. In my parents' generation, the path was relatively clear: get a degree, find a stable job, stay there for decades. Today, many traditional career paths have been disrupted by technology and globalisation. Graduates often face significant debt, a competitive job market, and the knowledge that many of the jobs they're training for may not exist in twenty years.

I think the most realistic approach combines ambition with pragmatism. Young people should absolutely dream big and pursue work they find meaningful, but they should also develop practical, transferable skills — communication, critical thinking, adaptability — that will serve them regardless of how the job market evolves. The people who struggle most are those who have very specific expectations about what their career should look like and are unable to adapt when reality doesn't match their vision.`,
    discussionPoints: [
      'Social media creating distorted views of career success',
      'Narrative of effortless success versus reality of gradual work',
      'Genuine changes in the economic landscape: instability, disruption',
      'Generational shift: from lifelong employment to portfolio careers',
      'Need for transferable skills: adaptability, communication, critical thinking',
      'Balancing ambition with pragmatism and flexibility',
    ],
  },

  // 12 — Related to Food (Part 2 card 12)
  {
    id: 'sp3-12-food-globalisation',
    topic: 'Food & Globalisation',
    question: 'How has globalisation affected the food people eat in your country?',
    modelAnswer: `Globalisation has had a profound impact on food culture in Kazakhstan, and I think the effects are both positive and negative. On the positive side, the variety of food available has expanded enormously. Twenty years ago, the food options in most Kazakh cities were limited to local cuisine and basic Russian dishes. Today, you can find sushi restaurants, Korean barbecue, Italian pizza, and American fast food in any major city. This diversity is generally a good thing — it broadens people's palates and reflects Kazakhstan's growing openness to the world.

However, the rapid spread of Western fast food chains like McDonald's and KFC has had some worrying consequences. Traditional Kazakh cuisine — which is based on meat, dairy, and grain and was designed for the active lifestyle of nomadic people — is being gradually displaced by processed food that is high in sugar, salt, and unhealthy fats. Obesity rates in Kazakhstan have risen significantly in recent decades, and nutritionists attribute this partly to the shift towards Western-style processed food.

There's also a cultural dimension. Food is deeply connected to identity, and when young people prefer hamburgers and pizza to beshbarmak and kuyrdak, something culturally significant is being lost. Some restaurants and food activists in Kazakhstan are now working to reinvent traditional dishes in a modern, appealing format — making them healthier and more visually attractive — which I think is a very promising approach.

Ultimately, I believe the ideal outcome is not to reject globalisation but to use it selectively — embracing the best of international cuisine while preserving and modernising our own culinary traditions.`,
    discussionPoints: [
      'Increased food variety as a positive consequence of globalisation',
      'Spread of Western fast food displacing traditional cuisine',
      'Rising obesity linked to processed food adoption',
      'Cultural significance of food and identity loss',
      'Reinventing traditional dishes in modern formats',
      'Selective globalisation: embracing diversity while preserving traditions',
    ],
  },

  // 13 — Related to Sports (Part 2 card 13)
  {
    id: 'sp3-13-sports-society',
    topic: 'Sports & Society',
    question: 'What role should sports play in society, and do you think professional athletes are overpaid?',
    modelAnswer: `Sports play a multifaceted role in society that goes well beyond entertainment. At the community level, sports promote physical health, teach discipline and teamwork, and provide a sense of belonging. For nations, sporting success can be a source of pride and unity — when a Kazakh athlete wins an Olympic medal, it brings the country together in a way that few other events can.

As for whether professional athletes are overpaid, I think this depends on how you define "overpaid." In a market economy, salaries reflect the revenue someone generates, and top athletes generate enormous sums through ticket sales, broadcasting rights, sponsorship, and merchandise. By that logic, their salaries are simply a reflection of market forces.

However, from a moral perspective, I do find it uncomfortable that a footballer can earn more in a week than a teacher or nurse earns in several years. These professions are arguably far more important to society, yet they are rewarded far less. This discrepancy reflects a broader societal problem: we tend to value entertainment and spectacle over essential public services.

I think the real issue is not athletes' salaries per se but the broader economic system that creates such extreme inequality. Rather than capping athletes' earnings, which would be impractical and arguably unfair, I would argue for better funding of public services and a tax system that ensures the wealthiest members of society — including highly paid athletes — contribute their fair share.`,
    discussionPoints: [
      'Community benefits: health, discipline, teamwork, belonging',
      'National pride and unity through sporting success',
      'Market logic: salaries reflect revenue generated',
      'Moral discomfort: athletes vs. teachers and nurses',
      'Societal tendency to value entertainment over essential services',
      'Systemic solution: better public service funding and progressive taxation',
    ],
  },

  // 14 — Related to Music (Part 2 card 14)
  {
    id: 'sp3-14-music-culture',
    topic: 'Music & Cultural Identity',
    question: 'Do you think globalisation is leading to a loss of musical diversity, or is it creating new forms of music?',
    modelAnswer: `I think globalisation is doing both simultaneously, and the balance depends on where you look. On one hand, the dominance of English-language pop music — particularly American and British artists — means that local musical traditions in many countries are receiving less attention and fewer resources. Young people everywhere are listening to the same global hits, and local musicians often feel pressured to conform to Western pop formats in order to reach a wider audience.

On the other hand, globalisation has also created exciting new musical fusions that would never have existed otherwise. Artists are blending traditional instruments and scales with modern electronic production, creating genres that are genuinely innovative. In Central Asia, for example, there are musicians who combine the dombra — the traditional Kazakh string instrument — with electronic beats, creating something entirely new. K-pop is another fascinating example: it's essentially a fusion of Korean, American, and Japanese musical elements that has become a global phenomenon.

I think the critical factor is whether local musicians have the infrastructure and support to develop their own voice within the global landscape, rather than simply imitating Western trends. Countries that invest in music education, support local music festivals, and provide funding for artists are more likely to produce distinctive, globally competitive music that reflects their own cultural identity.

So I would argue that globalisation is not inherently a threat to musical diversity — but it can become one if local cultures fail to invest in and protect their own musical traditions.`,
    discussionPoints: [
      'Dominance of English-language pop reducing attention to local traditions',
      'Pressure on local musicians to conform to Western formats',
      'New musical fusions: dombra + electronic, K-pop as global fusion',
      'Infrastructure and support for local musicians as the critical factor',
      'Investment in music education and local festivals',
      'Globalisation as opportunity or threat depending on cultural investment',
    ],
  },

  // 15 — Related to Decision-Making (Part 2 card 15)
  {
    id: 'sp3-15-decision-making',
    topic: 'Decision-Making & Modern Life',
    question: 'Some people say that having too many choices makes it harder to make decisions. Do you agree?',
    modelAnswer: `Yes, I largely agree with this view, and it's actually well supported by psychological research. The psychologist Barry Schwartz coined the term "the paradox of choice" to describe the phenomenon whereby an abundance of options leads not to greater satisfaction but to increased anxiety, indecision, and regret. When you have three options, choosing is relatively simple. When you have three hundred, you become paralysed by the fear of making the wrong choice.

This applies to many areas of modern life. Consider something as simple as choosing a streaming service or a restaurant. The sheer volume of options — amplified by review sites, comparison tools, and social media recommendations — can make what should be a simple decision feel overwhelming. And once you've made your choice, you're haunted by the alternatives you didn't choose — what Schwartz calls "opportunity cost."

However, I wouldn't go so far as to say that choice is inherently bad. Having options is fundamentally better than having none — nobody would prefer a Soviet-style economy where the government decides what you can buy. The problem is not choice itself but the absence of effective filtering mechanisms. This is actually where technology can help: algorithms that learn your preferences and narrow down options can reduce decision fatigue significantly.

I think the most effective personal strategy is to adopt what Schwartz calls a "satisficing" approach — setting clear criteria for what you need and choosing the first option that meets those criteria, rather than exhaustively comparing every possible alternative in search of the perfect choice. Perfectionism in decision-making is the enemy of both efficiency and happiness.`,
    discussionPoints: [
      'Paradox of choice: more options lead to more anxiety, not more satisfaction',
      'Decision paralysis from excessive alternatives',
      'Opportunity cost and regret over unchosen options',
      'Choice is better than no choice — Soviet-style economy as counterexample',
      'Technology as filtering mechanism to reduce decision fatigue',
      'Satisficing strategy: "good enough" vs. perfectionism in decisions',
    ],
  },
]
