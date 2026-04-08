import EntCourseViewer from '@/components/EntCourseViewer'
import { BIOLOGY_ENT_COURSE } from '@/data/biologyEntCourse'

export default function BiologyEntCourse() {
  return (
    <EntCourseViewer
      courseData={BIOLOGY_ENT_COURSE}
      storageKey="studyhub-biology-ent-progress"
      courseTitle="Биология ЕНТ — Полный курс"
      courseEmoji="🧬"
      courseName="Биология — полный курс ЕНТ"
      moduleCount={7}
      questionCount="~120"
    />
  )
}
