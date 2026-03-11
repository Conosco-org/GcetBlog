import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'
import type { User } from '@/payload-types'
import { checkPermission } from '@/access/hasPermission'

export async function POST(request: NextRequest) {
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

    if (!checkPermission(user, 'blog:publish')) {
      return NextResponse.json(
        { error: 'Forbidden: Only editors can create categories' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { title } = body

    if (!title || typeof title !== 'string' || title.trim().length === 0) {
      return NextResponse.json(
        { error: 'Category title is required' },
        { status: 400 }
      )
    }

    // Check if category with this title already exists
    const existingCategory = await payload.find({
      collection: 'categories',
      where: {
        title: { equals: title.trim() }
      },
      limit: 1,
    })

    if (existingCategory.docs.length > 0) {
      return NextResponse.json(
        { error: 'A category with this title already exists' },
        { status: 400 }
      )
    }

    // Create the category
    const category = await payload.create({
      collection: 'categories',
      data: {
        title: title.trim(),
      },
      user,
    })

    return NextResponse.json(category, { status: 201 })
  } catch (error) {
    console.error('Error creating category:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}