'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { getFileCategory, getFileIcon } from '@/lib/utils/file'
import type { Attachment } from '@/lib/types'
import { X, Download, FileText, Loader2 } from 'lucide-react'
import { WhatsAppSender } from '@/components/whatsapp-sender'
import { toast } from 'sonner'

interface Props {
  attachment: Attachment
  onDelete?: (id: string, url: string) => void
  isAdmin?: boolean
  caseTitle?: string
  eventDescription?: string
  defaultPhone?: string
}

export function AttachmentViewer({ attachment, onDelete, isAdmin, caseTitle, eventDescription, defaultPhone }: Props) {
  const [open, setOpen] = useState(false)
  const [downloading, setDownloading] = useState(false)
  const category = getFileCategory(attachment.file_type)
  const icon = getFileIcon(attachment.file_type)

  async function handleDownload() {
    setDownloading(true)
    try {
      const res = await fetch(
        `/api/download-file?url=${encodeURIComponent(attachment.file_url)}&name=${encodeURIComponent(attachment.file_name)}`
      )
      if (!res.ok) throw new Error('Download failed')
      const blob = await res.blob()
      const blobUrl = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = blobUrl
      a.download = attachment.file_name
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(blobUrl)
    } catch {
      toast.error('Download failed — please try again')
    } finally {
      setDownloading(false)
    }
  }

  return (
    <>
      <div className="flex items-center gap-2 p-2 rounded-lg border bg-white hover:bg-gray-50 group">
        <button
          onClick={() => setOpen(true)}
          className="flex items-center gap-2 flex-1 text-left min-w-0"
        >
          <span className="text-lg flex-shrink-0">{icon}</span>
          <span className="text-sm text-blue-600 hover:underline truncate">
            {attachment.file_name}
          </span>
        </button>
        <div className="flex items-center gap-1 flex-shrink-0">
          <button
            onClick={handleDownload}
            disabled={downloading}
            className="p-1 rounded hover:bg-gray-200 text-gray-500 hover:text-gray-700 disabled:opacity-50"
            title="Download"
          >
            {downloading
              ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
              : <Download className="h-3.5 w-3.5" />
            }
          </button>
          {caseTitle && (
            <WhatsAppSender
              caseTitle={caseTitle}
              eventDescription={eventDescription ?? ''}
              documentName={attachment.file_name}
              documentUrl={attachment.file_url}
              defaultPhone={defaultPhone}
            />
          )}
          {isAdmin && onDelete && (
            <button
              onClick={() => onDelete(attachment.id, attachment.file_url)}
              className="p-1 rounded hover:bg-red-100 text-gray-400 hover:text-red-600"
              title="Delete"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <span>{icon}</span>
              <span className="truncate">{attachment.file_name}</span>
            </DialogTitle>
          </DialogHeader>
          <div className="mt-2">
            {category === 'image' && (
              <img
                src={attachment.file_url}
                alt={attachment.file_name}
                className="max-w-full h-auto rounded-lg"
              />
            )}
            {category === 'audio' && (
              <audio controls className="w-full" src={attachment.file_url}>
                Your browser does not support the audio element.
              </audio>
            )}
            {category === 'video' && (
              <video controls className="w-full rounded-lg" src={attachment.file_url}>
                Your browser does not support the video element.
              </video>
            )}
            {category === 'document' && (
              <>
                {attachment.file_type === 'application/pdf' ? (
                  <iframe
                    src={`${attachment.file_url}#view=FitH`}
                    className="w-full h-[70vh] rounded-lg border"
                    title={attachment.file_name}
                  />
                ) : (
                  <div className="flex flex-col items-center gap-4 py-8">
                    <FileText className="h-16 w-16 text-gray-400" />
                    <p className="text-gray-600">Preview not available for this file type.</p>
                    <Button variant="outline" onClick={handleDownload} disabled={downloading}>
                      {downloading
                        ? <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        : <Download className="h-4 w-4 mr-2" />
                      }
                      {downloading ? 'Downloading…' : 'Download File'}
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
