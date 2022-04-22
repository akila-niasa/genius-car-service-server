const express = require('express')
const cors = require('cors')
require('dotenv').config()

const app = express()

const port = process.env.PORT || 5000

// middleware
app.use(cors())
app.use(express.json())


const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.xmrlv.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });
// client.connect(err => {
//   const collection = client.db("test").collection("devices");
//   // perform actions on the collection object
//   client.close();
// });
async function run() {
    try {
        await client.connect()
        const serviceCollection = client.db("geniusCar").collection("services");

        app.get('/service', async (req, res) => {
            const query = {}
            const cursor = serviceCollection.find(query)
            const result = await cursor.toArray()
            res.send(result)
        })

        app.get('/service/:id',async(req,res)=>{
            const id=req.params.id
            const query={_id:ObjectId(id)}
            const result=await serviceCollection.findOne(query)
            res.send(result)
        })

       app.post('/service',async(req,res)=>{
           const newUser=req.body
           const result=await serviceCollection.insertOne(newUser)
           res.send(result)
       })

       app.delete('/service/:id',async(req,res)=>{
        const id=req.params.id
        const query={_id:ObjectId(id)}
        const result=await serviceCollection.deleteOne(query)
        res.send(result)
       })
    }
    finally {

    }
}
run().catch(console.dir)

app.get('/', (req, res) => {
    res.send('running code')
})

app.listen(port, () => {
    console.log('CRUD is running');
})