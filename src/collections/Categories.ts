import type { CollectionConfig } from 'payload'

import { anyone } from '../access/anyone'
import { hasPermission } from '../access/hasPermission'
import { institutionField } from '../fields/institution'
import { slugField } from '@/fields/slug'
import { tenantIsolationHooks } from '@/hooks/tenantIsolation'

export const Categories: CollectionConfig = {
  slug: 'categories',
  access: {
    create: hasPermission('blog:publish'),
    delete: hasPermission('blog:delete'),
    read: anyone,
    update: hasPermission('blog:publish'),
  },
  admin: {
    useAsTitle: 'title',
  },
  hooks: tenantIsolationHooks(),
  fields: [
    institutionField,
    {
      name: 'title',
      type: 'text',
      required: true,
    },
    ...slugField(),
  ],
}
