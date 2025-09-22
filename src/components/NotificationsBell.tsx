import { useState } from 'react'
import { Bell, CheckCircle2, ShieldAlert, TriangleAlert, Loader2 } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useAlerts } from '@/hooks/useAlerts'

export function NotificationsBell() {
  const [open, setOpen] = useState(false)
  const { alerts, loading, error, ack, resolve, counts, refresh } = useAlerts({ pollMs: 15000 })

  const sevColor = (s: string) => s === 'critical' ? 'text-red-600' : s === 'major' ? 'text-amber-600' : 'text-blue-600'
  const sevBadge = (s: string) => s === 'critical' ? 'bg-red-100 text-red-700' : s === 'major' ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'
  const sevIcon = (s: string) => s === 'critical' ? <ShieldAlert className="w-4 h-4 text-red-600"/> : s === 'major' ? <TriangleAlert className="w-4 h-4 text-amber-600"/> : <Bell className="w-4 h-4 text-blue-600"/>

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="relative">
          <Bell className="h-4 w-4" />
          {counts.total > 0 && (
            <span className="absolute -top-1 -right-1 h-5 min-w-[20px] px-1 rounded-full bg-red-600 text-white text-xs flex items-center justify-center">
              {counts.total}
            </span>
          )}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Notifications</span>
            <div className="flex items-center gap-2 text-sm">
              <Badge className="bg-red-100 text-red-700">Critical: {counts.critical}</Badge>
              <Badge className="bg-amber-100 text-amber-700">Major: {counts.major}</Badge>
              <Badge className="bg-blue-100 text-blue-700">Minor: {counts.minor}</Badge>
              <Button variant="outline" size="sm" onClick={refresh} disabled={loading}>
                {loading ? <Loader2 className="w-4 h-4 animate-spin"/> : 'Refresh'}
              </Button>
            </div>
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-3 max-h-[60vh] overflow-y-auto">
          {error && <div className="text-red-600 text-sm">{error}</div>}
          {alerts.length === 0 && !loading && (
            <div className="text-sm text-gray-500">No open notifications</div>
          )}
          {alerts.map(a => (
            <div key={a._id} className="border rounded-lg p-3 bg-white/80 dark:bg-gray-900/80 flex items-start justify-between">
              <div className="flex items-start gap-3">
                <div className="mt-1">{sevIcon(a.severity)}</div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className={`text-sm font-medium ${sevColor(a.severity)}`}>{a.severity.toUpperCase()}</span>
                    <span className="text-xs text-gray-500">{new Date(a.createdAt).toLocaleString()}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${sevBadge(a.severity)}`}>{a.type}</span>
                  </div>
                  <div className="text-sm text-gray-800 dark:text-gray-200">{a.message}</div>
                  {a.notifiedChannels?.length ? (
                    <div className="text-xs text-gray-500 mt-1">Notified via: {a.notifiedChannels.join(', ')}</div>
                  ) : null}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button size="sm" variant="outline" onClick={() => ack(a._id)}>Acknowledge</Button>
                <Button size="sm" onClick={() => resolve(a._id)}>
                  <CheckCircle2 className="w-4 h-4 mr-1"/> Resolve
                </Button>
              </div>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  )
}
