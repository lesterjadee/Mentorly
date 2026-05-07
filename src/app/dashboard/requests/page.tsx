import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Plus, BookOpen, Search } from 'lucide-react'

export default async function RequestsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: requests } = await supabase
    .from('requests')
    .select('*')
    .eq('learner_id', user.id)
    .order('created_at', { ascending: false })

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold">My Requests</h1>
          <p className="text-white/40 text-sm mt-1">Help requests you've posted</p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard/requests/browse"
            className="flex items-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 transition-colors px-4 py-2.5 rounded-xl text-sm font-medium text-white/60 hover:text-white"
          >
            <Search size={15} />
            Browse requests
          </Link>
          <Link
            href="/dashboard/requests/new"
            className="flex items-center gap-2 bg-[#26619C] hover:bg-[#1e4f82] transition-colors px-4 py-2.5 rounded-xl text-sm font-medium"
          >
            <Plus size={16} />
            New request
          </Link>
        </div>
      </div>

      {requests && requests.length > 0 ? (
        <div className="grid gap-4">
          {requests.map((req) => (
            <div key={req.id} className="bg-white/3 border border-white/8 rounded-2xl p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center mt-0.5">
                    <BookOpen size={16} className="text-purple-400" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">{req.title}</p>
                    <p className="text-xs text-white/30 mt-1 max-w-lg leading-relaxed">{req.description}</p>
                    <div className="flex items-center gap-2 mt-2 flex-wrap">
                      <span className="text-xs text-white/30 border border-white/8 bg-white/3 px-2 py-1 rounded-lg">{req.category}</span>
                      {req.budget && (
                        <span className="text-xs text-[#4a8fd4] border border-[#26619C]/20 bg-[#26619C]/10 px-2 py-1 rounded-lg">
                          Budget: ₱{req.budget}/hr
                        </span>
                      )}
                      <span className="text-xs text-white/30 border border-white/8 bg-white/3 px-2 py-1 rounded-lg capitalize">{req.mode}</span>
                    </div>
                  </div>
                </div>
                <span className={
                  'text-xs px-2 py-1 rounded-full border flex-shrink-0 ' +
                  (req.status === 'open'
                    ? 'border-green-500/20 text-green-400 bg-green-500/10'
                    : 'border-white/10 text-white/30')
                }>
                  {req.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white/3 border border-white/8 rounded-2xl p-12 text-center">
          <BookOpen size={32} className="text-white/10 mx-auto mb-4" />
          <p className="text-white/40 text-sm mb-4">You haven't posted any requests yet</p>
          <Link href="/dashboard/requests/new" className="text-[#26619C] hover:text-[#4a8fd4] text-sm transition-colors">
            Post your first request
          </Link>
        </div>
      )}
    </div>
  )
}