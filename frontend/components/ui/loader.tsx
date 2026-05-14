import { Spinner } from '@/components/ui/spinner'
import { cn } from '@/lib/utils'

interface LoaderProps {
  label?: string
  className?: string
}

export function Loader({ label = 'Loading...', className }: LoaderProps) {
  return (
    <div
      className={cn(
        'flex min-h-[400px] w-full flex-col items-center justify-center gap-4 text-center',
        className,
      )}
    >
      <Spinner className="h-10 w-10 text-blue-600" />
      <p className="text-base font-medium text-slate-500 animate-pulse">{label}</p>
    </div>
  )
}

