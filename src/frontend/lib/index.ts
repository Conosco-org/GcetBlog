/**
 * Frontend utility functions barrel export
 * 
 * This file exports all frontend-specific utilities for easy importing.
 */

// UI utilities
export { cn } from './utils'

// Date/time formatting
export { formatDateTime, formatDateTimeIST, formatDateIST } from './format-date-time'

// Author formatting
export { formatAuthors } from './format-authors'

// Meta generation
export { generateMeta } from './generate-meta'
export { mergeOpenGraph } from './merge-open-graph'

// Media utilities
export { getMediaUrl } from './get-media-url'

// React hooks
export { default as useClickableCard } from './use-clickable-card'
export { useDebounce } from './use-debounce'

// DOM utilities
export { default as canUseDOM } from '@shared/lib/can-use-dom'
