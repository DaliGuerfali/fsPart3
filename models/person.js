require('dotenv').config();
const mongoose = require('mongoose');

mongoose.set('strictQuery',false);

const url = process.env.MONGODB_URI;
console.log(url);

console.log('connecting to MongoDB...');

mongoose.connect(url)
    .then((res) => {
        console.log('Connection successful!');
    })
    .catch((err) => {
        console.log('Connection failed: ', err.message);
    });

const personSchema = new mongoose.Schema({
    name: {
        type:  String,
        minLength: 3,
        required: true
    },
    number: {
        type: String,
        minLength: 8,
        required: true,
        validate: {
            validator: number =>  {
              return /^\d{2,3}-\d+$/.test(number);
            },
            message: props => `${props.value} is not a valid phone number!`
          }
    },
});

personSchema.set('toJSON', {
    transform: (document, returnedObject) => {
      returnedObject.id = returnedObject._id.toString();
      delete returnedObject._id;
      delete returnedObject.__v;
    }
});

module.exports = mongoose.model('Person', personSchema);
