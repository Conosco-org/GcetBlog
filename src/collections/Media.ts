import type { CollectionConfig } from 'payload'

import {
  FixedToolbarFeature,
  InlineToolbarFeature,
  lexicalEditor,
} from '@payloadcms/richtext-lexical'

import { anyone } from '../access/anyone'
import { hasPermission } from '../access/hasPermission'
import { authenticated } from '../access/authenticated'
import { institutionField } from '../fields/institution'
import { useCloudinaryFallback } from './Media/hooks/useCloudinaryFallback'
import { uploadToCloudinary } from './Media/hooks/uploadToCloudinary'
import { withTenantIsolation } from '@/hooks/tenantIsolation'

export const Media: CollectionConfig = {
  slug: 'media',
  access: {
    create: authenticated, // any authenticated user can upload media
    delete: hasPermission('media:delete'),
    read: anyone,
    update: hasPermission('media:upload'),
  },
  admin: {
    description: '📸 Recommended sizes: Hero 1920×1080 (16:9), Cards 900×600 (3:2), OG 1200×630. Optimize images to <500KB. See IMAGE_GUIDELINES.md for details.',
  },
  hooks: withTenantIsolation({
    beforeChange: [
      uploadToCloudinary,
      // Auto-assign institution for non-superadmin users
      ({ data, req }) => {
        if (!data.institution && req.user) {
          const user = req.user as { 
            role?: string
            institution?: string | { id: string }
          }
          
          // Regular users: use their institution
          if (user.role !== 'superadmin' && user.institution) {
            data.institution = typeof user.institution === 'object'
              ? user.institution.id
              : user.institution
          }
        }
        return data
      },
    ],
    afterRead: [useCloudinaryFallback],
  }),
  fields: [
    {
      name: 'institution',
      type: 'relationship',
      relationTo: 'institutions',
      required: false, // Keep optional to allow superadmin platform assets
      admin: {
        position: 'sidebar',
        description: 'Institution this media belongs to. Auto-assigned for regular users.',
        condition: (data, siblingData, { user }) => {
          // Show field for superadmin, hide for others (auto-assigned)
          return user?.role === 'superadmin'
        },
      },
    },
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
    {
      name: 'contextType',
      type: 'select',
      options: [
        { label: 'Post', value: 'post' },
        { label: 'Event', value: 'event' },
        { label: 'Club', value: 'club' },
        { label: 'Page', value: 'page' },
        { label: 'General', value: 'general' },
      ],
      admin: {
        position: 'sidebar',
        description: 'What type of content this media is associated with',
      },
    },
    {
      name: 'contextId',
      type: 'text',
      index: true,
      admin: {
        position: 'sidebar',
        description: 'ID of the associated content item',
      },
    },
    {
      name: 'uploadedBy',
      type: 'relationship',
      relationTo: 'users',
      admin: {
        position: 'sidebar',
        readOnly: true,
        description: 'User who uploaded this media',
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
