var test = require('tap').test
var urlParse = require('url').parse
var chance = require('chance').Chance()
var nock = require('nock')

var account = require('../')(
  urlParse('http://admin:admin@localhost:5984')
)

nock('http://localhost:5984')
  .get('/_users/_design/user/_view/code?key=%2286931bf9-3971-4b4d-aa5b-bce5f90a6132%22&include_docs=true')
  .reply(200, {"total_rows":3,"offset":1,"rows":[
    {
      "id":"org.couchdb.user:foo2",
      "key":"86931bf9-3971-4b4d-aa5b-bce5f90a6132",
      "value":"org.couchdb.user:foo2",
      "doc":{
        "_id":"org.couchdb.user:foo2",
        "_rev":"13-263118982280bd6ec06f536e706ec5cb",
        "password_scheme":"pbkdf2",
        "fullname":"Foo Bar",
        "email":"foo@bar.com",
        "name":"foo2",
        "roles":["foo","patient"],
        "type":"user",
        "derived_key":"73045dc4381a1b6330153a6458c2bc2615bfcab9",
        "salt":"53a84949b4a0143e239c2833797fc7eb",
        "code":"86931bf9-3971-4b4d-aa5b-bce5f90a6132"
      }
    },{
      "id":"org.couchdb.user:foobar2",
      "key":"86931bf9-3971-4b4d-aa5b-bce5f90a6132",
      "value":"org.couchdb.user:foobar2",
      "doc": {
        "_id":"org.couchdb.user:foobar2",
        "_rev":"14-361358e6f330c013f9ad33e0631af009",
        "password_scheme":"pbkdf2",
        "fullname":"Foo bar",
        "email":"foo@bar.com",
        "name":"foobar2",
        "roles":["foo","patient"],
        "type":"user",
        "password_sha":"16d6d6fba583ffb93bc66c0b335d6ac5894df459",
        "salt":"1dcc3b77093cfda76220d70877d7be8b",
        "code":"86931bf9-3971-4b4d-aa5b-bce5f90a6132",
        "derived_key":"7c7a242b7b56f8e7044ab4588f2e37303465f5ef"
        }
    }]})


nock('http://localhost:5984')
  .post('/_users', {
    "_id":"org.couchdb.user:foobar2",
    "_rev":"14-361358e6f330c013f9ad33e0631af009",
    "password_scheme":"pbkdf2",
    "fullname":"Foo bar",
    "email":"foo@bar.com",
    "name":"foobar2",
    "roles":["foo","patient"],
    "type":"user",
    "password_sha":"16d6d6fba583ffb93bc66c0b335d6ac5894df459",
    "salt":"1dcc3b77093cfda76220d70877d7be8b",
    "code":"86931bf9-3971-4b4d-aa5b-bce5f90a6132",
    "derived_key":"7c7a242b7b56f8e7044ab4588f2e37303465f5ef",
    "password":"newpassword"
  })
  .reply(201, {
    "ok":true,
    "id":"org.couchdb.user:foobar2",
    "rev":"15-205ee9547cd199f3a019ff94f69367b5"
  })

nock('http://localhost:5984')
  .post('/_users', {
    "_id":"org.couchdb.user:foo2",
    "_rev":"13-263118982280bd6ec06f536e706ec5cb",
    "password_scheme":"pbkdf2",
    "fullname":"Foo Bar",
    "email":"foo@bar.com",
    "name":"foo2",
    "roles":["foo","patient"],
    "type":"user",
    "derived_key":"73045dc4381a1b6330153a6458c2bc2615bfcab9",
    "salt":"53a84949b4a0143e239c2833797fc7eb",
    "code":"86931bf9-3971-4b4d-aa5b-bce5f90a6132",
    "password":"newpassword"
  })
  .reply(201, {
    "ok":true,
    "id":"org.couchdb.user:foo2",
    "rev":"14-518dc0ca5ecc718a7d1b47f54eaeac6e"
  })


test('Account#changePassword', function(t) {
  account.changePassword('86931bf9-3971-4b4d-aa5b-bce5f90a6132', 'newpassword', function(err, res) {
    t.ok(res.ok, 'should return ok === true')
    t.end()
  })
})
