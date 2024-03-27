const mongoose= require('mongoose')
require('dotenv').config()

mongoose.set('strictQuery', false)
async function connectToDB() {
    try{
        await mongoose.connect(process.env.MONGOD_URI)
        console.log('Connected to Cloud Atlas DB')
    }
    catch(err) {
        console.log('Failed to connect')
    }}
connectToDB()
const contactSchema = mongoose.Schema({
    name: {
        type: String,
        required: true,
        minLength: 3,
        unique: true
    },
    number: {
        type:String,
        validate : {
            validator: (v) => {
                return /^\d{3}-\d{4}$/.test(v)
            },
            message: 'Number\'s format is invalid'
        }
    }
})
contactSchema.set('toJSON', {
    transform : (document, returnObject) => {
        returnObject.id= returnObject._id
        delete returnObject._id
        delete returnObject.__v
    }
})

module.exports= mongoose.model('Contact', contactSchema)