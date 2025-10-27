import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'
import type { User } from '@/payload-types'

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const payload = await getPayload({ config: configPromise })
    const requestHeaders = await headers()
    const { user } = await payload.auth({ headers: requestHeaders })

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const typedUser = user as User & { role: string }

    if (!['editor', 'admin'].includes(typedUser.role)) {
      return NextResponse.json(
        { error: 'Forbidden: Only editors and admins can update categories' },
        { status: 403 }
      )
    }

    const categoryId = params.id
    const body = await request.json()
    const { title } = body

    if (!title || typeof title !== 'string' || title.trim().length === 0) {
      return NextResponse.json(
        { error: 'Category title is required' },
        { status: 400 }
      )
    }

    // Check if another category with this title already exists
    const existingCategory = await payload.find({
      collection: 'categories',
      where: {
        and: [
          { title: { equals: title.trim() } },
          { id: { not_equals: categoryId } }
        ]
      },
      limit: 1,
    })

    if (existingCategory.docs.length > 0) {
      return NextResponse.json(
        { error: 'A category with this title already exists' },
        { status: 400 }
      )
    }

    // Update the category
    const category = await payload.update({
      collection: 'categories',
      id: categoryId,
      data: {
        title: title.trim(),
      },
      user,
    })

    return NextResponse.json(category)
  } catch (error) {
    console.error('Error updating category:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const payload = await getPayload({ config: configPromise })
    const requestHeaders = await headers()
    const { user } = await payload.auth({ headers: requestHeaders })

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const typedUser = user as User & { role: string }

    if (!['editor', 'admin'].includes(typedUser.role)) {
      return NextResponse.json(
        { error: 'Forbidden: Only editors and admins can delete categories' },
        { status: 403 }
      )
    }

    const categoryId = params.id

    // Check if category has posts
    const postsWithCategory = await payload.find({
      collection: 'posts',
      where: {
        categories: { equals: categoryId }
      },
      limit: 1,
    })

    if (postsWithCategory.totalDocs > 0) {
      return NextResponse.json(
        { error: 'Cannot delete category that has posts assigned to it' },
        { status: 400 }
      )
    }

    // Delete the category
    await payload.delete({
      collection: 'categories',
      id: categoryId,
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting category:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}