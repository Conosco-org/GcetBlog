import { redirect } from 'next/navigation'

export default function ArchivePage() {
  redirect('/editor/queue?tab=archive')
}
