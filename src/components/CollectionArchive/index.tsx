import { cn } from '@/utilities/ui'
import React from 'react'

import { Card, CardPostData } from '@/components/Card'

export type Props = {
  posts: CardPostData[]
}

export const CollectionArchive: React.FC<Props> = (props) => {
  const { posts } = props

  return (
    <div className={cn('container px-5 sm:px-6')}>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
        {posts?.map((result, index) => {
          if (typeof result === 'object' && result !== null) {
            return (
              <div key={index} className={cn('animate-fade-up', `stagger-${Math.min(index + 1, 8)}`)}>
                <Card className="h-full" doc={result} relationTo="posts" showCategories />
              </div>
            )
          }

          return null
        })}
      </div>
    </div>
  )
}
