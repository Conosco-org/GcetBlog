export type ArchiveContentType = 'posts' | 'comments'

export const canManageArchive = (
  user: unknown,
): user is { id: string; role?: string; isAdmin?: boolean } => {
  const typedUser = user as { role?: string; isAdmin?: boolean } | undefined
  return typedUser?.role === 'editor' || typedUser?.role === 'admin' || typedUser?.isAdmin === true
}

export function parseBulkBody(body: unknown, idField: 'ids' | 'archiveIds') {
  const data = body as Record<string, unknown>
  const type = data.type
  if (type !== 'posts' && type !== 'comments') {
    return { error: 'type must be posts or comments' } as const
  }
  if (!Array.isArray(data[idField])) {
    return { error: `${idField} must be an array` } as const
  }
  const ids = [...new Set(data[idField].filter((id): id is string => typeof id === 'string' && id.length > 0))]
  if (ids.length === 0) return { error: `At least one ${idField} value is required` } as const
  if (ids.length > 100) return { error: 'Bulk operations are limited to 100 items' } as const
  return { type: type as ArchiveContentType, ids } as const
}

export async function runBulk(
  ids: string[],
  operation: (id: string) => Promise<unknown>,
) {
  const succeeded: string[] = []
  const failed: Array<{ id: string; message: string }> = []
  for (const id of ids) {
    try {
      await operation(id)
      succeeded.push(id)
    } catch (error) {
      failed.push({
        id,
        message: error instanceof Error ? error.message : 'Operation failed',
      })
    }
  }
  return { succeeded, failed }
}
