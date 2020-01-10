/**
 * @license
 * Copyright © 2017-2018 Moov Corporation.  All rights reserved.
 */
import React from 'react'
import { mount } from 'enzyme'
import AnalyticsProvider from '../src/AnalyticsProvider'
import GoogleAnalytics from '../src/targets/GoogleAnalytics'
import { fire, initialize } from '../src/analytics'
import waitForAnalytics from './helpers/waitForAnalytics'

describe('GoogleAnalytics', () => {
  beforeEach(() => initialize(false))
  it('should render with no children', () => {
    mount(
      <AnalyticsProvider>
        <GoogleAnalytics />
      </AnalyticsProvider>,
    )
  })

  it('should call ga with configured values', () => {
    const globalObjectName = 'globalObjectName'
    const eventName = 'productClicked'
    const spy = jest.fn()
    window[globalObjectName] = spy
    mount(
      <AnalyticsProvider>
        <GoogleAnalytics globalObjectName={globalObjectName}>
          {{
            [eventName]: ({ eventParams }) => {
              return {
                keyToSend: eventParams.id,
              }
            },
          }}
        </GoogleAnalytics>
      </AnalyticsProvider>,
    )
    // setImmediate awaits useEffect call to set event listeners
    setImmediate(() => fire('productClicked', { id: 'id' }))
    return waitForAnalytics(() => {
      expect(spy).toHaveBeenCalledWith('send', { keyToSend: 'id' })
    })
  })
})
