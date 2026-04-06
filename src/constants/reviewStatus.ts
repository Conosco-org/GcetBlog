export const REVIEW_STATUS = {
  DRAFT: 'draft',
  PENDING_REVIEW: 'pending_review',
  APPROVED: 'approved',
  REJECTED: 'rejected',
  REQUESTING_CHANGES: 'requesting_changes',
} as const

export type ReviewStatus = typeof REVIEW_STATUS[keyof typeof REVIEW_STATUS]
