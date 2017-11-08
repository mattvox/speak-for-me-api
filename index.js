require('dotenv').config({ path: './config/.env' })

const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors')

const app = express()

app.use(cors())
app.use(bodyParser.json())

require('./routes/api-routes')(app)

const PORT = process.env.PORT || 5000

app.listen(PORT, () => (
  // eslint-disable-next-line no-console
  console.log(`Listening on localhost:${PORT} \n`)
))

// for testing
module.exports = app
