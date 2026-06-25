import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { logout } from '@/lib/actions/auth'
import { Scale, LogOut } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-gradient-to-r from-indigo-700 to-indigo-600 text-white sticky top-0 z-50 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <Link href="/admin" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <div className="bg-white/20 rounded-lg p-1.5">
              <Scale className="h-5 w-5 text-white" />
            </div>
            <span className="font-bold text-lg tracking-tight">LegalCase</span>
            <span className="text-xs text-indigo-200 bg-white/15 px-2 py-0.5 rounded-full">Admin</span>
          </Link>
          <div className="flex items-center gap-3">
            <span className="text-sm text-indigo-100 hidden sm:block">{user.email}</span>
            <form action={logout}>
              <Button type="submit" variant="ghost" size="sm" className="text-indigo-100 hover:text-white hover:bg-white/15 gap-2">
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline">Sign Out</span>
              </Button>
            </form>
          </div>
        </div>
      </header>
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 py-6 bg-slate-50 min-h-screen">
        {children}
      </main>
    </div>
  )
}
