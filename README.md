# couchdb-user-account model

[![build
status](https://secure.travis-ci.org/twilson63/couchdb-user-account.png)](http://travis-ci.org/twilson63/couchdb-user-account)

This is a user account model module for applications looking to
leverage couchdb `_users` database to manage application users as 
well as create a database per user and properly set the security
properties giving the user account sole access to their datastore.

## Requirements

- NodeJS http://nodejs.org
- CouchDb http://couchdb.apache.org

## Install

`npm install couchdb-user-account`

## Usage

``` js
var account = require('couchdb-user-account')({
  protocol: 'http',
  host: 'localhost:5984',
  auth: 'foo:bar'
})

// register account

account.register({
  name: "foo",
  password: "beep",
  email: "foo@beep.com"
}, function(err, res) {
  console.log(res);
})
```

## API

TODO

* register
* login
* remove
* setup
* findByEmail
* changePassword
* createCode

## Test

`npm test`

## Support

* create an issue on github


---

