/**
 * @license
 * Copyright © 2017-2018 Moov Corporation.  All rights reserved.
 */
import React from 'react'
import { mount } from 'enzyme'
import waitForAnalytics from './helpers/waitForAnalytics'
import Track from '../src/Track'
import AnalyticsProvider from '../src/AnalyticsProvider'
import { events } from '../src/analytics'

describe('Track', () => {
  beforeEach(() => {
    jest.spyOn(global, 'setTimeout').mockImplementation(setImmediate)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('should support no children', () => {
    expect(
      mount(
        <AnalyticsProvider>
          <Track event="testEvent" foo="bar" />
        </AnalyticsProvider>,
      ).isEmptyRender(),
    ).toBe(true)
  })

  it('should fire the configured event when clicked', () => {
    const spy = jest.fn()
    events.once('testEvent', spy)
    mount(
      <AnalyticsProvider>
        <Track event={{ onClick: 'testEvent' }} foo="bar">
          <button>Click Me</button>
        </Track>
      </AnalyticsProvider>,
    )
      .find('button')
      .simulate('click')

    return waitForAnalytics(() => {
      expect(spy).toHaveBeenCalledWith({
        eventParams: { foo: 'bar' },
        eventContext: expect.anything(),
      })
    })
  })

  it('should call the onSuccess prop after the event has been sent', done => {
    const onSuccess = jest.fn()

    mount(
      <AnalyticsProvider>
        <Track event="testEvent" foo="bar" onSuccess={onSuccess}>
          <button>Click Me</button>
        </Track>
      </AnalyticsProvider>,
    )
      .find('button')
      .simulate('click')

    setTimeout(() => {
      expect(onSuccess).toHaveBeenCalled()
      done()
    }, 200)
  })

  it('calls the original handler prop', () => {
    const onClick = jest.fn()

    mount(
      <AnalyticsProvider>
        <Track event="testEvent" foo="bar">
          <button onClick={onClick}>Click Me</button>
        </Track>
      </AnalyticsProvider>,
    )
      .find('button')
      .simulate('click')

    expect(onClick).toHaveBeenCalledWith(expect.any(Object))
  })

  it('should support multiple triggers', () => {
    const clickSpy = jest.fn()
    events.once('click', clickSpy)
    const focusSpy = jest.fn()
    events.once('focus', focusSpy)

    mount(
      <AnalyticsProvider>
        <Track event={{ onClick: 'click', onFocus: 'focus' }} foo="bar">
          <button>Click Me</button>
        </Track>
      </AnalyticsProvider>,
    )
      .find('button')
      .simulate('click')
      .simulate('focus')

    return waitForAnalytics(() => {
      expect(clickSpy).toHaveBeenCalledWith({
        eventParams: { foo: 'bar' },
        eventContext: expect.anything(),
      })
      expect(focusSpy).toHaveBeenCalledWith({
        eventParams: { foo: 'bar' },
        eventContext: expect.anything(),
      })
    })
  })
})
