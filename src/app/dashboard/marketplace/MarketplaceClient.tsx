'use client'

import { useState } from 'react'
import { BookOpen, Filter, X, Search, ChevronDown, ShieldCheck, Sparkles, GraduationCap } from 'lucide-react'
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

    return (
      <div
        className={
          'bg-white border border-[#E8E5DE] rounded-2xl overflow-hidden transition-all duration-200 group ' +
          'hover:border-[#F26A21]/40 hover:-translate-y-0.5 hover:shadow-md cursor-pointer shadow-xs flex flex-col justify-between ' +
          (large ? 'p-6' : 'p-5')
        }
        onClick={() => !isOwn && setSelectedServiceId(service.id)}
      >
        <div>
          <div className="flex items-start justify-between mb-3.5">
            <div className="flex items-center gap-3">
              <div className={
                'rounded-xl bg-[#FFF0E5] border border-[#F26A21]/20 flex items-center justify-center font-bold text-[#F26A21] flex-shrink-0 shadow-xs ' +
                (large ? 'w-12 h-12 text-base' : 'w-10 h-10 text-sm')
              }>
                {service.users?.full_name?.[0] ?? '?'}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-[#20251F] truncate group-hover:text-[#F26A21] transition-colors">
                  {service.users?.full_name}
                </p>
                <p className="text-[11px] text-[#6B716B] truncate">{service.users?.school || 'Gordon College'}</p>
              </div>
            </div>
            <div className="flex items-center gap-1.5 flex-shrink-0">
              {isOwn && (
                <span className="text-[10px] font-semibold text-[#F26A21] border border-[#F26A21]/20 bg-[#FFF0E5] px-2 py-0.5 rounded-full">
                  Yours
                </span>
              )}
              <span className="text-[10px] font-medium text-[#20251F] border border-[#E8E5DE] bg-[#F5F3ED] px-2.5 py-0.5 rounded-full capitalize">
                {service.mode}
              </span>
            </div>
          </div>

          <div className="mb-2">
            <span className="text-[10px] font-semibold text-[#315B3B] bg-[#E8F0E7] border border-[#315B3B]/20 px-2 py-0.5 rounded-md mb-1.5 inline-block">
              {service.category}
            </span>
            <h3 className={'font-bold text-[#20251F] line-clamp-1 ' + (large ? 'text-base' : 'text-sm')}>
              {service.title}
            </h3>
          </div>

          {service.description && (
            <p className="text-xs text-[#6B716B] line-clamp-2 leading-relaxed mb-4">
              {service.description}
            </p>
          )}
        </div>

        <div>
          <div className="flex items-center justify-between pt-3 border-t border-[#E8E5DE]/60 mb-3">
            <span className="text-xs text-[#6B716B] flex items-center gap-1">
              <ShieldCheck size={13} className="text-[#315B3B]" />
              SPECS Support
            </span>
            <span className="text-sm font-bold text-[#315B3B] bg-[#E8F0E7] border border-[#315B3B]/20 px-2.5 py-0.5 rounded-full">
              Free
            </span>
          </div>

          {!isOwn && (
            <div className="w-full text-center bg-[#F5F3ED] group-hover:bg-[#F26A21] border border-[#E8E5DE] group-hover:border-[#F26A21] transition-all py-2.5 rounded-xl text-xs font-semibold text-[#20251F] group-hover:text-white shadow-xs">
              View profile & book session
            </div>
          )}
          {isOwn && (
            <Link
              href={'/dashboard/services/' + service.id + '/edit'}
              onClick={(e) => e.stopPropagation()}
              className="block w-full text-center bg-[#F5F3ED] hover:bg-[#E8E5DE] border border-[#E8E5DE] transition-all py-2.5 rounded-xl text-xs font-semibold text-[#20251F]"
            >
              Edit listing
            </Link>
          )}
        </div>
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

      <div className="w-full space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#E8F0E7] text-[#315B3B] text-xs font-semibold mb-1">
              <GraduationCap size={13} />
              Peer Educator Marketplace
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-[#20251F] tracking-tight">Tutor Marketplace</h1>
            <p className="text-[#6B716B] text-sm mt-0.5">
              Connect with {filtered.length} verified peer educator{filtered.length !== 1 ? 's' : ''} offering free academic mentoring
            </p>
          </div>
          <Link
            href="/dashboard/requests/new"
            className="inline-flex items-center gap-2 bg-white hover:bg-[#F5F3ED] border border-[#E8E5DE] transition-all px-4 py-2.5 rounded-xl text-xs font-semibold text-[#20251F] shadow-xs self-start sm:self-auto"
          >
            <BookOpen size={14} className="text-[#F26A21]" />
            Post a request instead
          </Link>
        </div>

        {/* Search + Filter Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#6B716B]" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search tutors by name, subject (e.g. Calculus, Physics), school..."
              className="w-full bg-white border border-[#E8E5DE] rounded-xl pl-11 pr-10 py-2.5 text-[#20251F] text-sm placeholder-[#6B716B]/60 focus:outline-none focus:border-[#F26A21] focus:ring-2 focus:ring-[#F26A21]/15 transition-all shadow-xs"
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6B716B] hover:text-[#20251F] transition-colors p-1"
              >
                <X size={14} />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            {/* Sort */}
            <div className="relative flex-1 sm:flex-initial">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="w-full bg-white border border-[#E8E5DE] rounded-xl px-4 py-2.5 text-[#20251F] text-xs font-semibold focus:outline-none focus:border-[#F26A21] transition-all appearance-none pr-8 cursor-pointer shadow-xs"
              >
                <option value="newest">Newest first</option>
                <option value="rating">Top rated mentors</option>
              </select>
              <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6B716B] pointer-events-none" />
            </div>

            {/* Filter Toggle */}
            <button
              type="button"
              onClick={() => setShowFilters(!showFilters)}
              className={
                'flex items-center gap-2 px-4 py-2.5 rounded-xl border text-xs font-semibold transition-all shadow-xs ' +
                (hasFilters || showFilters
                  ? 'bg-[#FFF0E5] border-[#F26A21]/40 text-[#F26A21]'
                  : 'bg-white border-[#E8E5DE] text-[#6B716B] hover:text-[#20251F]')
              }
            >
              <Filter size={13} />
              Filters
              {hasFilters && (
                <span className="w-4 h-4 bg-[#F26A21] rounded-full text-[10px] font-bold text-white flex items-center justify-center">
                  !
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Filter Panel */}
        {showFilters && (
          <div className="bg-white border border-[#E8E5DE] rounded-2xl p-5 shadow-xs">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <label className="text-xs font-bold text-[#6B716B] uppercase tracking-wider mb-2 block">Instruction Mode</label>
                <div className="flex flex-wrap gap-2">
                  {['All', 'online', 'in-person', 'both'].map((m) => {
                    const isSelected = selectedMode === m
                    return (
                      <button
                        key={m}
                        type="button"
                        onClick={() => setSelectedMode(m)}
                        className={
                          'px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all capitalize border ' +
                          (isSelected
                            ? 'bg-[#FFF0E5] text-[#F26A21] border-[#F26A21]/40 shadow-xs'
                            : 'bg-[#FFFCF7] text-[#6B716B] border-[#E8E5DE] hover:text-[#20251F]')
                        }
                      >
                        {m}
                      </button>
                    )
                  })}
                </div>
              </div>

              {hasFilters && (
                <button
                  type="button"
                  onClick={clearFilters}
                  className="flex items-center gap-1.5 px-3 py-2 bg-red-50 hover:bg-red-100 border border-red-200 text-red-700 rounded-xl text-xs font-semibold transition-all self-end sm:self-auto"
                >
                  <X size={13} />
                  Reset filters
                </button>
              )}
            </div>
          </div>
        )}

        {/* Category Pills */}
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {CATEGORIES.map((cat) => {
            const isSelected = selectedCategory === cat
            return (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={
                  'px-4 py-2 rounded-full text-xs font-semibold border transition-all whitespace-nowrap flex-shrink-0 ' +
                  (isSelected
                    ? 'bg-[#F26A21] border-[#F26A21] text-white shadow-xs'
                    : 'bg-white border-[#E8E5DE] text-[#6B716B] hover:border-[#F26A21]/30 hover:text-[#20251F]')
                }
              >
                {cat}
              </button>
            )
          })}
        </div>

        {/* Featured Row */}
        {featured.length > 0 && !query && selectedCategory === 'All' && !hasFilters && (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-[#E8F0E7] text-[#315B3B] flex items-center justify-center">
                <Sparkles size={15} />
              </div>
              <h2 className="text-sm font-bold text-[#20251F]">Featured SPECS Academic Support</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {featured.slice(0, 3).map((s) => (
                <ServiceCard key={s.id} service={s} large />
              ))}
            </div>
          </div>
        )}

        {/* Divider if featured is visible */}
        {featured.length > 0 && !query && selectedCategory === 'All' && !hasFilters && (
          <div className="flex items-center gap-3 pt-2">
            <div className="flex-1 h-px bg-[#E8E5DE]" />
            <p className="text-[11px] font-bold text-[#6B716B] uppercase tracking-wider">All Peer Services</p>
            <div className="flex-1 h-px bg-[#E8E5DE]" />
          </div>
        )}

        {/* All Results Grid */}
        {filtered.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((service) => (
              <ServiceCard key={service.id} service={service} />
            ))}
          </div>
        ) : (
          <div className="bg-white border border-[#E8E5DE] rounded-2xl p-16 text-center shadow-xs">
            <div className="w-14 h-14 rounded-2xl bg-[#FFF0E5] border border-[#F26A21]/20 flex items-center justify-center text-[#F26A21] mx-auto mb-4">
              <BookOpen size={24} />
            </div>
            <h2 className="text-base font-semibold text-[#20251F]">No tutors or services found</h2>
            <p className="text-sm text-[#6B716B] mt-1 max-w-sm mx-auto mb-4">
              Try adjusting your category selection, search terms, or active filters.
            </p>
            {hasFilters && (
              <button
                type="button"
                onClick={clearFilters}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#F26A21] hover:underline"
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
