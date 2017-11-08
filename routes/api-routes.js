const axios = require('axios')

const GEOCODE_URL = 'https://api.geocod.io/v1/geocode'
const PROPUBLICA_URL = 'https://api.propublica.org/congress/v1/members'
const NYT_URL = 'https://api.nytimes.com/svc/search/v2/articlesearch.json'

// fetches state, formatted address, and congressional district
// from Geocodio API
const fetchUserData = _address => (
  axios.get(GEOCODE_URL, {
    params: {
      q: _address,
      fields: 'cd115',
      api_key: process.env.GEOCODIO_KEY,
    },
  })
    .then((response) => {
      const {
        address_components: { state },
        formatted_address: address,
        fields: { congressional_district: { district_number: district } },
      } = response.data.results[0]

      return { state, address, district }
    })
)

// fetches senate representatives info based on user's state
const fetchSenateData = _state => (
  axios.get(`${PROPUBLICA_URL}/senate/${_state}/current.json`, {
    headers: {
      'x-api-key': process.env.PROPUBLICA_KEY,
    },
  }).then(response => response.data.results)
)

// fetches house representative info based on user's state and district
const fetchHouseData = (_state, _district) => (
  axios.get(`${PROPUBLICA_URL}/house/${_state}/${_district}/current.json`, {
    headers: {
      'x-api-key': process.env.PROPUBLICA_KEY,
    },
  }).then(response => response.data.results)
)

// fetches more detailed representative data
const fetchRepData = id => (
  axios.get(`${PROPUBLICA_URL}/${id}.json`, {
    headers: {
      'x-api-key': process.env.PROPUBLICA_KEY,
    },
  }).then((response) => {
    const { status, error, errors } = response.data

    return status !== 'OK'
      ? errors || error
      : response.data.results[0]
  })
)

// fetches recent New York Times articles for representative
const fetchTimesData = name => (
  axios.get(NYT_URL, {
    params: { 'api-key': process.env.NYT_KEY, q: name },
  }).then(response => response.data)
    .catch(err => ({ error: err.message }))
)

// API routes
module.exports = (app) => {
  app.get('/api/v1/user', async (req, res) => {
    try {
      const { state, address, district } = await fetchUserData(req.query.address)

      res.send({ state, address, district })
    } catch (err) {
      res.status(err.response.status).send(err.message)
    }
  })

  app.get('/api/v1/representatives/house', async (req, res) => {
    const { state, district } = req.query

    try {
      const response = await fetchHouseData(state, district)
      res.send(response)
    } catch (err) {
      res.status(err.response.status).send(err.message)
    }
  })

  app.get('/api/v1/representatives/senate', async (req, res) => {
    try {
      const response = await fetchSenateData(req.query.state)
      res.send(response)
    } catch (err) {
      res.status(err.response.status).send(err.message)
    }
  })

  app.get('/api/v1/representatives/:id', async (req, res) => {
    try {
      const response = await fetchRepData(req.params.id)
      res.send(response)
    } catch (err) {
      res.status(err.response.status).send(err.message)
    }
  })

  app.get('/api/v1/representatives/nyt/articles', async (req, res) => {
    try {
      const response = await fetchTimesData(req.query.name)
      res.send(response)
    } catch (err) {
      res.status(err.response.status).send(err.message)
    }
  })
}
