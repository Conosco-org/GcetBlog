/**
 * Department Configuration — Institution-Specific Departments
 *
 * Used for filtering content, events, and clubs by department.
 * Update this list when deploying for a different institution.
 */

export interface Department {
  /** Unique department code (matches Conosco if integrated) */
  code: string
  /** Full department name */
  name: string
  /** Short display name */
  shortName: string
}

// ---------------------------------------------------------------------------
// GCET Departments
// ---------------------------------------------------------------------------

export const departments: Department[] = [
  { code: 'CSE', name: 'Computer Science & Engineering', shortName: 'CSE' },
  { code: 'IT', name: 'Information Technology', shortName: 'IT' },
  { code: 'ECE', name: 'Electronics & Communication Engineering', shortName: 'ECE' },
  { code: 'EE', name: 'Electrical Engineering', shortName: 'EE' },
  { code: 'ME', name: 'Mechanical Engineering', shortName: 'ME' },
  { code: 'CE', name: 'Civil Engineering', shortName: 'CE' },
  { code: 'CHE', name: 'Chemical Engineering', shortName: 'CHE' },
  { code: 'AIML', name: 'Artificial Intelligence & Machine Learning', shortName: 'AI/ML' },
  { code: 'AIDS', name: 'Artificial Intelligence & Data Science', shortName: 'AI/DS' },
  { code: 'GENERAL', name: 'General / Institution-wide', shortName: 'General' },
]

/**
 * Get department options for Payload select fields
 */
export function getDepartmentOptions(): { label: string; value: string }[] {
  return departments.map((dept) => ({
    label: `${dept.shortName} — ${dept.name}`,
    value: dept.code,
  }))
}

/**
 * Get department by code
 */
export function getDepartment(code: string): Department | undefined {
  return departments.find((dept) => dept.code === code)
}

/**
 * Get department name by code (for display)
 */
export function getDepartmentName(code: string): string {
  return getDepartment(code)?.name ?? code
}
