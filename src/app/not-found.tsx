import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Scale } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="flex justify-center mb-4">
          <div className="bg-gray-800 rounded-xl p-3">
            <Scale className="h-8 w-8 text-white" />
          </div>
        </div>
        <h1 className="text-4xl font-bold text-gray-800 mb-2">404</h1>
        <p className="text-gray-500 mb-6">Case not found or the URL is incorrect.</p>
        <Link href="/login">
          <Button>Go to Admin</Button>
        </Link>
      </div>
    </div>
  )
}
