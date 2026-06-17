export const ACCEPTED_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'image/jpeg',
  'image/png',
  'video/mp4',
  'video/quicktime',
  'audio/mpeg',
  'audio/wav',
  'audio/mp4',
  'audio/x-m4a',
]

export function getFileCategory(mimeType: string): 'document' | 'image' | 'audio' | 'video' | 'other' {
  if (mimeType.startsWith('image/')) return 'image'
  if (mimeType.startsWith('audio/')) return 'audio'
  if (mimeType.startsWith('video/')) return 'video'
  if (
    mimeType === 'application/pdf' ||
    mimeType.includes('word') ||
    mimeType.includes('excel') ||
    mimeType.includes('spreadsheet')
  ) return 'document'
  return 'other'
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export function getMimeFromExtension(fileName: string): string {
  const ext = fileName.split('.').pop()?.toLowerCase() ?? ''
  const map: Record<string, string> = {
    pdf: 'application/pdf',
    doc: 'application/msword',
    docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    xls: 'application/vnd.ms-excel',
    xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    jpg: 'image/jpeg', jpeg: 'image/jpeg', png: 'image/png', webp: 'image/webp',
    mp4: 'video/mp4', mov: 'video/quicktime',
    mp3: 'audio/mpeg', wav: 'audio/wav', m4a: 'audio/x-m4a',
  }
  return map[ext] ?? 'application/octet-stream'
}

export function getFileIcon(mimeType: string): string {
  const cat = getFileCategory(mimeType)
  switch (cat) {
    case 'image': return '🖼️'
    case 'audio': return '🎵'
    case 'video': return '🎬'
    case 'document': return mimeType === 'application/pdf' ? '📄' : '📝'
    default: return '📎'
  }
}
