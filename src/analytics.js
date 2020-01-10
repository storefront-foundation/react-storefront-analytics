/**
 * @license
 * Copyright © 2017-2019 Moov Corporation.  All rights reserved.
 */

import { getCookie } from './utils/cookie.js'
import ttiPolyfill from 'tti-polyfill'
import { reset as resetAmpAnalyticsSelectorIds } from './TrackAmp'

const EventEmitter = require('events')

export const events = new EventEmitter()

// When false, any fired events will be put in a queue until activate() is called
let activated = false

// events accumulate here when activated is false
let queue = []

const analyticsEnabled = () => getCookie('rsf_disable_analytics') !== 'true'

export async function initialize(delayUntilInteractive) {
  if (delayUntilInteractive) {
    await ttiPolyfill.getFirstConsistentlyInteractive()
  }

  if (analyticsEnabled()) {
    activate()
  } else {
    console.log('Skipping analytics because a rsf_disable_analytics=true cookie is present.')
  }
}

/**
 * Stops queuing and immediatley fires all queued events
 * @private
 */
export function activate() {
  activated = true

  for (let call of queue) {
    fire(call.event, call.args)
  }
}

const getMetaData = () => ({
  title: document.title,
  pathname: location.pathname,
  search: location.search,
  uri: location.pathname + location.search,
  referrer: document.referrer,
})

export const fire = (event, data) => {
  data = data || {}

  if (!data.eventContext) {
    data = { eventContext: getMetaData(), eventParams: data }
  }

  if (activated) {
    events.emit(event, data)
  } else {
    queue.push({ event, args: data })
  }
}

let ampAnalyticsTags = []
let ampTargets = []

export const addAmpAnalyticsTag = createTag => {
  ampAnalyticsTags.push(createTag)
}

export const addAmpTarget = target => {
  ampTargets.push(target)
}

export const renderAmpAnalyticsTags = () => {
  return ampAnalyticsTags
    .map(tag => {
      return tag({ trackedTargets: ampTargets })
    })
    .join('\n')
}

export const reset = () => {
  activated = false
  ampAnalyticsTags = []
  ampTargets = []
  queue = []
  resetAmpAnalyticsSelectorIds()
}
