import FirebasePerformanceMonitoring from '../../src/firebase/FirebasePerformanceMonitoring'
import { mount } from 'enzyme'
import React from 'react'

describe('FirebasePerformanceMonitoring', () => {
  beforeEach(() => {
    process.env.FIREBASE_CONFIG = JSON.stringify({ foo: 'bar' })
  })

  afterEach(() => {
    delete process.env.FIREBASE_CONFIG
  })

  it('should use the config from the FIREBASE_CONFIG environment variable', () => {
    const wrapper = mount(<FirebasePerformanceMonitoring />)
    expect(
      wrapper
        .find('script')
        .first()
        .html(),
    ).toContain(process.env.FIREBASE_CONFIG)
  })

  it('should render nothing if FIREBASE_CONFIG is not provided', () => {
    delete process.env.FIREBASE_CONFIG
    const wrapper = mount(<FirebasePerformanceMonitoring />)
    expect(wrapper.find('script')).toHaveLength(0)
  })

  it('should use the provided sdk url', () => {
    const url = 'http://firebase.com/test'
    const wrapper = mount(<FirebasePerformanceMonitoring firebaseSdkUrl={url} />)
    expect(
      wrapper
        .find('script')
        .first()
        .html(),
    ).toContain(url)
  })
})
