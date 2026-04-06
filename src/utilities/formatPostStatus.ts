export type ReviewStatus = 'draft' | 'pending_review' | 'approved' | 'rejected' | 'requesting_changes'

export const reviewStatusLabels: Record<ReviewStatus, string> = {
  draft: 'Draft',
  pending_review: 'Pending Review',
  approved: 'Approved',
  rejected: 'Rejected',
  requesting_changes: 'Requesting Changes',
}

export const reviewStatusClasses: Record<ReviewStatus, string> = {
  draft: 'text-gray-600 bg-gray-100',
  pending_review: 'text-yellow-700 bg-yellow-100',
  approved: 'text-green-700 bg-green-100',
  rejected: 'text-red-700 bg-red-100',
  requesting_changes: 'text-orange-700 bg-orange-100',
}

/**
 * Maps reviewStatus enum values to human-readable labels and CSS class names.
 */
export function formatPostStatus(status: ReviewStatus): { label: string; className: string } {
  return {
    label: reviewStatusLabels[status] || status,
    className: reviewStatusClasses[status] || 'text-gray-600 bg-gray-100',
  }
}
