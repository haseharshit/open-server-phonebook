const express = require('express')
const morgan = require('morgan')
const cors =require('cors')
const app= express()
const Contact = require('./mongo')
app.use(cors())
app.use(express.static('dist'))
morgan.token('body', (req) => {
    return `${JSON.stringify(req.body)}`
})

app.use(express.json())

app.use((req, res, next) => {
    if(req.method==='POST' && res.status>300){
        morgan(':method :url HTTP/:http-version :status :res[content-length] :response-time ms :body ')(req, res, next)
    }

    next()
})


app.get('/api/persons', (req, res, next) => {
    Contact.find({}).then(contacts => {
        console.log(contacts)
        res.send(contacts)
    }).catch(err => {
        next(err)
    })
})
app.get('/info',async (req, res, next) => {
    Contact.find({}).then(result => {
        res.send(`
        <p>This phonebook has info for ${result.length} people</p>
        <p>${Date()}</p>
        `)
    })
        .catch(err => next(err))


})

app.get('/api/persons/:id', (req, res, next) => {
    const id= (req.params.id)
    Contact.findById(id).then(contact => {
        contact?res.send(contact): res.status(404).send({})
    }).catch(err => next(err))
})



app.delete('/api/persons/:id',(req,res, next) => {
    const id= (req.params.id)
    console.log(id)
    Contact.findByIdAndDelete(id).then(result => {
        result?res.send(result):res.status(400).send({ 'error': 'No record with provided id' })
        return
    })
        .catch(err => {
            next(err)
        // res.status(502).send({"error": `${err}`})
        })


})

const handleInsert = async (req, res, next) => {

    const { name, number } = req.body
    // if(!name){
    //     next("Name attribute not found")
    //     // res.status(400).send({"error": "Name field is required"})
    //     return
    // }
    try{
    // const existingUser = await Contact.find({name: name})
    // if(existingUser.length){
    //     next({'error':'Name Shuld be unique'})
    //     return
    // }
        const newContact= new Contact({
            name: name,
            number: number
        })
        const result= await newContact.save()
        console.log(result)
        res.status(201).send(result)
        return
    }
    catch(err){
        next(err)
        // res.status(502).send({"error": `${err}`})
    }



}

app.post('/api/persons', handleInsert
)

app.put('/api/persons/:id', (req, res, next) => {
    Contact.findOneAndUpdate({ name: req.body.name }, { number: req.body.number }, { new: true, runValidators:true, context:'query' }).then(result => {
        console.log(result)
        res.send(result)
    })
        .catch(err => next(err))
})


const unknownPoint =(req, res) => {
    res.status(404).send({ 'error': 'Unkown endpoint' })
}

app.use(unknownPoint)

const errorHandler = (error, req, res, next) => {
    console.log(error.name)
    if( ['ValidationError','CastError', 'MongooseError', 'MongoServerError' ].includes(error.name)){
        res.status(400).send({ 'error': `${error.message}` })
        return
    }
    res.status(400).send(error)
    next()
}

app.use(errorHandler)


const PORT= process.env.PORT || 3000
app.listen(PORT, () => console.log(`Server port running on ${PORT}`))