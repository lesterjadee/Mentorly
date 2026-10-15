import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Plus, Pencil, Briefcase, GraduationCap } from 'lucide-react'

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
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#E8F0E7] text-[#315B3B] text-xs font-semibold mb-1">
            <GraduationCap size={13} />
            Peer Offerings
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#20251F] tracking-tight">My Services</h1>
          <p className="text-[#6B716B] text-sm mt-0.5">Manage the subjects and topics you tutor for campus peers</p>
        </div>
        <Link
          href="/dashboard/services/new"
          className="inline-flex items-center gap-2 bg-[#F26A21] hover:bg-[#D95416] transition-colors px-4 py-2.5 rounded-xl text-sm font-semibold text-white shadow-xs self-start sm:self-auto"
        >
          <Plus size={16} />
          Create new service
        </Link>
      </div>

      {services && services.length > 0 ? (
        <div className="grid gap-4">
          {services.map((service) => (
            <div
              key={service.id}
              className="bg-white border border-[#E8E5DE] rounded-2xl p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs hover:border-[#F26A21]/30 transition-all"
            >
              <div className="flex items-start sm:items-center gap-4">
                <div className="w-11 h-11 rounded-xl bg-[#FFF0E5] border border-[#F26A21]/20 flex items-center justify-center flex-shrink-0 text-[#F26A21]">
                  <Briefcase size={20} />
                </div>
                <div>
                  <h2 className="font-semibold text-base text-[#20251F]">{service.title}</h2>
                  <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                    <span className="text-xs font-medium text-[#20251F] bg-[#F5F3ED] border border-[#E8E5DE] px-2.5 py-0.5 rounded-md">
                      {service.category}
                    </span>
                    <span className="text-xs font-medium text-[#20251F] bg-[#F5F3ED] border border-[#E8E5DE] px-2.5 py-0.5 rounded-md capitalize">
                      {service.mode}
                    </span>
                    <span className="text-xs font-semibold text-[#315B3B] bg-[#E8F0E7] border border-[#315B3B]/20 px-2.5 py-0.5 rounded-md">
                      Free Peer Support
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between sm:justify-end gap-3 pt-3 sm:pt-0 border-t sm:border-t-0 border-[#E8E5DE]">
                <span className={
                  'text-xs px-3 py-1 rounded-full font-semibold border ' +
                  (service.is_active
                    ? 'border-[#315B3B]/20 text-[#315B3B] bg-[#E8F0E7]'
                    : 'border-[#E8E5DE] text-[#6B716B] bg-[#F5F3ED]')
                }>
                  {service.is_active ? 'Active on Marketplace' : 'Inactive'}
                </span>
                <Link
                  href={'/dashboard/services/' + service.id + '/edit'}
                  className="p-2 text-[#6B716B] hover:text-[#20251F] hover:bg-[#F5F3ED] border border-[#E8E5DE] transition-colors rounded-xl shadow-xs"
                  title="Edit service"
                >
                  <Pencil size={15} />
                </Link>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white border border-[#E8E5DE] rounded-2xl p-12 text-center shadow-xs">
          <div className="w-14 h-14 rounded-2xl bg-[#FFF0E5] border border-[#F26A21]/20 flex items-center justify-center text-[#F26A21] mx-auto mb-4">
            <Briefcase size={24} />
          </div>
          <h2 className="text-base font-semibold text-[#20251F]">You haven't listed any services yet</h2>
          <p className="text-sm text-[#6B716B] mt-1 max-w-sm mx-auto mb-4">
            Share your strengths in programming, math, science, or general coursework with fellow students.
          </p>
          <Link
            href="/dashboard/services/new"
            className="inline-flex items-center gap-2 bg-[#F26A21] hover:bg-[#D95416] text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-colors shadow-xs"
          >
            <Plus size={16} />
            Create your first service
          </Link>
        </div>
      )}
    </div>
  )
}
