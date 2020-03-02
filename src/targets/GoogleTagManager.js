/**
 * @license
 * Copyright © 2017-2019 Moov Corporation.  All rights reserved.
 */

import React, { useEffect, memo } from 'react'
import Head from 'next/head'
import useAnalytics from '../useAnalytics'
import { useAmp } from 'next/amp'

/**
 * Component which includes the Google Tag Manager script in document Head.
 *
 * The child of this component is expected to be an object mapping event names
 * to the payload that is to be pushed to the datalayer.
 *
 * Given an example configuration of:
 * ```js
 *  <GoogleTagManager containerId="my-container-id" dataLayerName="dataLayer">
 *   {{
 *     productClicked: ({eventParams, eventContext}) => {
 *       return {
 *         event: 'product-clicked',
 *         productId: eventParams.product.id
 *       }
 *     }
 *   }}
 *  </GoogleTagManager>
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
 * GoogleTagManager component will listen to `productClicked` events and push to the
 * dataLayer as configured:
 * ```
 *   window[dataLayer].push({event: 'product-clicked', productId: 1})`
 * ```
 *
 * In AMP, if the `ampContainerId` prop has been specified then an <amp-analytics> tag
 * with configuration pointing to the AMP container will be added to the body of the
 * document.
 */
const GoogleTagManager = ({
  dataLayerName,
  containerId,
  ampContainerId,
  ampSourceOrigin,
  children,
}) => {
  const { events, addAmpAnalyticsTag } = useAnalytics()

  if (useAmp() && ampContainerId) {
    addAmpAnalyticsTag(() => {
      return `<amp-analytics config="https://www.googletagmanager.com/amp.json?id=${encodeURIComponent(
        ampContainerId,
      )}&gtm.url=${encodeURIComponent(
        ampSourceOrigin,
      )}" data-credentials="include"></amp-analytics>`
    })
    return null
  }

  if (!containerId) return null

  useEffect(() => {
    setImmediate(() => {
      const handlers = children || {}
      Object.keys(handlers).forEach(event => {
        events.on(event, eventParams => {
          const eventConfiguration = handlers[event](eventParams)
          window[dataLayerName] = window[dataLayerName] || []
          window[dataLayerName].push(eventConfiguration)
        })
      })
    })
  }, [dataLayerName, events])

  return (
    <Head>
      <script dangerouslySetInnerHTML={{
        __html: `
          (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
          new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
          j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
          'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
          })(window,document,'script','${dataLayerName}','${containerId}');
        `
      }} />
    </Head>
  )
}

GoogleTagManager.defaultProps = {
  ampSourceOrigin: 'SOURCE_URL',
  dataLayerName: 'dataLayer',
}

export default memo(GoogleTagManager)
