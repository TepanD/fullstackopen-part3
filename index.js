require("dotenv").config();
const express = require("express");
const morgan = require("morgan");
const cors = require("cors");
const Person = require("./models/person");

const app = express();

app.use(express.static("build"));
app.use(express.json());
app.use(cors());

morgan.token("body", function (req) {
  if (req.method === "POST") {
    return JSON.stringify(req.body);
  }
  return null;
});

app.use(
  morgan(":method :url :status :res[content-length] - :response-time ms :body")
);

// let people = [
//   {
//     id: 1,
//     name: "Arto Hellas",
//     number: "040-123456",
//   },
//   {
//     id: 2,
//     name: "Ada Lovelace",
//     number: "39-44-5323523",
//   },
//   {
//     id: 3,
//     name: "Dan Abramov",
//     number: "12-43-234345",
//   },
//   {
//     id: 4,
//     name: "Mary Poppendick",
//     number: "39-23- 6423122",
//   },
// ];

app.get("/api/people", (request, response) => {
  //response.json(people);
  Person.find({}).then((people) => {
    response.json(people);
  });
});

app.get("/api/people/:id", (request, response, next) => {
  Person.findById(request.params.id)
    .then((person) => {
      if (person) {
        response.json(person);
      } else {
        response.status(404).end();
      }
    })
    .catch((error) => next(error));
});

app.post("/api/people", (request, response, next) => {
  const body = request.body;
  //const duplicateName = person.some((person) => person.name === body.name);

  if (!body.name) {
    return response.status(404).json({
      error: "name is missing",
    });
  }

  if (!body.number) {
    return response.status(404).json({
      error: "number is missing",
    });
  }

  const person = new Person({
    name: body.name,
    number: body.number,
  });

  person
    .save()
    .then((savedPerson) => savedPerson.toJSON())
    .then((formattedPerson) => {
      response.json(formattedPerson);
    })
    .catch((error) => {
      response.status(409).json({ error });
      next(error);
    });
});

app.put("/api/people/:id", (request, response, next) => {
  const body = request.body;

  const person = {
    name: body.name,
    number: body.number,
  };

  Person.findByIdAndUpdate(request.params.id, person, { new: true })
    .then((updatedPerson) => {
      response.json(updatedPerson);
    })
    .catch((error) => next(error));
});

app.delete("/api/people/:id", (request, response, next) => {
  Person.findByIdAndRemove(request.params.id)
    .then(() => {
      response.status(204).end();
    })
    .catch((error) => next(error));
});

app.get("/api/info", (requests, response) => {
  const date = new Date();

  Person.find({}).then((people) => {
    response.send(`
    <div>Phonebook has info for ${people.length} people</div>
    <br/>
    <div>${date}</div>
  `);
  });
});

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: "unknown endpoint" });
};

app.use(unknownEndpoint);

const errorHandler = (error, request, response, next) => {
  if (error.name === "CastError") {
    return response.status(400).send({ error: "malformatted id" });
  }

  next(error);
};

app.use(errorHandler);

const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
