import { redirect } from 'next/navigation'

export default async function CreateContentPage() {
  // Contributor routes deprecated - redirect to editor
  redirect('/editor/posts/create')
}
