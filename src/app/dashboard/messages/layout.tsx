export default function MessagesLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="h-[calc(100vh-81px)] -m-8 flex">
      {children}
    </div>
  )
}