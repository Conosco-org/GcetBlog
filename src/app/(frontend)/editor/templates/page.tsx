import { FileStack, Plus } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export default async function TemplatesPage() {
  // TODO: When you add a templates collection to MongoDB, fetch real data here:
  // const payload = await getPayload({ config: configPromise })
  // const templates = await payload.find({
  //   collection: 'templates',
  //   limit: 50,
  //   sort: '-usageCount',
  // })

  return (
    <div className="p-8 min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <div>
            <h1 className="text-3xl font-bold">Templates</h1>
            <p className="text-muted-foreground">Manage reusable content templates</p>
          </div>
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Create Template
          </Button>
        </div>
      </div>

      {/* Empty State */}
      <Card>
        <CardContent className="p-12">
          <div className="max-w-md mx-auto text-center">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <FileStack className="w-8 h-8 text-primary" />
            </div>
            <h2 className="text-xl font-semibold mb-2">No Templates Yet</h2>
            <p className="text-muted-foreground mb-6">
              Create reusable content templates to streamline your workflow. Templates help maintain consistency across similar posts.
            </p>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Create Your First Template
            </Button>
            <div className="mt-8 p-4 bg-muted rounded-lg text-left">
              <p className="text-sm font-medium mb-2">To enable templates:</p>
              <ol className="text-sm text-muted-foreground space-y-1 list-decimal list-inside">
                <li>Add a &apos;templates&apos; collection to your database schema</li>
                <li>Define fields: name, category, content, usageCount</li>
                <li>Update this page to fetch from the collection</li>
              </ol>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
