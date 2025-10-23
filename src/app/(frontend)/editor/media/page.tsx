import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { Upload, Search, Grid3x3, List, Folder, Image as ImageIcon } from 'lucide-react'

export default async function MediaManagerPage() {
  const payload = await getPayload({ config: configPromise })

  // Get all media
  const allMedia = await payload.find({
    collection: 'media',
    limit: 100,
    sort: '-createdAt',
  })

  // Calculate real storage from media filesizes
  const totalBytes = allMedia.docs.reduce((acc, media) => {
    return acc + (media.filesize || 0)
  }, 0)
  const storageUsed = totalBytes / (1024 * 1024 * 1024) // Convert to GB
  const storageLimit = 10 // GB
  const storagePercent = storageUsed > 0 ? (storageUsed / storageLimit) * 100 : 0

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Media Manager</h1>
            <p className="text-gray-600">Organize and manage your media files</p>
          </div>
          <div className="flex gap-3">
            <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition font-medium flex items-center gap-2">
              <Folder className="w-4 h-4" />
              New Folder
            </button>
            <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-medium flex items-center gap-2">
              <Upload className="w-4 h-4" />
              Upload Files
            </button>
          </div>
        </div>
      </div>

      {/* Storage Usage */}
      <div className="bg-white rounded-xl p-6 mb-6 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold text-gray-900">Storage Usage</h2>
          <span className="text-sm font-medium text-green-600">{Math.round(storagePercent)}% Used</span>
        </div>
        <p className="text-sm text-gray-600 mb-3">{storageUsed.toFixed(2)}GB of {storageLimit}GB used</p>
        <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
          <div 
            className="bg-gradient-to-r from-blue-500 to-blue-600 h-full rounded-full transition-all"
            style={{ width: `${Math.min(storagePercent, 100)}%` }}
          />
        </div>
      </div>

      {/* Files Section */}
      <div className="bg-white rounded-xl shadow-sm">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <h2 className="text-lg font-semibold text-gray-900">Files ({allMedia.totalDocs})</h2>
              <div className="flex border border-gray-300 rounded-lg overflow-hidden">
                <button className="px-3 py-1.5 bg-blue-50 text-blue-600">
                  <Grid3x3 className="w-4 h-4" />
                </button>
                <button className="px-3 py-1.5 hover:bg-gray-50">
                  <List className="w-4 h-4 text-gray-600" />
                </button>
              </div>
            </div>
            
            <div className="flex items-center gap-3 flex-1 max-w-md">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search files..."
                  className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                />
              </div>
              <select className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-sm">
                <option>Sort by Date</option>
                <option>Sort by Name</option>
                <option>Sort by Size</option>
              </select>
            </div>
          </div>
        </div>

        {/* Upload Area */}
        <div className="p-12">
          <div className="border-2 border-dashed border-gray-300 rounded-xl p-12 text-center hover:border-blue-500 transition">
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <Upload className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Drag and drop files here</h3>
              <p className="text-sm text-gray-600 mb-4">or click to browse files</p>
              <button className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-medium">
                Choose Files
              </button>
              <p className="text-xs text-gray-500 mt-4">
                Supported formats: JPG, PNG, PDF, MP4, MP3, ZIP (Max: 50MB)
              </p>
            </div>
          </div>
        </div>

        {/* Recent Files Grid */}
        {allMedia.docs.length > 0 && (
          <div className="px-6 pb-6">
            <h3 className="text-sm font-semibold text-gray-700 mb-4">Recent Files</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {allMedia.docs.slice(0, 6).map((media) => (
                <div key={media.id} className="group relative">
                  <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden mb-2">
                    {media.url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={media.url}
                        alt={media.alt || media.filename || 'Media file'}
                        className="w-full h-full object-cover group-hover:scale-110 transition"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <ImageIcon className="w-8 h-8 text-gray-400" />
                      </div>
                    )}
                  </div>
                  <p className="text-xs text-gray-900 font-medium truncate">
                    {media.filename || 'Untitled'}
                  </p>
                  <p className="text-xs text-gray-500">
                    {media.filesize ? `${(media.filesize / 1024).toFixed(1)} KB` : 'Unknown size'}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
