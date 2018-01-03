import getFormData from 'get-form-data'
import invariant from 'invariant'
import React from 'react'
import PropTypes from 'prop-types'
import createReactClass from 'create-react-class'

const {any, func, number, object, oneOfType, shape, string} = PropTypes

const {toString} = Object.prototype

const typeOf = (o) => toString.call(o).slice(8, -1).toLowerCase()

function resolveToLocation(to, router) {
  switch (typeOf(to)) {
    case 'function': return to(router.location)
    case 'string': return {pathname: to}
  }
  return to
}

// XXX Reproducing ContextSubscriber from react-router/modules/ContextUtils.js
// so we don't have to import the router, plus it's not available in the UMD
// build. << ^D

// Works around issues with context updates failing to propagate.
// Caveat: the context value is expected to never change its identity.
// https://github.com/facebook/react/issues/2517
// https://github.com/reactjs/react-router/issues/470

function ContextSubscriber(name) {
  const contextName = `@@contextSubscriber/${name}`
  const lastRenderedEventIndexKey = `${contextName}/lastRenderedEventIndex`
  const handleContextUpdateKey = `${contextName}/handleContextUpdate`
  const unsubscribeKey = `${contextName}/unsubscribe`

  return {
    contextTypes: {
      [contextName]: shape({
        subscribe: func.isRequired,
        eventIndex: number.isRequired
      })
    },

    getInitialState() {
      if (!this.context[contextName]) {
        return {}
      }

      return {
        [lastRenderedEventIndexKey]: this.context[contextName].eventIndex
      }
    },

    componentDidMount() {
      if (!this.context[contextName]) {
        return
      }

      this[unsubscribeKey] = this.context[contextName].subscribe(
        this[handleContextUpdateKey]
      )
    },

    componentWillReceiveProps() {
      if (!this.context[contextName]) {
        return
      }

      this.setState({
        [lastRenderedEventIndexKey]: this.context[contextName].eventIndex
      })
    },

    componentWillUnmount() {
      if (!this[unsubscribeKey]) {
        return
      }

      this[unsubscribeKey]()
      this[unsubscribeKey] = null
    },

    [handleContextUpdateKey](eventIndex) {
      if (eventIndex !== this.state[lastRenderedEventIndexKey]) {
        this.setState({[lastRenderedEventIndexKey]: eventIndex})
      }
    }
  }
}

// ^D

/**
 * <Form> components are used to create a <form> element that submits its input
 * data to a route.
 *
 * For example, assuming you have the following route:
 *
 *   <Route path="/topics/:topicId/add-post" onEnter={handleAddPost}/>
 *
 * You could use the following component to submit a form's input data to that
 * route as location state:
 *
 *   <Form to={`/topics/${topicId}/add-post`} method="POST">
 */
const Form = createReactClass({
  displayName: 'Form',

  mixins: [ContextSubscriber('router')],

  contextTypes: {
    router: shape({
      push: func.isRequired,
      replace: func.isRequired,
      go: func.isRequired,
      goBack: func.isRequired,
      goForward: func.isRequired,
      setRouteLeaveHook: func.isRequired,
      isActive: func.isRequired,
    }),
  },

  propTypes: {
    to: oneOfType([string, object, func]),

    component: any,
    dataKey: string,
    extractFormData: func,
    methodKey: string,
    onSubmit: func,
  },

  getDefaultProps() {
    return {
      component: 'form',
      dataKey: 'body',
      extractFormData: getFormData,
      method: 'GET',
      methodKey: 'method',
    }
  },

  handleSubmit(event) {
    let formData = this.props.extractFormData(event.target)

    if (this.props.onSubmit) {
      this.props.onSubmit(event, formData)
    }

    if (event.defaultPrevented) {
      return
    }

    event.preventDefault()

    let {router} = this.context
    invariant(router, '<Form>s rendered outside of a router context cannot submit.')

    let {dataKey, method, methodKey, to} = this.props
    let submitLocation = resolveToLocation(to, router)

    if (method === 'GET') {
      // GET submissions use the query string, so just merge form data into it
      submitLocation.query = {...submitLocation.query, ...formData}
    }
    else {
      submitLocation.state = {
        ...submitLocation.state,
        [methodKey]: method,
        [dataKey]: formData,
      }
    }

    router.push(submitLocation)
  },

  render() {
    let {
      component, dataKey, extractFormData, methodKey, onSubmit, // eslint-disable-line no-unused-vars
      to, ...props,
    } = this.props
    let {router} = this.context

    if (router) {
      props.action = router.createHref(resolveToLocation(to, router))
    }

    return <this.props.component {...props} onSubmit={this.handleSubmit}/>
  }
})

export default Form
