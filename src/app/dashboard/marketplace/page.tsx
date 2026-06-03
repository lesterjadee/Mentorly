import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import MarketplaceClient from './MarketplaceClient'

export default async function MarketplacePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: services } = await supabase
    .from('services')
    .select('*, users(id, full_name, school)')
    .eq('is_active', true)
    .order('created_at', { ascending: false })

  const { data: featured } = await supabase
    .from('services')
    .select('*, users(id, full_name, school)')
    .eq('is_active', true)
    .order('created_at', { ascending: false })
    .limit(6)

  return (
    <MarketplaceClient
      services={(services || []) as any}
      currentUserId={user.id}
      featured={(featured || []) as any}
    />
  )
}
