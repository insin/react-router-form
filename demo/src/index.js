import './style.css'

import React from 'react'
import {render} from 'react-dom'
import {IndexRoute, Link, Route, Router, hashHistory} from 'react-router'

import Form from '../../src'

let CONTACTS = [{
  first: 'Ryan',
  last: 'Florence',
  avatar: 'http://ryanflorence.com/jsconf-avatars/avatars/ryan.jpg'
}, {
  first: 'Michael',
  last: 'Jackson',
  avatar: 'http://ryanflorence.com/jsconf-avatars/avatars/michael.jpg'
}, {
  first: 'Jeremy',
  last: 'Ashkenas',
  avatar: 'http://ryanflorence.com/jsconf-avatars/avatars/jeremy.jpg'
}, {
  first: 'Yehuda',
  last: 'Katz',
  avatar: 'http://ryanflorence.com/jsconf-avatars/avatars/yehuda.jpg'
}, {
  first: 'Tom',
  last: 'Dale',
  avatar: 'http://ryanflorence.com/jsconf-avatars/avatars/tom.jpg'
}, {
  first: 'Pete',
  last: 'Hunt',
  avatar: 'http://ryanflorence.com/jsconf-avatars/avatars/pete.jpg'
}, {
  first: 'Misko',
  last: 'Hevery',
  avatar: 'http://ryanflorence.com/jsconf-avatars/avatars/misko.png'
}, {
  first: 'Scott',
  last: 'Miles',
  avatar: 'http://ryanflorence.com/jsconf-avatars/avatars/scott.png'
}, {
  first: 'Matt',
  last: 'Zabriskie',
  avatar: 'http://ryanflorence.com/jsconf-avatars/avatars/matt.jpeg'
}]

let ContactService = {
  add(contact, cb) {
    if (!contact.first || !contact.last || !contact.avatar || !contact.PIN) {
      return cb(null, 'All fields are required.')
    }
    // Simulated server-only check
    let dupe = CONTACTS.some(existing => {
      return existing.first.toUpperCase() === contact.first.toUpperCase() &&
             existing.last.toUpperCase() === contact.last.toUpperCase()
    })
    if (dupe) {
      return cb(null, 'Duplicate contact name.')
    }
    CONTACTS.push(contact)
    cb(null)
  }
}

let App = React.createClass({
  render() {
    return <div className="App">
      <p>
        Reuses components from the <a href="http://react-router-mega-demo.herokuapp.com/">React Router Mega Demo</a>,
        but uses the <code>&lt;Form&gt;</code> component
        from <a href="https://github.com/insin/react-router-form">react-router-form</a> to
        automatically retrieve and submit form data.
      </p>
      {this.props.children}
    </div>
  }
})

let Contacts = React.createClass({
  render() {
    return <div>
      <h2>Contacts</h2>

      <Link to="/new-contact">New Contact</Link>
      <hr/>
      {CONTACTS.map(contact => <div className="Contact">
        <h3>{contact.first} {contact.last}</h3>
        <img src={contact.avatar}/>
      </div>)}
      <hr/>
      <Link to="/new-contact">New Contact</Link>
    </div>
  }
})

let NewContact = React.createClass({
  getInitialState() {
    return {
      error: null
    }
  },

  componentWillReceiveProps(nextProps) {
    let {state} = this.props.location
    let {state: nextState} = nextProps.location
    if (nextState && nextState.error &&
       (!state || state.error !== nextState.error)) {
      this.setState({error: nextState.error})
    }
  },

  _onSubmit(e, contact) {
    let error = this.state.error
    if (Object.keys(contact).some(prop => contact[prop] === '')) {
      e.preventDefault()
      error = 'All fields are required.'
    }
    this.setState({error})
  },

  render() {
    let {location} = this.props
    let contact = location.state && location.state.contact || {}
    return <div>
      <h1>New Contact</h1>
      <p><em>
        (Enter a duplicate name to simulate a service call resulting in an error response)
      </em></p>
      <div>
        <Form method="POST" to="/create-contact" dataKey="contact" onSubmit={this._onSubmit}>
          {this.state.error && <p className="error">{this.state.error}</p>}
          <p><input name="first" placeholder="first name" defaultValue={contact.first}/></p>
          <p><input name="last" placeholder="last name" defaultValue={contact.last}/></p>
          <p><input name="avatar" placeholder="avatar url" defaultValue={contact.avatar}/></p>
          <p><input name="PIN" type="password" placeholder="PIN" defaultValue={contact.PIN}/></p>
          <p><button type="submit">Add</button> or <Link to="/">Cancel</Link></p>
        </Form>
      </div>
    </div>
  }
})

function handleCreateContact({location}, replaceState, cb) {
  let {contact} = location.state
  ContactService.add(contact, (_, error) => {
    if (!error) {
      replaceState(null, '/')
    }
    else {
      replaceState({contact, error}, '/new-contact')
    }
    cb()
  })
}

let routes = <Route path="/" component={App}>
  <IndexRoute component={Contacts}/>
  <Route path="new-contact" component={NewContact}/>
  <Route path="create-contact" onEnter={handleCreateContact}/>
</Route>

render(<Router history={hashHistory} routes={routes}/>, document.querySelector('#demo'))
