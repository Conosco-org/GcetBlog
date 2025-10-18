'use client'

import { useAuth } from '@payloadcms/ui'
import React from 'react'
import './styles.css'

export const AdminLogout = () => {
  const { logOut } = useAuth()

  const handleLogout = React.useCallback(async () => {
    try {
      // Call Payload's logout to clear the session
      await logOut()
      
      // Redirect to /login instead of /admin/login
      window.location.href = '/login'
    } catch (error) {
      console.error('Logout error:', error)
      // Even if there's an error, redirect to login
      window.location.href = '/login'
    }
  }, [logOut])

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
