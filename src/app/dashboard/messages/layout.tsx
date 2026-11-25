export default function MessagesLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="h-[calc(100vh-100px)] min-h-[540px] w-full bg-white border border-[#E8E5DE] rounded-2xl shadow-xs overflow-hidden flex">
      {children}
    </div>
  )
}