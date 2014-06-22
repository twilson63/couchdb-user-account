var test = require('tap').test
var urlParse = require('url').parse
var chance = require('chance').Chance()
var nock = require('nock')

var account = require('../')(
  urlParse('http://admin:admin@localhost:5984')
)

nock('http://localhost:5984')
  .get('/_users/_design/user')
  .reply(200, {
    "_id":"_design/user",
    "_rev":"3-7faf30910416bb30aee867954d1bd3e7",
    "language":"javascript",
    "version":"0.0.1","views":{
      "all":{"map":"function (doc) {\n    if (doc.type === 'user') emit(doc.email, doc._id)\n  }"},
      "code":{"map":"function (doc) {\n    if (doc.type === 'user' && doc.code) emit(doc.code, doc._id)\n  }"},
      "role":{"map":"function (doc) {\n    doc.roles.forEach(function(role) { emit(role, doc._id) } )\n  }"},
      "verification_code":{"map":"function (doc) {\n    if (doc.type === 'user' && doc.verification_code)\n      emit(doc.verification_code, doc._id)\n  }"}}
    })

nock('http://localhost:5984')
  .post('/_users', {
    "_id":"_design/user",
    "language":"javascript",
    "version":"0.0.1",
    "views":{
      "all":{"map":"function (doc) {\n    if (doc.type === 'user') emit(doc.email, doc._id)\n  }"},
      "code":{"map":"function (doc) {\n    if (doc.type === 'user' && doc.code) emit(doc.code, doc._id)\n  }"},
      "role":{"map":"function (doc) {\n    doc.roles.forEach(function(role) { emit(role, doc._id) } )\n  }"},
      "verification_code":{"map":"function (doc) {\n    if (doc.type === 'user' && doc.verification_code)\n      emit(doc.verification_code, doc._id)\n  }"}},
      "_rev":"3-7faf30910416bb30aee867954d1bd3e7"})
  .reply(201, {"ok":true,"id":"_design/user","rev":"4-520a02b08e9ff862c43f4416bc95a898"})

test('Account#setup', function(t) {
  account.setup(function(err, res) {
    t.ok(res.ok, 'should update view')
    t.end()
  })
})
