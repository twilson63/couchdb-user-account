// # Account Module
//
// This module will
//
// * register an account
// * login as account
// * request a password reset
// * reset a password
// * remove account
//
// Dependencies:
//
// - nano
var nano = require('nano')
// - async
var async = require('async')
// - url.format
var urlFormat = require('url').format
// - underscore
var _ = require('underscore')
// - uuid
var uuid = require('uuid')

// ## Account Object
function Account(urlObj) {
  // constructor
  this.nano = nano(urlFormat(urlObj))
}

// ### setup
Account.prototype.setup = function(cb) {
  var all = function(doc) {
    if (doc.type === 'user') emit(doc.email, doc._id)
  }

  var code = function(doc) {
    if (doc.type === 'user' && doc.code) emit(doc.code, doc._id)
  }

  var verification_code = function(doc) {
    if (doc.type === 'user' && doc.verification_code)
      emit(doc.verification_code, doc._id)
  }

  var role = function(doc) {
    doc.roles.forEach(function(role) { emit(role, doc._id) } )
  }

  var designDoc = {
     _id: "_design/user",
     language: "javascript",
     version: "0.0.1",
     views: {
         all:  { map: all.toString()  },
         code: { map: code.toString() },
         role: { map: role.toString() },
         verification_code:
               { map: verification_code.toString() }
     }
  }

  var db = this.nano.use('_users');
  db.get('_design/user', function(err, body) {
    designDoc._rev = body._rev
    db.insert(designDoc, cb)
  })
}

// ### remove
//
Account.prototype.remove = function(id, cb) {
  var users = this.nano.use('_users')
  users.get(id, function(err, doc) {
    users.destroy(id, doc._rev, cb)
  })
}

// ### findByEmail
//
Account.prototype.findByEmail = function(email, cb) {
  var users = this.nano.use('_users')
  users.view('user', 'all', { key: email, include_docs: true }, function(err, body) {
    var docs = _(body.rows).pluck('doc')
    cb(null, docs)
  })
}

// ### createResetCode
//
Account.prototype.createCode = function(email, cb) {
  var self = this
  var db = this.nano.use('_users')
  var code = uuid.v4()

  var saveCode = function(docs, cb) {
    async.map(docs, function (doc, cb) {
      doc.code = code
      db.insert(doc, cb)
    }, cb)
  }

  async.waterfall([
    function (cb) {
      self.findByEmail.call(self, email, cb)
    },
    saveCode
    ],
  function(err, res) {
    if (err) { return cb(new Error(err.message)) }
    var ids = _(res).pluck('id')
    var result = {
      _ids: ids,
      code: code
    }
    cb(null, result)
  })
}

// ### changePassword
//
Account.prototype.changePassword = function(code, password, cb) {
  var users = this.nano.use('_users')
  users.view('user', 'code', {key: code, include_docs: true}, function(err, res) {
    async.map(_(res.rows).pluck('doc'), function(doc, cb) {
      doc.password = password
      users.insert(doc, cb)
    }, function(err, res) {
      if (err) { return cb(new Error(err.message)) }
      var ok = _(res)
        .reduce(function(m,b) { return m * b.ok }, true)
      cb(null, {ok: (ok === 1) })
    })
  })
}

// ### login ( [Object] acct, [function] cb )
//
Account.prototype.login = function(name, password, cb) {
  // name should be string
  if (!_.isString(name)) { return cb(new Error('name should be string!')) }
  if (!_.isString(password)) { return cb(new Error('password should be string!')) }
  this.nano.auth(name, password, cb);
}

// ### register ( [Object] acct, [function] cb )
//
Account.prototype.register = function(acct, cb) {
  // acct must be object
  if (!_.isObject(acct)) { return cb(new Error('acct should be an object!')) }
  // required attributes
  var attributes = ['name', 'password', 'email']
  var errors = _(attributes).reduce(function(valid, attr) {
    if (!_(acct).has('name')) {
      return valid.push(attr + ' is required!')
    } else {
      return valid
    }
  }, [])
  if (errors.length > 0) { return cb(new Error(errors.join(','))) }
  // clone incoming object
  var user = _.clone(acct)
  // extend with doc attributes
  _(user).extend({ type: 'user', roles: ['account']})
  // create security document
  var security = {
    admins: { roles: [], names: []},
    members: { roles: ['admins'], names: [user.name]}
  }
  // execute a series of db cmds
  async.series([
    // create user
    async.apply(this.nano.use('_users').insert, user, 'org.couchdb.user:' + user.name),
    // create database with users name
    async.apply(this.nano.db.create, user.name),
    // insert security document in new database
    async.apply(this.nano.use(user.name).insert, security, '_security'),
    // authenticate user
    async.apply(this.nano.auth, user.name, user.password)
  ], function(err, results) {
    // if err return
    if (err) { return cb(err) }
    // get session cookie
    var sessionCookie = _(results).last()[1]['set-cookie']
    // set ok to true if all requests are ok: true
    var ok = _(results)
      .reduce(function(m,b) { return m * b[0].ok }, true)
    var result = { ok: (ok === 1), 'set-cookie':  sessionCookie }
    // send results
    cb(null, result)
  })
}

// ## export Account Object Instance
module.exports = function(urlObj) {
  return new Account(urlObj)
}
