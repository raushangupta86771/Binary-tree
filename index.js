import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();


// Connect to MongoDB database
// Define schema for the binary tree node
const NodeSchema = new mongoose.Schema({
  value: Number,
  left: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Node'
  },
  right: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Node'
  }
});

// Define the model for the binary tree node
const Node = mongoose.model('Node', NodeSchema);

// Connect to the MongoDB database
mongoose.connect(process.env.DB_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  console.log('Connected to database');
}).catch((error) => {
  console.log('Error connecting to database:', error);
});

// Create an Express app
const app = express();

// Define the API route for creating a new node
app.post('/nodes', async (req, res) => {
  try {
    const node = await Node.create(req.body);
    res.status(201).send(node);
  } catch (error) {
    console.log('Error creating node:', error);
    res.status(500).send('Internal server error');
  }
});

// Define the API route for retrieving all nodes
app.get('/nodes', async (req, res) => {
  try {
    const nodes = await Node.find();
    res.send(nodes);
  } catch (error) {
    console.log('Error retrieving nodes:', error);
    res.status(500).send('Internal server error');
  }
});

// Define the API route for performing a breadth-first search
app.get('/breadthFirstSearch/:startingNode', async (req, res) => {
  try {
    const startingNode = await Node.findById(req.params.startingNode);

    if (!startingNode) {
      return res.status(404).send('Node not found');
    }

    const visited = new Set();
    const queue = [startingNode];
    const result = [];

    while (queue.length > 0) {
      const node = queue.shift();

      if (!visited.has(node._id.toString())) {
        visited.add(node._id.toString());
        result.push(node.value);

        if (node.left) {
          queue.push(await Node.findById(node.left));
        }

        if (node.right) {
          queue.push(await Node.findById(node.right));
        }
      }
    }

    res.send(result);
  } catch (error) {
    console.log('Error performing breadth-first search:', error);
    res.status(500).send('Internal server error');
  }
});

// Start the server
app.listen(3000, () => {
  console.log('Server started on port 3000');
});
