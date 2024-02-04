
const express = require("express")
const morgan = require("morgan")
const cors =require("cors")
const app= express()
app.use(cors())
app.use(express.static('dist'))
morgan.token('body', (req)=>{
    return `${JSON.stringify(req.body)}`
})

app.use(express.json())

app.use((req, res, next)=> {
    if(req.method==='POST'){
        morgan(":method :url HTTP/:http-version :status :res[content-length] :response-time ms :body ")(req, res, next)
    }
    next();
})

let contacts=[
    { 
      "id": 1,
      "name": "Arto Hellas", 
      "number": "040-123456"
    },
    { 
      "id": 2,
      "name": "Ada Lovelace", 
      "number": "39-44-5323523"
    },
    { 
      "id": 3,
      "name": "Dan Abramov", 
      "number": "12-43-234345"
    },
    { 
      "id": 4,
      "name": "Mary Poppendieck", 
      "number": "39-23-6423122"
    },
    {
        "id":642,
        "name": "Torshabla",
        "number": "642642642"
    }
]

app.get('/api/persons', (req, res)=>{
    res.send(contacts)
})
app.get('/info', (req, res) => {
    res.send(`
    <p>This phonebook has info for ${contacts.length} people</p>
    <p>${Date()}</p>
    `)
})

app.get('/api/persons/:id', (req, res)=>{
    const id= Number(req.params.id)
    const body=contacts.find((contact)=> contact.id===id)
    body?res.send(body): res.status(404).send({})
})

app.delete('/api/persons/:id', (req,res) => {
    const id= Number(req.params.id)
    const body=contacts.find((contact)=> contact.id===id)
    if(body){
        contacts=contacts.filter(contact => contact.id!==body.id)
        return res.send(body)
    }
    return res.status(404).send({"error":"Person with provided id is not found"})

})

app.post('/api/persons', (req, res)=>{
    if(req.body.name){
        return contacts.find(contact=> contact.name.toLowerCase()===req.body.name.toLowerCase())? 
        (res.status(400).send({error:"Name must be unique"})): 
        (contacts=contacts.concat({
            id: Math.round(Math.random()*1000000),
            name: req.body.name,
            number: req.body.number?req.body.number:""})) && res.send("Record added successfully")
    }
    res.status(400).send({error: "Unable to get name attribute"})
})

const PORT= process.env.PORT || 3000 
app.listen(PORT, ()=> console.log(`Server port running on ${PORT}`))