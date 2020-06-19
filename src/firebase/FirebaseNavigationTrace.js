import { useContext, useLayoutEffect } from 'react'
import FirebaseContext from './FirebaseContext'
import { useRouter } from 'next/router'

/**
 * Records client-side navigation time using Firebase Performance Monitoring.
 * This component should be used as a descendent of `FirebasePerformanceMonitoring`. It should be
 * placed in each page component to track when rendering has been completed.
 */
export default function FirebaseNavigationTrace() {
  const context = useContext(FirebaseContext)
  const router = useRouter()

  useLayoutEffect(() => {
    if (context && context.trace) {
      context.trace.stop()
      context.trace = null
    }
  }, [router.asPath])

  return null
}
