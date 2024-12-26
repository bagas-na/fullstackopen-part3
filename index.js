const express = require('express')
const app = express()

let persons = [
  {
    "id": "1",
    "name": "Arto Hellas",
    "number": "040-123456"
  },
  {
    "id": "2",
    "name": "Ada Lovelace",
    "number": "39-44-5323523"
  },
  {
    "id": "3",
    "name": "Dan Abramov",
    "number": "12-43-234345"
  },
  {
    "id": "4",
    "name": "Mary Poppendieck",
    "number": "39-23-6423122"
  }
]

app.use(express.json())

app.get('/', (request, response) => {
  response.send('<h1>Hello World!</h1>')
})

app.get('/api/persons', (request, response) => {
  response.json(persons)
})

app.get('/api/persons/:id', (req, res) => {
  const id = req.params.id
  const matchedPerson = persons.find(person => person.id === id)

  if (!matchedPerson) {
    res.status(404).send({ error: `person with id:${id} is not found` })
  }

  res.json(matchedPerson);
})

app.post('/api/persons', (req, res) => {
  const id = Math.floor(1000000 * Math.random());
  const contentType = req.get('Content-type')

  if (contentType !== 'application/json') {
    res.status(415).send({
      error: 'Unsupported Media Type',
      message: `Expected Content-Type: application/json, but received ${contentType}`
    })
    return
  }

  const person = req.body
  if (person.name === undefined || person.number === undefined) {
    res.status(400).send({
      message: `Expected json to contain entries of {name: ..., number: ...}`
    })
    return
  }

  persons = persons.concat({...person, id})

  res.json({...person, id})
})

app.delete('/api/persons/:id', (req, res) => {
  const id = req.params.id
  const matchedPerson = persons.find(person => person.id === id)
  if (!matchedPerson) {
    res.status(404).send({ error: `person with id:${id} is not found` })
  }

  persons = persons.filter(person => person.id !== matchedPerson.id);

  res.json(matchedPerson);
})

app.get('/info', (req, res) => {
  let message = `<p>Phonebook has info for ${persons.length} ${persons.length === 1 ? 'person' : 'people'}</p>\n`;
  message += `<p>${Date(Date.now()).toString()}</p>`
  res.send(message)
})


const PORT = 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})