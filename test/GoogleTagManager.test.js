/**
 * @license
 * Copyright © 2017-2018 Moov Corporation.  All rights reserved.
 */
import React from 'react'
import { mount } from 'enzyme'
import AnalyticsProvider from '../src/AnalyticsProvider'
import GoogleTagManager from '../src/targets/GoogleTagManager'
import { fire, initialize } from '../src/analytics'
import waitForAnalytics from './helpers/waitForAnalytics'

describe('GoogleTagManager', () => {
  beforeEach(() => {
    initialize(false)
    jest.spyOn(global, 'setTimeout').mockImplementation(setImmediate)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('should render with no children', () => {
    mount(
      <AnalyticsProvider>
        <GoogleTagManager />
      </AnalyticsProvider>,
    )
  })

  it('should push to data layer with configured values', () => {
    const dataLayerName = 'dataLayerName'
    const eventName = 'productClicked'
    mount(
      <AnalyticsProvider>
        <GoogleTagManager containerId="container-id" dataLayerName={dataLayerName}>
          {{
            [eventName]: ({ eventParams }) => {
              return {
                keyToSend: eventParams.id,
              }
            },
          }}
        </GoogleTagManager>
      </AnalyticsProvider>,
    )
    const spy = { push: jest.fn() }
    window.dataLayerName = spy
    // setImmediate awaits useEffect call to set event listeners
    setImmediate(() => fire('productClicked', { id: 'id' }))
    return waitForAnalytics(() => {
      expect(spy.push).toHaveBeenCalledWith({ keyToSend: 'id' })
    })
  })
})
