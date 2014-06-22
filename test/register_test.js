var test = require('tap').test
var urlParse = require('url').parse
var chance = require('chance').Chance()
var nock = require('nock')

var account = require('../')(
  urlParse('http://admin:admin@localhost:5984')
)

var name = chance.word({ syllables: 2 })
var email = chance.email()

nock('http://localhost:5984')
  .put('/_users/org.couchdb.user%3A' + name, {
    "name": name,
    "password":"foobar",
    "email": email,
    "type":"user",
    "roles":["account"]})
  .reply(201, {"ok":true})

nock('http://localhost:5984')
  .put('/' + name)
  .reply(201, {"ok":true})

nock('http://localhost:5984')
  .put('/' + name + '/_security', {"admins":{"roles":[],"names":[]},"members":{"roles":["admins"],"names":[name]}})
  .reply(200, {"ok":true})


nock('http://localhost:5984')
  .post('/_session', "name=" + name + "&password=foobar")
  .reply(200, {"ok":true,"name": name,"roles":["account"]},
    { 'set-cookie': [
      'AuthSession=dGV2YWw6NTNBNjI4OUQ6_ADGkFgQ38qYnh8X4wOCL7J_Xzs; Version=1; Path=/; HttpOnly'
    ]})

//nock.recorder.rec()

test('Account#register', function(t) {
  account.register({
    name: name,
    password: 'foobar',
    email: email
  }, function(e,r) {
    t.ok(r.ok, 'is successful')
    t.ok(r['set-cookie'], 'has session cookie')
    t.end()
  })
})
