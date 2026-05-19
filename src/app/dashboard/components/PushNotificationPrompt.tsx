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
    <div className="fixed bottom-24 right-6 z-50 w-80 bg-[#0d1117] border border-white/15 rounded-2xl p-5 shadow-2xl shadow-black/50 animate-fade-in-up">
      <button
        onClick={dismiss}
        className="absolute top-3 right-3 w-6 h-6 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/30 hover:text-white transition-colors"
      >
        <X size={12} />
      </button>

      {status === 'granted' ? (
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-green-500/10 border border-green-500/20 flex items-center justify-center">
            <Check size={16} className="text-green-400" />
          </div>
          <div>
            <p className="text-sm font-bold text-green-400">Notifications enabled!</p>
            <p className="text-xs text-white/30 mt-0.5">We'll notify you of new bookings and messages.</p>
          </div>
        </div>
      ) : status === 'denied' ? (
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center">
            <X size={16} className="text-red-400" />
          </div>
          <div>
            <p className="text-sm font-bold text-red-400">Notifications blocked</p>
            <p className="text-xs text-white/30 mt-0.5">Enable them in your browser settings.</p>
          </div>
        </div>
      ) : (
        <>
          <div className="flex items-start gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-[#26619C]/10 border border-[#26619C]/20 flex items-center justify-center flex-shrink-0">
              <Bell size={16} className="text-[#4a8fd4]" />
            </div>
            <div>
              <p className="text-sm font-bold">Never miss a booking</p>
              <p className="text-xs text-white/40 mt-1 leading-relaxed">
                Get instant alerts when students book you, send messages, or when offers arrive.
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={requestPermission}
              className="flex-1 bg-[#26619C] hover:bg-[#1e4f82] active:scale-95 transition-all py-2.5 rounded-xl text-xs font-bold"
            >
              Enable notifications
            </button>
            <button
              onClick={dismiss}
              className="px-3 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-xs text-white/40 hover:text-white transition-all"
            >
              Not now
            </button>
          </div>
        </>
      )}
    </div>
  )
}