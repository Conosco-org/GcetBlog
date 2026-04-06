import { revalidatePath } from 'next/cache'

/**
 * Takes an array of paths and calls revalidatePath on each.
 * Reduces boilerplate in API routes.
 */
export function revalidatePaths(paths: string[]) {
  paths.forEach((path) => revalidatePath(path))
}
