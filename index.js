const express = require("express");
const cors = require("cors");
require("dotenv").config();
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const app = express();
const port = process.env.PORT || 3000;

//Middleware-------------

app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.j1ucna7.mongodb.net/?appName=Cluster0`;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

app.get("/", (req, res) => {
  res.send("Smart Server is Running");
});

async function run() {
  try {
    await client.connect();
    const db = client.db("smart_db");
    const productsCollection = db.collection("products");
    const bidsCollection = db.collection("bids");
    const customersCollection = db.collection("customers");

    // Customer's API--------------->>>

    app.post("/customers", async (req, res) => {
      const newCustomer = req.body;
      const email = req.body.email;
      const query = { email: email };
      const existingUser = await customersCollection.findOne(query);
      if (existingUser) {
        res.send({
          message: "Customer already exists. Do not need to insert any",
        });
      } else {
        const result = await customersCollection.insertOne(newCustomer);
        res.send(result);
      }
    });

    // Products's API-------------->>>>

    app.get("/products", async (req, res) => {
      // const projectFields = {
      //   title: 1,
      //   price_min: 1,
      //   price_max: 1,
      //   image: 1,
      //   email: 1,
      // };
      // const cursor = productsCollection
      //   .find()
      //   .sort({ price_min: -1 })
      //   .limit(7)
      //   .skip(2)
      //   .project(projectFields);

      console.log(req.query);
      const email = req.query.email;
      const query = {};
      if (email) {
        query.email = email;
      }

      const cursor = productsCollection.find(query);
      const result = await cursor.toArray();
      res.send(result);
    });

    app.get("/recent-products", async (req, res) => {
      const cursor = productsCollection
        .find()
        .sort({ created_at: -1 })
        .limit(6);
      const result = await cursor.toArray();
      res.send(result);
    });

    app.get("/products/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await productsCollection.findOne(query);
      res.send(result);
    });

    app.post("/products", async (req, res) => {
      const newProduct = req.body;
      const result = await productsCollection.insertOne(newProduct);
      res.send(result);
    });

    app.patch("/products/:id", async (req, res) => {
      const id = req.params.id;
      const updateProduct = req.body;
      const query = { _id: new ObjectId(id) };
      const update = {
        $set: {
          Name: updateProduct.Name,
          Price: updateProduct.Price,
        },
      };
      const result = await productsCollection.updateOne(query, update);
      res.send(result);
    });

    app.delete("/products/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await productsCollection.deleteOne(query);
      res.send(result);
    });

    // Bid related API's

    app.get("/bids", async (req, res) => {
      const email = req.query.email;
      const query = {};
      if (email) {
        query.buyer_email = email;
      }

      const cursor = bidsCollection.find(query);
      const result = await cursor.toArray();
      res.send(result);
    });

    app.delete("/bids/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await bidsCollection.deleteOne(query);
      res.send(result);
    });

    app.get("/products/bids/:productId", async (req, res) => {
      const productId = req.params.productId;
      const query = { product: productId };
      cursor = bidsCollection.find(query).sort({ bid_price: -1 });
      const result = await cursor.toArray();
      res.send(result);
    });

    app.post("/bids", async (req, res) => {
      const newBids = req.body;
      const result = await bidsCollection.insertOne(newBids);
      res.send(result);
    });

    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!",
    );
  } finally {
    // await client.close();
  }
}
run().catch(console.dir);

app.listen(port, () => {
  console.log(`Smart Server is running on port:  ${port}`);
});

// client
//   .connect()
//   .then(() => {
//     app.listen(port, () => {
//       console.log(`Smart Server is running on port:  ${port}`);
//     });
//   })
//   .catch(console.dir);
