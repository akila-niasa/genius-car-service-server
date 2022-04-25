const express = require('express')
const cors = require('cors')
require('dotenv').config()
var jwt = require('jsonwebtoken');

const app = express()

const port = process.env.PORT || 5000

// middleware
app.use(cors())
app.use(express.json())

function verifyJWT(req,res,next){
    const authHeader=req.headers.authorization
    console.log(authHeader);
    if (!authHeader) {
        return res.status(401).send({ message: 'unauthorized access' });
    }
    const token=authHeader.split(' ')[1]
    jwt.verify(token,process.env.ACCESS_TOKEN_SECRET,(err,decoded)=>{
        if(err){
            return res.status(403).send({ message: 'Forbidden access' });
        }
        console.log('decoded', decoded);
        req.decoded=decoded
    })
    // console.log(authHeader);
    next()
}

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

        const orderCollection=client.db('geniusCar').collection('order')


        // Auth
        app.post('/login',async(req,res)=>{
            const user=req.body
            // console.log(user);
            const token=jwt.sign(user,process.env.ACCESS_TOKEN_SECRET,{expiresIn:'1d'})
            console.log(token);
            res.send(token)
        })


        // SERVICES API
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

    //    Order Collection Api

    app.get('/order', verifyJWT,async(req,res)=>{
    //    const authHeader=req.headers.authorization
    //    console.log(authHeader);
    const decodedEmail=req.decoded.email
        const email=req.query.email
        if(email===decodedEmail){
            const query = {email: email}
        const cursor = orderCollection.find(query)
        // console.log(cursor);
        const result = await cursor.toArray()
        // console.log(result);
        res.send(result)
        }
        else{
            res.status(403).send({message: 'forbidden access'})
        }
    })

       app.post('/order',async(req,res)=>{
        const order=req.body
        const result=await orderCollection.insertOne(order)
        
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