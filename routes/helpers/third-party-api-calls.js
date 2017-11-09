const axios = require('axios')

// Third-party API urls
const GEOCODE_URL = 'https://api.geocod.io/v1/geocode'
const PROPUBLICA_URL = 'https://api.propublica.org/congress/v1/members'
const NYT_URL = 'https://api.nytimes.com/svc/search/v2/articlesearch.json'

// validates returned status code
const instance = axios.create({
  validateStatus: status => status === 200,
})

// fetches state, formatted address, and congressional district
// from Geocodio API
const fetchUserData = _address => (
  instance.get(GEOCODE_URL, {
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
  instance.get(`${PROPUBLICA_URL}/senate/${_state}/current.json`, {
    headers: {
      'x-api-key': process.env.PROPUBLICA_KEY,
    },
  }).then(response => response.data)
)

// fetches house representative info based on user's state and district
const fetchHouseData = (_state, _district) => (
  instance.get(`${PROPUBLICA_URL}/house/${_state}/${_district}/current.json`, {
    headers: {
      'x-api-key': process.env.PROPUBLICA_KEY,
    },
  }).then(response => response.data)
)

// fetches more detailed representative data
const fetchRepData = id => (
  instance.get(`${PROPUBLICA_URL}/${id}.json`, {
    headers: {
      'x-api-key': process.env.PROPUBLICA_KEY,
    },
  }).then(response => response.data)
)

// fetches recent New York Times articles for representative
const fetchTimesData = name => (
  instance.get(NYT_URL, {
    params: { 'api-key': process.env.NYT_KEY, q: name },
  }).then(response => response.data)
    .catch(err => ({ error: err.message }))
)

module.exports = {
  fetchUserData,
  fetchSenateData,
  fetchHouseData,
  fetchRepData,
  fetchTimesData,
}
