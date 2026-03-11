/**
 * Database Seed Script — Multi-tenant RBAC
 *
 * Seeds the database with:
 * - GCET Institution
 * - Demo users (superadmin, institution_admin, blog_editor, blog_author)
 * - Sample categories, media, posts, pages
 * - Header & footer globals
 *
 * Usage: node scripts/seed-database.js
 * Make sure DATABASE_URI is set in your .env
 */

import 'dotenv/config'
import { getPayload } from 'payload'
import config from '../src/payload.config.js'

async function seedDatabase() {
  console.log('🌱 Starting database seed...\n')

  const payload = await getPayload({ config })

  // ─── 1. Clear existing data ───────────────────────────────────
  console.log('🗑️  Clearing existing data...')

  const collectionsToClear = [
    'categories',
    'media',
    'pages',
    'posts',
    'forms',
    'form-submissions',
    'search',
    'institutions',
    'admin-logs',
    'comments',
    'feedback',
    'events',
    'clubs',
  ] as const

  // Clear globals
  await Promise.all([
    payload.updateGlobal({
      slug: 'header',
      data: { navItems: [] } as any,
      depth: 0,
      context: { disableRevalidate: true },
    }),
    payload.updateGlobal({
      slug: 'footer',
      data: { navItems: [] } as any,
      depth: 0,
      context: { disableRevalidate: true },
    }),
  ])

  // Clear collections
  for (const collection of collectionsToClear) {
    try {
      await payload.delete({
        collection,
        where: {},
        context: { disableRevalidate: true },
      })
    } catch (e) {
      // Collection might be empty or not exist yet
    }
  }

  // Clear all users
  try {
    await payload.delete({
      collection: 'users',
      where: {},
      context: { disableRevalidate: true },
    })
  } catch (e) {
    // might fail if empty
  }

  console.log('✅ Cleared existing data\n')

  // ─── 2. Create GCET Institution ──────────────────────────────
  console.log('🏫 Creating GCET institution...')

  const gcet = await payload.create({
    collection: 'institutions',
    data: {
      name: 'Geethanjali College of Engineering & Technology',
      code: 'gcet',
      shortName: 'GCET',
      status: 'active',
      tier: 'standard',
      domains: [
        {
          hostname: 'blog.gcet.edu.in',
          purpose: 'blog',
          verified: false,
        },
      ],
      contact: {
        email: 'info@gcettbr.ac.in',
        website: 'https://gcettbr.ac.in/',
        address: 'Cheeryal, Keesara, Medchal Dist., Hyderabad, Telangana 501301',
      },
      settings: {
        enabledModules: ['blog', 'events', 'clubs', 'newsletter'],
        maxUsers: 0,
      },
    },
  })

  console.log(`✅ Created institution: ${gcet.name} (ID: ${gcet.id})\n`)

  // ─── 3. Create Users ─────────────────────────────────────────
  console.log('👥 Creating demo users...')

  const superAdmin = await payload.create({
    collection: 'users',
    data: {
      name: 'SuperAdmin',
      email: 'superadmin@gcetblog.in',
      password: 'superadmin123',
      role: 'superadmin',
      // SuperAdmin has NO institution
    },
  })
  console.log(`  ✅ SuperAdmin: superadmin@gcetblog.in / superadmin123`)

  const instAdmin = await payload.create({
    collection: 'users',
    data: {
      name: 'Institution Admin',
      email: 'admin@gcet.edu.in',
      password: 'admin123',
      role: 'user',
      institution: gcet.id,
      roleAssignments: [
        {
          assignedRole: 'institution_admin',
          scopeType: 'institution',
          scopeId: { relationTo: 'institutions', value: gcet.id },
          scopeLabel: 'GCET',
        },
      ],
    },
  })
  console.log(`  ✅ Institution Admin: admin@gcet.edu.in / admin123`)

  const editorUser = await payload.create({
    collection: 'users',
    data: {
      name: 'Editor User',
      email: 'editor@gcet.edu.in',
      password: 'editor123',
      role: 'user',
      institution: gcet.id,
      roleAssignments: [
        {
          assignedRole: 'blog_editor',
          scopeType: 'institution',
          scopeId: { relationTo: 'institutions', value: gcet.id },
          scopeLabel: 'GCET',
        },
      ],
    },
  })
  console.log(`  ✅ Editor: editor@gcet.edu.in / editor123`)

  const authorUser = await payload.create({
    collection: 'users',
    data: {
      name: 'Author User',
      email: 'author@gcet.edu.in',
      password: 'author123',
      role: 'user',
      institution: gcet.id,
      roleAssignments: [
        {
          assignedRole: 'blog_author',
          scopeType: 'institution',
          scopeId: { relationTo: 'institutions', value: gcet.id },
          scopeLabel: 'GCET',
        },
      ],
    },
  })
  console.log(`  ✅ Author: author@gcet.edu.in / author123`)

  const moderatorUser = await payload.create({
    collection: 'users',
    data: {
      name: 'Moderator User',
      email: 'moderator@gcet.edu.in',
      password: 'moderator123',
      role: 'user',
      institution: gcet.id,
      roleAssignments: [
        {
          assignedRole: 'moderator',
          scopeType: 'institution',
          scopeId: { relationTo: 'institutions', value: gcet.id },
          scopeLabel: 'GCET',
        },
      ],
    },
  })
  console.log(`  ✅ Moderator: moderator@gcet.edu.in / moderator123\n`)

  // ─── 4. Create Categories ────────────────────────────────────
  console.log('📁 Creating categories...')

  const categoryNames = [
    'Technology',
    'News',
    'Announcements',
    'Events',
    'Research',
    'Campus Life',
    'Engineering',
    'Software',
  ]

  const categories: Record<string, { id: string }> = {}
  for (const title of categoryNames) {
    const slug = title.toLowerCase().replace(/\s+/g, '-')
    const cat = await payload.create({
      collection: 'categories',
      data: {
        title,
        institution: gcet.id,
        breadcrumbs: [{ label: title, url: `/${slug}` }],
      },
    })
    categories[title] = cat
  }
  console.log(`  ✅ Created ${categoryNames.length} categories\n`)

  // ─── 5. Create Sample Posts ───────────────────────────────────
  console.log('📝 Creating sample posts...')

  const samplePosts = [
    {
      title: 'Welcome to GCET Blog Platform',
      slug: 'welcome-to-gcet-blog',
      excerpt: 'Introducing our new blog platform built with modern technologies for the GCET community.',
      category: 'Announcements',
      author: instAdmin,
    },
    {
      title: 'Getting Started with Web Development in 2025',
      slug: 'getting-started-web-development-2025',
      excerpt: 'A comprehensive guide to modern web development technologies and frameworks.',
      category: 'Technology',
      author: editorUser,
    },
    {
      title: 'Campus Innovation Week 2025',
      slug: 'campus-innovation-week-2025',
      excerpt: 'Join us for the annual Campus Innovation Week featuring tech talks and workshops.',
      category: 'Events',
      author: authorUser,
    },
    {
      title: 'Research Opportunities for Engineering Students',
      slug: 'research-opportunities-engineering',
      excerpt: 'Explore various research opportunities available for our engineering students.',
      category: 'Research',
      author: editorUser,
    },
    {
      title: 'Top 10 Study Tips for Engineering Students',
      slug: 'top-10-study-tips-engineering',
      excerpt: 'Discover effective study strategies and time management techniques.',
      category: 'Campus Life',
      author: authorUser,
    },
  ]

  const createdPosts = []
  for (const postData of samplePosts) {
    const post = await payload.create({
      collection: 'posts',
      data: {
        title: postData.title,
        slug: postData.slug,
        institution: gcet.id,
        _status: 'published',
        publishedAt: new Date().toISOString(),
        authors: [postData.author.id],
        populatedAuthors: [
          {
            id: postData.author.id,
            name: postData.author.name,
          },
        ],
        categories: categories[postData.category]
          ? [categories[postData.category].id]
          : [],
        meta: {
          title: postData.title,
          description: postData.excerpt,
        },
        content: {
          root: {
            type: 'root',
            children: [
              {
                type: 'heading',
                children: [
                  {
                    type: 'text',
                    detail: 0,
                    format: 0,
                    mode: 'normal',
                    style: '',
                    text: postData.title,
                    version: 1,
                  },
                ],
                direction: 'ltr',
                format: '',
                indent: 0,
                tag: 'h2',
                version: 1,
              },
              {
                type: 'paragraph',
                children: [
                  {
                    type: 'text',
                    detail: 0,
                    format: 0,
                    mode: 'normal',
                    style: '',
                    text: postData.excerpt,
                    version: 1,
                  },
                ],
                direction: 'ltr',
                format: '',
                indent: 0,
                textFormat: 0,
                version: 1,
              },
              {
                type: 'paragraph',
                children: [
                  {
                    type: 'text',
                    detail: 0,
                    format: 0,
                    mode: 'normal',
                    style: '',
                    text: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.',
                    version: 1,
                  },
                ],
                direction: 'ltr',
                format: '',
                indent: 0,
                textFormat: 0,
                version: 1,
              },
            ],
            direction: 'ltr',
            format: '',
            indent: 0,
            version: 1,
          },
        },
      },
      context: {
        disableRevalidate: true,
      },
    })
    createdPosts.push(post)
    console.log(`  ✅ Post: "${postData.title}"`)
  }

  // Add related posts
  for (let i = 0; i < createdPosts.length; i++) {
    const related = createdPosts
      .filter((_, idx) => idx !== i)
      .slice(0, 2)
      .map((p) => p.id)
    await payload.update({
      id: createdPosts[i].id,
      collection: 'posts',
      data: { relatedPosts: related },
      context: { disableRevalidate: true },
    })
  }
  console.log(`  ✅ Linked related posts\n`)

  // ─── 6. Create Pages ─────────────────────────────────────────
  console.log('📄 Creating pages...')

  await payload.create({
    collection: 'pages',
    data: {
      title: 'Home',
      slug: 'home',
      institution: gcet.id,
      _status: 'published',
      hero: {
        type: 'lowImpact',
        richText: {
          root: {
            type: 'root',
            children: [
              {
                type: 'heading',
                children: [
                  {
                    type: 'text',
                    detail: 0,
                    format: 0,
                    mode: 'normal',
                    style: '',
                    text: 'Welcome to GCET Blog',
                    version: 1,
                  },
                ],
                direction: 'ltr',
                format: '',
                indent: 0,
                tag: 'h1',
                version: 1,
              },
              {
                type: 'paragraph',
                children: [
                  {
                    type: 'text',
                    detail: 0,
                    format: 0,
                    mode: 'normal',
                    style: '',
                    text: 'Your campus news, stories, and community updates — all in one place.',
                    version: 1,
                  },
                ],
                direction: 'ltr',
                format: '',
                indent: 0,
                textFormat: 0,
                version: 1,
              },
            ],
            direction: 'ltr',
            format: '',
            indent: 0,
            version: 1,
          },
        },
      },
      layout: [
        {
          blockType: 'archive',
          populateBy: 'collection',
          relationTo: 'posts',
          limit: 6,
        },
      ],
    },
    context: {
      disableRevalidate: true,
    },
  })
  console.log('  ✅ Home page')

  const contactPage = await payload.create({
    collection: 'pages',
    data: {
      title: 'Contact',
      slug: 'contact',
      institution: gcet.id,
      _status: 'published',
      hero: {
        type: 'lowImpact',
        richText: {
          root: {
            type: 'root',
            children: [
              {
                type: 'heading',
                children: [
                  {
                    type: 'text',
                    detail: 0,
                    format: 0,
                    mode: 'normal',
                    style: '',
                    text: 'Contact Us',
                    version: 1,
                  },
                ],
                direction: 'ltr',
                format: '',
                indent: 0,
                tag: 'h1',
                version: 1,
              },
            ],
            direction: 'ltr',
            format: '',
            indent: 0,
            version: 1,
          },
        },
      },
      layout: [
        {
          blockType: 'content',
          columns: [
            {
              size: 'full',
              richText: {
                root: {
                  type: 'root',
                  children: [
                    {
                      type: 'paragraph',
                      children: [
                        {
                          type: 'text',
                          detail: 0,
                          format: 0,
                          mode: 'normal',
                          style: '',
                          text: 'Get in touch with the GCET Blog team at info@gcettbr.ac.in',
                          version: 1,
                        },
                      ],
                      direction: 'ltr',
                      format: '',
                      indent: 0,
                      textFormat: 0,
                      version: 1,
                    },
                  ],
                  direction: 'ltr',
                  format: '',
                  indent: 0,
                  version: 1,
                },
              },
            },
          ],
        },
      ],
    },
    context: {
      disableRevalidate: true,
    },
  })
  console.log('  ✅ Contact page\n')

  // ─── 7. Seed Globals ─────────────────────────────────────────
  console.log('🌐 Seeding header & footer...')

  await payload.updateGlobal({
    slug: 'header',
    context: { disableRevalidate: true },
    data: {
      navItems: [
        {
          link: {
            type: 'custom',
            label: 'Posts',
            url: '/posts',
          },
        },
        {
          link: {
            type: 'reference',
            label: 'Contact',
            reference: {
              relationTo: 'pages',
              value: contactPage.id,
            },
          },
        },
      ],
    },
  })

  await payload.updateGlobal({
    slug: 'footer',
    context: { disableRevalidate: true },
    data: {
      navItems: [
        {
          link: {
            type: 'custom',
            label: 'Admin',
            url: '/admin',
          },
        },
        {
          link: {
            type: 'custom',
            label: 'Source Code',
            newTab: true,
            url: 'https://github.com/Conosco-org/GcetBlog',
          },
        },
        {
          link: {
            type: 'custom',
            label: 'GCET Official',
            newTab: true,
            url: 'https://gcettbr.ac.in/',
          },
        },
      ],
    },
  })
  console.log('  ✅ Header & footer globals\n')

  // ─── Summary ──────────────────────────────────────────────────
  console.log('═══════════════════════════════════════════════════')
  console.log('🎉 Database seeded successfully!')
  console.log('═══════════════════════════════════════════════════')
  console.log('')
  console.log('📋 Seeded Accounts:')
  console.log('┌────────────────────┬────────────────────────────┬────────────────┐')
  console.log('│ Role               │ Email                      │ Password       │')
  console.log('├────────────────────┼────────────────────────────┼────────────────┤')
  console.log('│ SuperAdmin         │ superadmin@gcetblog.in     │ superadmin123  │')
  console.log('│ Institution Admin  │ admin@gcet.edu.in          │ admin123       │')
  console.log('│ Blog Editor        │ editor@gcet.edu.in         │ editor123      │')
  console.log('│ Blog Author        │ author@gcet.edu.in         │ author123      │')
  console.log('│ Moderator          │ moderator@gcet.edu.in      │ moderator123   │')
  console.log('└────────────────────┴────────────────────────────┴────────────────┘')
  console.log('')
  console.log(`📁 ${categoryNames.length} categories, ${createdPosts.length} posts, 2 pages`)
  console.log(`🏫 Institution: GCET (${gcet.id})`)
  console.log('')

  process.exit(0)
}

seedDatabase().catch((err) => {
  console.error('❌ Seed failed:', err)
  process.exit(1)
})
