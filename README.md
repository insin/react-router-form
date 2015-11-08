## React Router `<Form>`

A `<Form>` component for use with [React Router](https://github.com/rackt/react-router) which does for `<form>` what react-router's `<Link>` does for `<a>`.

## Usage

A `<Form>` component renders a `<form>` element and uses its `onSubmit` event to extract input data form form elements and transition to a new route with input data in the location state.

```javascript
let NewPost = React.createClass({
  render() {
    <Form to={`/topics/${topicId}/add-post`} method="POST">
      <textarea name="comment"/>
      <button type="submit">Add Post</button>
    </Form>
  }
})
```
For example, assuming you have the following routes, the component above would trigger the `onEnter` handler for the `add-post` route:

``` javascript
<Route path="/topics/:topicId/new-post" component={NewPost}/>
<Route path="/topics/:topicId/add-post" onEnter={handleAddPost}/>
```

By default, form data is set as a `body` property and the form's `method` is set as a `method` property in the next location's state:

```javascript
function handleAddPost(nextState, replaceState) {
  console.log(nextState.location.state.method) // 'POST'
  console.log(nextState.location.state.body) // {comment: '...'}
}
```

It's more likely that you'll want to do something with the data, then decide what to do next:

```javascript
function handleAddPost({location}, replaceState, callback) {
  let comment = location.state.body
  let {topicId} = location.state.params
  ForumService.addComment({comment, topicId})
    .then(({page}) => replaceState(null, `/topics/${topicId}?page=${page}`))
    .catch(errors => replaceState({comment, errors}, `/topics/${topicId}/new-post`))
    .finally(callback)
}
```

## Install

**Node**

````
npm install react-router-form
```

```javascript
var Form = require('react-router-form')
// or
import Form from 'react-router-form'
```

**Browser**

Browser bundles export a global `ReactRouterForm` variable and expect to find global ``React`` and `ReactRouter` variables to work with.

* [react-router-form.js](https://npmcdn.com/react-router-form/dist/react-router-form.js) (development version)
* [react-router-form.min.js](https://npmcdn.com/react-router-form/dist/react-router-form.min.js) (compressed production version)

## MIT Licensed
