import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Search, Star, BookOpen } from 'lucide-react'

const CATEGORIES = ['All', 'Mathematics', 'Science', 'Physics', 'Chemistry', 'Biology', 'Programming', 'Web Development', 'English', 'Other']

export default async function MarketplacePage({
  searchParams,
}: {
  searchParams: { category?: string; q?: string }
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const selectedCategory = searchParams.category || 'All'
  const query = searchParams.q || ''

  let servicesQuery = supabase
    .from('services')
    .select('*, users(full_name, school, course, trust_score, avatar_url)')
    .eq('is_active', true)
    .neq('tutor_id', user.id)

  if (selectedCategory !== 'All') {
    servicesQuery = servicesQuery.eq('category', selectedCategory)
  }
  if (query) {
    servicesQuery = servicesQuery.ilike('title', `%${query}%`)
  }

  const { data: services } = await servicesQuery.order('created_at', { ascending: false })

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-1">Marketplace</h1>
        <p className="text-white/40 text-sm">Find the right tutor for you</p>
      </div>

      {/* search */}
      <form className="relative mb-6">
        <Search size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" />
        <input
          name="q"
          defaultValue={query}
          placeholder="Search subjects, skills..."
          className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-white text-sm placeholder-white/20 focus:outline-none focus:border-[#26619C]/60 transition-colors"
        />
        {selectedCategory !== 'All' && (
          <input type="hidden" name="category" value={selectedCategory} />
        )}
      </form>

      {/* categories */}
      <div className="flex gap-2 flex-wrap mb-8">
        {CATEGORIES.map((cat) => (
          
            key={cat}
            href={`/dashboard/marketplace?category=${cat}${query ? `&q=${query}` : ''}`}
            className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
              selectedCategory === cat
                ? 'bg-[#26619C] border-[#26619C] text-white'
                : 'border-white/10 text-white/40 hover:border-white/20 hover:text-white/70'
            }`}
          >
            {cat}
          </a>
        ))}
      </div>

      {/* results */}
      {services && services.length > 0 ? (
        <div className="grid md:grid-cols-2 gap-4">
          {services.map((service: any) => (
            <div key={service.id} className="bg-white/3 border border-white/8 rounded-2xl p-6 hover:border-[#26619C]/30 transition-colors">
              <div className="flex items-start justify-between mb-4">
                <div className="w-10 h-10 rounded-full bg-[#26619C]/20 border border-[#26619C]/30 flex items-center justify-center text-sm font-medium text-[#4a8fd4]">
                  {service.users?.full_name?.[0] || '?'}
                </div>
                <span className="text-xs text-white/30 border border-white/10 px-2 py-1 rounded-full">
                  {service.mode}
                </span>
              </div>
              <h3 className="font-medium text-sm mb-1">{service.title}</h3>
              <p className="text-xs text-white/30 mb-3 leading-relaxed line-clamp-2">{service.description}</p>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-white/40">{service.users?.full_name}</p>
                  <p className="text-xs text-white/20">{service.users?.school}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-[#4a8fd4]">₱{service.price_per_hour}/hr</p>
                  <div className="flex items-center gap-1 justify-end mt-0.5">
                    <Star size={10} className="text-yellow-400" />
                    <span className="text-xs text-white/30">
                      {service.users?.trust_score > 0 ? service.users.trust_score : 'New'}
                    </span>
                  </div>
                </div>
              </div>
              <button className="w-full mt-4 bg-white/5 hover:bg-[#26619C] border border-white/10 hover:border-[#26619C] transition-all py-2 rounded-xl text-xs font-medium text-white/60 hover:text-white">
                Book session
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white/3 border border-white/8 rounded-2xl p-12 text-center">
          <BookOpen size={32} className="text-white/10 mx-auto mb-4" />
          <p className="text-white/40 text-sm">No services found</p>
          <p className="text-white/20 text-xs mt-1">Try a different category or search term</p>
        </div>
      )}
    </div>
  )
}