import type { CollectionConfig } from 'payload'

import { anyone } from '../access/anyone'
import { editorOnly } from '../access/editorOnly'
import { isAdmin } from '../utilities/checkUserRole'
import { slugField } from '@/fields/slug'

export const Categories: CollectionConfig = {
  slug: 'categories',
  access: {
    create: editorOnly,
    delete: editorOnly,
    read: anyone,
    update: editorOnly,
  },
  admin: {
    hidden: ({ user }) => isAdmin(user),
    useAsTitle: 'title',
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
    },
    ...slugField(),
  ],
}
