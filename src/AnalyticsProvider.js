/**
 * @license
 * Copyright © 2017-2019 Moov Corporation.  All rights reserved.
 */
import React, { useEffect, useMemo } from 'react'
import PropTypes from 'prop-types'
import { fire, events, addAmpAnalyticsTag, initialize } from './analytics'
import AnalyticsContext from './AnalyticsContext'
import { useAmp } from 'next/amp'
import { reset as resetAnalytics } from './analytics'

/**
 * Components that are decendents of AnalyticsProvider can use the `useAnalytics` hook to:
 * 1) Get access to the `fire` function which can be used to broadcast analytics events:
 *
 * ```
 *  import React, { useCallback } from 'react'
 *  import Button from '@material-ui/core/Button'
 *  import { useAnalytics } from 'react-storefront-analytics'
 *
 *  const MyComponent = () => {
 *    const { fire } = useAnalytics()
 *
 *    // This will call the someEvent() method on all configured analytics targets.
 *    const fireAnalyticsEvent = useCallback(() => {
 *      const eventData = { foo: 'bar' }
 *      fire('someEvent', eventData)
 *    }, [])
 *
 *    return <Button onClick={fireAnalyticsEvent}>Click Me</Button>
 *  }
 * ```
 *
 * 2) Get access to the `events` broadcaster object to listen to any event being triggered:
 * ```
 *  import { useAnalytics } from 'react-storefront-analytics'
 *
 *  const MyAnalyticsHandler = () => {
 *    const { events } = useAnalytics()
 *    events.on('someEvent', e => console.log('someEvent triggered with: ', e.eventParams))
 *  }
 * ```
 * `useAnalytics.events` can be used to implement analytics tracking for any vendor.
 *
 * 3) Get access to `addAmpAnalyticsTag` function. This function can be used to build the
 * <amp-analytics> tag in a custom analytics handler. `addAmpAnalyticsTag` takes a function
 * as a parameter. The function provided is called with an array of all targets that are
 * tracked by being wrapped by a <Track> component. Each target is represented as an object
 * in the form of `{ event, eventParams, selector }` where `event` represents the name of the
 * event, `eventParams` represents the event data passed as props to <Track> and the selector
 * is a unique auto-generated CSS selector pointing to a specific target.
 * ```
 * import { useAmp } from 'next/amp'
 * import { useAnalytics } from 'react-storefront-analytics'
 *
 * const MyAnalyticsHandler = () => {
 *   const { events, addAmpAnalyticsTag } = useAnalytics()
 *
 *   if (useAmp()) {
 *     let triggers = []
 *     addAmpAnalyticsTag(targets => {
 *       targets.map(({event, eventParams, selector}) => {
 *         triggers.push({on: 'click', request: 'event', vars: {id: eventParams.id}, selector})
 *       })
 *       const configuration = {triggers, vars: {myAmpVar: 'myAmpVar'}}
 *       return (
 *         `<amp-analytics type="myVendorType">` +
 *         `<script type="application/json">${JSON.stringify(configuration)}</script>` +
 *         `</amp-analytics>`
 *       )
 *     })
 *     return null
 *   } else {
 *     *handle analytics events for non-AMP*
 *     events.on(...)
 *   }
 * }
 * ```
 */
const AnalyticsProvider = ({ children, delayUntilInteractive }) => {
  // Analytics state and AMP handlers are stateful in module scope
  if (useAmp()) {
    resetAnalytics()
  }

  useEffect(() => {
    // Allow targets to add event listeners before initializing
    setTimeout(() => {
      initialize(delayUntilInteractive)
    })
  }, [])

  const value = useMemo(
    () => ({
      fire,
      events,
      addAmpAnalyticsTag,
    }),
    [],
  )

  return <AnalyticsContext.Provider value={value}>{children}</AnalyticsContext.Provider>
}

AnalyticsProvider.propTypes = {
  /**
   * Set to true to delay loading of analytics until the app is interactive
   */
  delayUntilInteractive: PropTypes.bool,
}

AnalyticsProvider.defaultProps = {
  trackPageViews: true,
}

export default AnalyticsProvider
