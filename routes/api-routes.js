const {
  fetchUserData,
  fetchHouseData,
  fetchSenateData,
  fetchRepData,
  fetchTimesData,
} = require('./helpers/third-party-api-calls')

// URL prefixes and endpoints
const API_PREFIX = '/api/v1'
const USER_ENDPOINT = `${API_PREFIX}/user`
const REP_ENDPOINT = `${API_PREFIX}/representatives`

module.exports = (app) => {
  app.get(USER_ENDPOINT, async (req, res, next) => {
    try {
      const { state, address, district } = await fetchUserData(req.query.address)

      res.send({ state, address, district })
    } catch (err) {
      next(err)
    }
  })

  app.get(`${REP_ENDPOINT}/house`, async (req, res, next) => {
    try {
      const { state, district } = req.query

      if (!state || !district) {
        const err = new Error()
        err.status = 400
        err.error = 'A valid state and district is required'
        next(err)
      }

      const response = await fetchHouseData(state, district)

      if (response.status !== 'OK') {
        const err = new Error()
        err.status = 404
        err.error = response.errors[0].error || 'Not Found'
        next(err)
      } else {
        res.send(response.results[0])
      }
    } catch (err) {
      next(err)
    }
  })

  app.get(`${REP_ENDPOINT}/senate`, async (req, res, next) => {
    try {
      if (!req.query.state) {
        const err = new Error()
        err.status = 400
        err.error = 'A valid state is required'
        next(err)
      }

      const response = await fetchSenateData(req.query.state)

      if (response.status !== 'OK') {
        const err = new Error()
        err.status = 404
        err.error = response.errors[0].error || 'Not Found'
        next(err)
      } else {
        res.send(response.results)
      }
    } catch (err) {
      next(err)
    }
  })

  app.get(`${REP_ENDPOINT}/:id`, async (req, res, next) => {
    try {
      if (!req.params.id) {
        const err = new Error()
        err.status = 400
        err.error = 'A valid representative ID is required'
        next(err)
      }

      const response = await fetchRepData(req.params.id)

      if (response.status !== 'OK') {
        const err = new Error()
        err.status = 404
        err.error = response.errors[0].error || 'Not Found'
        next(err)
      } else {
        res.send(response.results[0])
      }
    } catch (err) {
      next(err)
    }
  })

  app.get(`${REP_ENDPOINT}/nyt/articles`, async (req, res, next) => {
    try {
      if (!req.query.name) {
        const err = new Error()
        err.status = 400
        err.error = 'A valid, searchable name is required'
        next(err)
      }

      const response = await fetchTimesData(req.query.name)

      res.send(response)
    } catch (err) {
      next(err)
    }
  })
}
