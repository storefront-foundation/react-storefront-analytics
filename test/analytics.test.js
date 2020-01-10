/**
 * @license
 * Copyright © 2017-2018 Moov Corporation.  All rights reserved.
 */
import { events, fire, initialize, reset } from '../src/analytics'

function throwOnEvent() {
  throw new Error('Expected no events to trigger')
}

let setInteractive = () => {}

describe('analytics', () => {
  beforeEach(() => {
    jest.resetModules()
    jest.mock('tti-polyfill', () => ({
      getFirstConsistentlyInteractive: () => {
        return new Promise((resolve, reject) => {
          setInteractive = resolve
        })
      },
    }))
    reset()
  })

  it('does not trigger events before initialization', done => {
    const eventData = {}
    events.on('event', throwOnEvent)
    fire('event', eventData)
    setImmediate(() => {
      events.removeListener('event', throwOnEvent)
      done()
    })
  })

  it('triggers events after initialization', done => {
    initialize(false)
    const eventData = {}
    events.once('event', () => {
      done()
    })
    fire('event', eventData)
  })

  it('triggers queued events upon initialization', () => {
    const spy = jest.fn()
    events.on('event', spy)
    fire('event', {})
    fire('event', {})
    expect(spy).not.toHaveBeenCalled()
    initialize(false)
    expect(spy).toHaveBeenCalledTimes(2)
    events.removeListener('event', spy)
  })

  it('waits until interactive before firing queued events when configured', () => {
    const spy = jest.fn()
    events.on('event', spy)
    fire('event', {})
    expect(spy).not.toHaveBeenCalled()
    initialize(true)
    expect(spy).not.toHaveBeenCalled()
    setInteractive()
    setTimeout(() => {
      expect(spy).toHaveBeenCalledOnce()
      events.removeListener('event', spy)
    })
  })
})
