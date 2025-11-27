import express from "express";
import dotenv from "dotenv";
const router = express.Router();
import { MongoClient } from "mongodb";

dotenv.config();

const uri = process.env.MONGO_URI;
const client = new MongoClient(uri);
const db = client.db("ClassicMart");

const cart = db.collection("userCart");
const history = db.collection("userHistory");

// ---------------- CHECKOUT ----------------
router.post("/checkout", async (req, res) => {
  const { userEmail } = req.body;

  try {
    const userItems = await cart.find({ userMail: userEmail }).toArray();

    if (userItems.length === 0) {
      return res.status(400).json({ message: "No items to checkout." });
    }

    const orderData = {
      userEmail,
      items: userItems,
      date: new Date(),
    };

    await history.insertOne(orderData);
    await cart.deleteMany({ userMail: userEmail });

    res.json({ message: "Order completed successfully!" });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Checkout failed" });
  }
});


// ---------------- HISTORY ----------------
router.get("/history/:email", async (req, res) => {
  const email = req.params.email;

  try {
    const userHistory = await history
      .find({ userEmail: email })
      .sort({ date: -1 })
      .toArray();

    res.json(userHistory);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch history" });
  }
});

export default router;
