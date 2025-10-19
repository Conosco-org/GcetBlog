import type { CollectionConfig } from 'payload'
import { authenticated } from '../../access/authenticated'
import { adminOnly } from '../../access/adminOnly'

export const RoleUpgradeRequests: CollectionConfig = {
  slug: 'role-upgrade-requests',
  access: {
    read: ({ req }) => {
      // Admin can see all, users can see their own
      if (req.user?.role === 'admin') return true
      if (req.user) {
        return { user: { equals: req.user.id } }
      }
      return false
    },
    create: authenticated, // Any authenticated user can request
    update: adminOnly, // Only admin can update status
    delete: adminOnly,
  },
  admin: {
    defaultColumns: ['user', 'requestedRole', 'status', 'createdAt'],
    useAsTitle: 'user',
  },
  fields: [
    {
      name: 'user',
      type: 'relationship',
      relationTo: 'users',
      required: true,
      admin: {
        readOnly: true, // Set by hooks
      },
    },
    {
      name: 'requestedRole',
      type: 'select',
      options: [
        { label: 'Editor', value: 'editor' },
        { label: 'Admin', value: 'admin' },
      ],
      required: true,
    },
    {
      name: 'message',
      type: 'textarea',
      admin: {
        description: 'Explain why you should be granted this role',
      },
    },
    {
      name: 'status',
      type: 'select',
      options: [
        { label: 'Pending', value: 'pending' },
        { label: 'Approved', value: 'approved' },
        { label: 'Rejected', value: 'rejected' },
      ],
      defaultValue: 'pending',
      access: {
        update: ({ req }) => {
          const user = req.user as { role?: string } | undefined
          return user?.role === 'admin'
        },
      },
    },
    {
      name: 'adminNotes',
      type: 'textarea',
      admin: {
        description: 'Internal notes for admin review',
      },
      access: {
        read: ({ req }) => {
          const user = req.user as { role?: string } | undefined
          return user ? ['editor', 'admin'].includes(user.role || '') : false
        },
        update: ({ req }) => {
          const user = req.user as { role?: string } | undefined
          return user?.role === 'admin'
        },
      },
    },
    {
      name: 'processedAt',
      type: 'date',
      admin: {
        readOnly: true,
      },
    },
  ],
  hooks: {
    beforeChange: [
      ({ req, data, operation }) => {
        if (operation === 'create' && req.user) {
          data.user = req.user.id
        }
        if (data.status !== 'pending' && !data.processedAt) {
          data.processedAt = new Date()
        }
      },
    ],
    afterChange: [
      async ({ req, doc, operation, previousDoc }) => {
        // When status changes from pending to approved, update the user's role
        if (
          operation === 'update' &&
          doc.status === 'approved' &&
          previousDoc?.status === 'pending'
        ) {
          try {
            const userId = typeof doc.user === 'object' ? doc.user.id : doc.user
            
            await req.payload.update({
              collection: 'users',
              id: userId,
              data: {
                role: doc.requestedRole,
              },
            })
            
            req.payload.logger.info(`Successfully upgraded user ${userId} to role ${doc.requestedRole}`)
          } catch (error) {
            req.payload.logger.error(`Failed to upgrade user role: ${error}`)
          }
        }
      },
    ],
  },
  timestamps: true,
}
