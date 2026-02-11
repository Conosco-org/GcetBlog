import { getPayload } from 'payload'
import config from '../src/payload.config'

async function createSamplePosts() {
  const payload = await getPayload({ config })

  console.log('Creating 5 sample published posts...\n')

  // Sample post data
  const posts = [
    {
      title: 'Welcome to GCET Blog Platform',
      content: 'This is the first sample post showcasing our new blog platform. Built with Next.js 15, Payload CMS, and MongoDB for a modern publishing experience.',
      category: 'Announcements',
    },
    {
      title: 'Getting Started with Web Development',
      content: 'Learn the fundamentals of web development including HTML, CSS, and JavaScript. Perfect for beginners looking to start their coding journey.',
      category: 'Technology',
    },
    {
      title: 'Campus Innovation Week 2025',
      content: 'Join us for the annual Campus Innovation Week featuring tech talks, workshops, and project showcases from our talented students and faculty.',
      category: 'Events',
    },
    {
      title: 'Research Opportunities for Students',
      content: 'Explore various research opportunities available for undergraduate and graduate students in engineering and technology fields.',
      category: 'Research',
    },
    {
      title: 'Top 10 Study Tips for Engineering Students',
      content: 'Discover effective study strategies and time management techniques to excel in your engineering courses and projects.',
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
      console.log(`Creating category: ${post.category}`)
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

  // Find admin or editor user to be the author
  const users = await payload.find({
    collection: 'users',
    where: {
      or: [
        {
          role: {
            equals: 'admin',
          },
        },
        {
          role: {
            equals: 'editor',
          },
        },
      ],
    },
    limit: 1,
  })

  if (users.docs.length === 0) {
    console.error('No admin or editor user found. Please create a user first.')
    process.exit(1)
  }

  const authorId = users.docs[0].id

  // Create posts
  for (const postData of posts) {
    const slug = postData.title
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim()

    console.log(`Creating post: ${postData.title}`)

    try {
      await payload.create({
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
      console.log(`✓ Created: ${postData.title}`)
    } catch (error) {
      console.error(`✗ Failed to create: ${postData.title}`, error)
    }
  }

  console.log('\n✅ Sample posts created successfully!')
  console.log('Visit http://localhost:3000 to see them on the landing page')
  console.log('Visit http://localhost:3000/posts to see all posts')
  
  process.exit(0)
}

createSamplePosts().catch((error) => {
  console.error('Error creating sample posts:', error)
  process.exit(1)
})
