/**
 * @license
 * Copyright © 2017-2018 Moov Corporation.  All rights reserved.
 */
import React from 'react'
import { mount } from 'enzyme'
import waitForAnalytics from './helpers/waitForAnalytics'
import TrackPageView from '../src/TrackPageView'
import AnalyticsProvider from '../src/AnalyticsProvider'
import { events } from '../src/analytics'

describe('TrackPageView', () => {
  beforeEach(() => {
    jest.spyOn(global, 'setTimeout').mockImplementation(setImmediate)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('should fire a pageview event with props on mount', () => {
    const spy = jest.fn()
    events.once('pageview', spy)
    mount(
      <AnalyticsProvider>
        <TrackPageView foo="bar" />
      </AnalyticsProvider>,
    )

    return waitForAnalytics(() => {
      expect(spy).toHaveBeenCalledWith({
        eventParams: { foo: 'bar' },
        eventContext: expect.anything(),
      })
    })
  })
})
