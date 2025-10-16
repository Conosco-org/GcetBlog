'use server'

import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { headers } from 'next/headers'

export async function submitRoleUpgradeRequest(formData: FormData) {
  try {
    const payload = await getPayload({ config: configPromise })
    const requestHeaders = await headers()

    // Authenticate the request
    const { user } = await payload.auth({ headers: requestHeaders })

    if (!user) {
      throw new Error('Authentication required')
    }

    const requestedRole = formData.get('requestedRole') as string
    const message = formData.get('message') as string

    if (!requestedRole || !message) {
      throw new Error('All fields are required')
    }

    // Check if user already has a pending request
    const existingRequest = await payload.find({
      collection: 'role-upgrade-requests',
      where: {
        and: [{ user: { equals: user.id } }, { status: { equals: 'pending' } }],
      },
    })

    if (existingRequest.docs.length > 0) {
      throw new Error('You already have a pending role upgrade request')
    }

    // Create the request
    await payload.create({
      collection: 'role-upgrade-requests',
      data: {
        user: user.id,
        requestedRole: requestedRole as 'editor' | 'admin',
        message,
        status: 'pending',
      },
    })

    return { success: true, message: 'Role upgrade request submitted successfully' }
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Failed to submit request',
    }
  }
}

export async function approveRoleUpgradeRequest(requestId: string, adminNotes?: string) {
  try {
    const payload = await getPayload({ config: configPromise })
    const requestHeaders = await headers()

    // Authenticate the request
    const { user } = await payload.auth({ headers: requestHeaders })

    if (!user || (user as { role: string }).role !== 'admin') {
      throw new Error('Admin access required')
    }

    // Get the request
    const request = await payload.findByID({
      collection: 'role-upgrade-requests',
      id: requestId,
      depth: 1,
    })

    if (!request) {
      throw new Error('Request not found')
    }

    if (request.status !== 'pending') {
      throw new Error('Request has already been processed')
    }

    const userId = typeof request.user === 'object' ? request.user.id : request.user

    // Update the request status (the afterChange hook will update the user's role)
    await payload.update({
      collection: 'role-upgrade-requests',
      id: requestId,
      data: {
        status: 'approved',
        adminNotes: adminNotes || undefined,
        processedAt: new Date().toISOString(),
      },
    })

    // Also directly update the user's role to ensure it works
    await payload.update({
      collection: 'users',
      id: userId,
      data: {
        role: request.requestedRole,
      },
    })

    return { success: true, message: 'Role upgrade approved successfully' }
  } catch (error) {
    console.error('Error approving role upgrade:', error)
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Failed to approve request',
    }
  }
}

export async function rejectRoleUpgradeRequest(requestId: string, adminNotes?: string) {
  try {
    const payload = await getPayload({ config: configPromise })
    const requestHeaders = await headers()

    // Authenticate the request
    const { user } = await payload.auth({ headers: requestHeaders })

    if (!user || (user as { role: string }).role !== 'admin') {
      throw new Error('Admin access required')
    }

    // Update the request status
    await payload.update({
      collection: 'role-upgrade-requests',
      id: requestId,
      data: {
        status: 'rejected',
        adminNotes,
        processedAt: new Date().toISOString(),
      },
    })

    return { success: true, message: 'Role upgrade rejected' }
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Failed to reject request',
    }
  }
}
