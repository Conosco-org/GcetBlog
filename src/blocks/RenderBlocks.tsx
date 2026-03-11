import React, { Fragment } from 'react'

import type { Page } from '@/payload-types'

import { ArchiveBlock } from '@/blocks/ArchiveBlock/Component'
import { CallToActionBlock } from '@/blocks/CallToAction/Component'
import { ContentBlock } from '@/blocks/Content/Component'
import { FormBlock } from '@/blocks/Form/Component'
import { MediaBlock } from '@/blocks/MediaBlock/Component'
import { StatsBlockComponent } from '@/blocks/StatsBlock/Component'
import { EventsFeedBlockComponent } from '@/blocks/EventsFeed/Component'
import { TeamGridBlockComponent } from '@/blocks/TeamGrid/Component'
import { CountdownBlockComponent } from '@/blocks/Countdown/Component'
import { GalleryPreviewBlockComponent } from '@/blocks/GalleryPreview/Component'
import { SponsorsBlockComponent } from '@/blocks/Sponsors/Component'
import { TestimonialsBlockComponent } from '@/blocks/Testimonials/Component'
import { ScheduleBlockComponent } from '@/blocks/Schedule/Component'
import { ContactBlockComponent } from '@/blocks/Contact/Component'

const blockComponents = {
  archive: ArchiveBlock,
  content: ContentBlock,
  cta: CallToActionBlock,
  formBlock: FormBlock,
  mediaBlock: MediaBlock,
  statsBlock: StatsBlockComponent,
  eventsFeed: EventsFeedBlockComponent,
  teamGrid: TeamGridBlockComponent,
  countdown: CountdownBlockComponent,
  galleryPreview: GalleryPreviewBlockComponent,
  sponsors: SponsorsBlockComponent,
  testimonials: TestimonialsBlockComponent,
  schedule: ScheduleBlockComponent,
  contact: ContactBlockComponent,
}

export const RenderBlocks: React.FC<{
  blocks: Page['layout'][0][]
}> = (props) => {
  const { blocks } = props

  const hasBlocks = blocks && Array.isArray(blocks) && blocks.length > 0

  if (hasBlocks) {
    return (
      <Fragment>
        {blocks.map((block, index) => {
          const { blockType } = block

          if (blockType && blockType in blockComponents) {
            const Block = blockComponents[blockType]

            if (Block) {
              return (
                <div className="my-16" key={index}>
                  {/* @ts-expect-error there may be some mismatch between the expected types here */}
                  <Block {...block} disableInnerContainer />
                </div>
              )
            }
          }
          return null
        })}
      </Fragment>
    )
  }

  return null
}
