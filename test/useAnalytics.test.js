/**
 * @license
 * Copyright © 2017-2018 Moov Corporation.  All rights reserved.
 */
import React from 'react'
import { mount } from 'enzyme'
import useAnalytics from '../src/useAnalytics'
import AnalyticsContext from '../src/AnalyticsContext'

describe('useAnalytics', () => {
  const Test = () => {
    const analytics = useAnalytics()
    return <button onClick={analytics.triggerSomething}>Click Me</button>
  }

  it('should pass the value of AnalyticsContext', () => {
    const triggerSomething = jest.fn()
    mount(
      <AnalyticsContext.Provider value={{ triggerSomething }}>
        <Test />
      </AnalyticsContext.Provider>,
    )
      .find('button')
      .simulate('click')

    expect(triggerSomething).toHaveBeenCalled()
  })
})
