/**
 * @license
 * Copyright © 2017-2018 Moov Corporation.  All rights reserved.
 */
import React from 'react'
import { mount } from 'enzyme'
import waitForAnalytics from './helpers/waitForAnalytics'
import { events } from '../src/analytics'
import FirebaseContext from '../src/firebase/FirebaseContext'

describe('TrackPageView', () => {
  let AnalyticsProvider, TrackPageView

  beforeEach(() => {
    jest.isolateModules(() => {
      jest.doMock('next/router', () => ({
        useRouter: jest.fn(() => ({})),
      }))
      jest.spyOn(global, 'setTimeout').mockImplementation(setImmediate)
      AnalyticsProvider = require('../src/AnalyticsProvider').default
      TrackPageView = require('../src/TrackPageView').default
    })
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('should fire a pageview event with props on mount', () => {
    const spy = jest.fn()
    events.once('pageview', spy)
    mount(
      <FirebaseContext.Provider value={{}}>
        <AnalyticsProvider>
          <TrackPageView foo="bar" />
        </AnalyticsProvider>
      </FirebaseContext.Provider>,
    )

    return waitForAnalytics(() => {
      expect(spy).toHaveBeenCalledWith({
        eventParams: { foo: 'bar' },
        eventContext: expect.anything(),
      })
    })
  })
})
