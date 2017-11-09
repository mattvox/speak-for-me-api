/* eslint-disable no-undef */
/* eslint-disable func-names */
/* eslint-disable prefer-arrow-callback */
/* eslint-disable no-unused-expressions */

process.env.NODE_ENV = 'test'

const chai = require('chai')
const chaiHttp = require('chai-http')

const app = require('../index.js')

// eslint-disable-next-line no-unused-vars
const should = chai.should()

chai.use(chaiHttp)

describe('GET api/v1/', function () {
  beforeEach(function (done) {
    address = '416 Sloan Ave 08107'
    state = 'NJ'
    district = 1
    repId = 'B001288'
    repName = 'cory booker'

    badAddress = '416'
    badState = 'ZZ'
    badDistrict = 12345
    badRepId = 'HHHHHH'
    done()
  })

  // ************SHOULD SUCCEED************

  it('should GET user info', function (done) {
    chai.request(app)
      .get('/api/v1/user')
      .query({ address })
      .end(function (err, res) {
        res.should.have.status(200)
        res.should.be.json
        res.body.should.be.a('object')
        res.body.should.have.property('state')
        res.body.should.have.property('address')
        res.body.should.have.property('district')
        done()
      })
  })

  it('should GET house rep info', function (done) {
    chai.request(app)
      .get('/api/v1/representatives/house')
      .query({ state, district })
      .end(function (err, res) {
        res.should.have.status(200)
        res.should.be.json
        res.body.should.be.a('object')
        res.body.should.have.property('id')
        res.body.should.have.property('name')
        res.body.should.have.property('party')
        done()
      })
  })

  it('should GET senate reps info', function (done) {
    chai.request(app)
      .get('/api/v1/representatives/senate')
      .query({ state })
      .end(function (err, res) {
        res.should.have.status(200)
        res.should.be.json
        res.body.should.be.a('array')
        done()
      })
  })

  it('should GET detailed rep info', function (done) {
    chai.request(app)
      .get(`/api/v1/representatives/${repId}`)
      .end(function (err, res) {
        res.should.have.status(200)
        res.should.be.json
        res.body.should.be.a('object')
        res.body.should.have.property('member_id')
        res.body.should.have.property('first_name')
        res.body.should.have.property('last_name')
        done()
      })
  })

  it('should GET articles from the Times', function (done) {
    chai.request(app)
      .get('/api/v1/representatives/nyt/articles')
      .query({ name: repName })
      .end(function (err, res) {
        res.should.have.status(200)
        res.should.be.json
        res.body.should.be.a('object')
        res.body.should.have.property('status')
        res.body.should.have.property('copyright')
        res.body.should.have.property('response')
        done()
      })
  })

  // ************SHOULD FAIL************

  it('should FAIL to GET user info with bad address', function (done) {
    chai.request(app)
      .get('/api/v1/user')
      .query({ address: badAddress })
      .end(function (err, res) {
        err.response.should.have.status(422)
        res.should.have.status(422)
        done()
      })
  })

  it('should FAIL to GET user info with no address', function (done) {
    chai.request(app)
      .get('/api/v1/user')
      .end(function (err, res) {
        err.response.should.have.status(422)
        res.should.have.status(422)
        done()
      })
  })

  it('should FAIL to GET house rep info with bad state', function (done) {
    chai.request(app)
      .get('/api/v1/representatives/house')
      .query({ state: badState, district })
      .end(function (err, res) {
        err.response.should.have.status(404)
        res.should.have.status(404)
        res.body.should.be.a('object')
        res.body.should.have.property('error')
        done()
      })
  })

  it('should FAIL to GET house rep info with no state', function (done) {
    chai.request(app)
      .get('/api/v1/representatives/house')
      .query({ district })
      .end(function (err, res) {
        err.response.should.have.status(400)
        res.should.have.status(400)
        res.body.should.be.a('object')
        res.body.should.have.property('error')
        done()
      })
  })

  it('should FAIL to GET house rep info with bad district', function (done) {
    chai.request(app)
      .get('/api/v1/representatives/house')
      .query({ state, district: badDistrict })
      .end(function (err, res) {
        err.response.should.have.status(404)
        res.should.have.status(404)
        res.body.should.be.a('object')
        res.body.should.have.property('error')
        done()
      })
  })

  it('should FAIL to GET house rep info with no district', function (done) {
    chai.request(app)
      .get('/api/v1/representatives/house')
      .query({ state })
      .end(function (err, res) {
        err.response.should.have.status(400)
        res.should.have.status(400)
        res.body.should.be.a('object')
        res.body.should.have.property('error')
        done()
      })
  })

  it('should FAIL to GET senate reps info with bad state', function (done) {
    chai.request(app)
      .get('/api/v1/representatives/senate')
      .query({ state: badState })
      .end(function (err, res) {
        err.response.should.have.status(404)
        res.should.have.status(404)
        res.body.should.be.a('object')
        res.body.should.have.property('error')
        done()
      })
  })

  it('should FAIL to GET senate reps info with no state', function (done) {
    chai.request(app)
      .get('/api/v1/representatives/senate')
      .end(function (err, res) {
        err.response.should.have.status(400)
        res.should.have.status(400)
        res.body.should.be.a('object')
        res.body.should.have.property('error')
        done()
      })
  })

  it('should FAIL to GET detailed rep info with bad ID', function (done) {
    chai.request(app)
      .get(`/api/v1/representatives/${badRepId}`)
      .end(function (err, res) {
        err.response.should.have.status(404)
        res.should.have.status(404)
        res.body.should.be.a('object')
        res.body.should.have.property('error')
        done()
      })
  })

  it('should FAIL to GET news articles with no name to search', function (done) {
    chai.request(app)
      .get('/api/v1/representatives/nyt/articles')
      .end(function (err, res) {
        err.response.should.have.status(400)
        res.should.have.status(400)
        res.body.should.be.a('object')
        res.body.should.have.property('error')
        done()
      })
  })
})
