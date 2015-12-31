import getFormData from 'get-form-data'
import React, {PropTypes} from 'react'

let {toString} = Object.prototype

let typeOf = o => toString.call(o).slice(8, -1).toLowerCase()

function createLocationDescriptor({to, query, state}) {
  if (typeOf(to) === 'string') {
    return {pathname: to, query, state}
  }
  return {query, state, ...to}
}

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
    router: PropTypes.object
  },

  propTypes: {
    to: PropTypes.oneOfType([PropTypes.string, PropTypes.object]).isRequired,

    component: PropTypes.any,
    dataKey: PropTypes.string,
    extractFormData: PropTypes.func,
    methodKey: PropTypes.string,
    onSubmit: PropTypes.func,
    query: PropTypes.object,
    state: PropTypes.object
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
      let submitLocation = createLocationDescriptor({to, query, state})

      if (method === 'GET') {
        // GET submissions use the query string, so just merge form data into it
        submitLocation.query = {...submitLocation.query, ...formData}
      }
      else {
        submitLocation.state = {
          ...submitLocation.state,
          [methodKey]: method,
          [dataKey]: formData
        }
      }
      this.context.router.push(submitLocation)
    }
  },

  render() {
    let {component, dataKey, extractFormData, methodKey, onSubmit, query, state, to, ...props} = this.props
    let {router} = this.context

    props.onSubmit = this.handleSubmit

    if (router) {
      props.action = router.createHref(createLocationDescriptor({to, query}))
    }

    return <this.props.component {...props}/>
  }
})

export default Form
