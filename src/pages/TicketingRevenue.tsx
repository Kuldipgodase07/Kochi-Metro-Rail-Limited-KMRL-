import { useEffect, useMemo, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { IndianRupee, CreditCard, WalletMinimal, Percent, TrendingUp } from 'lucide-react'

type Range = 'today' | 'week' | 'month'

export default function TicketingRevenue() {
  const [activeTab, setActiveTab] = useState('dashboard')
  const [range, setRange] = useState<Range>('today')
  const [loading, setLoading] = useState(false)
  const [metrics, setMetrics] = useState<any>({ revenue: 0, transactions: 0, average: 0, successRate: 0 })
  const [ticketTypes, setTicketTypes] = useState<any[]>([])
  const [payments, setPayments] = useState<any[]>([])

  const apiBase = '/api/ticketing'

  function inr(n: number) {
    try { return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n) } catch { return `₹${Math.round(n).toLocaleString('en-IN')}` }
  }

  async function safeFetch(url: string) {
    try {
      const res = await fetch(url)
      if (!res.ok) throw new Error(String(res.status))
      const json = await res.json()
      return json?.data ?? json
    } catch {
      return null
    }
  }

  const fetchAll = async (currentRange: Range = range) => {
    setLoading(true)
    const [m, tt, pm] = await Promise.all([
      safeFetch(`${apiBase}/metrics?range=${currentRange}`),
      safeFetch(`${apiBase}/ticket-types?range=${currentRange}`),
      safeFetch(`${apiBase}/payments?range=${currentRange}`)
    ])
    if (m) setMetrics(m)
    setTicketTypes(Array.isArray(tt) ? tt : [])
    setPayments(Array.isArray(pm) ? pm : [])
    setLoading(false)
  }

  useEffect(() => {
    fetchAll(range)
    const id = setInterval(() => fetchAll(range), 20000)
    return () => clearInterval(id)
  }, [range])

  const totalTickets = useMemo(() => ticketTypes.reduce((s, r) => s + (r.tickets || 0), 0), [ticketTypes])
  const totalPaymentTx = useMemo(() => payments.reduce((s, r) => s + (r.transactions || 0), 0), [payments])

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-green-50 dark:from-gray-900 dark:to-gray-900 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-emerald-700 dark:text-emerald-400">Ticketing & Revenue Management</h1>
          <p className="text-gray-600 dark:text-gray-400">Comprehensive ticketing system with revenue analytics and management tools</p>
        </div>

        {/* Nav Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="ticket-types">Ticket Types</TabsTrigger>
            <TabsTrigger value="payments">Payments</TabsTrigger>
            <TabsTrigger value="history">User History</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="admin">Admin</TabsTrigger>
          </TabsList>

          {/* Dashboard */}
          <TabsContent value="dashboard" className="space-y-6">
            {/* Range + Live */}
            <div className="flex items-center gap-2">
              {(['today','week','month'] as Range[]).map(r => (
                <Button key={r} size="sm" variant={range === r ? 'default' : 'outline'} onClick={() => setRange(r)}>
                  {r === 'today' ? 'Today' : r === 'week' ? 'Week' : 'Month'}
                </Button>
              ))}
              <div className="ml-auto flex items-center gap-3">
                <Button size="sm" variant="outline" onClick={() => fetchAll(range)} disabled={loading}>{loading ? 'Refreshing…' : 'Refresh'}</Button>
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"/>
                <span className="text-sm font-medium text-green-600 dark:text-green-400">LIVE</span>
                {loading && <span className="text-xs px-2 py-1 rounded bg-white/70 dark:bg-gray-800 border">Refreshing…</span>}
              </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm text-gray-600">Total Revenue</div>
                      <div className="text-3xl font-bold text-emerald-600">{inr(metrics.revenue || 0)}</div>
                      <div className="text-xs text-emerald-600 flex items-center gap-1"><TrendingUp className="w-3 h-3"/> +8.2%</div>
                    </div>
                    <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center"><IndianRupee className="text-emerald-600"/></div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm text-gray-600">Transactions</div>
                      <div className="text-3xl font-bold text-blue-600">{(metrics.transactions || 0).toLocaleString('en-IN')}</div>
                      <div className="text-xs text-gray-500">Total transactions</div>
                    </div>
                    <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center"><CreditCard className="text-blue-600"/></div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm text-gray-600">Avg. Ticket Price</div>
                      <div className="text-3xl font-bold text-purple-600">{inr(metrics.average || 0)}</div>
                      <div className="text-xs text-gray-500">Per transaction</div>
                    </div>
                    <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center"><Percent className="text-purple-600"/></div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm text-gray-600">Success Rate</div>
                      <div className="text-3xl font-bold text-orange-600">{(metrics.successRate || 0).toFixed(1)}%</div>
                      <div className="text-xs text-gray-500">Payment success</div>
                    </div>
                    <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center"><WalletMinimal className="text-orange-600"/></div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Distribution and Payments */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500"/> Ticket Types Distribution
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {ticketTypes.map((row, i) => {
                    const pct = totalTickets > 0 ? (row.tickets * 100) / totalTickets : 0
                    return (
                      <div key={i} className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <div className="text-gray-800 dark:text-gray-200">{row.type}</div>
                          <div className="text-gray-500">{row.tickets.toLocaleString('en-IN')} tickets <Badge variant="secondary" className="ml-2">{pct.toFixed(1)}%</Badge></div>
                        </div>
                        <div className="w-full h-2 bg-gray-200 dark:bg-gray-800 rounded">
                          <div className="h-2 bg-emerald-500 rounded" style={{ width: `${pct}%` }} />
                        </div>
                        <div className="text-xs text-gray-500">Revenue: {inr(row.revenue || 0)}</div>
                      </div>
                    )
                  })}
                  {ticketTypes.length === 0 && <div className="text-sm text-gray-500">No data.</div>}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-blue-500"/> Payment Methods
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {payments.map((row, i) => {
                    const pct = totalPaymentTx > 0 ? (row.transactions * 100) / totalPaymentTx : 0
                    return (
                      <div key={i} className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <div className="text-gray-800 dark:text-gray-200">{row.method}</div>
                          <div className="text-gray-500">{row.transactions.toLocaleString('en-IN')} transactions <Badge variant="secondary" className="ml-2">{pct.toFixed(1)}%</Badge></div>
                        </div>
                        <div className="w-full h-2 bg-gray-200 dark:bg-gray-800 rounded">
                          <div className="h-2 bg-blue-500 rounded" style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    )
                  })}
                  {payments.length === 0 && <div className="text-sm text-gray-500">No data.</div>}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Other tabs stubs */}
          <TabsContent value="ticket-types"><div className="text-sm text-gray-500">Ticket Types management will appear here.</div></TabsContent>
          <TabsContent value="payments"><div className="text-sm text-gray-500">Payments reconciliation will appear here.</div></TabsContent>
          <TabsContent value="history"><div className="text-sm text-gray-500">User History will appear here.</div></TabsContent>
          <TabsContent value="analytics"><div className="text-sm text-gray-500">Advanced Analytics will appear here.</div></TabsContent>
          <TabsContent value="admin"><div className="text-sm text-gray-500">Admin tools will appear here.</div></TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
