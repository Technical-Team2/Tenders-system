'use client'

export {
  signIn as signInUser,
  signInWithGoogle,
  signOutUser,
  resetPassword,
  updatePassword,
} from '@/lib/auth/client'

export { getCurrentUser as getCurrentUserLocal } from '@/lib/auth/client'
