'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import {
  ArrowLeft, Calendar, Clock, Shield,
  FileText, Upload, X, Users, AlertCircle, Sparkles
} from 'lucide-react'

const SUBJECTS = [
  'Mathematics', 'Science', 'Physics', 'Chemistry', 'Biology',
  'Programming', 'Web Development', 'English', 'Filipino', 'History',
  'Accounting', 'Economics', 'Other'
]

const SESSION_TYPES = [
  { value: 'tutoring', label: 'Tutoring', desc: 'One-on-one or small group learning' },
  { value: 'workshop', label: 'Workshop', desc: 'Hands-on activity-based session' },
  { value: 'review', label: 'Review Session', desc: 'Exam prep and topic review' },
  { value: 'consultation', label: 'Consultation', desc: 'Q&A and academic guidance' },
]

export default function NewSessionPage() {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [isSpecsMember, setIsSpecsMember] = useState<boolean | null>(null)
  const [userId, setUserId] = useState<string>('')

  // form fields
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [subject, setSubject] = useState('')
  const [sessionType, setSessionType] = useState('tutoring')
  const [mode, setMode] = useState<'online' | 'in-person' | 'both'>('online')
  const [maxParticipants, setMaxParticipants] = useState('20')
  const [dateType, setDateType] = useState<'single' | 'multi'>('single')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [startTime, setStartTime] = useState('')
  const [hoursPerDay, setHoursPerDay] = useState('1')

  // study material
  const [materialTitle, setMaterialTitle] = useState('')
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [uploadingFile, setUploadingFile] = useState(false)

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    async function checkAccess() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }
      setUserId(user.id)

      const { data: profile } = await supabase
        .from('users')
        .select('is_specs_member')
        .eq('id', user.id)
        .single()

      setIsSpecsMember(profile?.is_specs_member || false)
    }
    checkAccess()
  }, [router])

  function countDays() {
    if (!startDate || !endDate) return 1
    const s = new Date(startDate), e = new Date(endDate)
    if (e < s) return 1
    return Math.floor((e.getTime() - s.getTime()) / (1000 * 60 * 60 * 24)) + 1
  }

  function formatEndTime(t: string, h: string) {
    if (!t || !h) return ''
    const [hh, mm] = t.split(':').map(Number)
    const total = hh * 60 + mm + parseFloat(h) * 60
    const eh = Math.floor(total / 60) % 24, em = total % 60
    const p = (x: number) => x >= 12 ? 'PM' : 'AM'
    const f = (x: number) => x % 12 === 0 ? 12 : x % 12
    return f(hh) + ':' + String(mm).padStart(2,'0') + ' ' + p(hh) + ' – ' + f(eh) + ':' + String(em).padStart(2,'0') + ' ' + p(eh)
  }

  function formatFileSize(bytes: number) {
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
  }

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 50 * 1024 * 1024) {
      setError('File size must be under 50MB.')
      return
    }
    setSelectedFile(file)
    if (!materialTitle) setMaterialTitle(file.name.replace(/\.[^.]+$/, ''))
  }

  async function handleSubmit() {
    if (!title || !subject || !startDate || !startTime) {
      setError('Please fill in all required fields.')
      return
    }
    if (dateType === 'multi' && !endDate) {
      setError('Please select an end date.')
      return
    }
    if (selectedFile && !materialTitle) {
      setError('Please enter a title for the study material.')
      return
    }

    setLoading(true)
    setError('')

    const supabase = createClient()
    const totalDays = dateType === 'single' ? 1 : countDays()
    const finalEndDate = dateType === 'single' ? startDate : endDate

    // 1 — create session
    const { data: sessionData, error: sessionError } = await supabase
      .from('services')
      .insert({
        tutor_id: userId,
        title,
        description,
        category: subject,
        price_per_hour: 0,
        mode,
        is_active: true,
        is_free: true,
        session_type: sessionType,
        start_date: startDate,
        end_date: finalEndDate,
        daily_start_time: startTime,
        hours_per_day: parseFloat(hoursPerDay),
        total_days: totalDays,
        max_participants: parseInt(maxParticipants),
        scheduled_at: new Date(startDate + 'T' + startTime).toISOString(),
      })
      .select()
      .single()

    if (sessionError || !sessionData) {
      setError(sessionError?.message || 'Failed to create session.')
      setLoading(false)
      return
    }

    // 2 — upload study material if provided
    if (selectedFile) {
      setUploadingFile(true)
      const ext = selectedFile.name.split('.').pop()
      const filePath = userId + '/' + sessionData.id + '/' + Date.now() + '.' + ext

      const { error: uploadError } = await supabase.storage
        .from('study-materials')
        .upload(filePath, selectedFile)

      if (!uploadError) {
        const { data: urlData } = supabase.storage
          .from('study-materials')
          .getPublicUrl(filePath)

        await supabase.from('study_materials').insert({
          uploaded_by: userId,
          session_id: sessionData.id,
          title: materialTitle,
          subject,
          description: 'Study material for: ' + title,
          file_url: urlData.publicUrl,
          file_name: selectedFile.name,
          file_type: selectedFile.type,
          file_size: selectedFile.size,
        })
      }
      setUploadingFile(false)
    }

    router.push('/dashboard/sessions?posted=true')
  }

  // loading state while checking access
  if (isSpecsMember === null) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-6 h-6 border-2 border-[#F26A21] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  // access denied for non-SPECS
  if (!isSpecsMember) {
    return (
      <div className="max-w-lg mx-auto pt-10">
        <div className="bg-white border border-[#E8E5DE] rounded-2xl p-8 text-center shadow-xs">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto mb-4 border border-amber-200">
            <AlertCircle size={24} />
          </div>
          <h2 className="font-extrabold text-xl text-[#20251F] mb-2">SPECS Mentors Only</h2>
          <p className="text-[#6B716B] text-xs leading-relaxed mb-6">
            Only verified SPECS tutors and officers can publish academic sessions. If you are a member, please reach out to an officer to authorize your account.
          </p>
          <Link
            href="/dashboard/sessions"
            className="inline-flex items-center justify-center bg-[#F26A21] hover:bg-[#D95416] text-white px-5 py-2.5 rounded-xl text-xs font-bold transition-all shadow-xs"
          >
            Browse Available Sessions
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl space-y-6">
      {/* Header */}
      <div>
        <Link
          href="/dashboard/sessions"
          className="inline-flex items-center gap-2 text-xs font-semibold text-[#6B716B] hover:text-[#20251F] transition-colors mb-3"
        >
          <ArrowLeft size={14} />
          <span>Back to sessions</span>
        </Link>
        <div className="flex items-center gap-2 mb-1">
          <span className="w-6 h-6 rounded-lg bg-[#E8F0E7] text-[#315B3B] flex items-center justify-center">
            <Shield size={13} />
          </span>
          <span className="text-xs font-bold text-[#315B3B] uppercase tracking-wider">SPECS Mentor Hub</span>
        </div>
        <h1 className="text-2xl font-extrabold tracking-tight text-[#20251F]">Post a Tutoring Session</h1>
        <p className="text-xs text-[#6B716B] mt-0.5">Share your knowledge with fellow Gordon College students</p>
      </div>

      <div className="bg-white border border-[#E8E5DE] rounded-2xl p-6 md:p-8 space-y-6 shadow-xs">
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 flex items-start gap-2.5">
            <X size={15} className="text-red-500 flex-shrink-0 mt-0.5" />
            <p className="text-red-600 text-xs font-medium">{error}</p>
          </div>
        )}

        {/* Session type */}
        <div>
          <label className="text-xs font-bold text-[#20251F] uppercase tracking-wider mb-2.5 block">
            Session Type *
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {SESSION_TYPES.map((t) => (
              <button
                type="button"
                key={t.value}
                onClick={() => setSessionType(t.value)}
                className={`p-3.5 rounded-xl border text-left transition-all ${
                  sessionType === t.value
                    ? 'border-[#315B3B] bg-[#E8F0E7]/60 shadow-2xs'
                    : 'border-[#E8E5DE] bg-white hover:border-[#315B3B]/40 hover:bg-[#F3F7F2]/40'
                }`}
              >
                <p className={`text-xs font-bold mb-0.5 ${sessionType === t.value ? 'text-[#315B3B]' : 'text-[#20251F]'}`}>
                  {t.label}
                </p>
                <p className="text-[11px] text-[#6B716B] leading-tight">{t.desc}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Title */}
        <div>
          <label className="text-xs font-bold text-[#20251F] uppercase tracking-wider mb-2 block">
            Session Title *
          </label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Data Structures & Algorithms — Trees & Graphs"
            className="w-full bg-white border border-[#E8E5DE] rounded-xl px-4 py-2.5 text-[#20251F] text-sm placeholder:text-[#939A92] focus:border-[#F26A21] focus:ring-2 focus:ring-[#F26A21]/15 transition-all outline-none"
          />
        </div>

        {/* Description */}
        <div>
          <label className="text-xs font-bold text-[#20251F] uppercase tracking-wider mb-2 block">
            Description
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Outline the concepts covered, target audience, and any prerequisites students should have..."
            rows={3}
            className="w-full bg-white border border-[#E8E5DE] rounded-xl px-4 py-2.5 text-[#20251F] text-sm placeholder:text-[#939A92] focus:border-[#F26A21] focus:ring-2 focus:ring-[#F26A21]/15 transition-all outline-none resize-none"
          />
        </div>

        {/* Subject & Mode */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-bold text-[#20251F] uppercase tracking-wider mb-2 block">
              Academic Subject *
            </label>
            <select
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full bg-white border border-[#E8E5DE] rounded-xl px-4 py-2.5 text-[#20251F] text-sm focus:border-[#F26A21] focus:ring-2 focus:ring-[#F26A21]/15 transition-all outline-none"
            >
              <option value="" disabled>Select subject category</option>
              {SUBJECTS.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs font-bold text-[#20251F] uppercase tracking-wider mb-2 block">
              Meeting Mode
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['online', 'in-person', 'both'] as const).map((m) => (
                <button
                  type="button"
                  key={m}
                  onClick={() => setMode(m)}
                  className={`py-2.5 rounded-xl border text-xs font-bold capitalize transition-all ${
                    mode === m
                      ? 'border-[#F26A21] bg-[#FFF0E5] text-[#D95416]'
                      : 'border-[#E8E5DE] text-[#6B716B] hover:border-[#F26A21]/30 hover:text-[#20251F]'
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Max participants */}
        <div>
          <label className="text-xs font-bold text-[#20251F] uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <Users size={13} className="text-[#315B3B]" /> Max Participants
          </label>
          <div className="flex gap-2">
            {['5', '10', '20', '30', '50'].map((n) => (
              <button
                type="button"
                key={n}
                onClick={() => setMaxParticipants(n)}
                className={`flex-1 py-2 rounded-xl border text-xs font-bold transition-all ${
                  maxParticipants === n
                    ? 'border-[#315B3B] bg-[#E8F0E7] text-[#315B3B]'
                    : 'border-[#E8E5DE] text-[#6B716B] hover:border-[#315B3B]/30 hover:text-[#20251F]'
                }`}
              >
                {n}
              </button>
            ))}
          </div>
        </div>

        {/* Schedule */}
        <div className="border-t border-[#E8E5DE] pt-5 space-y-4">
          <p className="text-xs font-bold text-[#20251F] uppercase tracking-wider">
            Schedule & Availability *
          </p>

          <div className="grid grid-cols-2 gap-3">
            {(['single', 'multi'] as const).map((t) => (
              <button
                type="button"
                key={t}
                onClick={() => setDateType(t)}
                className={`py-2 rounded-xl border text-xs font-bold transition-all ${
                  dateType === t
                    ? 'border-[#F26A21] bg-[#FFF0E5] text-[#D95416]'
                    : 'border-[#E8E5DE] text-[#6B716B] hover:border-[#F26A21]/30'
                }`}
              >
                {t === 'single' ? 'Single day session' : 'Multiple days series'}
              </button>
            ))}
          </div>

          {dateType === 'single' ? (
            <div>
              <label className="text-xs font-medium text-[#6B716B] mb-1.5 block">Session Date</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => { setStartDate(e.target.value); setEndDate(e.target.value) }}
                min={new Date().toISOString().split('T')[0]}
                className="w-full bg-white border border-[#E8E5DE] rounded-xl px-4 py-2 text-[#20251F] text-sm focus:border-[#F26A21] outline-none"
              />
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-[#6B716B] mb-1.5 block">Start Date</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full bg-white border border-[#E8E5DE] rounded-xl px-4 py-2 text-[#20251F] text-sm focus:border-[#F26A21] outline-none"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-[#6B716B] mb-1.5 block">End Date</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  min={startDate || new Date().toISOString().split('T')[0]}
                  className="w-full bg-white border border-[#E8E5DE] rounded-xl px-4 py-2 text-[#20251F] text-sm focus:border-[#F26A21] outline-none"
                />
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-[#6B716B] mb-1.5 block">Start Time</label>
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full bg-white border border-[#E8E5DE] rounded-xl px-4 py-2 text-[#20251F] text-sm focus:border-[#F26A21] outline-none"
              />
              {startTime && hoursPerDay && (
                <p className="text-xs font-semibold text-[#D95416] mt-1.5">
                  {formatEndTime(startTime, hoursPerDay)}
                </p>
              )}
            </div>
            <div>
              <label className="text-xs font-medium text-[#6B716B] mb-1.5 block">Duration per Day</label>
              <div className="grid grid-cols-4 gap-1.5">
                {['1', '1.5', '2', '3'].map((h) => (
                  <button
                    type="button"
                    key={h}
                    onClick={() => setHoursPerDay(h)}
                    className={`py-2 rounded-xl border text-xs font-bold transition-all ${
                      hoursPerDay === h
                        ? 'border-[#315B3B] bg-[#E8F0E7] text-[#315B3B]'
                        : 'border-[#E8E5DE] text-[#6B716B] hover:border-[#315B3B]/30'
                    }`}
                  >
                    {h}h
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Study Material Upload */}
        <div className="border-t border-[#E8E5DE] pt-5 space-y-3">
          <div>
            <p className="text-xs font-bold text-[#20251F] uppercase tracking-wider">
              Attach Study Material (Optional)
            </p>
            <p className="text-xs text-[#6B716B] mt-0.5">
              Upload notes or reviewers that students can download anytime.
            </p>
          </div>

          {selectedFile ? (
            <div className="bg-[#FFFCF7] border border-[#E8E5DE] rounded-xl p-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-9 h-9 rounded-lg bg-[#E8F0E7] text-[#315B3B] flex items-center justify-center flex-shrink-0">
                  <FileText size={16} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-[#20251F] truncate">{selectedFile.name}</p>
                  <p className="text-[10px] text-[#6B716B]">{formatFileSize(selectedFile.size)}</p>
                </div>
                <button
                  type="button"
                  onClick={() => { setSelectedFile(null); if (fileInputRef.current) fileInputRef.current.value = '' }}
                  className="p-1 hover:bg-[#F5F3ED] rounded-md text-[#939A92] hover:text-[#20251F]"
                >
                  <X size={15} />
                </button>
              </div>
              <div>
                <label className="text-xs font-semibold text-[#6B716B] mb-1.5 block">
                  Material Title *
                </label>
                <input
                  value={materialTitle}
                  onChange={(e) => setMaterialTitle(e.target.value)}
                  placeholder="e.g. Tree Traversal Quick Reference Guide"
                  className="w-full bg-white border border-[#E8E5DE] rounded-xl px-3 py-2 text-[#20251F] text-xs focus:border-[#F26A21] outline-none"
                />
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="w-full flex flex-col items-center justify-center gap-2 bg-[#FFFCF7] border border-dashed border-[#E8E5DE] hover:border-[#315B3B]/40 hover:bg-[#E8F0E7]/20 transition-all rounded-xl py-6 cursor-pointer"
            >
              <div className="w-8 h-8 rounded-full bg-[#E8F0E7] text-[#315B3B] flex items-center justify-center">
                <Upload size={16} />
              </div>
              <p className="text-xs font-bold text-[#20251F]">Click to upload document or notes</p>
              <p className="text-[10px] text-[#6B716B]">PDF, DOCX, PPTX, images up to 50MB</p>
            </button>
          )}
          <input
            ref={fileInputRef}
            type="file"
            onChange={handleFileSelect}
            className="hidden"
            accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.txt,image/*"
          />
        </div>

        {/* Free peer pledge badge */}
        <div className="bg-[#E8F0E7] border border-[#315B3B]/20 rounded-xl p-3.5 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[#315B3B] text-white flex items-center justify-center flex-shrink-0">
            <Shield size={16} />
          </div>
          <p className="text-xs text-[#24452D] leading-relaxed font-medium">
            This session is provided as <span className="font-bold underline decoration-[#315B3B]">free academic support</span> for Gordon College students through SPECS.
          </p>
        </div>

        <button
          type="button"
          onClick={handleSubmit}
          disabled={loading}
          className="w-full bg-[#F26A21] hover:bg-[#D95416] disabled:opacity-50 text-white font-bold py-3.5 rounded-xl text-sm transition-all shadow-xs hover:shadow"
        >
          {loading
            ? (uploadingFile ? 'Uploading study materials...' : 'Publishing session...')
            : 'Publish Tutoring Session'}
        </button>
      </div>
    </div>
  )
}