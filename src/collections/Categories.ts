import type { CollectionConfig } from 'payload'

import { anyone } from '../access/anyone'
import { editorOnly } from '../access/editorOnly'
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
