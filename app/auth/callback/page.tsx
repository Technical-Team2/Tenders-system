import { redirect } from 'next/navigation'

export default function AuthCallbackRedirect() {
  redirect('/callback')
}
