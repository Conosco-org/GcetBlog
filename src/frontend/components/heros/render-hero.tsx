import React from 'react'

import type { Page } from '@shared/types/payload-types'

import { HighImpactHero } from '@frontend/components/heros/high-impact'
import { LowImpactHero } from '@frontend/components/heros/low-impact'
import { MediumImpactHero } from '@frontend/components/heros/medium-impact'

const heroes = {
  highImpact: HighImpactHero,
  lowImpact: LowImpactHero,
  mediumImpact: MediumImpactHero,
}

export const RenderHero: React.FC<Page['hero']> = (props) => {
  const { type } = props || {}

  if (!type || type === 'none') return null

  const HeroToRender = heroes[type]

  if (!HeroToRender) return null

  return <HeroToRender {...props} />
}
