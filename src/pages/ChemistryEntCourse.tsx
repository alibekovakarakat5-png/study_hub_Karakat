import EntCourseViewer from '@/components/EntCourseViewer'
import { CHEMISTRY_ENT_COURSE } from '@/data/chemistryEntCourse'

export default function ChemistryEntCourse() {
  return (
    <EntCourseViewer
      courseData={CHEMISTRY_ENT_COURSE}
      storageKey="studyhub-chemistry-ent-progress"
      courseTitle="Химия ЕНТ — Полный курс"
      courseEmoji="🧪"
      courseName="Химия — полный курс ЕНТ"
      moduleCount={7}
      questionCount="~120"
    />
  )
}
