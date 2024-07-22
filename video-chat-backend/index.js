const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

// Connect to MongoDB
mongoose.connect("mongodb://localhost:27017/video-chat", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Define a User model
const userSchema = new mongoose.Schema({
  peerId: String,
  connectedTo: [String],
});

const User = mongoose.model("User", userSchema);

const app = express();
app.use(cors());
app.use(express.json());

// Endpoint to save user connection
app.post("/connect", async (req, res) => {
  try {
    const { peerId, connectedTo } = req.body;
    let user = await User.findOne({ peerId });
    if (!user) {
      user = new User({ peerId, connectedTo: [connectedTo] });
    } else {
      user.connectedTo.push(connectedTo);
    }
    await user.save();
    res.status(201).send(user);
  } catch (err) {
    console.error(err);
    res.status(500).send({ message: "Error saving user connection" });
  }
});

// Endpoint to get user connections
app.get("/connections/:peerId", async (req, res) => {
  try {
    const user = await User.findOne({ peerId: req.params.peerId });
    if (user) {
      res.send(user);
    } else {
      res.status(404).send({ message: "User not found" });
    }
  } catch (err) {
    console.error(err);
    res.status(500).send({ message: "Error getting user connections" });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
