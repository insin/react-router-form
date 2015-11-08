import getFormData from 'get-form-data'
import React from 'react'

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
let Form = React.createClass({
  displayName: 'Form',

  contextTypes: {
    history: React.PropTypes.object
  },

  propTypes: {
    component: React.PropTypes.any,
    dataKey: React.PropTypes.string,
    extractFormData: React.PropTypes.func,
    methodKey: React.PropTypes.string,
    onSubmit: React.PropTypes.func,
    query: React.PropTypes.object,
    state: React.PropTypes.object,
    to: React.PropTypes.string.isRequired
  },

  getDefaultProps() {
    return {
      component: 'form',
      dataKey: 'body',
      extractFormData: getFormData,
      method: 'GET',
      methodKey: 'method'
    }
  },

  handleSubmit(event) {
    let formData = this.props.extractFormData(event.target)
    let allowTransition = true
    let submitResult

    if (this.props.onSubmit) {
      submitResult = this.props.onSubmit(event, formData)
    }

    if (submitResult === false || event.defaultPrevented === true) {
      allowTransition = false
    }

    event.preventDefault()

    if (allowTransition) {
      let {dataKey, method, methodKey, query, state, to} = this.props

      if (method === 'GET') {
        // GET submissions use the query string, so just merge form data into it
        query = {...query || {}, ...formData}
      }
      else {
        state = {
          ...state,
          ...{
            [methodKey]: method,
            [dataKey]: formData
          }
        }
      }
      this.context.history.pushState(state, to, query)
    }
  },

  render() {
    let {component, dataKey, extractFormData, methodKey, onSubmit, query, state, to, ...props} = this.props
    let {history} = this.context

    props.onSubmit = this.handleSubmit

    if (history) {
      props.action = history.createHref(to, query)
    }

    return <this.props.component {...props}/>
  }
})

export default Form
