import { useCallback, useEffect, useState } from 'react'
import { getApiErrorMessage } from '@/services/api'
import { getHealth } from '@/services/health.service'

type Status = 'loading' | 'online' | 'offline'

interface HealthState {
  status: Status
  message: string
}

const fetchHealth = async (): Promise<HealthState> => {
  try {
    const res = await getHealth()
    return { status: res.success ? 'online' : 'offline', message: res.message }
  } catch (error) {
    return { status: 'offline', message: getApiErrorMessage(error) }
  }
}

export const useHealthCheck = () => {
  const [state, setState] = useState<HealthState>({ status: 'loading', message: '' })

  useEffect(() => {
    let active = true
    void fetchHealth().then((next) => {
      if (active) setState(next)
    })
    return () => {
      active = false
    }
  }, [])

  const refresh = useCallback(async () => {
    setState({ status: 'loading', message: '' })
    setState(await fetchHealth())
  }, [])

  return { ...state, refresh }
}
