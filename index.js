const express = require("express");
const cors = require("cors");
require("dotenv").config();
const port = process.env.PORT || 5000;
const { MongoClient, ServerApiVersion } = require("mongodb");

const app = express();

app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.tocyu.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    const roomsCollection = client.db("airbnb_db").collection("rooms");

    app.get("/rooms", async (req, res) => {
      const category = req.query.category;

      const location = req.query.location;

      // const checkIn = req.query.checkIn;
      // const searchCheckIn = new Date(checkIn).toISOString().split("T")[0];

      // const checkOut = req.query.checkOut;
      // const searchCheckOut = new Date(checkOut).toISOString().split("T")[0];

      // const guest = req.query.guest;

      let query = {};
      if (category) {
        query.category = { $regex: category, $options: "i" };
      }

      if (location) {
        query.$or = [
          { destination: { $regex: location, $options: "i" } },
          { destination: { $exists: false } },
          { destination: { $ne: "" } }
        ];
      }
      
      // if (checkIn) {
      //   query.checkIn = { $gte: searchCheckIn };
      // }
      // if (checkOut) {
      //   query.checkOut = { $lte: searchCheckOut };
      // }
    
      const rooms = await roomsCollection.find(query).toArray();
      res.send(rooms);
    });

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Airbnb Server is running.");
});

app.listen(port, () => {
  console.log(`Server is running on ${port}`);
});
