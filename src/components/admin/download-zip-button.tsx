'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Download, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

interface Props {
  caseId: string
  caseName: string
  totalFiles: number
}

export function DownloadZipButton({ caseId, caseName, totalFiles }: Props) {
  const [loading, setLoading] = useState(false)

  async function handleDownload() {
    setLoading(true)
    toast.info('Preparing ZIP…')
    try {
      const params = new URLSearchParams({ caseId, caseName })
      const res = await fetch(`/api/download-zip?${params}`)
      if (!res.ok) {
        const err = await res.json()
        toast.error(err.error ?? 'Failed to create ZIP')
        return
      }
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${caseName.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_documents.zip`
      a.click()
      URL.revokeObjectURL(url)
      toast.success('ZIP downloaded!')
    } catch {
      toast.error('Download failed — please try again')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleDownload}
      disabled={loading || totalFiles === 0}
      className="gap-2 text-xs border-gray-300 hover:bg-gray-50"
    >
      {loading
        ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
        : <Download className="h-3.5 w-3.5" />
      }
      {loading ? 'Preparing…' : `Download All (${totalFiles})`}
    </Button>
  )
}
