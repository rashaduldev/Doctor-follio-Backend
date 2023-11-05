const express = require('express')
const cors = require('cors')
const cookiePerser = require('cookie-parser')
const jwt = require('jsonwebtoken');
const app = express()
require('dotenv').config()
const port =process.env.PORT || 3000

// middleware
app.use(cors({
  origin:['http://localhost:5173'],
  credentials:true
}));
app.use(express.json());
app.use(cookiePerser());


// console.log(process.env.DB_pass);
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_user}:${process.env.DB_pass}@cluster0.ioitfil.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();

    // Auth related API
    app.post('/jwt', async(req,res)=>{
      const user=req.body;
      console.log(user);
      const token=jwt.sign(user,process.env.Access_token_secret,{expiresIn:'1h'})
      res
      .cookie('token',token , {
        httpOnly:true,
        secure:false,
      })
      .send({success:true})
    })

    const serviceCollection=client.db('carDoctor').collection('service');
    const bookingCollection=client.db('carDoctor').collection('booking');

    app.get('/service', async(req, res) => {
      const cursor=serviceCollection.find();
      const result=await cursor.toArray();
      res.send(result);
    })

    app.get('/service/:id', async(req, res) => {
      const id=req.params.id;
      const query={_id:new ObjectId(id)};
      const options = {
        projection: { title: 1, service_id: 1,price: 1,img:1 },
      };

      const result=await serviceCollection.findOne(query,options);
      res.send(result);
    })

    // Bookings collection
    app.post('/bookings' ,async(req,res)=>{
      const booking=req.body;
      console.log(booking)
      const result=await bookingCollection.insertOne(booking);
      res.send(result);
    });

    app.get('/bookings',async(req,res)=>{
      let quary={};
      console.log('token',req.cookies.token);
      if (req.query.email) {
          quary={email:req.query.email}
      }
      const result=await bookingCollection. find(). toArray();
      res.send(result)
    })

    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // await client.close();
  }
}
run().catch(console.dir);


app.get('/', (req, res) => {
  res.send(`Server is running  ${port}`)
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})