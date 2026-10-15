export default function MessagesLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="h-[calc(100vh-140px)] min-h-[560px] bg-white border border-[#E8E5DE] rounded-2xl shadow-xs overflow-hidden flex">
      {children}
    </div>
  )
}