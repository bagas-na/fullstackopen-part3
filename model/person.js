const mongoose = require('mongoose')

const uri = process.env.MONGODB_URI
const clientOptions = { serverApi: { version: '1', strict: true, deprecationErrors: true } };

async function connectDB() {
  try {
    mongoose.set('strictQuery', false)
    // Create a Mongoose client with a MongoClientOptions object to set the Stable API version
    await mongoose.connect(uri);
    console.log("Connected to MongoDB!");
  } catch (error) {
    console.log('error connecting to MongoDB:', error.message)
  }
}

// async function savePerson(person) {
//   try {
//     await person.save()
//     console.log("Person saved!")
//   } catch (error) {
//     console.log('error saving person to MongoDB:', error.message)
//   }
// }

// async function getAllPerson(Person) {
//   try {
//     const result = await Person.find({});
//     console.log("phonebook:");

//     result.forEach(person => console.log(person.name, person.number));
//   } catch (error) {
//     console.log('error fetching person from MongoDB:', error.message)
//   }
// }

const personSchema = new mongoose.Schema({
  name: String,
  number: String,
})

personSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString();
    delete returnedObject._id;
    delete returnedObject.__v;
  }
})

const Person = mongoose.model('Person', personSchema)

connectDB();

module.exports = Person