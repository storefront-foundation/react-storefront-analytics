/**
 * @license
 * Copyright © 2017-2019 Moov Corporation.  All rights reserved.
 */

import React, { useEffect, memo } from 'react'
import Head from 'next/head'
import useAnalytics from '../useAnalytics'
import { useAmp } from 'next/amp'

/**
 * Component which includes the Google Analytics script in document Head.
 *
 * The child of this component is expected to be an object mapping event names
 * to the payload that is to be sent when calling the ga() command queue.
 *
 * Given an example configuration of:
 * ```js
 *  <GoogleAnalytics trackingId="my-tracking-id" globalObjectName="ga">
 *   {{
 *     productClicked: ({ eventParams }) => ({
 *      hitType: 'event',
 *      eventCategory: 'interaction',
 *      eventAction: 'click',
 *      eventLabel: eventParams.product.id.toString(),
 *      eventValue: 1
 *     })
 *   }}
 *  </GoogleAnalytics>
 * ```
 *
 * Having set up one or more <Track> components...
 * ```js
 *  <Track event="productClicked" product={{id: 1}}}>
 *   <MyComponent />
 *  </Track>
 * ```
 *
 * ...or when triggering events using `useAnalytics.fire`:
 * ```js
 *   const { fire } = useAnalytics()
 *   return <MyComponent onClick={() => fire('productClicked', {product: {id: 1}})}>
 * ```
 *
 * GoogleAnalytics component will listen to `productClicked` events and call the `ga()`
 * queue with a 'send' command:
 * ```js
 *   window.ga(
 *    'send',
 *    {
 *      eventType: 'event',
 *      eventCategory: 'interaction',
 *      eventAction: 'click',
 *      eventLabel: '1',
 *      eventValue: 1
 *    }
 *   )
 * ```
 *
 * In AMP, the configuration provided as the child is used to construct a set of triggers,
 * in the case of the above example:
 * ```js
 *   [..., {
 *     on: 'click',
 *     request: 'event', // The AMP trigger `request` property is equal to the `hitType` configured
 *     vars: {
 *       eventCategory: 'interaction',
 *       eventAction: 'click',
 *       eventLabel: '1',
 *       eventValue: 1
 *     },
 *     selector: *autogenerated AMP selector identifying the specific MyComponent instance*
 *   }, ...]
 * ```
 * A trigger object is created for each element wrapped in <Track> that has an onClick event.
 * To exclude an event from being triggered in AMP add the `includeInAMP` property as `false`
 * in the event configuration.
 */
const GoogleAnalytics = ({
  globalObjectName,
  trackingId,
  useAmpClientId,
  trace,
  useBeacon,
  children,
}) => {
  const handlers = children || {}
  const { events, addAmpAnalyticsTag } = useAnalytics()
  if (useAmp()) {
    const createAmpTriggers = trackedTargets => {
      const targetTriggers = trackedTargets.map(({ event, eventParams, selector }) => {
        const { hitType, includeInAMP = true, ...vars } = handlers[event]({
          eventParams,
          eventContext: {},
        })
        if (includeInAMP) {
          if (event === 'pageview') {
            return {
              on: 'visible',
              request: hitType,
            }
          }
          return {
            on: 'click',
            request: hitType,
            vars,
            selector,
          }
        } else {
          return null
        }
      })
      return targetTriggers.filter(Boolean)
    }
    const createAmpConfiguration = ({ trackedTargets }) => {
      return {
        vars: { account: trackingId },
        triggers: createAmpTriggers(trackedTargets),
      }
    }
    addAmpAnalyticsTag(({ trackedTargets }) => {
      const configuration = createAmpConfiguration({ trackedTargets })
      return (
        `<amp-analytics type="googleanalytics">` +
        `<script type="application/json">${JSON.stringify(configuration)}</script>` +
        `</amp-analytics>`
      )
    })
    return null
  }

  useEffect(() => {
    setImmediate(() => {
      if (trace) {
        window.ga_debug = { trace }
      }
      if (useBeacon) {
        if (window[globalObjectName]) {
          window[globalObjectName]('set', 'transport', 'beacon')
        }
      }
      Object.keys(handlers).forEach(event => {
        events.on(event, eventParams => {
          const { includeInAMP, ...eventConfiguration } = handlers[event](eventParams)
          if (window[globalObjectName]) {
            window[globalObjectName]('send', eventConfiguration)
          }
        })
      })
    })
  }, [globalObjectName, events, trace, useBeacon])

  return (
    <Head>
      <script>
        {`
          (function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
          (i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
          m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
          })(window,document,'script','https://www.google-analytics.com/analytics.js','${globalObjectName}');
          ${globalObjectName}('create', '${trackingId}', 'auto', { useAmpClientId: ${useAmpClientId.toString()} });
        `}
      </script>
    </Head>
  )
}

GoogleAnalytics.defaultProps = {
  globalObjectName: 'ga',
  useAmpClientId: true,
  useBeacon: true,
}

export default memo(GoogleAnalytics)
