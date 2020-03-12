import { useEffect } from 'react'
import useAnalytics from './useAnalytics'
import { addAmpTarget } from './analytics'
import { useAmp } from 'next/amp'

/**
 * Fires a 'pageview' event on mount with provided props as the `eventParams`.
 */
const TrackPageView = props => {
  const { fire } = useAnalytics()
  const isAmp = useAmp()

  if (isAmp) {
    addAmpTarget({ event: 'pageview', eventParams: props })
    return null
  }

  useEffect(() => {
    setTimeout(() => {
      fire('pageview', props)
    })
  }, [])

  return null
}

export default TrackPageView
