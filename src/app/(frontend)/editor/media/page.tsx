import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { Upload, Search, Grid3x3, List, Folder, Image as ImageIcon } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

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
    <div className="p-8 min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <div>
            <h1 className="text-3xl font-bold">Media Manager</h1>
            <p className="text-muted-foreground">Organize and manage your media files</p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline">
              <Folder className="w-4 h-4 mr-2" />
              New Folder
            </Button>
            <Button>
              <Upload className="w-4 h-4 mr-2" />
              Upload Files
            </Button>
          </div>
        </div>
      </div>

      {/* Storage Usage */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold">Storage Usage</h2>
            <span className="text-sm font-medium text-green-600">{Math.round(storagePercent)}% Used</span>
          </div>
          <p className="text-sm text-muted-foreground mb-3">{storageUsed.toFixed(2)}GB of {storageLimit}GB used</p>
          <div className="w-full bg-secondary rounded-full h-3 overflow-hidden">
            <div 
              className="bg-gradient-to-r from-blue-500 to-blue-600 h-full rounded-full transition-all"
              style={{ width: `${Math.min(storagePercent, 100)}%` }}
            />
          </div>
        </CardContent>
      </Card>

      {/* Files Section */}
      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <CardTitle>Files ({allMedia.totalDocs})</CardTitle>
              <div className="flex border rounded-lg overflow-hidden">
                <Button variant="ghost" size="sm" className="bg-primary/10 text-primary">
                  <Grid3x3 className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="sm">
                  <List className="w-4 h-4" />
                </Button>
              </div>
            </div>
            
            <div className="flex items-center gap-3 flex-1 max-w-md">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search files..."
                  className="pl-9"
                />
              </div>
              <select className="px-3 py-2 border rounded-lg bg-background text-sm">
                <option>Sort by Date</option>
                <option>Sort by Name</option>
                <option>Sort by Size</option>
              </select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Upload Area */}
          <div className="mb-6">
            <div className="border-2 border-dashed rounded-xl p-12 text-center hover:border-primary transition">
              <div className="flex flex-col items-center">
                <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
                  <Upload className="w-8 h-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Drag and drop files here</h3>
                <p className="text-sm text-muted-foreground mb-4">or click to browse files</p>
                <Button>
                  Choose Files
                </Button>
                <p className="text-xs text-muted-foreground mt-4">
                  Supported formats: JPG, PNG, PDF, MP4, MP3, ZIP (Max: 50MB)
                </p>
              </div>
            </div>
          </div>

          {/* Recent Files Grid */}
          {allMedia.docs.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold mb-4">Recent Files</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {allMedia.docs.slice(0, 6).map((media) => (
                  <div key={media.id} className="group relative">
                    <div className="aspect-square bg-muted rounded-lg overflow-hidden mb-2">
                      {media.url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={media.url}
                          alt={media.alt || media.filename || 'Media file'}
                          className="w-full h-full object-cover group-hover:scale-110 transition"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <ImageIcon className="w-8 h-8 text-muted-foreground" />
                        </div>
                      )}
                    </div>
                    <p className="text-xs font-medium truncate">
                      {media.filename || 'Untitled'}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {media.filesize ? `${(media.filesize / 1024).toFixed(1)} KB` : 'Unknown size'}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
