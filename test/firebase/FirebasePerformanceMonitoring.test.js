import { mount } from 'enzyme'
import React from 'react'
import EventEmitter from 'events'

describe('FirebasePerformanceMonitoring', () => {
  let FirebasePerformanceMonitoring, events, start, config

  beforeEach(() => {
    jest.isolateModules(() => {
      config = { foo: 'bar' }
      events = new EventEmitter()
      start = jest.fn()

      class MockTrace {
        constructor() {
          this.start = start
        }
      }

      window.firebasePerf = {
        trace: jest.fn(name => {
          return new MockTrace()
        }),
      }

      jest.doMock('next/router', () => ({
        Router: {
          events,
        },
      }))

      FirebasePerformanceMonitoring = require('../../src/firebase/FirebasePerformanceMonitoring')
        .default
    })
  })

  it('should use the config from the FIREBASE_CONFIG environment variable', () => {
    const wrapper = mount(<FirebasePerformanceMonitoring config={config} />)
    expect(
      wrapper
        .find('script')
        .first()
        .html(),
    ).toContain(JSON.stringify(config))
  })

  it('should render nothing if FIREBASE_CONFIG is not provided', () => {
    const wrapper = mount(<FirebasePerformanceMonitoring />)
    expect(wrapper.find('script')).toHaveLength(0)
  })

  it('should use the provided sdk url', () => {
    const url = 'http://firebase.com/test'
    const wrapper = mount(<FirebasePerformanceMonitoring config={config} firebaseSdkUrl={url} />)
    expect(
      wrapper
        .find('script')
        .first()
        .html(),
    ).toContain(url)
  })

  it('should start a trace on routeChangeStart', () => {
    const wrapper = mount(<FirebasePerformanceMonitoring config={config} />)
    events.emit('routeChangeStart')
    expect(start).toHaveBeenCalled()
  })
})
