'use strict';

var getFormData = require('get-form-data')
var React = require('react')
var assign = require('react/lib/Object.assign')
var {Navigation, State} = require('react-router')

/**
 * <Form> components are used to create a <form> element that submits its input
 * data to a route.
 *
 * For example, assuming you have the following route:
 *
 *   <Route name="addPost" path="/topics/:topicID/addPost" handler={AddPost}/>
 *
 * You could use the following component to submit a form's input data to that
 * route:
 *
 *   <Form to="addPost" params={{ topicID: "123" }}>
 */
var Form = React.createClass({

  displayName: 'Form',

  mixins: [Navigation, State],

  propTypes: {
    to: React.PropTypes.string.isRequired,
    params: React.PropTypes.object,
    query: React.PropTypes.object,
    onSubmit: React.PropTypes.func
  },

  getDefaultProps() {
    return {
      method: 'GET'
    }
  },

  handleSubmit(event) {
    var data = getFormData(event.target)
    var allowTransition = true
    var submitResult

    if (this.props.onSubmit) {
      submitResult = this.props.onSubmit(event, data)
    }

    if (submitResult === false || event.defaultPrevented === true) {
      allowTransition = false
    }

    event.preventDefault()

    if (allowTransition) {
      if (this.props.method === 'GET') {
        this.transitionTo(this.props.to, this.props.params, this.props.query)
      }

      // TODO POST data
    }
  },

  /**
   * Returns the value of the "action" attribute to use on the DOM element.
   */
  getAction() {
    return this.makeHref(this.props.to, this.props.params, this.props.query)
  },

  render() {
    var props = assign({}, this.props, {
      action: this.getAction(),
      onSubmit: this.handleSubmit
    })

    return React.createElement('form', props, this.props.children)
  }
})

module.exports = Form