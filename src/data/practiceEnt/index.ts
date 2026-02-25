import type { ProfileQuestionBank } from '@/types/practiceEnt'

export { examVariants } from './mandatory'
export { mathProfileBank } from './profileMath'
export { physicsProfileBank } from './profilePhysics'
export { chemistryProfileBank } from './profileChemistry'
export { biologyProfileBank } from './profileBiology'
export { englishProfileBank } from './profileEnglish'
export { geographyProfileBank } from './profileGeography'
export { informaticsProfileBank } from './profileInformatics'

import { mathProfileBank } from './profileMath'
import { physicsProfileBank } from './profilePhysics'
import { chemistryProfileBank } from './profileChemistry'
import { biologyProfileBank } from './profileBiology'
import { englishProfileBank } from './profileEnglish'
import { geographyProfileBank } from './profileGeography'
import { informaticsProfileBank } from './profileInformatics'

export const profileBanks: ProfileQuestionBank[] = [
  mathProfileBank,
  physicsProfileBank,
  chemistryProfileBank,
  biologyProfileBank,
  englishProfileBank,
  geographyProfileBank,
  informaticsProfileBank,
]
