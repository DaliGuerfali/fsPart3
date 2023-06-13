const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const Person = require('./models/person');

const app = express();


app.use(express.static('build'));
app.use(cors());
app.use(express.json());

app.use(morgan(function (tokens, req, res) {
  let log = [
    tokens.method(req, res),
    tokens.url(req, res),
    tokens.status(req, res),
    tokens.res(req, res, 'content-length'), '-',
    tokens['response-time'](req, res), 'ms'
  ].join(' ');
  if(tokens.method(req,res) === 'POST') {
    log = `${log} ${JSON.stringify(req.body)}`;
  }
  return log;
}));

app.get('/api/persons', (request, response, next) => {
  Person.find({}).then(res => {
    response.json(res);
  })
  .catch(err => next(err));
});


app.get('/api/persons/:id', (request, response, next) => {
    const id = request.params.id;
    Person.findById(id).then(res => {
      if(res) {
        response.json(res);
      } else {
        next();
      }

    })
    .catch(err => next(err));
});


app.get('/api/info', (request, response, next) => {
    Person.find({}).then(res => {
      response.send(`
      <p>Phonebook has info for ${res.length} people</p>
      <p>${new Date()}</p>
      `);
    })
    .catch(err => next(err));
});


app.delete('/api/persons/:id', (request, response, next) => {
    const id = request.params.id;

    Person.findByIdAndRemove(id).then(res => {
      response.status(204).end();
    })
    .catch(err => next(err));
});


app.post('/api/persons', (request, response, next) => {
    const body = request.body;

    const person = new Person({
      name: body.name,
      number: body.number
    });

    person.save().then(res => {
      response.json(res);
    })
    .catch(err => next(err));
});


app.put('/api/persons/:id',(request,response, next) => {
  const id = request.params.id;

  const { name, number } = request.body;
  
  Person.findByIdAndUpdate(id, {name, number}, { new: true, runValidators: true, context: 'query' })
  .then(res => {
    response.json(res);
  })
  .catch(err => next(err));
});

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: 'unknown endpoint' });
}

app.use(unknownEndpoint);

const errorHandler = (error, request, response, next) => {
  console.error(error.message);

  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'malformatted id' });
  } else if (error.name === 'ValidationError') {
    return response.status(400).json({ error: error.message });
  }

  next(error);
}

app.use(errorHandler);


const PORT = process.env.PORT || 3001;
app.listen(PORT);
console.log(`Server running on port ${PORT}`);