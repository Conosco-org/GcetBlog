import type { CollectionConfig } from 'payload'

import { anyone } from '@backend/access/anyone'
import { isAdminOrEditor } from '@backend/access/is-admin-or-editor'
import { slugField } from '@backend/fields/slug'

export const Categories: CollectionConfig = {
  slug: 'categories',
  access: {
    create: isAdminOrEditor,
    delete: isAdminOrEditor,
    read: anyone,
    update: isAdminOrEditor,
  },
  admin: {
    useAsTitle: 'title',
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
    },
    {
      name: 'description',
      type: 'textarea',
      admin: {
        description: 'Category description for SEO and category pages',
      },
    },
    {
      name: 'postCount',
      type: 'number',
      defaultValue: 0,
      admin: {
        position: 'sidebar',
        readOnly: true,
        description: 'Number of posts in this category (denormalized)',
      },
      access: {
        update: () => false, // Only updated programmatically
      },
    },
    {
      name: 'color',
      type: 'text',
      admin: {
        position: 'sidebar',
        description: 'Hex color for category badge, e.g. #3B82F6',
      },
    },
    {
      name: 'isActive',
      type: 'checkbox',
      defaultValue: true,
      admin: {
        position: 'sidebar',
        description: 'Inactive categories are hidden from public view',
      },
    },
    {
      name: 'order',
      type: 'number',
      defaultValue: 0,
      admin: {
        position: 'sidebar',
        description: 'Manual sort order for navigation display (lower numbers first)',
      },
    },
    ...slugField(),
  ],
}
