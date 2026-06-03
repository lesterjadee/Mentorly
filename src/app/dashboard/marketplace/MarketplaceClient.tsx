'use client'

import { useState, useEffect } from 'react'
import { Star, BookOpen, Filter, X, Search, ChevronDown, Award } from 'lucide-react'
import Link from 'next/link'
import TutorModal from './TutorModal'

const CATEGORIES = [
  'All', 'Mathematics', 'Science', 'Physics', 'Chemistry',
  'Biology', 'Programming', 'Web Development', 'English', 'Other'
]

type Service = {
  id: string
  tutor_id: string
  title: string
  description: string
  category: string
  price_per_hour: number
  mode: string
  users: {
    id: string
    full_name: string
    school: string
    trust_score: number
    mentor_score?: number
  } | null
}

type Props = {
  services: Service[]
  currentUserId: string
  featured: Service[]
}

export default function MarketplaceClient({ services, currentUserId, featured }: Props) {
  const [query, setQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [selectedMode, setSelectedMode] = useState('All')
  const [minPrice, setMinPrice] = useState('')
  const [maxPrice, setMaxPrice] = useState('')
  const [minRating, setMinRating] = useState(0)
  const [showFilters, setShowFilters] = useState(false)
  const [selectedServiceId, setSelectedServiceId] = useState<string | null>(null)
  const [sortBy, setSortBy] = useState<'newest' | 'price_asc' | 'price_desc' | 'rating'>('newest')

  const filtered = services.filter((s) => {
    if (selectedCategory !== 'All' && s.category !== selectedCategory) return false
    if (selectedMode !== 'All' && s.mode !== selectedMode) return false
    if (minPrice && s.price_per_hour < parseFloat(minPrice)) return false
    if (maxPrice && s.price_per_hour > parseFloat(maxPrice)) return false
    if (minRating > 0 && (s.users?.trust_score || 0) < minRating) return false
    if (query) {
      const q = query.toLowerCase()
      return (
        s.title.toLowerCase().includes(q) ||
        s.category.toLowerCase().includes(q) ||
        s.users?.full_name?.toLowerCase().includes(q) ||
        s.users?.school?.toLowerCase().includes(q)
      )
    }
    return true
  }).sort((a, b) => {
    if (sortBy === 'price_asc') return a.price_per_hour - b.price_per_hour
    if (sortBy === 'price_desc') return b.price_per_hour - a.price_per_hour
    if (sortBy === 'rating') return (b.users?.trust_score || 0) - (a.users?.trust_score || 0)
    return 0
  })

  const hasFilters = selectedCategory !== 'All' || selectedMode !== 'All' || minPrice !== '' || maxPrice !== '' || minRating > 0

  function clearFilters() {
    setSelectedCategory('All')
    setSelectedMode('All')
    setMinPrice('')
    setMaxPrice('')
    setMinRating(0)
    setQuery('')
  }

  function ServiceCard({ service, large = false }: { service: Service; large?: boolean }) {
    const isOwn = service.tutor_id === currentUserId
    const score = service.users?.mentor_score || service.users?.trust_score || 0

    return (
      <div
        className={
          'bg-white/3 border border-white/8 rounded-2xl overflow-hidden transition-all duration-200 group ' +
          'hover:border-[#26619C]/40 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-[#26619C]/5 cursor-pointer ' +
          (large ? 'p-6' : 'p-5')
        }
        onClick={() => !isOwn && setSelectedServiceId(service.id)}
      >
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className={
              'rounded-full bg-[#26619C]/20 border border-[#26619C]/30 flex items-center justify-center font-bold text-[#4a8fd4] flex-shrink-0 ' +
              (large ? 'w-11 h-11 text-base' : 'w-9 h-9 text-sm')
            }>
              {service.users?.full_name?.[0] ?? '?'}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-medium text-white/70 truncate">{service.users?.full_name}</p>
              <p className="text-[10px] text-white/30 truncate">{service.users?.school}</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 flex-shrink-0">
            {isOwn && (
              <span className="text-[10px] text-purple-400 border border-purple-500/20 bg-purple-500/10 px-2 py-0.5 rounded-full">
                Yours
              </span>
            )}
            <span className="text-[10px] text-white/30 border border-white/8 px-2 py-0.5 rounded-full capitalize">
              {service.mode}
            </span>
          </div>
        </div>

        <h3 className={'font-semibold mb-1 line-clamp-1 ' + (large ? 'text-sm' : 'text-xs')}>
          {service.title}
        </h3>
        {service.description && (
          <p className="text-xs text-white/30 line-clamp-2 leading-relaxed mb-3">
            {service.description}
          </p>
        )}

        <div className="flex items-center justify-between">
          <div className="flex flex-col gap-1">
            <span className="text-[10px] text-white/20">SPECS volunteer support</span>
          </div>
          <p className={'font-black text-green-400 ' + (large ? 'text-base' : 'text-sm')}>Free</p>
        </div>

        {!isOwn && (
          <div className="mt-3 pt-3 border-t border-white/5">
            <div className="w-full text-center bg-white/3 group-hover:bg-[#26619C] border border-white/8 group-hover:border-[#26619C] transition-all py-2 rounded-xl text-xs font-semibold text-white/40 group-hover:text-white">
              View profile & book
            </div>
          </div>
        )}
        {isOwn && (
          <div className="mt-3 pt-3 border-t border-white/5">
            <Link
              href={'/dashboard/services/' + service.id + '/edit'}
              onClick={(e) => e.stopPropagation()}
              className="block w-full text-center bg-white/3 hover:bg-white/8 border border-white/8 transition-all py-2 rounded-xl text-xs font-semibold text-white/30 hover:text-white/60"
            >
              Edit listing
            </Link>
          </div>
        )}
      </div>
    )
  }

  return (
    <>
      {selectedServiceId && (
        <TutorModal
          serviceId={selectedServiceId}
          onClose={() => setSelectedServiceId(null)}
        />
      )}

      <div className="w-full">
        {/* header */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-2xl font-black tracking-tight mb-1">Marketplace</h1>
            <p className="text-white/30 text-sm">
              {filtered.length} tutor{filtered.length !== 1 ? 's' : ''} available
            </p>
          </div>
          <Link
            href="/dashboard/requests/new"
            className="flex items-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 transition-all px-4 py-2.5 rounded-xl text-xs font-semibold text-white/50 hover:text-white"
          >
            <BookOpen size={13} />
            Post a request instead
          </Link>
        </div>

        {/* search + filter bar */}
        <div className="flex items-center gap-3 mb-4">
          <div className="relative flex-1">
            <Search size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search tutors, subjects, schools..."
              className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-white text-sm placeholder-white/20 focus:outline-none focus:border-[#26619C]/60 transition-colors"
            />
            {query && (
              <button
                onClick={() => setQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/20 hover:text-white/50 transition-colors"
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* sort */}
          <div className="relative">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-xs focus:outline-none focus:border-[#26619C]/60 transition-colors appearance-none pr-8 cursor-pointer"
            >
              <option value="newest" className="bg-[#0d1117]">Newest</option>
            </select>
            <ChevronDown size={12} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-white/30 pointer-events-none" />
          </div>

          {/* filter toggle */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={
              'flex items-center gap-2 px-4 py-3 rounded-xl border text-xs font-semibold transition-all ' +
              (hasFilters || showFilters
                ? 'bg-[#26619C]/20 border-[#26619C]/40 text-[#4a8fd4]'
                : 'bg-white/5 border-white/10 text-white/50 hover:border-white/20 hover:text-white')
            }
          >
            <Filter size={13} />
            Filters
            {hasFilters && (
              <span className="w-4 h-4 bg-[#26619C] rounded-full text-[9px] font-bold text-white flex items-center justify-center">
                !
              </span>
            )}
          </button>
        </div>

        {/* filter panel */}
        {showFilters && (
          <div className="bg-white/3 border border-white/8 rounded-2xl p-5 mb-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">

              {/* mode */}
              <div>
                <label className="text-[10px] text-white/30 uppercase tracking-wider mb-2 block">Mode</label>
                <div className="flex flex-col gap-1.5">
                  {['All', 'online', 'in-person', 'both'].map((m) => (
                    <button
                      key={m}
                      onClick={() => setSelectedMode(m)}
                      className={
                        'text-left px-3 py-1.5 rounded-lg text-xs transition-all capitalize ' +
                        (selectedMode === m
                          ? 'bg-[#26619C]/20 text-[#4a8fd4] border border-[#26619C]/30'
                          : 'text-white/40 hover:text-white hover:bg-white/5 border border-transparent')
                      }
                    >
                      {m}
                    </button>
                  ))}
                </div>
              </div>

              {/* clear */}
              <div className="flex items-end">
                {hasFilters && (
                  <button
                    onClick={clearFilters}
                    className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 rounded-xl text-xs font-semibold transition-all"
                  >
                    <X size={12} />
                    Clear all
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* category pills */}
        <div className="flex gap-2 overflow-x-auto pb-2 mb-6 scrollbar-hide">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={
                'px-4 py-2 rounded-full text-xs font-semibold border transition-all whitespace-nowrap flex-shrink-0 ' +
                (selectedCategory === cat
                  ? 'bg-[#26619C] border-[#26619C] text-white shadow-lg shadow-[#26619C]/20'
                  : 'border-white/10 text-white/40 hover:border-white/20 hover:text-white/70')
              }
            >
              {cat}
            </button>
          ))}
        </div>

        {/* featured row */}
        {featured.length > 0 && !query && selectedCategory === 'All' && !hasFilters && (
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <BookOpen size={14} className="text-[#4a8fd4]" />
              <p className="text-sm font-bold">Featured SPECS support</p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {featured.slice(0, 3).map((s) => (
                <ServiceCard key={s.id} service={s} large />
              ))}
            </div>
          </div>
        )}

        {/* divider */}
        {featured.length > 0 && !query && selectedCategory === 'All' && !hasFilters && (
          <div className="flex items-center gap-3 mb-6">
            <div className="flex-1 h-px bg-white/5" />
            <p className="text-[10px] text-white/20 uppercase tracking-widest">All listings</p>
            <div className="flex-1 h-px bg-white/5" />
          </div>
        )}

        {/* all results grid */}
        {filtered.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((service) => (
              <ServiceCard key={service.id} service={service} />
            ))}
          </div>
        ) : (
          <div className="bg-white/3 border border-white/8 rounded-2xl p-16 text-center">
            <BookOpen size={36} className="text-white/10 mx-auto mb-4" />
            <p className="text-white/40 font-semibold mb-1">No tutors found</p>
            <p className="text-white/20 text-sm mb-5">Try adjusting your filters or search term</p>
            {hasFilters && (
              <button
                onClick={clearFilters}
                className="text-[#26619C] hover:text-[#4a8fd4] text-sm transition-colors"
              >
                Clear all filters
              </button>
            )}
          </div>
        )}
      </div>
    </>
  )
}
