## React Router `<Form>`

[![Travis][build-badge]][build]
[![npm package][npm-badge]][npm]
[![Coveralls][coveralls-badge]][coveralls]

A `<Form>` component for use with [React Router](https://github.com/rackt/react-router) which does for `<form>` what react-router's `<Link>` does for `<a>`.

## Usage

A `<Form>` component renders a `<form>` element with the contents you provide, hooks into the form's `onSubmit` event to extract user input and transitions to the configured route with user input data in the next location's state.

```js
import React from 'react'
import Form from 'react-router-form'

let NewPost = React.createClass({
  render() {
    <Form to={`/topics/${this.props.params.topicId}/add-post`} method="POST">
      <textarea name="comment"/>
      <button type="submit">Add Post</button>
    </Form>
  }
})
```
For example, assuming you have the following routes, the component above would trigger the `onEnter` handler for the `add-post` route when the form is submitted:

```js
<Route path="/topics/:topicId/new-post" component={NewPost}/>
<Route path="/topics/:topicId/add-post" onEnter={handleAddPost}/>
```

Form data is set as a `body` property and the form's `method` is set as a `method` property in the next location's state:

```js
function handleAddPost(nextState, replaceState) {
  console.log(nextState.location.state.method) // 'POST'
  console.log(nextState.location.state.body) // {comment: '...'}
}
```

## Goals

One of the key goals of this component is to make it easier to implement basic isomorphic forms in your React app.

If your `onEnter` handlers send back everything needed to re-render a form which has errors (i.e. validation errors *and* user input), then for a little extra effort your React components can handle form submissions on both client and server:

```js
function handleAddPost(nextState, replace, callback) {
  let comment = nextState.location.state.body
  let {topicId} = nextState.params
  ForumService.addComment({comment, topicId})
    .then(({page}) => {
      replace(`/topics/${topicId}?page=${page}`)
    })
    .catch(errors => {
      replace({
        pathname: `/topics/${topicId}/new-post`,
        state: {comment, errors}.
      })
    })
    .finally(callback)
}
```

## Install

````sh
# For React Router 3.x
npm install react-router-form

# For React Router 1.x
npm install react-router-form@1
```

```js
import Form from 'react-router-form'
// or
const Form = require('react-router-form')
```

Browser bundles are available, which export a global `ReactRouterForm` variable and expect to find a global ``React`` variable to work with.

* [react-router-form.js](https://unpkg.com/react-router-form/umd/react-router-form.js) (development version)
* [react-router-form.min.js](https://unpkg.com/react-router-form/umd/react-router-form.min.js) (compressed production version)

## MIT Licensed

[build-badge]: https://img.shields.io/travis/insin/react-router-form/master.png?style=flat-square
[build]: https://travis-ci.org/insin/react-router-form

[npm-badge]: https://img.shields.io/npm/v/react-router-form.png?style=flat-square
[npm]: https://www.npmjs.org/package/react-router-form

[coveralls-badge]: https://img.shields.io/coveralls/insin/react-router-form/master.png?style=flat-square
[coveralls]: https://coveralls.io/github/insin/react-router-form
