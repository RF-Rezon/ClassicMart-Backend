import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import { MongoClient, ServerApiVersion } from "mongodb";
import checkoutRoute from "./checkoutRoute.js";
import contactRoute from "./contactRoute.js";
dotenv.config();

const app = express();
const port = process.env.PORT;

app.use(express.json());
app.use(cors());
app.use("/api", contactRoute);
app.use("/api", checkoutRoute);

const uri = process.env.MONGO_URI;
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
    await client.connect(); // make sure DB is connected

    app.get("/products", async (req, res) => {
      let allproducts = await products.find().toArray();
      res.send(allproducts);
    });

    app.post("/users", async (req, res) => {
      const user = req.body;
      const query = { email: user.email };
      const existingUser = await users.findOne(query);

      if (existingUser) {
        return res.send({ message: "User already exists on the database." });
      }

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

    console.log("Pinged your deployment. Successfully connected to MongoDB!");
  } catch (err) {
    console.error("Deployment problem", err);
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
