import type { University, Subject } from '@/types'

export const universities: University[] = [
  {
    id: 'kaznu',
    name: 'Казахский национальный университет им. аль-Фараби',
    city: 'Алматы',
    minScore: 75,
    ranking: 1,
    description: 'Ведущий классический университет Казахстана',
    specialties: [
      { id: 'kaznu-cs', name: 'Информационные системы', code: '6B06101', minScore: 85, subjects: ['math', 'informatics', 'physics'] as Subject[], avgSalary: '450 000 ₸', demand: 'high' },
      { id: 'kaznu-med', name: 'Общая медицина', code: '6B10101', minScore: 90, subjects: ['biology', 'chemistry'] as Subject[], avgSalary: '350 000 ₸', demand: 'high' },
      { id: 'kaznu-law', name: 'Юриспруденция', code: '6B04201', minScore: 80, subjects: ['history', 'russian'] as Subject[], avgSalary: '300 000 ₸', demand: 'medium' },
      { id: 'kaznu-econ', name: 'Экономика', code: '6B04101', minScore: 78, subjects: ['math', 'geography'] as Subject[], avgSalary: '320 000 ₸', demand: 'medium' },
      { id: 'kaznu-phys', name: 'Физика', code: '6B05301', minScore: 72, subjects: ['math', 'physics'] as Subject[], avgSalary: '280 000 ₸', demand: 'medium' },
    ],
  },
  {
    id: 'nu',
    name: 'Назарбаев Университет',
    city: 'Астана',
    minScore: 95,
    ranking: 2,
    description: 'Исследовательский университет мирового класса',
    specialties: [
      { id: 'nu-cs', name: 'Computer Science', code: 'NU-CS', minScore: 95, subjects: ['math', 'informatics', 'physics'] as Subject[], avgSalary: '800 000 ₸', demand: 'high' },
      { id: 'nu-eng', name: 'Engineering', code: 'NU-ENG', minScore: 92, subjects: ['math', 'physics'] as Subject[], avgSalary: '600 000 ₸', demand: 'high' },
      { id: 'nu-bus', name: 'Business Administration', code: 'NU-BUS', minScore: 90, subjects: ['math', 'english'] as Subject[], avgSalary: '550 000 ₸', demand: 'medium' },
    ],
  },
  {
    id: 'satbayev',
    name: 'Казахский национальный технический университет им. Сатпаева',
    city: 'Алматы',
    minScore: 70,
    ranking: 3,
    description: 'Ведущий технический университет Казахстана',
    specialties: [
      { id: 'sat-it', name: 'Информационные технологии', code: '6B06102', minScore: 78, subjects: ['math', 'informatics', 'physics'] as Subject[], avgSalary: '400 000 ₸', demand: 'high' },
      { id: 'sat-oil', name: 'Нефтегазовое дело', code: '6B07201', minScore: 82, subjects: ['math', 'physics', 'chemistry'] as Subject[], avgSalary: '500 000 ₸', demand: 'high' },
      { id: 'sat-arch', name: 'Архитектура', code: '6B07301', minScore: 75, subjects: ['math', 'physics'] as Subject[], avgSalary: '350 000 ₸', demand: 'medium' },
    ],
  },
  {
    id: 'enu',
    name: 'Евразийский национальный университет им. Гумилёва',
    city: 'Астана',
    minScore: 70,
    ranking: 4,
    description: 'Крупнейший университет столицы',
    specialties: [
      { id: 'enu-it', name: 'Вычислительная техника и ПО', code: '6B06103', minScore: 76, subjects: ['math', 'informatics'] as Subject[], avgSalary: '380 000 ₸', demand: 'high' },
      { id: 'enu-ir', name: 'Международные отношения', code: '6B03101', minScore: 82, subjects: ['history', 'english'] as Subject[], avgSalary: '300 000 ₸', demand: 'medium' },
      { id: 'enu-fin', name: 'Финансы', code: '6B04103', minScore: 74, subjects: ['math', 'geography'] as Subject[], avgSalary: '350 000 ₸', demand: 'medium' },
    ],
  },
  {
    id: 'kimep',
    name: 'KIMEP University',
    city: 'Алматы',
    minScore: 72,
    ranking: 5,
    description: 'Ведущий бизнес-университет Центральной Азии',
    specialties: [
      { id: 'kimep-fin', name: 'Финансы и учёт', code: 'KIMEP-FIN', minScore: 78, subjects: ['math', 'english'] as Subject[], avgSalary: '450 000 ₸', demand: 'high' },
      { id: 'kimep-law', name: 'Право', code: 'KIMEP-LAW', minScore: 80, subjects: ['history', 'english'] as Subject[], avgSalary: '400 000 ₸', demand: 'medium' },
      { id: 'kimep-mkt', name: 'Маркетинг', code: 'KIMEP-MKT', minScore: 72, subjects: ['math', 'english'] as Subject[], avgSalary: '350 000 ₸', demand: 'medium' },
    ],
  },
  {
    id: 'kbtu',
    name: 'КБТУ',
    city: 'Алматы',
    minScore: 75,
    ranking: 6,
    description: 'Казахстанско-Британский технический университет',
    specialties: [
      { id: 'kbtu-se', name: 'Software Engineering', code: 'KBTU-SE', minScore: 82, subjects: ['math', 'informatics', 'physics'] as Subject[], avgSalary: '550 000 ₸', demand: 'high' },
      { id: 'kbtu-ds', name: 'Data Science', code: 'KBTU-DS', minScore: 80, subjects: ['math', 'informatics'] as Subject[], avgSalary: '500 000 ₸', demand: 'high' },
      { id: 'kbtu-pe', name: 'Petroleum Engineering', code: 'KBTU-PE', minScore: 78, subjects: ['math', 'physics', 'chemistry'] as Subject[], avgSalary: '600 000 ₸', demand: 'medium' },
    ],
  },
]

export function findUniversityById(id: string): University | undefined {
  return universities.find(u => u.id === id)
}

export function getSpecialtiesBySubjects(subjects: Subject[]): { university: University; specialty: typeof universities[0]['specialties'][0] }[] {
  const results: { university: University; specialty: typeof universities[0]['specialties'][0] }[] = []
  for (const uni of universities) {
    for (const spec of uni.specialties) {
      const match = spec.subjects.some(s => subjects.includes(s))
      if (match) {
        results.push({ university: uni, specialty: spec })
      }
    }
  }
  return results.sort((a, b) => a.specialty.minScore - b.specialty.minScore)
}
