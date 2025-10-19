'use client'

import React from 'react'
import './styles.css'

export default function AdminLogout() {
  const handleLogout = React.useCallback(async () => {
    try {
      // Call our logout API endpoint to clear the payload-token cookie
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      })

      if (!response.ok) {
        console.error('Logout failed:', await response.text())
      }
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      // Always redirect to /login after logout attempt
      window.location.href = '/login'
    }
  }, [])

  return (
    <button
      type="button"
      onClick={handleLogout}
      className="admin-logout-button"
    >
      Log Out
    </button>
  )
}
