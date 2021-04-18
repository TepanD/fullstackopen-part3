const express = require("express");
const morgan = require("morgan");
const cors = require("cors");
const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static("build"));

morgan.token("body", function (req, res) {
  if (req.method === "POST") {
    return JSON.stringify(req.body);
  }
  return null;
});

app.use(
  morgan(":method :url :status :res[content-length] - :response-time ms :body")
);

let persons = [
  {
    id: 1,
    name: "Arto Hellas",
    number: "040-123456",
  },
  {
    id: 2,
    name: "Ada Lovelace",
    number: "39-44-5323523",
  },
  {
    id: 3,
    name: "Dan Abramov",
    number: "12-43-234345",
  },
  {
    id: 4,
    name: "Mary Poppendick",
    number: "39-23- 6423122",
  },
];

app.get("/api/persons", (request, response) => {
  response.json(persons);
});

app.get("/api/persons/:id", (request, response) => {
  const id = Number(request.params.id);
  const person = persons.find((person) => person.id === id);

  if (person) {
    response.json(person);
  } else {
    response.status(404).end();
  }
});

const generateId = () => {
  const id = Math.random() * (100 - persons.length) + persons.length;
  return Math.floor(id);
};

app.post("/api/persons", (request, response) => {
  const body = request.body;
  const duplicateName = persons.some((person) => person.name === body.name);

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

  if (duplicateName) {
    return response.status(404).json({
      error: "name must be unique",
    });
  }

  const newPersonId = generateId();

  const person = {
    id: newPersonId,
    name: body.name,
    number: body.number,
  };

  persons = persons.concat(person);

  //console.log(JSON.stringify({ name: person.name, number: person.number }));
  response.json(person);
});

app.delete("/api/persons/:id", (request, response) => {
  const id = Number(request.params.id);
  persons = persons.filter((person) => person.id !== id);
  response.status(204).end();
});

app.get("/api/info", (requests, response) => {
  const date = new Date();

  response.send(`
    <div>Phonebook has info for ${persons.length} people</div>
    <br/>
    <div>${date}</div>
  `);
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
