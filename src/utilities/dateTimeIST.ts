/**
 * Utilities for converting between IST (Indian Standard Time) and ISO strings
 * for datetime-local inputs and database storage
 */

/**
 * Convert an ISO string to IST datetime-local input format (YYYY-MM-DDTHH:mm)
 * Used for populating datetime-local inputs with IST time
 */
export function toISTDateTimeInput(isoString: string | null | undefined): string {
  if (!isoString) return ''
  
  const date = new Date(isoString)
  
  // Convert to IST (UTC+5:30)
  const istDate = new Date(date.toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }))
  
  // Format as YYYY-MM-DDTHH:mm for datetime-local input
  const year = istDate.getFullYear()
  const month = String(istDate.getMonth() + 1).padStart(2, '0')
  const day = String(istDate.getDate()).padStart(2, '0')
  const hours = String(istDate.getHours()).padStart(2, '0')
  const minutes = String(istDate.getMinutes()).padStart(2, '0')
  
  return `${year}-${month}-${day}T${hours}:${minutes}`
}

/**
 * Convert datetime-local input value (in IST) to ISO string for database storage
 * Input format: YYYY-MM-DDTHH:mm (assumed to be IST)
 * Output: ISO string in UTC
 */
export function fromISTInputToISOString(istInput: string | null | undefined): string | null {
  if (!istInput) return null
  
  // Parse the input as IST
  // Input format: "2024-03-26T14:30"
  const [datePart, timePart] = istInput.split('T')
  const [year, month, day] = datePart.split('-').map(Number)
  const [hours, minutes] = timePart.split(':').map(Number)
  
  // Create date in IST timezone
  // We need to subtract 5:30 from IST to get UTC
  const istDate = new Date(year, month - 1, day, hours, minutes, 0, 0)
  
  // Get UTC time by subtracting IST offset (5 hours 30 minutes = 330 minutes)
  const utcTime = istDate.getTime() - (5.5 * 60 * 60 * 1000)
  const utcDate = new Date(utcTime)
  
  return utcDate.toISOString()
}
