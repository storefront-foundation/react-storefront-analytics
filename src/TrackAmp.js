/**
 * @license
 * Copyright © 2017-2019 Moov Corporation.  All rights reserved.
 */
import React from 'react'
import PropTypes from 'prop-types'
import { addAmpTarget } from './analytics'

let nextId = 0

const TrackAmp = ({ children, event, data }) => {
  const eventToTrack = event.onClick
  const child = children && React.Children.only(children)
  if (eventToTrack) {
    const id = (nextId++).toString()
    addAmpTarget({
      event: eventToTrack,
      eventParams: data,
      selector: `[data-amp-id="${id}"]`,
    })
    return React.cloneElement(child, { ...child.props, 'data-amp-id': id })
  } else {
    return child
  }
}

TrackAmp.propTypes = {
  /**
   * Object mapping triggers to events. Only the onClick event will be used.
   */
  event: PropTypes.object.isRequired,
}

export default TrackAmp

export const reset = () => {
  nextId = 0
}
