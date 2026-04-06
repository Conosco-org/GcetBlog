import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import configPromise from '@payload-config'

export async function GET(request: NextRequest) {
  // Disable in production
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json(
      { error: 'Seed endpoint is disabled in production' },
      { status: 403 }
    )
  }

  try {
    const payload = await getPayload({ config: configPromise })

    // Require authentication - only admins (isAdmin) can seed
    const { user } = await payload.auth({ headers: request.headers })
    const typedUser = user as { isAdmin?: boolean } | null
    if (!user || !typedUser?.isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    console.log('?? Creating 5 sample published posts...\n')

    // Sample post data
    const posts = [
      {
        title: 'Welcome to GCET Blog Platform',
        content:
          'This is the first sample post showcasing our new blog platform. Built with Next.js 15, Payload CMS, and MongoDB for a modern publishing experience.',
        category: 'Announcements',
      },
      {
        title: 'Getting Started with Web Development',
        content:
          'Learn the fundamentals of web development including HTML, CSS, and JavaScript. Perfect for beginners looking to start their coding journey.',
        category: 'Technology',
      },
      {
        title: 'Campus Innovation Week 2025',
        content:
          'Join us for the annual Campus Innovation Week featuring tech talks, workshops, and project showcases from our talented students and faculty.',
        category: 'Events',
      },
      {
        title: 'Research Opportunities for Students',
        content:
          'Explore various research opportunities available for undergraduate and graduate students in engineering and technology fields.',
        category: 'Research',
      },
      {
        title: 'Top 10 Study Tips for Engineering Students',
        content:
          'Discover effective study strategies and time management techniques to excel in your engineering courses and projects.',
        category: 'Education',
      },
    ]

    // Find or create categories
    const categoryMap = new Map<string, string>()

    for (const post of posts) {
      const category = await payload.find({
        collection: 'categories',
        where: {
          title: {
            equals: post.category,
          },
        },
        limit: 1,
      })

      if (category.docs.length === 0) {
        console.log(`?? Creating category: ${post.category}`)
        const newCategory = await payload.create({
          collection: 'categories',
          data: {
            title: post.category,
          },
        })
        categoryMap.set(post.category, newCategory.id)
      } else {
        categoryMap.set(post.category, category.docs[0].id)
      }
    }

    // Find an editor user to be the author
    const users = await payload.find({
      collection: 'users',
      where: {
        role: {
          equals: 'editor',
        },
      },
      limit: 1,
    })

    if (users.docs.length === 0) {
      return NextResponse.json(
        { error: 'No admin or editor user found. Please create a user first.' },
        { status: 400 },
      )
    }

    const authorId = users.docs[0].id
    console.log(`?? Using author: ${users.docs[0].name || users.docs[0].email}\n`)

    // Create posts
    const created = []
    const errors = []

    for (const postData of posts) {
      const slug = postData.title
        .toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim()

      console.log(`?? Creating post: ${postData.title}`)

      try {
        const post = await payload.create({
          collection: 'posts',
          data: {
            title: postData.title,
            slug,
            content: {
              root: {
                type: 'root',
                children: [
                  {
                    type: 'heading',
                    tag: 'h2',
                    version: 1,
                    children: [
                      {
                        type: 'text',
                        text: postData.title,
                        version: 1,
                      },
                    ],
                  },
                  {
                    type: 'paragraph',
                    version: 1,
                    children: [
                      {
                        type: 'text',
                        text: postData.content,
                        version: 1,
                      },
                    ],
                  },
                  {
                    type: 'paragraph',
                    version: 1,
                    children: [
                      {
                        type: 'text',
                        text: 'This is a sample post created to demonstrate the blog platform functionality. You can edit or delete this post from the content manager.',
                        version: 1,
                      },
                    ],
                  },
                ],
                direction: 'ltr',
                format: '',
                indent: 0,
                version: 1,
              },
            },
            authors: [authorId],
            categories: [categoryMap.get(postData.category)!],
            reviewStatus: 'approved',
            publishedAt: new Date().toISOString(),
            _status: 'published',
            meta: {
              description: postData.content.substring(0, 160),
              title: postData.title,
            },
          },
        })
        console.log(`   ? Created successfully`)
        created.push(post)
      } catch (error) {
        console.error(`   ? Failed to create:`, error)
        errors.push({ title: postData.title, error: (error as Error).message })
      }
    }

    return NextResponse.json({
      success: true,
      message: `Successfully created ${created.length} out of ${posts.length} sample posts`,
      created: created.length,
      total: posts.length,
      errors: errors.length > 0 ? errors : undefined,
      posts: created.map((p) => ({ id: p.id, title: p.title, slug: p.slug })),
    })
  } catch (error) {
    console.error('? Error creating sample posts:', error)
    return NextResponse.json(
      {
        error: 'Failed to create sample posts',
        details: (error as Error).message,
      },
      { status: 500 },
    )
  }
}
