import createHistory from 'history/lib/createMemoryHistory'
import React from 'react'
import test from 'tape'
import {render} from 'react-dom'
import {Router, Route} from 'react-router'
import {Simulate} from 'react-addons-test-utils'

import Form from 'src/index'

const {submit} = Simulate

test('Form props', t => {
  t.plan(5)

  let renderForm = (FormComponent, cb) => {
    let node = document.createElement('div')
    render(
      <Router history={createHistory('/')}>
        <Route path="/" component={FormComponent}/>
      </Router>,
      node,
      () => cb(node.querySelector('form'))
    )
  }

  renderForm(
    () => <Form to="/add-thing" method="POST" name="test-form" acceptCharset="UTF-8"/>,
    form => {
      t.equal(form.getAttribute('action'), '/add-thing', 'action attribute is set based on the "to" prop')
      t.equal(form.getAttribute('method'), 'POST', 'method prop is passed through')
      t.equal(form.getAttribute('name'), 'test-form', 'name prop is passed through')
      t.equal(form.getAttribute('accept-charset'), 'UTF-8', 'acceptCharset prop is passed through')
    }
  )

  renderForm(
    () => <Form to="/path" query={{foo: 1, bar: 2}}/>,
    form => {
      t.equal(form.getAttribute('action'), '/path?foo=1&bar=2', 'action attribute uses the query prop if given')
    }
  )
})

test('Form submission', t => {
  t.plan(12)

  let renderFormSubmit = (FormComponent, onEnter, cb) => {
    let node = document.createElement('div')
    render(
      <Router history={createHistory('/')}>
        <Route path="/" component={FormComponent}/>
        <Route path="/submit" onEnter={onEnter}/>
      </Router>,
      node,
      () => cb(node.querySelector('form'))
    )
  }

  let FormWrapper = (method, props = {}) => () =>
    <Form to="/submit" method={method} {...props}>
      <input type="text" name="name" defaultValue="AzureDiamond"/>
      <input type="password" name="password" defaultValue="hunter2"/>
      <input type="checkbox" name="accepted" value="accepted" defaultChecked/>
      <button type="submit"/>
    </Form>

  renderFormSubmit(
    FormWrapper('POST'),
    ({location}, replaceState) => {
      t.equal(location.state.method, 'POST', 'Form method set in location.state.method')
      t.deepEqual(
        location.state.body,
        {name: 'AzureDiamond', password: 'hunter2', 'accepted': 'accepted'},
        'POST form data set in location.state.body'
      )
    },
    form => submit(form)
  )

  renderFormSubmit(
    FormWrapper('GET'),
    ({location}, replaceState) => {
      t.deepEqual(
        location.query,
        {name: 'AzureDiamond', password: 'hunter2', 'accepted': 'accepted'},
        'GET form data set in location.query'
      )
    },
    form => submit(form)
  )

  // Any additional state prop given will also have its properties set on the
  // next location state.
  renderFormSubmit(
    FormWrapper('POST', {state: {answer: 42}}),
    ({location}, replaceState) => {
      t.equal(location.state.answer, 42, 'POST form additional state set in location.state')
      t.deepEqual(
        location.state.body,
        {name: 'AzureDiamond', password: 'hunter2', 'accepted': 'accepted'},
        'POST form data still set in location.state.body'
      )
    },
    form => submit(form)
  )

  // When additional query parameters are provided for a GET form, they will be
  // merged into the submitted query string.
  renderFormSubmit(
    FormWrapper('GET', {state: {question: 'que?'}, query: {answer: 42}}),
    ({location}, replaceState) => {
      t.equal(location.state.question, 'que?', 'GET form additional state set in location.state')
      t.deepEqual(
        location.query,
        {answer: '42', name: 'AzureDiamond', password: 'hunter2', 'accepted': 'accepted'},
        'GET form additional query data set in location.query'
      )
    },
    form => submit(form)
  )

  renderFormSubmit(
    FormWrapper('POST', {dataKey: 'stuff', methodKey: 'how'}),
    ({location}, replaceState) => {
      t.equal(location.state.how, 'POST', 'Form method set in location.state with custom methodKey')
      t.deepEqual(
        location.state.stuff,
        {name: 'AzureDiamond', password: 'hunter2', 'accepted': 'accepted'},
        'Form data set in location.state with custom dataKey'
      )
    },
    form => submit(form)
  )

  // Provide your own onSubmit() to control form submission
  renderFormSubmit(
    FormWrapper('POST', {
      onSubmit(e, data) {
        t.deepEqual(
          data,
          {name: 'AzureDiamond', password: 'hunter2', 'accepted': 'accepted'},
          'Extracted form data is passsed to onSubmit()'
        )
      }
    }),
    () => t.pass('Returning undefined from onSubmit() should not prevent form submission'),
    form => submit(form)
  )

  renderFormSubmit(
    FormWrapper('POST', {onSubmit: (e) => false}),
    () => t.fail('Returning false from onSubmit() should have prevented form submission'),
    form => submit(form)
  )

  renderFormSubmit(
    FormWrapper('POST', {onSubmit: (e) => e.preventDefault()}),
    () => t.fail('Calling preventDefault() in onSubmit() should have prevented form submission'),
    form => submit(form)
  )

  // You can provide your own extractFormData(form) prop to handle extracting
  // data from the form.
  renderFormSubmit(
    FormWrapper('POST', {
      extractFormData: (form) =>
        Array.prototype.reduce.call(form.elements, (values, el) => {
          if (el.value) values.push(el.value)
          return values
        }, [])
    }),
    ({location}, replaceState) => {
      t.deepEqual(
        location.state.body,
        ['AzureDiamond', 'hunter2', 'accepted'],
        'Custom extractFormData(form) used to extract form data'
      )
    },
    form => submit(form)
  )
})
