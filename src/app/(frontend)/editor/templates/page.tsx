import { FileStack, Plus } from 'lucide-react'

export default async function TemplatesPage() {
  // TODO: When you add a templates collection to MongoDB, fetch real data here:
  // const payload = await getPayload({ config: configPromise })
  // const templates = await payload.find({
  //   collection: 'templates',
  //   limit: 50,
  //   sort: '-usageCount',
  // })

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Templates</h1>
            <p className="text-gray-600">Manage reusable content templates</p>
          </div>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Create Template
          </button>
        </div>
      </div>

      {/* Empty State */}
      <div className="bg-white rounded-xl p-12 shadow-sm">
        <div className="max-w-md mx-auto text-center">
          <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <FileStack className="w-8 h-8 text-blue-600" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">No Templates Yet</h2>
          <p className="text-gray-600 mb-6">
            Create reusable content templates to streamline your workflow. Templates help maintain consistency across similar posts.
          </p>
          <button className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium inline-flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Create Your First Template
          </button>
          <div className="mt-8 p-4 bg-gray-50 rounded-lg text-left">
            <p className="text-sm font-medium text-gray-900 mb-2">To enable templates:</p>
            <ol className="text-sm text-gray-600 space-y-1 list-decimal list-inside">
              <li>Add a &apos;templates&apos; collection to your database schema</li>
              <li>Define fields: name, category, content, usageCount</li>
              <li>Update this page to fetch from the collection</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  )
}
