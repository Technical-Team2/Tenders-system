import { redirect } from 'next/navigation'

export default function RootPage() {
  // Always show landing page for all users
  redirect('/landing')
}
