import type { CollectionConfig, Where } from 'payload'
import { isAuthenticated } from '../../access/isAuthenticated'

export const Votes: CollectionConfig = {
  slug: 'votes',
  access: {
    // Anyone can see vote counts (public)
    read: () => true,
    // Only authenticated users can vote
    create: isAuthenticated,
    // Users can only update their own votes
    update: ({ req }) => {
      const user = req.user as { id?: string } | undefined
      if (!user?.id) return false
      return { user: { equals: user.id } } as Where
    },
    // Users can only delete their own votes
    delete: ({ req }) => {
      const user = req.user as { id?: string } | undefined
      if (!user?.id) return false
      return { user: { equals: user.id } } as Where
    },
  },
  admin: {
    defaultColumns: ['post', 'user', 'value', 'createdAt'],
    useAsTitle: 'post',
    hidden: true, // Hide from admin panel - managed via API
  },
  fields: [
    {
      name: 'post',
      type: 'relationship',
      relationTo: 'posts',
      required: true,
      index: true,
    },
    {
      name: 'user',
      type: 'relationship',
      relationTo: 'users',
      required: true,
      index: true,
    },
    {
      name: 'value',
      type: 'number',
      required: true,
      index: true,
      min: -1,
      max: 1,
      validate: (val: number | null | undefined) => {
        if (val === 1 || val === -1) return true
        return 'Vote value must be 1 (upvote) or -1 (downvote)'
      },
    },
    {
      name: 'previousVoteType',
      type: 'select',
      options: [
        { label: 'Upvote', value: 'upvote' },
        { label: 'Downvote', value: 'downvote' },
      ],
      admin: {
        readOnly: true,
        description: 'Previous vote type before change (for tracking)',
      },
    },
  ],
  indexes: [
    {
      fields: ['post', 'user'],
      unique: true,
    },
  ],
  hooks: {
    afterChange: [
      async ({ req, doc, previousDoc, operation }) => {
        const payload = req.payload
        const post = typeof doc.post === 'string' ? doc.post : doc.post?.id
        if (!post) return

        if (operation === 'create') {
          const delta = doc.value === 1 ? 1 : -1
          const currentPost = await payload.findByID({ collection: 'posts', id: post, overrideAccess: true })
          await payload.update({
            collection: 'posts',
            id: post,
            data: { voteCount: (currentPost.voteCount || 0) + delta },
            overrideAccess: true,
          })
        }

        if (operation === 'update' && previousDoc?.value !== doc.value) {
          const delta = doc.value === 1 ? 2 : -2
          const currentPost = await payload.findByID({ collection: 'posts', id: post, overrideAccess: true })
          await payload.update({
            collection: 'posts',
            id: post,
            data: {
              voteCount: (currentPost.voteCount || 0) + delta,
            },
            overrideAccess: true,
          })
        }
      },
    ],
    afterDelete: [
      async ({ req, doc }) => {
        const payload = req.payload
        const post = typeof doc.post === 'string' ? doc.post : doc.post?.id
        if (!post) return
        const delta = doc.value === 1 ? -1 : 1
        const currentPost = await payload.findByID({ collection: 'posts', id: post, overrideAccess: true })
        await payload.update({
          collection: 'posts',
          id: post,
          data: { voteCount: (currentPost.voteCount || 0) + delta },
          overrideAccess: true,
        })
      },
    ],
    beforeChange: [
      // Auto-set the user to the current authenticated user
      ({ req, data, operation }) => {
        if (operation === 'create' && req.user) {
          data.user = (req.user as { id: string }).id
        }
        return data
      },
    ],
    beforeValidate: [
      // Ensure one vote per user per post (upsert behavior)
      async ({ req, data, operation }) => {
        if (operation === 'create' && req.user && data?.post) {
          const userId = (req.user as { id: string }).id
          const existing = await req.payload.find({
            collection: 'votes',
            where: {
              post: { equals: data.post },
              user: { equals: userId },
            },
            limit: 1,
          })

          if (existing.docs.length > 0) {
            // Update existing vote instead of creating a new one
            const existingVote = existing.docs[0]
            if (existingVote) {
              await req.payload.update({
                collection: 'votes',
                id: existingVote.id,
                data: { value: data.value },
              })
              // Throw to prevent duplicate creation
              throw new Error(
                `VOTE_UPDATED:${existingVote.id}:${data.value}`,
              )
            }
          }
        }
        return data
      },
    ],
  },
  timestamps: true,
}
