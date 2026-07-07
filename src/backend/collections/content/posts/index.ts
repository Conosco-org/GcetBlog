import type { CollectionConfig } from 'payload'

import {
  BlocksFeature,
  FixedToolbarFeature,
  HeadingFeature,
  HorizontalRuleFeature,
  InlineToolbarFeature,
  lexicalEditor,
} from '@payloadcms/richtext-lexical'

import { publicOrAuthenticated } from '@backend/access/public-or-authenticated'
import { contributorOwn } from '@backend/access/contributor-own'
import { contributorOwnNotPublished } from '@backend/access/contributor-own-not-published'
import { isAdminOrEditor } from '@backend/access/is-admin-or-editor'
import { isAdmin } from '@shared/lib/check-user-role'
import { Banner } from '@backend/blocks/banner/config'
import { Code } from '@backend/blocks/code/config'
import { MediaBlock } from '@backend/blocks/media-block/config'
import { YouTubeEmbed } from '@backend/blocks/youtube-embed/config'
import { InstagramEmbed } from '@backend/blocks/instagram-embed/config'
import { generatePreviewPath } from '@frontend/lib/generate-preview-path'
import { populateAuthors } from './hooks/populateAuthors'
import { revalidateDelete, revalidatePost } from './hooks/revalidatePost'

import {
  MetaDescriptionField,
  MetaImageField,
  OverviewField,
  PreviewField,
} from '@payloadcms/plugin-seo/fields'
import { slugField } from '@backend/fields/slug'

