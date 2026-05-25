import EntCourseViewer from '@/components/EntCourseViewer'
import { MATH_LITERACY_ENT_COURSE } from '@/data/mathLiteracyEntCourse'

export default function MathLiteracyEntCourse() {
  return (
    <EntCourseViewer
      courseData={MATH_LITERACY_ENT_COURSE}
      storageKey="studyhub-math-literacy-ent-progress"
      courseTitle="Математическая грамотность ЕНТ — Полный курс"
      courseEmoji="📊"
      courseName="Математическая грамотность — полный курс ЕНТ"
      moduleCount={7}
      questionCount="~105"
    />
  )
}
