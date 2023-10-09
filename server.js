const express = require('express');
const app = express();
const cacheControl = require('cache-control');
const { MongoClient, ServerApiVersion } = require("mongodb");
const path = require('path');

// Declare db variable at the top
let db;

// Connection URL
const uri = 'mongodb://127.0.0.1:27017';
const dbName = 'myDataBase'; // database name

// Public directory
app.use(express.static(path.join(__dirname, 'public')));

// Serve static assets from the 'public' directory with caching headers
app.use('/images', cacheControl({ maxAge: 3600 }));

// Connect to MongoDB
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function connectToMongoDB() {
  try {
    // Connect the client to the server
    await client.connect();
    // Set the 'db' variable to the desired database
    db= client.db(dbName);
    console.log('Connected to MongoDB');
  } catch (err) {
    console.error('Error connecting to MongoDB:', err.message);
  }
}

// Run the MongoDB connection function
connectToMongoDB();
// View engine setup
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Error handler middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).send('Internal Server Error');
});

// Routes
app.get('/', async (req, res, next) => {
  try {
    console.log(db);
    const products = await db.collection('Products').find().toArray();
    res.render('home', { products });
  } catch (err) {
    next(err); // Pass the error to the error handler middleware
  }
});

app.get('/products/:id', async (req, res, next) => {
  const productId = parseInt(req.params.id);
  if (isNaN(productId)) {
    return res.status(400).send('Invalid product ID');
  }

  try {
    const product = await db.collection('Products').findOne({ id: productId });
    if (product) {
      res.render('productDetail', { product });
    } else {
      res.status(404).send('Product not found');
    }
  } catch (err) {
    next(err); // Pass the error to the error handler middleware
  }
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

