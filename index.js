import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import { MongoClient, ObjectId, ServerApiVersion } from "mongodb"; // ✅ ObjectId added
import checkoutRoute from "./checkoutRoute.js";
import contactRoute from "./contactRoute.js";

dotenv.config();

const app = express();
const port = process?.env?.PORT || 4000;

app.use(express.json());
app.use(cors());
app.use("/api", contactRoute);
app.use("/api", checkoutRoute);

const uri = process?.env?.MONGO_URI;
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

// Database collections
let products, users, cart;

// Connect to MongoDB
async function connectDB() {
  try {
    if (!client.topology || !client.topology.isConnected()) {
      await client.connect();
      console.log("Connected to MongoDB!");
    }
    const db = client.db("ClassicMart");
    products = db.collection("allproducts");
    users = db.collection("allusers");
    cart = db.collection("userCart");
  } catch (err) {
    console.error("MongoDB connection error:", err);
    throw err;
  }
}

connectDB();

app.get("/products", async (req, res) => {
  try {
    await connectDB();
    const allproducts = await products.find().toArray();
    res.send(allproducts);
  } catch (err) {
    console.error("Error fetching products:", err);
    res.status(500).send({ error: "Failed to fetch products" });
  }
});

app.post("/users", async (req, res) => {
  try {
    await connectDB();
    const user = req.body;
    const query = { email: user.email };
    const existingUser = await users.findOne(query);
    
    if (existingUser) {
      return res.send({ message: "User already exists on the database." });
    }
    
    const result = await users.insertOne(user);
    res.send(result);
  } catch (err) {
    console.error("Error creating user:", err);
    res.status(500).send({ error: "Failed to create user" });
  }
});

app.post("/addtocart", async (req, res) => {
  try {
    await connectDB();
    const user = req.body;
    const result = await cart.insertOne(user);
    res.send(result);
  } catch (err) {
    console.error("Error adding to cart:", err);
    res.status(500).send({ error: "Failed to add to cart" });
  }
});

app.get("/wishlist", async (req, res) => {
  try {
    await connectDB();
    const userCarts = await cart.find().toArray();
    res.send(userCarts);
  } catch (err) {
    console.error("Error fetching wishlist:", err);
    res.status(500).send({ error: "Failed to fetch wishlist" });
  }
});

app.delete("/wishlist/:id", async (req, res) => {
  try {
    await connectDB();
    const { id } = req.params;
    const result = await cart.deleteOne({ _id: new ObjectId(id) });
    
    if (result.deletedCount === 0) {
      return res.status(404).send({ error: "Item not found" });
    }
    
    res.send({ message: "Item deleted successfully", result });
  } catch (err) {
    console.error("Error deleting item:", err);
    res.status(500).send({ error: "Failed to delete item" });
  }
});

app.get("/", (req, res) => {
  res.send("Hello World!");
});

// For Vercel serverless
export default app;

// For Local development
if (process.env.NODE_ENV !== "production") {
  app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
  });
}