import { redirect } from 'next/navigation'

// All admin-dashboard routes have moved to /user/*
export default function AdminDashboardRootPage() {
  redirect('/user')
}