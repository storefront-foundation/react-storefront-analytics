import React from 'react'
import { mount } from 'enzyme'

describe('FirebaseNavigationTrace', () => {
  let FirebaseContext, FirebaseNavigationTrace

  beforeEach(() => {
    jest.isolateModules(() => {
      jest.doMock('next/router', () => ({
        useRouter() {
          return {}
        },
      }))
      FirebaseContext = require('../../src/firebase/FirebaseContext').default
      FirebaseNavigationTrace = require('../../src/firebase/FirebaseNavigationTrace').default
    })
  })

  it('should stop the active trace', () => {
    const stop = jest.fn()

    const context = {
      trace: {
        stop,
      },
    }

    mount(
      <FirebaseContext.Provider value={context}>
        <FirebaseNavigationTrace />
      </FirebaseContext.Provider>,
    )

    expect(stop).toHaveBeenCalled()
    expect(context.trace).toBe(null)
  })

  it('should do nothing if there is no active trace', () => {
    const context = {
      trace: null,
    }

    mount(
      <FirebaseContext.Provider value={context}>
        <FirebaseNavigationTrace />
      </FirebaseContext.Provider>,
    )

    expect(context.trace).toBe(null)
  })
})
