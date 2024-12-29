const mongoose = require('mongoose')

if (process.argv.length < 3) {
  console.log('give password as argument')
  process.exit(1)
}

const APP_NAME = 'phoneBook'
const password = process.argv[2]

const uri = `mongodb+srv://fullstack-open:${password}@cluster0.36xopnx.mongodb.net/${APP_NAME}?retryWrites=true&w=majority`

const clientOptions = { serverApi: { version: '1', strict: true, deprecationErrors: true } }

async function savePerson(person) {
  try {
    mongoose.set('strictQuery', false)
    // Create a Mongoose client with a MongoClientOptions object to set the Stable API version
    await mongoose.connect(uri, clientOptions)
    await person.save()
    console.log('Person saved!')
  } finally {
    await mongoose.disconnect()
  }
}

async function getAllPerson(Person) {
  try {
    mongoose.set('strictQuery', false)
    // Create a Mongoose client with a MongoClientOptions object to set the Stable API version
    await mongoose.connect(uri, clientOptions)

    const result = await Person.find({})
    console.log('phonebook:')

    result.forEach(person => console.log(person.name, person.number))
  } finally {
    await mongoose.disconnect()
  }
}

const personSchema = new mongoose.Schema({
  name: String,
  number: String,
})

const Person = mongoose.model('Person', personSchema)

if (process.argv.length === 3) {
  getAllPerson(Person).catch(console.dir)

} else if (process.argv.length === 5) {
  const newPerson = new Person({
    name: process.argv[3],
    number: process.argv[4]
  })

  savePerson(newPerson).catch(console.dir)
}
