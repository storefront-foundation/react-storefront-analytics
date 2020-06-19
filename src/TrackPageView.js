import React, { useEffect, useState, useContext } from 'react'
import useAnalytics from './useAnalytics'
import { addAmpTarget } from './analytics'
import { useAmp } from 'next/amp'
import FirebaseNavigationTrace from './firebase/FirebaseNavigationTrace'
import FirebaseContext from './firebase/FirebaseContext'

/**
 * Fires a 'pageview' event on mount with provided props as the `eventParams`.
 */
const TrackPageView = props => {
  const { fire } = useAnalytics()
  const isAmp = useAmp()
  const [hydrated, setHydrated] = useState(false)
  const firebase = useContext(FirebaseContext)

  if (isAmp) {
    addAmpTarget({ event: 'pageview', eventParams: props })
    return null
  }

  useEffect(() => {
    setTimeout(() => {
      fire('pageview', props)
    })
    setHydrated(true)
  }, [])

  return hydrated && firebase ? <FirebaseNavigationTrace /> : null
}

export default TrackPageView
