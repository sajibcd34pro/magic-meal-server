const express = require('express');
const app = express();
const { MongoClient } = require('mongodb');
const ObjectId = require('mongodb').ObjectId;
const cors = require('cors');
//dotenv
require('dotenv').config();
const port = process.env.PORT || 5000;

//middleware
app.use(cors());
app.use(express.json());


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.xhckh.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
// console.log(uri);

async function run() {
    try {
        await client.connect()
        const database = client.db('magic_meals');
        const foodCollection = database.collection('meal');
        const dashboard = database.collection('cart');
        
        // console.log('connection stablished');


        // load cart data according to user id get api
        app.get("/cart/:uid", async (req, res) => {
            const uid = req.params.uid;
            const query = { uid: uid };
            const result = await dashboard.find(query).toArray();
            res.json(result);
        });
        
        
        // add data to cart collection with additional info
        app.post("/service/add", async (req, res) => {
            const course = req.body;
            const result = await dashboard.insertOne(course);
            res.json(result);
        });


        // delete data from cart delete api
        app.delete("/delete/:id", async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await dashboard.deleteOne(query);
            res.json(result);
        });

        // order delete api
        app.delete("/orders/:uid", async (req, res) => {
            const uid = req.params.uid;
            const query = { uid: uid };
            const result = await dashboard.deleteMany(query);
            res.json(result);
        });

//...........................

        //get single products api
        app.get('/products/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const product = await foodCollection.findOne(query);
            res.json(product);
        })
              
        //get api
        app.get('/products', async (req, res) => {
            const cursor = foodCollection.find({})
            const count = await cursor.count();
            const products = await cursor.toArray([]);
            res.send(products);
        })
              

        //post api
        app.post('/products', async(req, res) => {
            const products = req.body;
            console.log('hit the post api with', products);
            const result = await foodCollection.insertOne(products);
            console.log(result);

            res.json(result);
    });
    }

    finally {
        // await client.close();
    }

}
run().catch(console.dir);

app.get('/', (req, res) => {
    res.send('meals magic server is running')
});

app.listen(port, () => {
    console.log('server running on port ', port)
})