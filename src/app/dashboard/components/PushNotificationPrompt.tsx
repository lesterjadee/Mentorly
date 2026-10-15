'use client'

import { useState, useEffect } from 'react'
import { Bell, X, Check } from 'lucide-react'

export default function PushNotificationPrompt() {
  const [show, setShow] = useState(false)
  const [status, setStatus] = useState<'idle' | 'granted' | 'denied'>('idle')

  useEffect(() => {
    if (typeof window === 'undefined') return
    if (!('Notification' in window)) return
    if (Notification.permission === 'granted') return
    if (Notification.permission === 'denied') return

    const dismissed = localStorage.getItem('push-prompt-dismissed')
    if (dismissed) return

    // show after 3 seconds
    const t = setTimeout(() => setShow(true), 3000)
    return () => clearTimeout(t)
  }, [])

  async function requestPermission() {
    const permission = await Notification.requestPermission()
    if (permission === 'granted') {
      setStatus('granted')
      setTimeout(() => setShow(false), 2000)
    } else {
      setStatus('denied')
      localStorage.setItem('push-prompt-dismissed', 'true')
      setTimeout(() => setShow(false), 1500)
    }
  }

  function dismiss() {
    localStorage.setItem('push-prompt-dismissed', 'true')
    setShow(false)
  }

  if (!show) return null

  return (
    <div className="fixed bottom-24 right-6 z-50 w-80 bg-white border border-[#E8E5DE] rounded-2xl p-5 shadow-xl animate-fade-in-up">
      <button
        onClick={dismiss}
        className="absolute top-3 right-3 w-6 h-6 rounded-lg hover:bg-[#F5F3ED] flex items-center justify-center text-[#939A92] hover:text-[#20251F] transition-colors"
      >
        <X size={13} />
      </button>

      {status === 'granted' ? (
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#E8F0E7] border border-[#315B3B]/20 flex items-center justify-center">
            <Check size={16} className="text-[#315B3B]" />
          </div>
          <div>
            <p className="text-sm font-bold text-[#315B3B]">Notifications enabled!</p>
            <p className="text-xs text-[#6B716B] mt-0.5">We'll alert you for new bookings and messages.</p>
          </div>
        </div>
      ) : status === 'denied' ? (
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-red-50 border border-red-200 flex items-center justify-center">
            <X size={16} className="text-red-500" />
          </div>
          <div>
            <p className="text-sm font-bold text-red-500">Notifications blocked</p>
            <p className="text-xs text-[#6B716B] mt-0.5">Enable them in your browser settings if desired.</p>
          </div>
        </div>
      ) : (
        <>
          <div className="flex items-start gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-[#FFF0E5] border border-[#F26A21]/20 flex items-center justify-center flex-shrink-0">
              <Bell size={18} className="text-[#F26A21]" />
            </div>
            <div>
              <p className="text-sm font-bold text-[#20251F]">Stay Updated</p>
              <p className="text-xs text-[#6B716B] mt-1 leading-relaxed">
                Get real-time alerts when students book sessions, messages arrive, or offers are accepted.
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={requestPermission}
              className="flex-1 bg-[#F26A21] hover:bg-[#D95416] text-white active:scale-95 transition-all py-2 rounded-xl text-xs font-semibold shadow-xs"
            >
              Enable alerts
            </button>
            <button
              onClick={dismiss}
              className="px-3 py-2 bg-[#F5F3ED] hover:bg-[#E8E5DE] text-[#6B716B] hover:text-[#20251F] border border-[#E8E5DE] rounded-xl text-xs font-medium transition-all"
            >
              Later
            </button>
          </div>
        </>
      )}
    </div>
  )
}