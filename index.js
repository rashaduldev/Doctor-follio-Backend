const express = require('express')
const cors = require('cors')
const app = express()
require('dotenv').config()
const port =process.env.PORT || 3000

// middleware
app.use(cors());
app.use(express.json());

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
    // await client.connect();

    const serviceCollection=client.db('carDoctor').collection('service');

    app.get('/service', async(req, res) => {
      const cursor=serviceCollection.find();
      const result=await cursor.toArray();
      res.send(result);
    })

    app.get('/service/:id', async(req, res) => {
      const id=req.params.id;
      const query={_id:new ObjectId(id)};
      const options = {
        // Include only the `title` and `imdb` fields in the returned document
        projection: { title: 1, service_id: 1,price: 1 },
      };

      const result=await serviceCollection.findOne(query,options);
      res.send(result);
    })


    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
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