import React from 'react'
import { mount } from 'enzyme'
import AnalyticsProvider from '../src/AnalyticsProvider'
import GoogleAnalytics from '../src/targets/GoogleAnalytics'
import GoogleTagManager from '../src/targets/GoogleTagManager'
import Track from '../src/Track'
import { renderAmpAnalyticsTags } from '../src/analytics'
import TrackPageView from '../src/TrackPageView'
import * as nextAmp from 'next/amp'

const withWrapping = value =>
  `<amp-analytics type="googleanalytics"><script type="application/json">${JSON.stringify(
    value,
  )}</script></amp-analytics>`

const trackingId = 'trackingId'

describe('AMP analytics', () => {
  nextAmp.useAmp = () => true

  it('renders google tag manager amp tag when ampContainerId set', () => {
    mount(
      <AnalyticsProvider>
        <GoogleTagManager ampContainerId="ampContainerId" />
      </AnalyticsProvider>,
    )

    expect(renderAmpAnalyticsTags()).toBe(
      `<amp-analytics config="https://www.googletagmanager.com/amp.json?id=ampContainerId&gtm.url=SOURCE_URL" data-credentials="include"></amp-analytics>`,
    )
  })

  it('does not render google tag manager amp tag when no ampContainerId set', () => {
    mount(
      <AnalyticsProvider>
        <GoogleTagManager />
      </AnalyticsProvider>,
    )

    expect(renderAmpAnalyticsTags()).toBe('')
  })

  it('renders Google Analytics AMP analytics configuration', () => {
    mount(
      <AnalyticsProvider>
        <GoogleAnalytics trackingId={trackingId}>
          {{
            'event-name': ({ eventParams }) => ({
              hitType: 'event',
              productId: eventParams.product.id,
            }),
          }}
        </GoogleAnalytics>
        <Track event={{ onClick: 'event-name' }} product={{ id: 1 }}>
          <div />
        </Track>
      </AnalyticsProvider>,
    )
    expect(renderAmpAnalyticsTags()).toBe(
      withWrapping({
        vars: { account: trackingId },
        triggers: [
          {
            on: 'click',
            request: 'event',
            vars: { productId: 1 },
            selector: '[data-amp-id="0"]',
          },
        ],
      }),
    )
  })

  it('includes pageview trigger when <TrackPageView> present', () => {
    mount(
      <AnalyticsProvider>
        <GoogleAnalytics trackingId={trackingId}>
          {{
            'event-name': ({ eventParams }) => ({
              hitType: 'event',
              productId: eventParams.product.id,
            }),
            pageview: ({ eventContext }) => ({
              hitType: 'pageview',
              page: eventContext.pathname,
            }),
          }}
        </GoogleAnalytics>
        <Track event={{ onClick: 'event-name' }} product={{ id: 1 }}>
          <div />
        </Track>
        <TrackPageView />
      </AnalyticsProvider>,
    )
    expect(renderAmpAnalyticsTags()).toBe(
      withWrapping({
        vars: { account: trackingId },
        triggers: [
          {
            on: 'click',
            request: 'event',
            vars: { productId: 1 },
            selector: '[data-amp-id="0"]',
          },
          { on: 'visible', request: 'pageview' },
        ],
      }),
    )
  })
})
