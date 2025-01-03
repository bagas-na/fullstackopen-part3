require('dotenv').config()
const express = require('express')
const morgan = require('morgan')
const cors = require('cors')
const app = express()
const Person = require('./model/person')

// Configuration for CORS
const corsOptions = {
  origin: '*',
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  preflightContinue: false,
  optionsSuccessStatus: 204
}

// Configuration for Logs
morgan.token('tiny-post-body', function (tokens, req, res) {
  return [
    tokens.method(req, res),
    tokens.url(req, res),
    tokens.status(req, res),
    tokens.res(req, res, 'content-length'), '-',
    tokens['response-time'](req, res), 'ms',
    req.method === 'POST' ? JSON.stringify(req.body) : '',
  ].join(' ')
})

app.use(express.static('dist'))
app.use(express.json())
app.use(morgan('tiny-post-body'))
app.options('*', cors(corsOptions))

app.get('/api/persons', cors(corsOptions), async (req, res, next) => {
  try {
    const persons = await Person.find({})
    res.json(persons)
  } catch (error) {
    console.log('error fetching persons from database:')
    next(error)
  }
})

app.get('/api/persons/:id', cors(corsOptions), async (req, res, next) => {
  try {
    const matchedPerson = await Person.findById(req.params.id)
    if (!matchedPerson) {
      res.status(404).send({ error: `person with id:${req.params.id} is not found` })
    }
    res.json(matchedPerson)
  } catch (error) {
    console.log('error fetching person from database:')
    next(error)
  }
})

app.post('/api/persons', cors(corsOptions), async (req, res, next) => {
  const contentType = req.get('Content-type')

  if (contentType !== 'application/json') {
    res.status(415).send({
      error: 'Unsupported Media Type',
      message: `Expected Content-Type: application/json, but received ${contentType}`
    })
    return
  }

  const newPerson = req.body
  if (newPerson?.name === undefined || newPerson?.number === undefined) {
    res.status(400).send({
      error: 'Unexpected json format',
      message: 'json must contain entries {name: ..., number: ...}'
    })
    return
  }

  const person = new Person({
    name: newPerson.name,
    number: newPerson.number
  })

  try {
    const savedPerson = await person.save({ validateBeforeSave: true })
    res.json(savedPerson)
  } catch (error) {
    console.log('error saving person to database:')
    next(error)
  }

})

app.delete('/api/persons/:id', cors(corsOptions), async (req, res, next) => {
  try {
    const result = await Person.findByIdAndDelete(req.params.id)
    res.json(result)
  } catch (error) {
    console.log('error deleting person')
    next(error)
  }
})

app.put('/api/persons/:id', cors(corsOptions), async (req, res, next) => {
  const contentType = req.get('Content-type')

  if (contentType !== 'application/json') {
    res.status(415).send({
      error: 'Unsupported Media Type',
      message: `Expected Content-Type: application/json, but received ${contentType}`
    })
    return
  }

  const newPerson = req.body
  if (newPerson?.name === undefined || newPerson?.number === undefined) {
    res.status(400).send({
      error: 'Unexpected json format',
      message: 'json must contain entries {name: ..., number: ...}'
    })
    return
  }

  const person = {
    name: newPerson.name,
    number: newPerson.number
  }

  try {
    const result = await Person.findByIdAndUpdate(req.params.id, person, { new: true, runValidators: true, context: 'query' })
    res.json(result)
  } catch (error) {
    console.log('error updating person to database')
    next(error)
  }
})

app.get('/info', async (req, res, next) => {
  try {
    const persons = await Person.find({})
    let message = `<p>Phonebook has info for ${persons.length} ${persons.length === 1 ? 'person' : 'people'}</p>\n`
    message += `<p>${Date(Date.now()).toString()}</p>`
    res.send(message)
  } catch (error) {
    console.log('error fetching persons from database:')
    next(error)
  }
})

// Unknown endpoints handler
app.use((request, response) => {
  response.status(404).send({ error: 'unknown endpoint' })
})

// Error handler
app.use((error, req, res, next) => {
  console.error(error.name)

  if (error.name === 'CastError') {
    return res.status(400).send({ error: 'malformatted id' })
  } else if (error.name === 'ValidationError') {
    return res.status(400).json({ error: error.message })
  }

  next(error)
})

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})