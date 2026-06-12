import type { Importance } from '@/lib/types'

export function importanceLabel(importance: Importance): string {
  switch (importance) {
    case 'low': return '🟢 Low'
    case 'medium': return '🟡 Medium'
    case 'high': return '🔴 High'
  }
}

export function importanceBadgeClass(importance: Importance): string {
  switch (importance) {
    case 'low': return 'bg-green-100 text-green-800 border-green-200'
    case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
    case 'high': return 'bg-red-100 text-red-800 border-red-200'
  }
}
