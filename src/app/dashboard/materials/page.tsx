import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import {
  FileText, Download, Search, Shield,
  Plus, BookOpen, CheckCircle2
} from 'lucide-react'

const SUBJECTS = [
  'All', 'Mathematics', 'Science', 'Physics', 'Chemistry',
  'Biology', 'Programming', 'Web Development', 'English',
  'Filipino', 'History', 'Accounting', 'Economics', 'Other'
]

const FILE_TYPES = [
  { value: 'all', label: 'All files' },
  { value: 'pdf', label: 'PDF' },
  { value: 'doc', label: 'Document' },
  { value: 'ppt', label: 'Presentation' },
  { value: 'image', label: 'Image' },
]

type Props = {
  searchParams: Promise<{ subject?: string; type?: string; q?: string; uploaded?: string }>
}

export default async function MaterialsPage({ searchParams }: Props) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const params = await searchParams
  const subject = params.subject ?? 'All'
  const fileType = params.type ?? 'all'
  const query = params.q ?? ''
  const justUploaded = params.uploaded === 'true'

  const { data: profile } = await supabase
    .from('users')
    .select('is_specs_member')
    .eq('id', user.id)
    .single()

  const isSpecsMember = profile?.is_specs_member || false

  let dbQuery = supabase
    .from('study_materials')
    .select(`
      *,
      uploader:users!study_materials_uploaded_by_fkey(
        id, full_name, course, specs_role, is_specs_member
      ),
      session:services!study_materials_session_id_fkey(
        id, title
      )
    `)

  if (subject !== 'All') dbQuery = dbQuery.eq('subject', subject)

  if (fileType !== 'all') {
    if (fileType === 'pdf') {
      dbQuery = dbQuery.ilike('file_type', '%pdf%')
    } else if (fileType === 'doc') {
      dbQuery = dbQuery.or(
        'file_type.ilike.%word%,file_type.ilike.%document%,file_name.ilike.%.doc%,file_name.ilike.%.docx%'
      )
    } else if (fileType === 'ppt') {
      dbQuery = dbQuery.or(
        'file_type.ilike.%presentation%,file_name.ilike.%.ppt%,file_name.ilike.%.pptx%'
      )
    } else if (fileType === 'image') {
      dbQuery = dbQuery.ilike('file_type', 'image/%')
    }
  }

  if (query) {
    dbQuery = dbQuery.or(
      'title.ilike.%' + query + '%,' +
      'description.ilike.%' + query + '%,' +
      'subject.ilike.%' + query + '%'
    )
  }

  const { data: materials } = await dbQuery.order('created_at', { ascending: false })

  function formatDate(dateStr: string) {
    return new Date(dateStr).toLocaleDateString('en-PH', {
      month: 'short', day: 'numeric', year: 'numeric'
    })
  }

  function formatFileSize(bytes: number) {
    if (!bytes) return ''
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
  }

  function getFileIcon(fileType?: string, fileName?: string) {
    const type = (fileType || '').toLowerCase()
    const name = (fileName || '').toLowerCase()
    if (type.includes('pdf') || name.endsWith('.pdf')) return '📄'
    if (type.includes('word') || name.endsWith('.doc') || name.endsWith('.docx')) return '📝'
    if (type.includes('presentation') || name.endsWith('.ppt') || name.endsWith('.pptx')) return '📊'
    if (type.includes('sheet') || name.endsWith('.xls') || name.endsWith('.xlsx')) return '📈'
    if (type.startsWith('image/')) return '🖼️'
    if (name.endsWith('.txt')) return '📃'
    return '📁'
  }

  function getFileColor(fileType?: string, fileName?: string) {
    const type = (fileType || '').toLowerCase()
    const name = (fileName || '').toLowerCase()
    if (type.includes('pdf') || name.endsWith('.pdf'))
      return 'bg-red-50 border-red-200 text-red-600'
    if (type.includes('word') || name.endsWith('.doc') || name.endsWith('.docx'))
      return 'bg-[#E8F0E7] border-[#315B3B]/20 text-[#315B3B]'
    if (type.includes('presentation') || name.endsWith('.ppt') || name.endsWith('.pptx'))
      return 'bg-[#FFF0E5] border-[#F26A21]/20 text-[#D95416]'
    if (type.startsWith('image/'))
      return 'bg-[#FFF0E5] border-[#F26A21]/20 text-[#D95416]'
    return 'bg-[#F5F3ED] border-[#E8E5DE] text-[#6B716B]'
  }

  // group by subject for default view
  const subjectGroups = (materials || []).reduce<Record<string, any[]>>((acc, mat) => {
    const s = mat.subject || 'Other'
    if (!acc[s]) acc[s] = []
    acc[s].push(mat)
    return acc
  }, {})

  const totalMaterials = (materials || []).length
  const isFiltered = query || subject !== 'All' || fileType !== 'all'

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-6 h-6 rounded-lg bg-[#E8F0E7] text-[#315B3B] flex items-center justify-center">
              <FileText size={14} />
            </span>
            <span className="text-xs font-bold text-[#315B3B] uppercase tracking-wider">Academic Repository</span>
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight text-[#20251F]">Study Materials & Reviewers</h1>
          <p className="text-xs text-[#6B716B] mt-0.5">
            Free downloadable notes, reviewers, and decks uploaded by SPECS tutors · <span className="font-bold text-[#315B3B]">{totalMaterials} files available</span>
          </p>
        </div>

        {isSpecsMember && (
          <Link
            href="/dashboard/materials/upload"
            className="inline-flex items-center gap-2 bg-[#F26A21] hover:bg-[#D95416] text-white px-4 py-2.5 rounded-xl text-xs font-bold shadow-xs hover:shadow transition-all self-start sm:self-auto"
          >
            <Plus size={15} />
            Upload Materials
          </Link>
        )}
      </div>

      {justUploaded && (
        <div className="bg-[#E8F0E7] border border-[#315B3B]/25 rounded-2xl p-4 flex items-center gap-3 shadow-2xs">
          <CheckCircle2 size={18} className="text-[#315B3B] flex-shrink-0" />
          <p className="text-xs font-bold text-[#315B3B]">
            Material uploaded successfully! It is now accessible to all Gordon College students.
          </p>
        </div>
      )}

      {/* Free notice banner */}
      <div className="flex items-start gap-3 bg-[#E8F0E7] border border-[#315B3B]/20 rounded-2xl p-4 shadow-2xs">
        <Shield size={16} className="text-[#315B3B] flex-shrink-0 mt-0.5" />
        <p className="text-xs text-[#24452D] leading-relaxed font-medium">
          All study materials are free open-access educational assets created by <span className="font-bold underline decoration-[#315B3B]">SPECS members</span> for the Gordon College community. Download without any bookings or charges.
        </p>
      </div>

      {/* Search Input */}
      <form className="relative">
        <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#939A92]" />
        <input
          name="q"
          defaultValue={query}
          placeholder="Search materials by title, topic, or subject..."
          className="w-full bg-white border border-[#E8E5DE] rounded-xl pl-11 pr-4 py-3 text-[#20251F] text-sm placeholder:text-[#939A92] focus:border-[#F26A21] focus:ring-2 focus:ring-[#F26A21]/15 transition-all shadow-2xs outline-none"
        />
        {subject !== 'All' && <input type="hidden" name="subject" value={subject} />}
        {fileType !== 'all' && <input type="hidden" name="type" value={fileType} />}
      </form>

      {/* File type filter pills */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
        {FILE_TYPES.map((t) => (
          <Link
            key={t.value}
            href={
              '/dashboard/materials?type=' + t.value +
              (subject !== 'All' ? '&subject=' + subject : '') +
              (query ? '&q=' + query : '')
            }
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold border transition-all whitespace-nowrap flex-shrink-0 ${
              fileType === t.value
                ? 'bg-[#F26A21] border-[#F26A21] text-white shadow-2xs'
                : 'bg-white border-[#E8E5DE] text-[#6B716B] hover:border-[#F26A21]/40 hover:text-[#20251F]'
            }`}
          >
            {t.label}
          </Link>
        ))}
      </div>

      {/* Subject filter pills */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {SUBJECTS.map((s) => (
          <Link
            key={s}
            href={
              '/dashboard/materials?subject=' + s +
              (fileType !== 'all' ? '&type=' + fileType : '') +
              (query ? '&q=' + query : '')
            }
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold border transition-all whitespace-nowrap flex-shrink-0 ${
              subject === s
                ? 'bg-[#315B3B] border-[#315B3B] text-white shadow-2xs'
                : 'bg-white border-[#E8E5DE] text-[#6B716B] hover:border-[#315B3B]/40 hover:text-[#20251F]'
            }`}
          >
            {s}
          </Link>
        ))}
      </div>

      {/* Materials Display */}
      {totalMaterials > 0 ? (
        isFiltered ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {(materials || []).map((mat: any) => (
              <MaterialCard
                key={mat.id}
                mat={mat}
                formatDate={formatDate}
                formatFileSize={formatFileSize}
                getFileIcon={getFileIcon}
                getFileColor={getFileColor}
              />
            ))}
          </div>
        ) : (
          <div className="space-y-8">
            {Object.entries(subjectGroups).map(([subj, mats]) => (
              <div key={subj}>
                <div className="flex items-center gap-3 mb-3.5">
                  <h2 className="text-sm font-bold text-[#20251F] uppercase tracking-wider">{subj}</h2>
                  <div className="flex-1 h-px bg-[#E8E5DE]" />
                  <span className="text-xs font-bold text-[#315B3B] bg-[#E8F0E7] px-2.5 py-0.5 rounded-full border border-[#315B3B]/20">
                    {mats.length} file{mats.length !== 1 ? 's' : ''}
                  </span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                  {mats.map((mat: any) => (
                    <MaterialCard
                      key={mat.id}
                      mat={mat}
                      formatDate={formatDate}
                      formatFileSize={formatFileSize}
                      getFileIcon={getFileIcon}
                      getFileColor={getFileColor}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )
      ) : (
        <div className="bg-white border border-[#E8E5DE] rounded-2xl p-12 text-center shadow-xs">
          <FileText size={24} className="text-[#939A92] mx-auto mb-2" />
          <p className="text-sm font-bold text-[#20251F]">No study materials found</p>
          <p className="text-xs text-[#6B716B] mt-1 max-w-sm mx-auto mb-4">
            {isFiltered
              ? 'Try choosing a different file type or subject filter.'
              : 'SPECS members will upload reviewers here soon. Feel free to request notes!'}
          </p>
          <Link
            href="/dashboard/requests/new"
            className="inline-flex items-center gap-1.5 bg-[#315B3B] hover:bg-[#24452D] text-white px-4 py-2 rounded-xl text-xs font-bold shadow-2xs transition-all"
          >
            Post a Reviewer Request →
          </Link>
        </div>
      )}
    </div>
  )
}

function MaterialCard({
  mat,
  formatDate,
  formatFileSize,
  getFileIcon,
  getFileColor,
}: {
  mat: any
  formatDate: (d: string) => string
  formatFileSize: (b: number) => string
  getFileIcon: (t?: string, n?: string) => string
  getFileColor: (t?: string, n?: string) => string
}) {
  const colorClass = getFileColor(mat.file_type, mat.file_name)

  return (
    <div className="bg-white border border-[#E8E5DE] rounded-2xl p-5 shadow-[0_1px_3px_rgba(0,0,0,0.03)] hover:border-[#315B3B]/40 hover:shadow-md transition-all duration-200 group flex flex-col justify-between">
      <div>
        {/* Header icon and title */}
        <div className="flex items-start gap-3.5 mb-3">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg border flex-shrink-0 shadow-2xs ${colorClass}`}>
            {getFileIcon(mat.file_type, mat.file_name)}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-[#20251F] group-hover:text-[#315B3B] transition-colors line-clamp-2 leading-snug">
              {mat.title}
            </p>
            {mat.subject && (
              <span className="text-[10px] font-bold text-[#D95416] bg-[#FFF0E5] border border-[#F26A21]/20 px-2 py-0.5 rounded-full mt-1.5 inline-block">
                {mat.subject}
              </span>
            )}
          </div>
        </div>

        {/* Description */}
        {mat.description && (
          <p className="text-xs text-[#6B716B] leading-relaxed mb-3 line-clamp-2">
            {mat.description}
          </p>
        )}

        {/* Linked session */}
        {mat.session && (
          <div className="flex items-center gap-1.5 mb-3 bg-[#FFFCF7] p-2 rounded-lg border border-[#E8E5DE]">
            <BookOpen size={12} className="text-[#F26A21] flex-shrink-0" />
            <p className="text-[11px] font-semibold text-[#20251F] truncate">
              Session: {mat.session.title}
            </p>
          </div>
        )}

        {/* Uploader info */}
        <div className="flex items-center gap-2 mb-3.5 text-xs text-[#6B716B]">
          <div className="w-5 h-5 rounded-full bg-[#E8F0E7] text-[#315B3B] border border-[#315B3B]/20 flex items-center justify-center text-[10px] font-bold flex-shrink-0">
            {mat.uploader?.full_name?.[0] || 'U'}
          </div>
          <p className="text-xs font-semibold text-[#20251F] truncate flex items-center gap-1">
            {mat.uploader?.full_name}
            <Shield size={10} className="text-[#315B3B] flex-shrink-0 inline" />
          </p>
          <span className="text-[#939A92] text-[10px] ml-auto flex-shrink-0">
            {formatDate(mat.created_at)}
          </span>
        </div>
      </div>

      {/* Download action footer */}
      <div className="flex items-center justify-between pt-3 border-t border-[#E8E5DE] mt-auto">
        <div className="min-w-0 pr-2">
          <p className="text-[11px] font-medium text-[#6B716B] truncate max-w-[130px]">{mat.file_name}</p>
          {mat.file_size && (
            <p className="text-[10px] text-[#939A92]">{formatFileSize(mat.file_size)}</p>
          )}
        </div>
        <button
          onClick={() => window.open(mat.file_url, '_blank')}
          className="flex items-center gap-1.5 bg-[#E8F0E7] hover:bg-[#315B3B] text-[#315B3B] hover:text-white border border-[#315B3B]/30 transition-all px-3 py-1.5 rounded-xl text-xs font-bold shadow-2xs hover:shadow-xs flex-shrink-0"
        >
          <Download size={13} />
          <span>Download</span>
        </button>
      </div>
    </div>
  )
}