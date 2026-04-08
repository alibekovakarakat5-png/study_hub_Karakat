import EntCourseViewer from '@/components/EntCourseViewer'
import { ENGLISH_ENT_COURSE } from '@/data/englishEntCourse'

export default function EnglishEntCourse() {
  return (
    <EntCourseViewer
      courseData={ENGLISH_ENT_COURSE}
      storageKey="studyhub-english-ent-progress"
      courseTitle="Английский язык ЕНТ — Полный курс"
      courseEmoji="🇬🇧"
      courseName="Английский язык — полный курс ЕНТ"
      moduleCount={7}
      questionCount="~120"
    />
  )
}
