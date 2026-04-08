import EntCourseViewer from '@/components/EntCourseViewer'
import { PHYSICS_ENT_COURSE } from '@/data/physicsEntCourse'

export default function PhysicsEntCourse() {
  return (
    <EntCourseViewer
      courseData={PHYSICS_ENT_COURSE}
      storageKey="studyhub-physics-ent-progress"
      courseTitle="Физика ЕНТ — Полный курс"
      courseEmoji="⚡"
      courseName="Физика — полный курс ЕНТ"
      moduleCount={7}
      questionCount="~120"
    />
  )
}
