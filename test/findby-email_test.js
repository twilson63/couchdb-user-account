var test = require('tap').test
var urlParse = require('url').parse
var chance = require('chance').Chance()
var nock = require('nock')

var account = require('../')(
  urlParse('http://admin:admin@localhost:5984')
)

nock('http://localhost:5984')
  .get('/_users/_design/user/_view/all?key=%22foo%40bar.com%22&include_docs=true')
  .reply(200, {"total_rows":43,"offset":7,"rows":[]})

test('Account#findByEmail', function(t) {
  account.findByEmail('foo@bar.com', function(err, doc) {
    t.equals(err, null, 'should not return error')
    t.end()
  })
})
