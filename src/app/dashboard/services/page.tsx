import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Plus, Pencil, Briefcase } from 'lucide-react'

export default async function ServicesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // strictly only fetch THIS user's services
  const { data: services } = await supabase
    .from('services')
    .select('*')
    .eq('tutor_id', user.id)
    .order('created_at', { ascending: false })

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold">My Services</h1>
          <p className="text-white/40 text-sm mt-1">Manage your tutoring offerings</p>
        </div>
        <Link
          href="/dashboard/services/new"
          className="flex items-center gap-2 bg-[#26619C] hover:bg-[#1e4f82] transition-colors px-4 py-2.5 rounded-xl text-sm font-medium"
        >
          <Plus size={16} />
          New service
        </Link>
      </div>

      {services && services.length > 0 ? (
        <div className="grid gap-4">
          {services.map((service) => (
            <div
              key={service.id}
              className="bg-white/3 border border-white/8 rounded-2xl p-6 flex items-center justify-between"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-[#26619C]/10 border border-[#26619C]/20 flex items-center justify-center">
                  <Briefcase size={16} className="text-[#4a8fd4]" />
                </div>
                <div>
                  <p className="font-medium text-sm">{service.title}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-white/30">{service.category}</span>
                    <span className="text-white/20">·</span>
                    <span className="text-xs text-white/30">₱{service.price_per_hour}/hr</span>
                    <span className="text-white/20">·</span>
                    <span className="text-xs text-white/30">{service.mode}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className={
                  'text-xs px-2 py-1 rounded-full border ' +
                  (service.is_active
                    ? 'border-green-500/20 text-green-400 bg-green-500/10'
                    : 'border-white/10 text-white/30')
                }>
                  {service.is_active ? 'Active' : 'Inactive'}
                </span>
                <Link
                  href={'/dashboard/services/' + service.id + '/edit'}
                  className="p-2 text-white/20 hover:text-white transition-colors hover:bg-white/5 rounded-lg"
                >
                  <Pencil size={14} />
                </Link>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white/3 border border-white/8 rounded-2xl p-12 text-center">
          <Briefcase size={32} className="text-white/10 mx-auto mb-4" />
          <p className="text-white/40 text-sm mb-4">You haven't listed any services yet</p>
          <Link
            href="/dashboard/services/new"
            className="text-[#26619C] hover:text-[#4a8fd4] text-sm transition-colors"
          >
            Create your first service
          </Link>
        </div>
      )}
    </div>
  )
}