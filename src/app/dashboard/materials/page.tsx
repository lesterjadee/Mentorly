import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import {
  FileText, Download, Search, Shield,
  Plus, BookOpen, CheckCircle
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
      return 'bg-red-500/10 border-red-500/20 text-red-400'
    if (type.includes('word') || name.endsWith('.doc') || name.endsWith('.docx'))
      return 'bg-blue-500/10 border-blue-500/20 text-blue-400'
    if (type.includes('presentation') || name.endsWith('.ppt') || name.endsWith('.pptx'))
      return 'bg-orange-500/10 border-orange-500/20 text-orange-400'
    if (type.startsWith('image/'))
      return 'bg-purple-500/10 border-purple-500/20 text-purple-400'
    return 'bg-white/5 border-white/10 text-white/40'
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
    <div>

      {/* header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-black tracking-tight mb-1">Study Materials</h1>
          <p className="text-white/40 text-sm">
            Free academic resources uploaded by SPECS members ·{' '}
            <span className="text-[#4a8fd4]">
              {totalMaterials} file{totalMaterials !== 1 ? 's' : ''}
            </span>
          </p>
        </div>
        {isSpecsMember && (
          <Link
            href="/dashboard/materials/upload"
            className="flex items-center gap-2 bg-[#26619C] hover:bg-[#1e4f82] transition-colors px-4 py-2.5 rounded-xl text-sm font-semibold shadow-lg shadow-[#26619C]/20"
          >
            <Plus size={15} />
            Upload material
          </Link>
        )}
      </div>

      {/* upload success banner */}
      {justUploaded && (
        <div className="bg-green-500/10 border border-green-500/20 rounded-xl px-4 py-3 mb-6 flex items-center gap-2">
          <CheckCircle size={15} className="text-green-400 flex-shrink-0" />
          <p className="text-green-400 text-sm">
            Material uploaded successfully! It's now available to all students.
          </p>
        </div>
      )}

      {/* notice for students */}
      {!isSpecsMember && (
        <div className="flex items-start gap-3 bg-[#26619C]/5 border border-[#26619C]/15 rounded-xl p-4 mb-6">
          <Shield size={14} className="text-[#4a8fd4] flex-shrink-0 mt-0.5" />
          <p className="text-xs text-white/50 leading-relaxed">
            All study materials are uploaded and maintained by{' '}
            <span className="text-[#4a8fd4] font-semibold">SPECS members</span> as a free
            academic resource for Gordon College students. Download anything — no booking or
            payment required.
          </p>
        </div>
      )}

      {/* search */}
      <form className="relative mb-4">
        <Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" />
        <input
          name="q"
          defaultValue={query}
          placeholder="Search materials by title, subject..."
          className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-white text-sm placeholder-white/20 focus:outline-none focus:border-[#26619C]/60 transition-colors"
        />
        {subject !== 'All' && <input type="hidden" name="subject" value={subject} />}
        {fileType !== 'all' && <input type="hidden" name="type" value={fileType} />}
      </form>

      {/* file type pills */}
      <div className="flex gap-2 overflow-x-auto pb-1.5 mb-3 scrollbar-hide">
        {FILE_TYPES.map((t) => (
          <Link
            key={t.value}
            href={
              '/dashboard/materials?type=' + t.value +
              (subject !== 'All' ? '&subject=' + subject : '') +
              (query ? '&q=' + query : '')
            }
            className={
              'px-3 py-1.5 rounded-full text-xs font-semibold border transition-all whitespace-nowrap flex-shrink-0 ' +
              (fileType === t.value
                ? 'bg-[#26619C] border-[#26619C] text-white'
                : 'border-white/10 text-white/40 hover:border-white/20 hover:text-white/70')
            }
          >
            {t.label}
          </Link>
        ))}
      </div>

      {/* subject pills */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-8 scrollbar-hide">
        {SUBJECTS.map((s) => (
          <Link
            key={s}
            href={
              '/dashboard/materials?subject=' + s +
              (fileType !== 'all' ? '&type=' + fileType : '') +
              (query ? '&q=' + query : '')
            }
            className={
              'px-3 py-1.5 rounded-full text-xs font-semibold border transition-all whitespace-nowrap flex-shrink-0 ' +
              (subject === s
                ? 'bg-white/10 border-white/30 text-white'
                : 'border-white/8 text-white/30 hover:border-white/15 hover:text-white/60')
            }
          >
            {s}
          </Link>
        ))}
      </div>

      {/* materials grid */}
      {totalMaterials > 0 ? (
        isFiltered ? (
          // flat grid when filtered
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
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
          // grouped by subject when showing all
          <div className="space-y-8">
            {Object.entries(subjectGroups).map(([subj, mats]) => (
              <div key={subj}>
                <div className="flex items-center gap-3 mb-3">
                  <h2 className="text-sm font-bold text-white/70">{subj}</h2>
                  <div className="flex-1 h-px bg-white/5" />
                  <span className="text-[10px] text-white/30">
                    {mats.length} file{mats.length !== 1 ? 's' : ''}
                  </span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
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
        <div className="bg-white/3 border border-white/8 rounded-2xl p-14 text-center">
          <FileText size={32} className="text-white/10 mx-auto mb-4" />
          <p className="text-white/40 font-semibold mb-1">No materials found</p>
          <p className="text-white/20 text-sm mb-5">
            {isFiltered
              ? 'Try different filters or search terms'
              : "SPECS members haven't uploaded any materials yet"}
          </p>
          {!isFiltered && (
            <Link
              href="/dashboard/requests/new"
              className="text-[#26619C] hover:text-[#4a8fd4] text-sm transition-colors"
            >
              Post a help request instead →
            </Link>
          )}
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
    <div className="bg-white/3 border border-white/8 rounded-2xl p-4 hover:border-white/15 transition-all group flex flex-col">

      {/* icon + title */}
      <div className="flex items-start gap-3 mb-3">
        <div className={'w-10 h-10 rounded-xl flex items-center justify-center text-lg border flex-shrink-0 ' + colorClass}>
          {getFileIcon(mat.file_type, mat.file_name)}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-white/80 line-clamp-2 leading-snug group-hover:text-white transition-colors">
            {mat.title}
          </p>
          {mat.subject && (
            <span className="text-[10px] text-white/30 border border-white/8 px-2 py-0.5 rounded-full mt-1 inline-block">
              {mat.subject}
            </span>
          )}
        </div>
      </div>

      {/* description */}
      {mat.description && (
        <p className="text-xs text-white/30 leading-relaxed mb-3 line-clamp-2 flex-1">
          {mat.description}
        </p>
      )}

      {/* linked session */}
      {mat.session && (
        <div className="flex items-center gap-1.5 mb-3">
          <BookOpen size={10} className="text-[#4a8fd4] flex-shrink-0" />
          <p className="text-[10px] text-[#4a8fd4] truncate">
            From: {mat.session.title}
          </p>
        </div>
      )}

      {/* uploader + date */}
      <div className="flex items-center gap-2 mb-3">
        <div className="w-5 h-5 rounded-full bg-[#26619C] flex items-center justify-center text-[9px] font-bold text-white flex-shrink-0">
          {mat.uploader?.full_name?.[0]}
        </div>
        <p className="text-[10px] text-white/30 truncate flex items-center gap-1">
          {mat.uploader?.full_name}
          <Shield size={8} className="text-[#4a8fd4] flex-shrink-0 inline" />
        </p>
        <span className="text-white/10 text-[10px] ml-auto flex-shrink-0">
          {formatDate(mat.created_at)}
        </span>
      </div>

      {/* file info + download */}
      <div className="flex items-center justify-between pt-3 border-t border-white/5 mt-auto">
        <div>
          <p className="text-[10px] text-white/20 truncate max-w-[120px]">{mat.file_name}</p>
          {mat.file_size && (
            <p className="text-[10px] text-white/20">{formatFileSize(mat.file_size)}</p>
          )}
        </div>
        <button
          onClick={() => window.open(mat.file_url, '_blank')}
          className="flex items-center gap-1.5 bg-[#26619C]/10 hover:bg-[#26619C] border border-[#26619C]/20 hover:border-[#26619C] transition-all px-3 py-1.5 rounded-lg text-[11px] font-semibold text-[#4a8fd4] hover:text-white"
        >
          <Download size={11} />
          Download
        </button>
      </div>
    </div>
  )
}