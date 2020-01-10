/**
 * @license
 * Copyright © 2017-2019 Moov Corporation.  All rights reserved.
 */
import React from 'react'
import PropTypes from 'prop-types'
import useAnalytics from './useAnalytics'
import { useAmp } from 'next/amp'
import TrackAmp from './TrackAmp'

/**
 * Returns the value of the trigger normalized to an object. If trigger is a string,
 * this function will return { [trigger]: event }
 */
const getTriggerEvents = event => {
  if (typeof event === 'string') {
    return { onClick: event }
  } else {
    return event
  }
}

/**
 * Fires an analytics event when the user interacts with the child component.  By default this fires when the user
 * clicks on the child component, but this can be overriden using the `event` prop.  The value of event should
 * be the name of the event prop to bind to. All additional props will be passed as options along with the event.
 *
 * Example:
 *
 * <Track event="addedToCart" product={this.props.product}>
 *  <Button>Add to Cart</Button>
 * </Track>
 *
 * To trigger events on multiple triggers provide the event prop as an object:
 *
 * <Track event={{onClick: 'onProductClicked', onFocus: 'onProductFocus'}} product={this.props.product}>
 *  <Button>Add to Cart</Button>
 * </Track>
 */
const Track = ({ children, event, onSuccess, ...data }) => {
  const triggerEvents = getTriggerEvents(event)
  if (event && useAmp()) {
    return (
      <TrackAmp event={triggerEvents} data={data}>
        {children}
      </TrackAmp>
    )
  }
  const { fire } = useAnalytics()

  const fireEvent = e => {
    setImmediate(async () => {
      // Next adds a 'trigger' prop
      const { trigger, ...rest } = data
      await fire(e, rest)
      onSuccess()
    })
  }

  const child = children && React.Children.only(children)
  if (!child) return null

  let triggerHandlers = {}

  for (let trigger in triggerEvents) {
    const originalHandler = child.props[trigger]
    triggerHandlers[trigger] = (...args) => {
      if (originalHandler) originalHandler(...args)
      fireEvent(triggerEvents[trigger])
    }
  }

  return React.cloneElement(child, { ...child.props, ...triggerHandlers })
}

Track.propTypes = {
  /**
   * The name of the event to emit. When specified as a string then the default trigger
   * is 'onClick'. Can be provided as an object, eg {onClick: 'productClicked', onMouseOver: 'productHovered'}
   * to specify a custom trigger or multiple events.
   */
  event: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),

  /**
   * A function to call once the event has been successfully sent by all analytics targets.
   */
  onSuccess: PropTypes.func,
}

Track.defaultProps = {
  trigger: 'onClick',
  onSuccess: Function.prototype,
}

export default Track
