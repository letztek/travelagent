import { ImportWizard } from './components/ImportWizard'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function ImportPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  return (
    <div className="container mx-auto py-12 px-4">
      <ImportWizard />
    </div>
  )
}
