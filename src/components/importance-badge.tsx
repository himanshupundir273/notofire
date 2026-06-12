import { importanceBadgeClass, importanceLabel } from '@/lib/utils/importance'
import type { Importance } from '@/lib/types'
import { cn } from '@/lib/utils'

export function ImportanceBadge({ importance, className }: { importance: Importance; className?: string }) {
  return (
    <span className={cn(
      'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border',
      importanceBadgeClass(importance),
      className
    )}>
      {importanceLabel(importance)}
    </span>
  )
}
