const express = require("express");
const cors = require("cors");
const app = express();
require("dotenv").config();
const port = process.env.PORT || 4000;

app.use(express.json());
// app.use(express.urlencoded({ extended: true })); 
app.use(cors());

const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = `mongodb+srv://${process.env.USER_NAME}:${process.env.USER_PASSWORD}@classicmartcluster.p18veby.mongodb.net/?retryWrites=true&w=majority`;
// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

const products = client.db("ClassicMart").collection("allproducts");
const users = client.db("ClassicMart").collection("allusers");
const cart = client.db("ClassicMart").collection("userCart");

async function run() {
  try {
    app.get("/products", async (req, res) => {
      let allproducts = await products.find().toArray();
      res.send(allproducts);
    })

    app.post("/users", async (req, res) => {
      const user = req.body;

      // Avoid adding rows in the dabase for the user alreary exist on the database.

      const query = { email: user.email };
      const existingUser = await users.findOne(query);

      if (existingUser) {
        return res.send({ message: "user already exists on the database." });
      }

      // Adding All users (user, intructor, admin) in the database.

      const result = await users.insertOne(user);
      res.send(result);
    });

    app.post("/addtocart", async (req, res) => {
      const user = req.body;
      const result = await cart.insertOne(user);
      res.send(result);
    });

    app.get("/wishlist", async (req, res) => {
        const userCarts = await cart.find().toArray();
        res.send(userCarts);
    });
    
    // app.get("/wishlist/:email", async (req, res) => {
    //   try {
    //     const email = req.params.email;
    //     const query = { email: email };
    //     const userCarts = await cart.find(query);
    //     console.log(userCarts);
    //     res.send(userCarts);
    //   } catch (error) {
    //     console.error(error);
    //     res.status(500).json({ message: "Internal Server Error" });
    //   }
    // });
    
    

    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } catch {
    // Ensures that the client will close when you finish/error
    console.warn("Deployment problem");
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
