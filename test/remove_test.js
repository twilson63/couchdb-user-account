var test = require('tap').test
var urlParse = require('url').parse
var chance = require('chance').Chance()
var nock = require('nock')

var account = require('../')(
  urlParse('http://admin:admin@localhost:5984')
)

nock('http://localhost:5984')
  .get('/_users/org.couchdb.user%3Afoobar2')
  .reply(200, {
    "_id":"org.couchdb.user:foobar2",
    "_rev":"15-205ee9547cd199f3a019ff94f69367b5",
    "password_scheme":"pbkdf2",
    "iterations":10,
    "fullname":"Foo bar",
    "email":"foo@bar.com",
    "name":"foobar2",
    "roles":["foo","patient"],
    "type":"user",
    "password_sha":"16d6d6fba583ffb93bc66c0b335d6ac5894df459",
    "salt":"c52a3d86b77606858353682b2d0a5d47",
    "code":"86931bf9-3971-4b4d-aa5b-bce5f90a6132",
    "derived_key":"67758fe990b9fef1466d78200e77217a2b880653"
  })

nock('http://localhost:5984')
  .delete('/_users/org.couchdb.user%3Afoobar2?rev=15-205ee9547cd199f3a019ff94f69367b5')
  .reply(200, {
    "ok":true,
    "id":"org.couchdb.user:foobar2",
    "rev":"16-738aa3f2c9c30924964b9d93d157f0ae"
  })


test('Account#remove', function(t) {
  account.remove('org.couchdb.user:foobar2', function(err, res) {
    t.ok(res.ok, 'should successfully remove account')
    t.end()
  })
})
