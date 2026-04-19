'use client'

import React from 'react'
import { DepartmentCard } from './DepartmentCard'
import type { DepartmentCardData } from '../types'

export const DepartmentArchive: React.FC<{
  departments: DepartmentCardData[]
}> = ({ departments }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 sm:gap-6">
      {departments.map((dept) => (
        <DepartmentCard key={dept.slug} department={dept} />
      ))}
    </div>
  )
}
