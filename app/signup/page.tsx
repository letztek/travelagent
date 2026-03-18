import { notFound } from 'next/navigation'

export default function SignupPage() {
  // Public signup is disabled in favor of invite-only system
  return notFound()
}
