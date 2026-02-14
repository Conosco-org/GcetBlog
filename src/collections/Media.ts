import type { CollectionConfig } from 'payload'

import {
  FixedToolbarFeature,
  InlineToolbarFeature,
  lexicalEditor,
} from '@payloadcms/richtext-lexical'
import path from 'path'
import { fileURLToPath } from 'url'

import { anyone } from '../access/anyone'
import { editorOnly } from '../access/editorOnly'
import { useCloudinaryFallback } from './Media/hooks/useCloudinaryFallback'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export const Media: CollectionConfig = {
  slug: 'media',
  access: {
    create: editorOnly,
    delete: editorOnly,
    read: anyone,
    update: editorOnly,
  },
  admin: {
    description: '📸 Recommended sizes: Hero 1920×1080 (16:9), Cards 900×600 (3:2), OG 1200×630. Optimize images to <500KB. See IMAGE_GUIDELINES.md for details.',
  },
  hooks: {
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
    // Note: disableLocalStorage requires a storage adapter plugin
    // Using default storage with afterRead hook for Cloudinary fallback
    staticDir: path.resolve(dirname, '../../public/media'),
    adminThumbnail: 'thumbnail',
    focalPoint: true,
    // disableLocalStorage: true, // Commented out - requires storage adapter plugin
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
