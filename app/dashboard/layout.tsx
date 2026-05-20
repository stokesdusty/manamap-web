import { DashSidebar } from './_components/DashSidebar'
import { DashTopBar } from './_components/DashTopBar'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {/* Mobile: sticky top bar + hamburger drawer */}
      <div className="md:hidden">
        <DashTopBar />
      </div>

      {/* Desktop: sidebar + content */}
      <div className="md:flex" style={{ minHeight: '100vh' }}>
        <div className="hidden md:block">
          <DashSidebar />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          {children}
        </div>
      </div>
    </>
  )
}
