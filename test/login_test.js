var test = require('tap').test
var urlParse = require('url').parse
var chance = require('chance').Chance()
var nock = require('nock')

var account = require('../')(
  urlParse('http://admin:admin@localhost:5984')
)

var name = chance.word({ syllables: 2 })
var password = chance.word({ syllables: 2})

nock('http://localhost:5984')
  .post('/_session', "name=" + name + "&password=" + password)
  .reply(200, {
    "ok":true,
    "name":null,
    "roles":["_admin","resource-admin","Admin","FooBar"]},
    { 'set-cookie': [ 'AuthSession=YWRtaW46NTNBNjM5QUY6Y-NPpK1rU29C2d-Ajn3Lz81EFt0; Version=1; Path=/; HttpOnly' ]}
  )

test('Account#login', function(t) {
  account.login(name, password, function(err, body, headers) {
    t.ok(body.ok, 'is successful')
    t.ok(headers['set-cookie'], 'has session cookie')
    t.end()
  })
})
