const express = require('express')
const app = express()
const port = process.env.PORT || 5000;
require('dotenv').config()

const cors = require('cors');
const ObjectId = require('mongodb').ObjectId


app.use(cors());//eta na dile cors e error dibe

app.use(express.json());
const { MongoClient } = require('mongodb');



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.b1ws8.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
console.log(uri);


async function run() {
    try {
        await client.connect();
        console.log('connected successfully');
        const database = client.db('potteryDb');
        const productsCollection = database.collection('products');
        const purchaseCollection = database.collection('purchase');
        const reviewCollection = database.collection('review');
        const userCollection = database.collection('user');


        //product---------
        app.get('/product', async (req, res) => {
            const cursor = productsCollection.find({});
            const result = await cursor.toArray();
            res.json(result);
        })


        //product find by id
        app.get('/product/:id', async (req, res) => {
            const id = req.params.id;
            console.log('getting product', id);
            const query = { _id: ObjectId(id) };
            const product = await productsCollection.findOne(query);
            res.json(product)
        })


        app.delete('/product/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await productsCollection.deleteOne(query);
            console.log('deleting order', result);
            res.json(result);
        })

        app.post('/product', async (req, res) => {

            const newProduct = req.body;
            const result = await productsCollection.insertOne(newProduct);

            console.log(req.body);
            console.log(result);
            res.json(result);
        });


        // -------------------




        //add bookings----------
        app.post('/purchase', async (req, res) => {
            const booking = req.body;
            const result = await purchaseCollection.insertOne(booking);
            console.log('booking', booking);
            res.json(result);
        })

        app.get('/purchase', async (req, res) => {
            const cursor = purchaseCollection.find({});
            const result = await cursor.toArray();
            res.json(result);
        })

        app.put('/purchase/:id', async (req, res) => {
            const id = req.params.id;

            const filter = { _id: ObjectId(id) };
            const options = { upsert: true };
            const updateDoc = {
                $set: {
                    status: `Shipped`
                },
            };
            const result = await purchaseCollection.updateOne(filter, updateDoc, options);
        })



        app.delete('/purchase/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await purchaseCollection.deleteOne(query);
            console.log('deleting purchase', result);
            res.json(result);
        })




        //load specific email address
        app.get('/purchase/myOrder', async (req, res) => {
            let query = {};
            const email = req.query.email;
            if (email) {
                query = { email: email };
            }
            const cursor = purchaseCollection.find(query)
            const orders = await cursor.toArray();
            res.json(orders);
        })


        // --------------------



        //review------------------
        app.post('/review', async (req, res) => {
            const review = req.body;
            const result = await reviewCollection.insertOne(review);

            res.json(result);

        })


        app.get('/review', async (req, res) => {
            const cursor = reviewCollection.find({});
            const result = await cursor.toArray();
            res.json(result);
        })
        // --------------


        //user
        app.post('/user', async (req, res) => {
            const user = req.body;
            const result = await userCollection.insertOne(user);
            console.log('added', user);
            res.json(result);

        })

        app.put('/user', async (req, res) => {
            const user = req.body;
            console.log('put', user);
            const filter = { email: user.email };
            const updateDoc = { $set: { role: 'admin' } };
            const result = await userCollection.updateOne(filter, updateDoc)
            console.log(result);
            res.json(result);
        })


        app.get('/user/:email', async (req, res) => {
            const email = req.params.email;
            const query = { email: email };
            const user = await userCollection.findOne(query);
            let isAdmin = false;
            if (user?.role === 'admin') {
                isAdmin = true;
            }
            res.json({ admin: isAdmin });
        })




    } finally {

        //   await client.close();
    }
}
run().catch(console.dir);




app.get('/', (req, res) => {
    res.send('Hello World!')
})

app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`)
})