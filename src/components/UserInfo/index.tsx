'use client'

import { useUser } from '../../providers/User'

export function UserInfo() {
  const { user, loading, logout } = useUser()

  if (loading) {
    return <div className="text-sm text-gray-500">Loading user...</div>
  }

  if (!user) {
    return <div className="text-sm text-red-500">Not authenticated</div>
  }

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'editor':
        return 'bg-blue-100 text-blue-800'
      case 'contributor':
        return 'bg-green-100 text-green-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="flex items-center gap-3 p-4 bg-white rounded-lg border">
      <div className="flex-1">
        <div className="font-medium text-gray-900">{user.name || 'Unknown User'}</div>
        <div className="text-sm text-gray-500">{user.email}</div>
      </div>
      <div className="flex items-center gap-2">
        <div
          className={`px-2 py-1 text-xs font-medium rounded-full ${getRoleBadgeColor(user.role)}`}
        >
          {user.role.toUpperCase()}
        </div>
        <button
          onClick={logout}
          className="px-3 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
        >
          Logout
        </button>
      </div>
    </div>
  )
}
