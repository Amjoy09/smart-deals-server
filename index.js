const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const app = express();
const port = process.env.PORT || 3000;

//Middleware-------------

app.use(cors());
app.use(express.json());
const uri =
  "mongodb+srv://smartDBUser:myHJ6iVpXky2NJFS@cluster0.j1ucna7.mongodb.net/?appName=Cluster0";

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

      const cursor = productsCollection.find();
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
