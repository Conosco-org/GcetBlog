'use client'

import { useContext } from 'react'
import { AuthContext } from '@frontend/providers/Auth'

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