export const Posts: CollectionConfig<'posts'> = {
  slug: 'posts',
  access: {
    create: isAdminOrEditor,
    delete: contributorOwnNotPublished, // Contributors can delete their own unpublished posts, editors/admins can delete all
    read: publicOrAuthenticated,
    update: contributorOwn, // Contributors can update their own posts, editors/admins can update all
  },
  // This config controls what's populated by default when a post is referenced
  // https://payloadcms.com/docs/queries/select#defaultpopulate-collection-config-property
  // Type safe if the collection slug generic is passed to `CollectionConfig` - `CollectionConfig<'posts'>
  defaultPopulate: {
    title: true,
    slug: true,
    categories: true,
    meta: {
      image: true,
      description: true,
    },
  },
  admin: {
    hidden: ({ user }) => isAdmin(user),
    defaultColumns: ['title', 'slug', 'updatedAt'],
    livePreview: {
      url: ({ data, req }) => {
        const path = generatePreviewPath({
          slug: typeof data?.slug === 'string' ? data.slug : '',
          collection: 'posts',
          req,
        })

        return path
      },
    },
    preview: (data, { req }) =>
      generatePreviewPath({
        slug: typeof data?.slug === 'string' ? data.slug : '',
        collection: 'posts',
        req,
      }),
    useAsTitle: 'title',
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
    },
    {
      type: 'tabs',
      tabs: [
        {
          fields: [
            {
              name: 'heroImage',
              type: 'upload',
              relationTo: 'media',
              admin: {
                description: 'Recommended: 1920×1080 (16:9). For portraits, keep faces in top 60% of frame. Compress to <500KB.',
              },
            },
            {
              name: 'content',
              type: 'richText',
              editor: lexicalEditor({
                features: ({ rootFeatures }) => {
                  return [
                    ...rootFeatures,
                    HeadingFeature({ enabledHeadingSizes: ['h1', 'h2', 'h3', 'h4'] }),
                    BlocksFeature({ blocks: [Banner, Code, MediaBlock, YouTubeEmbed, InstagramEmbed] }),
                    FixedToolbarFeature(),
                    InlineToolbarFeature(),
                    HorizontalRuleFeature(),
                  ]
                },
              }),
              label: false,
              required: true,
            },
          ],
          label: 'Content',
        },
        {
          fields: [
            {
              name: 'relatedPosts',
              type: 'relationship',
              admin: {
                position: 'sidebar',
              },
              filterOptions: ({ id }) => {
                return {
                  id: {
                    not_in: [id],
                  },
                }
              },
              hasMany: true,
              relationTo: 'posts',
            },
            {
              name: 'categories',
              type: 'relationship',
              admin: {
                position: 'sidebar',
              },
              hasMany: true,
              relationTo: 'categories',
            },
          ],
          label: 'Meta',
        },
        {
          name: 'meta',
          label: 'SEO',
          fields: [
            OverviewField({
              titlePath: 'title',
              descriptionPath: 'meta.description',
              imagePath: 'meta.image',
            }),
            MetaImageField({
              relationTo: 'media',
            }),

            MetaDescriptionField({}),
            PreviewField({
              // if the `generateUrl` function is configured
              hasGenerateFn: true,

              // field paths to match the target field for data
              titlePath: 'title',
              descriptionPath: 'meta.description',
            }),
          ],
        },
      ],
    },
    {
      name: 'tags',
      type: 'json',
      admin: {
        description: 'Free-form tags (comma-separated). E.g: tech, campus, events',
        position: 'sidebar',
      },
      // Stored as string[] in the database
    },
    {
      name: 'featuredFrom',
      type: 'date',
      admin: {
        date: {
          pickerAppearance: 'dayAndTime',
        },
        position: 'sidebar',
        description: 'Start date for featuring this post (e.g., event start)',
      },
      access: {
        update: ({ req }) => {
          const user = req.user as { role?: string } | undefined
          return user ? ['editor', 'admin'].includes(user.role || '') : false
        },
      },
    },
    {
      name: 'featuredUntil',
      type: 'date',
      admin: {
        date: {
          pickerAppearance: 'dayAndTime',
        },
        position: 'sidebar',
        description: 'End date for featuring this post (e.g., event end)',
      },
      access: {
        update: ({ req }) => {
          const user = req.user as { role?: string } | undefined
          return user ? ['editor', 'admin'].includes(user.role || '') : false
        },
      },
    },
    {
      name: 'voteScore',
      type: 'number',
      defaultValue: 0,
      admin: {
        position: 'sidebar',
        readOnly: true,
        description: 'Calculated vote score (upvotes - downvotes)',
      },
      access: {
        update: () => false, // Only updated programmatically
      },
    },
    {
      name: 'likesCount',
      type: 'number',
      defaultValue: 0,
      admin: {
        position: 'sidebar',
        readOnly: true,
        description: 'Total number of upvotes (likes)',
      },
      access: {
        update: () => false, // Only updated programmatically
      },
    },
    {
      name: 'readTime',
      type: 'number',
      admin: {
        position: 'sidebar',
        readOnly: true,
        description: 'Estimated read time in minutes, auto-calculated',
      },
      access: {
        update: () => false, // Only updated programmatically
      },
    },
    {
      name: 'viewCount',
      type: 'number',
      defaultValue: 0,
      admin: {
        position: 'sidebar',
        readOnly: true,
        description: 'Total page views (denormalized from PageViews)',
      },
      access: {
        update: () => false, // Only updated programmatically
      },
    },
    {
      name: 'commentCount',
      type: 'number',
      defaultValue: 0,
      admin: {
        position: 'sidebar',
        readOnly: true,
        description: 'Total approved comments (denormalized from Comments)',
      },
      access: {
        update: () => false, // Only updated programmatically
      },
    },
    {
      name: 'voteCount',
      type: 'number',
      defaultValue: 0,
      admin: {
        position: 'sidebar',
        readOnly: true,
        description: 'Net votes (upvotes minus downvotes)',
      },
      access: {
        update: () => false, // Only updated programmatically
      },
    },
    {
      name: 'publishedAt',
      type: 'date',
      admin: {
        date: {
          pickerAppearance: 'dayAndTime',
        },
        position: 'sidebar',
      },
      hooks: {
        beforeChange: [
          ({ siblingData, value }) => {
            if (siblingData._status === 'published' && !value) {
              return new Date()
            }
            return value
          },
        ],
      },
    },
    {
      name: 'authors',
      type: 'relationship',
      admin: {
        position: 'sidebar',
      },
      hasMany: true,
      relationTo: 'users',
    },
    // Editorial tracking fields
    {
      name: 'editorFeedbackAt',
      type: 'date',
      admin: {
        position: 'sidebar',
        readOnly: true,
        description: 'When editor last gave feedback',
      },
    },
    {
      name: 'feedbackGivenBy',
      type: 'relationship',
      relationTo: 'users',
      admin: {
        position: 'sidebar',
        readOnly: true,
        description: 'Which editor gave the feedback',
      },
    },
    {
      name: 'submittedForReviewCount',
      type: 'number',
      defaultValue: 0,
      admin: {
        position: 'sidebar',
        readOnly: true,
        description: 'How many times resubmitted — tracks revision cycles',
      },
    },
    {
      name: 'approvedAt',
      type: 'date',
      admin: {
        position: 'sidebar',
        readOnly: true,
      },
    },
    {
      name: 'approvedBy',
      type: 'relationship',
      relationTo: 'users',
      admin: {
        position: 'sidebar',
        readOnly: true,
      },
    },
    {
      name: 'lastEditedAt',
      type: 'date',
      admin: {
        position: 'sidebar',
        readOnly: true,
      },
    },
    {
      name: 'lastEditedBy',
      type: 'relationship',
      relationTo: 'users',
      admin: {
        position: 'sidebar',
        readOnly: true,
      },
    },
    // Soft delete fields
    {
      name: 'isDeleted',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        position: 'sidebar',
        description: 'Soft delete — never hard delete published posts',
      },
    },
    {
      name: 'deletedAt',
      type: 'date',
      admin: {
        position: 'sidebar',
        condition: (data) => data.isDeleted,
        readOnly: true,
      },
    },
    {
      name: 'deletedBy',
      type: 'relationship',
      relationTo: 'users',
      admin: {
        position: 'sidebar',
        condition: (data) => data.isDeleted,
        readOnly: true,
      },
    },
    // This field is only used to populate the user data via the `populateAuthors` hook
    // This is because the `user` collection has access control locked to protect user privacy
    // GraphQL will also not return mutated user data that differs from the underlying schema
    {
      name: 'populatedAuthors',
      type: 'array',
      access: {
        update: () => false,
      },
      admin: {
        disabled: true,
        readOnly: true,
      },
      fields: [
        {
          name: 'id',
          type: 'text',
        },
        {
          name: 'name',
          type: 'text',
        },
      ],
    },
    {
      name: 'editorFeedback',
      type: 'textarea',
      admin: {
        condition: (data) => data._status === 'draft',
        description: 'Feedback from editor for rejected posts',
      },
      access: {
        read: ({ req }) => {
          // Authors can see feedback on their own posts, editors/admins can see all
          const user = req.user as { role: string; id: string } | undefined
          if (!user) return false
          if (['editor', 'admin'].includes(user.role)) return true
          // TODO: Add author check when we have proper author relationships
          return true
        },
        update: ({ req }) => {
          const user = req.user as { role: string } | undefined
          return user ? ['editor', 'admin'].includes(user.role) : false
        },
      },
    },
    {
      name: 'reviewStatus',
      type: 'select',
      defaultValue: 'draft',
      options: [
        {
          label: 'Draft',
          value: 'draft',
        },
        {
          label: 'Pending Review',
          value: 'pending_review',
        },
        {
          label: 'Requesting Changes',
          value: 'requesting_changes',
        },
        {
          label: 'Approved',
          value: 'approved',
        },
        {
          label: 'Rejected',
          value: 'rejected',
        },
      ],
      admin: {
        position: 'sidebar',
        description: 'Current review status of the post',
      },
      access: {
        read: () => true,
        update: ({ req }) => {
          const user = req.user as { role: string } | undefined
          // Only editors and admins can change review status
          return user ? ['editor', 'admin'].includes(user.role) : false
        },
      },
    },
    {
      name: 'submittedForReviewAt',
      type: 'date',
      admin: {
        position: 'sidebar',
        readOnly: true,
        description: 'When the post was submitted for review',
      },
    },
    {
      name: 'archivedStatus',
      type: 'select',
      defaultValue: 'active',
      options: [
        { label: 'Active', value: 'active' },
        { label: 'Archived', value: 'archived' },
        { label: 'Deleted', value: 'deleted' },
      ],
      admin: {
        position: 'sidebar',
        readOnly: true,
        description: 'Lifecycle status for review queue retention.',
      },
    },
    {
      name: 'statusMessage',
      type: 'textarea',
      admin: {
        position: 'sidebar',
        readOnly: true,
        description: 'Contributor-facing lifecycle status message.',
      },
    },
    {
      name: 'postAgeReferenceTimestamp',
      type: 'date',
      admin: {
        position: 'sidebar',
        readOnly: true,
        description: 'Timestamp used by lifecycle automation for age calculations.',
      },
    },
    {
      name: 'archivedAt',
      type: 'date',
      admin: {
        position: 'sidebar',
        readOnly: true,
      },
    },
    {
      name: 'archivedBy',
      type: 'relationship',
      relationTo: 'users',
      admin: {
        position: 'sidebar',
        readOnly: true,
      },
    },
    {
      name: 'archiveReason',
      type: 'select',
      options: [
        { label: 'Automated', value: 'automated' },
        { label: 'Manual', value: 'manual' },
      ],
      admin: {
        position: 'sidebar',
        readOnly: true,
      },
    },
    {
      name: 'lifecycleDeletedAt',
      type: 'date',
      admin: {
        position: 'sidebar',
        readOnly: true,
      },
    },
    {
      name: 'lifecycleDeletedBy',
      type: 'relationship',
      relationTo: 'users',
      admin: {
        position: 'sidebar',
        readOnly: true,
      },
    },
    ...slugField(),
  ],
  hooks: {
    afterChange: [revalidatePost],
    afterRead: [populateAuthors],
    afterDelete: [revalidateDelete],
    beforeChange: [
      // Hook 1: Auto-calculate readTime from content
      async ({ data, operation }) => {
        if (operation === 'create' || operation === 'update') {
          if (data.content) {
            // Strip HTML/Lexical JSON, count words, divide by 200 wpm
            const text = typeof data.content === 'string' 
              ? data.content 
              : JSON.stringify(data.content)
            const wordCount = text.replace(/<[^>]*>/g, '').split(/\s+/).filter(Boolean).length
            data.readTime = Math.max(1, Math.ceil(wordCount / 200))
          }
        }
        return data
      },
      // Hook 2: Track review status transitions
      async ({ data, originalDoc, operation, req }) => {
        if (operation === 'update' && originalDoc) {
          const prevStatus = originalDoc.reviewStatus
          const newStatus = data.reviewStatus

          if (prevStatus !== 'pending_review' && newStatus === 'pending_review') {
            data.submittedForReviewAt = new Date()
            data.submittedForReviewCount = (originalDoc.submittedForReviewCount || 0) + 1
          }

          if (prevStatus !== 'approved' && newStatus === 'approved') {
            data.approvedAt = new Date()
            data.approvedBy = req.user?.id
          }

          if (newStatus === 'draft' && data.editorFeedback) {
            data.editorFeedbackAt = new Date()
            data.feedbackGivenBy = req.user?.id
          }
        }
        return data
      },
      // Hook 3: Track last edit
      async ({ data, req }) => {
        data.lastEditedAt = new Date()
        data.lastEditedBy = req.user?.id
        return data
      },
      // Hook 4: Set publishedAt once on first publish
      async ({ data, originalDoc }) => {
        if (data._status === 'published' && !originalDoc?.publishedAt) {
          data.publishedAt = new Date()
        }
        return data
      },
      // Hook 5: Initialize lifecycle fields for existing and new active posts
      async ({ data, originalDoc, operation }) => {
        if (operation === 'create') {
          data.archivedStatus = data.archivedStatus || 'active'
          data.postAgeReferenceTimestamp = data.postAgeReferenceTimestamp || new Date()
        }

        if (operation === 'update' && originalDoc && !originalDoc.postAgeReferenceTimestamp) {
          data.postAgeReferenceTimestamp = data.postAgeReferenceTimestamp || originalDoc.createdAt || new Date()
        }

        return data
      },
    ],
    beforeValidate: [
      ({ data }) => {
        // Validate meta description length
        if (data?.meta?.description && typeof data.meta.description === 'string') {
          const description = data.meta.description
          if (description.length > 160) {
            throw new Error(`Meta description must be 160 characters or less (currently ${description.length} characters)`)
          }
          // Note: We don't throw for minimum length - just a warning
          if (description.length < 120) {
            // SEO warning - not critical
          }
        }
        return data
      },
    ],
  },
  versions: {
    drafts: {
      autosave: {
        interval: 100, // We set this interval for optimal live preview
      },
      schedulePublish: true,
    },
    maxPerDoc: 50,
  },
}
