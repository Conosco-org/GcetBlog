import type { CollectionConfig } from 'payload'

import { authenticated } from '../access/authenticated'

export const Feedback: CollectionConfig = {
  slug: 'feedback',
  access: {
    create: authenticated,
    delete: authenticated,
    read: authenticated,
    update: authenticated,
  },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'post', 'type', 'status', 'createdAt'],
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
    },
    {
      name: 'post',
      type: 'relationship',
      relationTo: 'posts',
      required: true,
      admin: {
        description: 'The post this feedback is related to',
      },
    },
    {
      name: 'contributor',
      type: 'relationship',
      relationTo: 'users',
      required: true,
      admin: {
        description: 'The contributor receiving the feedback',
      },
    },
    {
      name: 'editor',
      type: 'relationship',
      relationTo: 'users',
      required: true,
      admin: {
        description: 'The editor providing the feedback',
      },
    },
    {
      name: 'type',
      type: 'select',
      required: true,
      options: [
        { label: 'Critical Issues', value: 'critical' },
        { label: 'Suggestions', value: 'suggestions' },
        { label: 'Praise', value: 'praise' },
        { label: 'Questions', value: 'questions' },
      ],
      admin: {
        description: 'Type of feedback',
      },
    },
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'active',
      options: [
        { label: 'Active', value: 'active' },
        { label: 'Resolved', value: 'resolved' },
        { label: 'Closed', value: 'closed' },
      ],
    },
    {
      name: 'messages',
      type: 'array',
      fields: [
        {
          name: 'content',
          type: 'textarea',
          required: true,
        },
        {
          name: 'sender',
          type: 'relationship',
          relationTo: 'users',
          required: true,
        },
        {
          name: 'timestamp',
          type: 'date',
          defaultValue: () => new Date().toISOString(),
          admin: {
            readOnly: true,
          },
        },
      ],
    },
  ],
}