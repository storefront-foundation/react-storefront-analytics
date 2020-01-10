/**
 * @license
 * Copyright © 2017-2019 Moov Corporation.  All rights reserved.
 */
import React from 'react'
import { mount } from 'enzyme'
import * as analytics from '../src/analytics'
import waitForAnalytics from './helpers/waitForAnalytics'
import AnalyticsProvider from '../src/AnalyticsProvider'

describe('AnalyticsProvider', () => {
  it('should call initialize with targets and delayUntilInteractive', () => {
    const spy = jest.spyOn(analytics, 'initialize')
    const delayUntilInteractive = true
    mount(
      <AnalyticsProvider delayUntilInteractive={delayUntilInteractive}>
        <div>Hello</div>
      </AnalyticsProvider>,
    )
    return waitForAnalytics(() => {
      expect(spy).toHaveBeenCalledWith(delayUntilInteractive)
    })
  })
})
