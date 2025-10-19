import { getPayload } from 'payload'
import config from '@payload-config'
import Link from 'next/link'

export default async function SeedPage() {
  const payload = await getPayload({ config })
  
  // Check if users exist
  const userCount = await payload.count({
    collection: 'users',
  })

  const hasUsers = userCount.totalDocs > 0

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Database Seeding</h1>
          <p className="text-gray-600">
            {hasUsers 
              ? 'Your database already has users.' 
              : 'Initialize your database with demo content and test users.'}
          </p>
        </div>

        {hasUsers ? (
          <div className="space-y-4">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <p className="text-green-800 text-sm">
                ✓ Database already initialized with <strong>{userCount.totalDocs}</strong> user(s).
              </p>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p className="text-yellow-800 text-sm font-medium mb-2">
                ⚠️ Warning:
              </p>
              <p className="text-yellow-700 text-sm">
                Seeding will clear all existing data and create fresh demo content.
              </p>
            </div>

            <form action="/next/seed" method="POST" className="space-y-3">
              <button
                type="submit"
                className="w-full bg-orange-600 hover:bg-orange-700 text-white font-medium py-3 px-4 rounded-lg transition-colors"
              >
                Re-seed Database (Clear All Data)
              </button>
            </form>

            <div className="text-center">
              <Link 
                href="/login" 
                className="text-blue-600 hover:text-blue-700 text-sm font-medium"
              >
                ← Back to Login
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-blue-800 text-sm mb-3">
                Seeding will create:
              </p>
              <ul className="text-blue-700 text-sm space-y-2">
                <li className="flex items-start">
                  <span className="mr-2">👤</span>
                  <div>
                    <strong>Admin:</strong> admin@gcet.edu.in / admin123
                  </div>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">✏️</span>
                  <div>
                    <strong>Editor:</strong> editor@gcet.edu.in / editor123
                  </div>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">📝</span>
                  <div>
                    <strong>Contributor:</strong> contributor@gcet.edu.in / contributor123
                  </div>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">📄</span>
                  <div>Demo posts, pages, and media files</div>
                </li>
              </ul>
            </div>

            <form action="/next/seed" method="POST" className="space-y-3">
              <button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-colors"
              >
                Seed Database
              </button>
            </form>

            <div className="text-center">
              <Link 
                href="/" 
                className="text-gray-600 hover:text-gray-700 text-sm"
              >
                ← Back to Home
              </Link>
            </div>
          </div>
        )}

        <div className="pt-4 border-t border-gray-200">
          <p className="text-xs text-gray-500 text-center">
            This process may take 30-60 seconds
          </p>
        </div>
      </div>
    </div>
  )
}
