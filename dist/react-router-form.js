(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory(require("react"));
	else if(typeof define === 'function' && define.amd)
		define(["react"], factory);
	else if(typeof exports === 'object')
		exports["ReactRouterForm"] = factory(require("react"));
	else
		root["ReactRouterForm"] = factory(root["React"]);
})(this, function(__WEBPACK_EXTERNAL_MODULE_2__) {
return /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

	function _objectWithoutProperties(obj, keys) { var target = {}; for (var i in obj) { if (keys.indexOf(i) >= 0) continue; if (!Object.prototype.hasOwnProperty.call(obj, i)) continue; target[i] = obj[i]; } return target; }

	var getFormData = __webpack_require__(1);
	var React = __webpack_require__(2);

	/**
	 * <Form> components are used to create a <form> element that submits its input
	 * data to a route.
	 *
	 * For example, assuming you have the following route:
	 *
	 *   <Route path="/topics/:topicID/add-post" onEnter={handleAddPost}/>
	 *
	 * You could use the following component to submit a form's input data to that
	 * route as location state:
	 *
	 *   <Form to={`/topics/${topicID}/add-post`}>
	 */
	var Form = React.createClass({
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

	  getDefaultProps: function getDefaultProps() {
	    return {
	      component: 'form',
	      dataKey: 'body',
	      extractFormData: getFormData,
	      method: 'GET',
	      methodKey: 'method'
	    };
	  },

	  handleSubmit: function handleSubmit(event) {
	    var formData = this.props.extractFormData(event.target);
	    var allowTransition = true;
	    var submitResult;

	    if (this.props.onSubmit) {
	      submitResult = this.props.onSubmit(event, formData);
	    }

	    if (submitResult === false || event.defaultPrevented === true) {
	      allowTransition = false;
	    }

	    event.preventDefault();

	    if (allowTransition) {
	      var state = this.props.state;
	      var to = this.props.to;
	      var query = this.props.query;
	      if (this.props.method === 'GET') {
	        // GET submissions use the query string, so just merge form data into it
	        query = _extends({}, query, formData);
	      } else {
	        var _extends2;

	        state = _extends({}, state, (_extends2 = {}, _extends2[this.props.methodKey] = this.props.method, _extends2[this.props.dataKey] = formData, _extends2));
	      }
	      this.context.history.pushState(state, to, query);
	    }
	  },

	  render: function render() {
	    var _props = this.props;
	    var component = _props.component;
	    var dataKey = _props.dataKey;
	    var methodKey = _props.methodKey;
	    var onSubmit = _props.onSubmit;
	    var query = _props.query;
	    var state = _props.state;
	    var to = _props.to;

	    var props = _objectWithoutProperties(_props, ['component', 'dataKey', 'methodKey', 'onSubmit', 'query', 'state', 'to']);

	    var history = this.context.history;

	    props.onSubmit = this.handleSubmit;

	    if (history) {
	      props.action = history.createHref(to, query);
	    }

	    return React.createElement(this.props.component, props);
	  }
	});

	module.exports = Form;

/***/ },
/* 1 */
/***/ function(module, exports) {

	'use strict';

	var NODE_LIST_CLASSES = {
	  '[object HTMLCollection]': true
	, '[object NodeList]': true
	, '[object RadioNodeList]': true
	}

	var IGNORED_INPUT_TYPES = {
	  'button': true
	, 'reset': true
	, 'submit': true
	, 'fieldset': true
	}

	var CHECKED_INPUT_TYPES = {
	  'checkbox': true
	, 'radio': true
	}

	var TRIM_RE = /^\s+|\s+$/g

	var slice = Array.prototype.slice
	var toString = Object.prototype.toString

	/**
	 * @param {HTMLFormElement} form
	 * @return {Object.<string,(string|Array.<string>)>} an object containing
	 *   submittable value(s) held in the form's .elements collection, with
	 *   properties named as per element names or ids.
	 */
	function getFormData(form, options) {
	  if (!form) {
	    throw new Error('A form is required by getFormData, was given form=' + form)
	  }

	  if (!options) {
	    options = {trim: false}
	  }

	  var data = {}
	  var elementName
	  var elementNames = []
	  var elementNameLookup = {}

	  // Get unique submittable element names for the form
	  for (var i = 0, l = form.elements.length; i < l; i++) {
	    var element = form.elements[i]
	    if (IGNORED_INPUT_TYPES[element.type] || element.disabled) {
	      continue
	    }
	    elementName = element.name || element.id
	    if (elementName && !elementNameLookup[elementName]) {
	      elementNames.push(elementName)
	      elementNameLookup[elementName] = true
	    }
	  }

	  // Extract element data name-by-name for consistent handling of special cases
	  // around elements which contain multiple inputs.
	  for (i = 0, l = elementNames.length; i < l; i++) {
	    elementName = elementNames[i]
	    var value = getNamedFormElementData(form, elementName, options)
	    if (value != null) {
	      data[elementName] = value
	    }
	  }

	  return data
	}

	/**
	 * @param {HTMLFormElement} form
	 * @param {string} elementName
	 * @return {(string|Array.<string>)} submittable value(s) in the form for a
	 *   named element from its .elements collection, or null if there was no
	 *   element with that name or the element had no submittable value(s).
	 */
	function getNamedFormElementData(form, elementName, options) {
	  if (!form) {
	    throw new Error('A form is required by getNamedFormElementData, was given form=' + form)
	  }
	  if (!elementName && toString.call(elementName) !== '[object String]') {
	    throw new Error('A form element name is required by getNamedFormElementData, was given elementName=' + elementName)
	  }

	  var element = form.elements[elementName]
	  if (!element || element.disabled) {
	    return null
	  }

	  var trim = !!(options && options.trim)

	  if (!NODE_LIST_CLASSES[toString.call(element)]) {
	    return getFormElementValue(element, trim)
	  }

	  // Deal with multiple form controls which have the same name
	  var data = []
	  var allRadios = true
	  for (var i = 0, l = element.length; i < l; i++) {
	    if (element[i].disabled) {
	      continue
	    }
	    if (allRadios && element[i].type !== 'radio') {
	      allRadios = false
	    }
	    var value = getFormElementValue(element[i], trim)
	    if (value != null) {
	      data = data.concat(value)
	    }
	  }

	  // Special case for an element with multiple same-named inputs which were all
	  // radio buttons: if there was a selected value, only return the value.
	  if (allRadios && data.length === 1) {
	    return data[0]
	  }

	  return (data.length > 0 ? data : null)
	}

	/**
	 * @param {HTMLElement} element a form element.
	 * @param {booleam} trim should values for text entry inputs be trimmed?
	 * @return {(string|Array.<string>|File|Array.<File>)} the element's submittable
	 *   value(s), or null if it had none.
	 */
	function getFormElementValue(element, trim) {
	  var value = null

	  if (element.type === 'select-one') {
	    if (element.options.length) {
	      value = element.options[element.selectedIndex].value
	    }
	    return value
	  }

	  if (element.type === 'select-multiple') {
	    value = []
	    for (var i = 0, l = element.options.length; i < l; i++) {
	      if (element.options[i].selected) {
	        value.push(element.options[i].value)
	      }
	    }
	    if (value.length === 0) {
	      value = null
	    }
	    return value
	  }

	  // If a file input doesn't have a files attribute, fall through to using its
	  // value attribute.
	  if (element.type === 'file' && 'files' in element) {
	    if (element.multiple) {
	      value = slice.call(element.files)
	      if (value.length === 0) {
	        value = null
	      }
	    }
	    else {
	      // Should be null if not present, according to the spec
	      value = element.files[0]
	    }
	    return value
	  }

	  if (!CHECKED_INPUT_TYPES[element.type]) {
	    value = (trim ? element.value.replace(TRIM_RE, '') : element.value)
	  }
	  else if (element.checked) {
	    value = element.value
	  }

	  return value
	}

	getFormData.getNamedFormElementData = getNamedFormElementData

	module.exports = getFormData

/***/ },
/* 2 */
/***/ function(module, exports) {

	module.exports = __WEBPACK_EXTERNAL_MODULE_2__;

/***/ }
/******/ ])
});
;