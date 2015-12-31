import expect from 'expect'
import createHistory from 'react-router/lib/createMemoryHistory'
import React from 'react'
import {render, unmountComponentAtNode} from 'react-dom'
import {Router, Route} from 'react-router'
import {Simulate} from 'react-addons-test-utils'

import Form from 'src/index'

const {submit} = Simulate

describe('Form', () => {
  let node

  beforeEach(() => {
    node = document.createElement('div')
  })

  afterEach(() => {
    unmountComponentAtNode(node)
  })

  let renderForm = (FormComponent, cb) => {
    render(
      <Router history={createHistory('/')}>
        <Route path="/" component={FormComponent}/>
      </Router>,
      node,
      () => cb(node.querySelector('form'))
    )
  }

  describe('props', () => {
    it('sets rendered form attributes appropriately', done => {
      renderForm(
        () => <Form to="/add-thing" method="POST" name="test-form" acceptCharset="UTF-8"/>,
        form => {
          expect(form.getAttribute('action')).toEqual('/add-thing')
          expect(form.getAttribute('method')).toEqual('POST', 'method prop is passed through')
          expect(form.getAttribute('name')).toEqual('test-form', 'name prop is passed through')
          expect(form.getAttribute('accept-charset')).toEqual('UTF-8', 'acceptCharset prop is passed through')
          done()
        }
      )
    })

    it('uses query props in the action attribute', done => {
      renderForm(
        () => <Form to="/path" query={{foo: 1, bar: 2}}/>,
        form => {
          expect(form.getAttribute('action')).toInclude('foo=1').toInclude('bar=2')
          done()
        }
      )
    })

    it('accepts a location descriptor object', done => {
      renderForm(
        () => <Form to={{pathname: '/path', query: {foo: 1, bar: 2}}}/>,
        form => {
          expect(form.getAttribute('action')).toInclude('foo=1').toInclude('bar=2')
          done()
        }
      )
    })
  })

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

  describe('submission', () => {
    it('sets POST form data in location.state', done => {
      renderFormSubmit(
        FormWrapper('POST'),
        ({location}, replaceState) => {
          expect(location.state.method).toEqual('POST', 'Form method set in location.state.method')
          expect(location.state.body).toEqual(
            {name: 'AzureDiamond', password: 'hunter2', 'accepted': 'accepted'},
            'POST form data set in location.state.body'
          )
          done()
        },
        form => submit(form)
      )
    })

    it('sets GET form data in location.query', done => {
      renderFormSubmit(
        FormWrapper('GET'),
        ({location}, replaceState) => {
          expect(location.query).toEqual(
            {name: 'AzureDiamond', password: 'hunter2', 'accepted': 'accepted'},
            'GET form data set in location.query'
          )
          done()
        },
        form => submit(form)
      )
    })

    it('also sets additional state props on location.state', done => {
      renderFormSubmit(
        FormWrapper('POST', {state: {answer: 42}}),
        ({location}, replaceState) => {
          expect(location.state.answer).toEqual(42, 'POST form additional state set in location.state')
          expect(location.state.body).toEqual(
            {name: 'AzureDiamond', password: 'hunter2', 'accepted': 'accepted'},
            'POST form data still set in location.state.body'
          )
          done()
        },
        form => submit(form)
      )
    })

    it('also sets additional location descriptor state on location.state', done => {
      renderFormSubmit(
        FormWrapper('POST', {to: {pathname: '/submit', state: {answer: 42}}}),
        ({location}, replaceState) => {
          expect(location.state.answer).toEqual(42, 'POST form additional state set in location.state')
          expect(location.state.body).toEqual(
            {name: 'AzureDiamond', password: 'hunter2', 'accepted': 'accepted'},
            'POST form data still set in location.state.body'
          )
          done()
        },
        form => submit(form)
      )
    })

    it('merges additional query prop for a GET form into the submitted query string', done => {
      renderFormSubmit(
        FormWrapper('GET', {state: {question: 'que?'}, query: {answer: 42}}),
        ({location}, replaceState) => {
          expect(location.state.question).toEqual('que?', 'GET form additional state set in location.state')
          expect(location.query).toEqual(
            {answer: '42', name: 'AzureDiamond', password: 'hunter2', 'accepted': 'accepted'},
            'GET form additional query data set in location.query'
          )
          done()
        },
        form => submit(form)
      )
    })

    it('merges additional location descriptor query for a GET form into the submitted query string', done => {
      renderFormSubmit(
        FormWrapper('GET', {to: {pathname: '/submit', state: {question: 'que?'}, query: {answer: 42}}}),
        ({location}, replaceState) => {
          expect(location.state.question).toEqual('que?', 'GET form additional state set in location.state')
          expect(location.query).toEqual(
            {answer: '42', name: 'AzureDiamond', password: 'hunter2', 'accepted': 'accepted'},
            'GET form additional query data set in location.query'
          )
          done()
        },
        form => submit(form)
      )
    })

    it('uses custom methodKey and dataKey props to set location.state when given', done => {
      renderFormSubmit(
        FormWrapper('POST', {dataKey: 'stuff', methodKey: 'how'}),
        ({location}, replaceState) => {
          expect(location.state.how).toEqual('POST', 'Form method set in location.state with custom methodKey')
          expect(location.state.stuff).toEqual(
            {name: 'AzureDiamond', password: 'hunter2', 'accepted': 'accepted'},
            'Form data set in location.state with custom dataKey'
          )
          done()
        },
        form => submit(form)
      )
    })

    it('continues when a custom onSubmit() returns undefined', done => {
      let onEnter = expect.createSpy()
      // Provide your own onSubmit() to control form submission
      renderFormSubmit(
        FormWrapper('POST', {
          onSubmit(e, data) {
            expect(
              data,
              {name: 'AzureDiamond', password: 'hunter2', 'accepted': 'accepted'},
              'Extracted form data is passsed to onSubmit()'
            )
          }
        }),
        onEnter,
        form => {
          submit(form)
          expect(onEnter).toHaveBeenCalled(
            'Returning undefined from onSubmit() should not prevent form submission'
          )
          done()
        }
      )
    })

    it('is cancelled when a custom onSubmit() returns false', done => {
      let onEnter = expect.createSpy()
      renderFormSubmit(
        FormWrapper('POST', {onSubmit: (e) => false}),
        onEnter,
        form => {
          submit(form)
          expect(onEnter).toNotHaveBeenCalled(
            'Returning false from onSubmit() should have prevented form submission'
          )
          done()
        }
      )
    })

    it('is cancelled if preventDefault() is called in a custom onSubmit()', done => {
      let onEnter = expect.createSpy()
      renderFormSubmit(
        FormWrapper('POST', {onSubmit: (e) => e.preventDefault()}),
        onEnter,
        form => {
          submit(form)
          expect(onEnter).toNotHaveBeenCalled(
            'Calling preventDefault() in onSubmit() should have prevented form submission'
          )
          done()
        }
      )
    })

    it('uses a custom extractFormData() to extract data when given', done => {
      renderFormSubmit(
        FormWrapper('POST', {
          extractFormData: (form) =>
            Array.prototype.reduce.call(form.elements, (values, el) => {
              if (el.value) values.push(el.value)
              return values
            }, [])
        }),
        ({location}, replaceState) => {
          expect(location.state.body).toEqual(
            ['AzureDiamond', 'hunter2', 'accepted'],
            'Custom extractFormData(form) used to extract form data'
          )
          done()
        },
        form => submit(form)
      )
    })
  }) // submission
})
