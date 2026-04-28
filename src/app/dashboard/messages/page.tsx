import { MessageSquare } from 'lucide-react'

export default function MessagesPage() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Messages</h1>
        <p className="text-white/40 text-sm mt-1">Your conversations</p>
      </div>
      <div className="bg-white/3 border border-white/8 rounded-2xl p-12 text-center">
        <MessageSquare size={32} className="text-white/10 mx-auto mb-4" />
        <p className="text-white/40 text-sm">Messaging coming in Sprint 8</p>
      </div>
    </div>
  )
}