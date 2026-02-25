// This file combines all subject content into a single export
// Individual subject files contain the detailed topic content

import type { TopicContent } from '@/types/curator'
import { mathTopics } from './math'
import { historyTopics } from './history'
import { physicsTopics } from './physics'
import { englishTopics } from './english'
import { chemistryTopics } from './chemistry'
import { biologyTopics } from './biology'

export const allCuratorContent: TopicContent[] = [
  ...mathTopics,
  ...historyTopics,
  ...physicsTopics,
  ...englishTopics,
  ...chemistryTopics,
  ...biologyTopics,
]

export {
  mathTopics,
  historyTopics,
  physicsTopics,
  englishTopics,
  chemistryTopics,
  biologyTopics,
}
