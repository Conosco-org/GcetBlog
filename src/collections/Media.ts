import type { CollectionConfig } from 'payload'

import {
  FixedToolbarFeature,
  InlineToolbarFeature,
  lexicalEditor,
} from '@payloadcms/richtext-lexical'

import { anyone } from '../access/anyone'
import { editorOnly } from '../access/editorOnly'
import { authenticated } from '../access/authenticated'
import { useCloudinaryFallback } from './Media/hooks/useCloudinaryFallback'
import { uploadToCloudinary } from './Media/hooks/uploadToCloudinary'

export const Media: CollectionConfig = {
  slug: 'media',
  access: {
    create: authenticated, // contributors need to upload featured images
    delete: editorOnly,
    read: anyone,
    update: editorOnly,
  },
  admin: {
    description: '📸 Recommended sizes: Hero 1920×1080 (16:9), Cards 900×600 (3:2), OG 1200×630. Optimize images to <500KB. See IMAGE_GUIDELINES.md for details.',
  },
  hooks: {
    beforeChange: [uploadToCloudinary],
    afterRead: [useCloudinaryFallback],
  },
  fields: [
    {
      name: 'alt',
      type: 'text',
      //required: true,
    },
    {
      name: 'caption',
      type: 'richText',
      editor: lexicalEditor({
        features: ({ rootFeatures }) => {
          return [...rootFeatures, FixedToolbarFeature(), InlineToolbarFeature()]
        },
      }),
    },
    {
      name: 'cloudinaryUrl',
      type: 'text',
      admin: {
        description: 'Cloudinary CDN URL for the uploaded image',
      },
    },
  ],
  upload: {
    disableLocalStorage: true,
    adminThumbnail: 'thumbnail',
    focalPoint: true,
    imageSizes: [
      {
        name: 'thumbnail',
        width: 300,
      },
      {
        name: 'square',
        width: 500,
        height: 500,
      },
      {
        name: 'small',
        width: 600,
      },
      {
        name: 'medium',
        width: 900,
      },
      {
        name: 'large',
        width: 1400,
      },
      {
        name: 'xlarge',
        width: 1920,
      },
      {
        name: 'og',
        width: 1200,
        height: 630,
        crop: 'center',
      },
    ],
  },
}
