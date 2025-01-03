const mongoose = require('mongoose')

const uri = process.env.MONGODB_URI
const clientOptions = { serverApi: { version: '1', strict: true, deprecationErrors: true } }

async function connectDB() {
  try {
    mongoose.set('strictQuery', false)
    // Create a Mongoose client with a MongoClientOptions object to set the Stable API version
    await mongoose.connect(uri, clientOptions)
    console.log('Connected to MongoDB!')
  } catch (error) {
    console.log('error connecting to MongoDB:', error.message)
  }
}

const personSchema = new mongoose.Schema({
  name: {
    type: String,
    minLength: 3,
    required: true
  },
  number: {
    type: String,
    minLength: 9,
    validate: {
      validator: function(v) {
        return /^[0-9]{2,3}-[0-9]+$/.test(v)
      },
      message: props => `${props.value} is not a valid phone number!`
    },
    required: [true, 'User phone number required']
  },
})

personSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString()
    delete returnedObject._id
    delete returnedObject.__v
  }
})

const Person = mongoose.model('Person', personSchema)

connectDB()

module.exports = Person