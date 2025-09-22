import { useEffect, useMemo, useState, useCallback } from 'react'

interface Incident {
  _id: string
  type: string
  message: string
  severity: 'minor' | 'major' | 'critical'
  status: 'open' | 'acknowledged' | 'resolved'
  createdAt: string
  notifiedChannels?: string[]
}

const API_BASE_URL = 'http://localhost:5000/api'
const TOKEN_KEY = 'train_plan_wise_token'

const apiCall = async (endpoint: string, options: RequestInit = {}) => {
  const token = localStorage.getItem(TOKEN_KEY)
  const config: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    },
    ...options,
  }
  const res = await fetch(`${API_BASE_URL}${endpoint}`, config)
  if (!res.ok) throw new Error((await res.json().catch(() => ({}))).message || 'API error')
  return res.json()
}

export function useAlerts({ pollMs = 15000 }: { pollMs?: number } = {}) {
  const [alerts, setAlerts] = useState<Incident[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchAlerts = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await apiCall(`/alerts?status=open&limit=100`)
      setAlerts(data.items || [])
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Failed to load alerts'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }, [])

  const ack = useCallback(async (id: string) => {
    await apiCall(`/alerts/${id}/ack`, { method: 'PATCH' })
    await fetchAlerts()
  }, [fetchAlerts])

  const resolve = useCallback(async (id: string) => {
    await apiCall(`/alerts/${id}/resolve`, { method: 'PATCH' })
    await fetchAlerts()
  }, [fetchAlerts])

  useEffect(() => {
    fetchAlerts()
    const t = setInterval(fetchAlerts, pollMs)
    return () => clearInterval(t)
  }, [fetchAlerts, pollMs])

  const counts = useMemo(() => ({
    total: alerts.length,
    critical: alerts.filter(a => a.severity === 'critical').length,
    major: alerts.filter(a => a.severity === 'major').length,
    minor: alerts.filter(a => a.severity === 'minor').length,
  }), [alerts])

  return { alerts, loading, error, refresh: fetchAlerts, ack, resolve, counts }
}
