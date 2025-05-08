const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcrypt');
const multer = require('multer');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());

// ✅ Serve static files from "uploads" folder
app.use('/uploads', express.static('uploads'));


// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/registrationDB', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log(' MongoDB connected'))
  .catch(err => console.log(' MongoDB connection error:', err));



// Define Schema and Model


const productSchema = new mongoose.Schema({
  title: String,
  price: Number,
  imageUrl: String,
});

const Product = mongoose.model('Product', productSchema);


const userSchema = new mongoose.Schema({
  firstName: String,
  lastName: String,
  email: { type: String, unique: true },
  telephone: { type: String, unique: true },
  password: String,
  address: String,
  city: String,
  state: String,
  country: String,
}, { timestamps: true });

const User = mongoose.model('User', userSchema);

const orderSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  email: { type: String, required: true },
  products: [
    {
      productId: { type: String, required: true },
      title: String,
      quantity: { type: Number, required: true },
      price: { type: String, required: true },
    },
  ],
  orderDate: { type: Date, default: Date.now },
});

const Order = mongoose.model('Order', orderSchema);



// Registration API
app.post('/register', async (req, res) => {
  const { firstName, lastName, email, telephone, password, address, city, state, country, products } = req.body;

  if (!firstName || !lastName || !email || !telephone || !password) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  try {
    const existingUser = await User.findOne({ $or: [{ email }, { telephone }] });

    if (existingUser) {
      return res.status(409).json({ error: 'Email or telephone already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({ firstName, lastName, email, telephone, password: hashedPassword, address, city, state, country });

    await user.save();

    const order = new Order({
      userId: user._id,
      email: user.email,
      products: products.map(product => ({
        productId: product.productId,
        title: product.title,
        quantity: product.quantity,
        price: product.price,
      })),
    });

    await order.save();

    res.status(201).json({ message: 'Registration and order created successfully', user, order });
  } catch (err) {
    console.error(' Error saving user or order:', err);
    res.status(500).json({ error: 'Failed to register user or create order', details: err.message });
  }
});

// Login API
app.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ error: 'No account found with this email. Please register first.' });

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) return res.status(401).json({ error: 'Invalid email or password' });


    res.status(200).json({ message: 'Login successful', user });
  } catch (err) {
    console.error(' Error during login:', err);
    res.status(500).json({ error: 'Login failed', details: err.message });
  }
});

app.post('/add-order', async (req, res) => {
  try {
      const { userId, productId, title, quantity, price } = req.body;

      console.log("Received Order Data:", req.body); 

      //  Check if the user exists
      const existingUser = await User.findById(userId);
      if (!existingUser) {
          console.log("User not found!"); 
          return res.status(400).json({ error: "User not found. Please register first." });
      }

      //  Find if an order exists for this user
      let existingOrder = await Order.findOne({ userId });

      if (existingOrder) {
          //  Check if product already exists in the user's order
          const existingProductIndex = existingOrder.products.findIndex(
              (item) => item.productId === productId
          );

          if (existingProductIndex !== -1) {
              //  If product exists, update quantity
              existingOrder.products[existingProductIndex].quantity += quantity;
          } else {
              //  Otherwise, add new product
              existingOrder.products.push({ productId, title, quantity, price });
          }

          // Save updated order
          await existingOrder.save();
          console.log("Updated Order:", existingOrder); 
          return res.json({ success: true, message: "Order updated successfully!", order: existingOrder });

      } else {
          // Create a new order for the user if none exists
          const newOrder = new Order({
              userId,
              email: existingUser.email, // Store email from user
              products: [{ productId, title, quantity, price }]
          });

          await newOrder.save();
          console.log("New Order Created:", newOrder); 
          return res.json({ success: true, message: "Order placed successfully!", order: newOrder });
      }
  } catch (error) {
      console.error("Error placing order:", error);
      res.status(500).json({ error: "Something went wrong.", details: error.message });
  }
});

//  Get Order Summary for a specific user
app.get('/get-order-summary/:userId', async (req, res) => {
  const { userId } = req.params;
  console.log(" Fetching order summary for userId:", userId);

  try {
    const order = await Order.findOne({ userId });

    if (!order) {
      return res.status(404).json({ error: 'No order found for this user' });
    }

    res.status(200).json({ order });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch order summary", details: error.message });
  }
});

// Get all users
app.get('/get-users', async (req, res) => {
    try {
        const users = await User.find().sort({ createdAt: -1 });  // Fetch all users
        res.status(200).json({ users });
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ error: 'Failed to fetch users', details: error.message });
    }
});



//product api

// Get all products from MongoDB
app.get('/get-products', async (req, res) => {
  try {
    const products = await Product.find();  // Fetch all products from the collection
    res.status(200).json({ products });
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ error: 'Failed to fetch products', details: error.message });
  }
});

// Set up Multer storage engine for product images
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/'); // Store images in 'uploads' folder
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname)); // Use a unique filename based on current timestamp
  }
});

const upload = multer({ storage: storage });


// Add Product API (handles image upload)
app.post('/add-product', upload.single('image'), async (req, res) => {
  const { title, price } = req.body;

  if (!title || !price) {
    return res.status(400).json({ error: 'Title and price are required' });
  }

  if (!req.file) {
    return res.status(400).json({ error: 'Image file is required' });
  }

  try {
    // Generate file URL to store in MongoDB
    const imageUrl = `http://localhost:8000/uploads/${req.file.filename}`;

    // Create a new product and save to database
    const newProduct = new Product({
      title,
      price,
      imageUrl, // Store the image URL in the product document
    });

    await newProduct.save();

    res.status(201).json({ message: 'Product added successfully', product: newProduct });
  } catch (error) {
    console.error('Error adding product:', error);
    res.status(500).json({ error: 'Failed to add product', details: error.message });
  }
});

// Express.js route
app.delete('/delete-user/:id', async (req, res) => {
  try {
      const deletedUser = await User.findByIdAndDelete(req.params.id);
      if (!deletedUser) return res.status(404).json({ error: "User not found" });
      res.json({ message: "User deleted successfully" });
  } catch (err) {
      res.status(500).json({ error: "Server error" });
  }
});






// Get all orders
app.get('/get-orders', async (req, res) => {
  try {
    const orders = await Order.find(); // Retrieves all orders from the collection
    res.status(200).json({ orders });
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ error: 'Failed to fetch orders', details: error.message });
  }
});

app.get('/dashboard-summary', async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalOrders = await Order.countDocuments();
    const orders = await Order.find().sort({ orderDate: -1 });

    let totalProducts = 0;
    let totalRevenue = 0;
    let recentProducts = [];

    for (let order of orders) {
      for (let product of order.products) {
        const quantity = product.quantity || 0;
        const price = parseFloat(product.price) || 0;

        totalProducts += quantity;
        totalRevenue += quantity * price;

        recentProducts.push({
          title: product.title,
          quantity,
          price,
          email: order.email,
          orderDate: order.orderDate,
        });
      }
    }

    // Keep only 5 recent products
    recentProducts = recentProducts.slice(0, 5);

    res.status(200).json({
      totalUsers,
      totalOrders,
      totalProducts,
      totalRevenue,
      recentProducts
    });
  } catch (err) {
    res.status(500).json({ error: 'Dashboard summary failed', details: err.message });
  }
});



// Admin Login API
app.post('/admin-login', async (req, res) => {
  const { username, password } = req.body;

  // Hardcoded admin credentials
  const adminUsername = 'kiruAdmin';
  const adminPassword = 'Admin@123';

  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required' });
  }

  // Check if username and password match the admin credentials
  if (username === adminUsername && password === adminPassword) {
    return res.status(200).json({ message: 'Admin login successful' });
  } else {
    return res.status(401).json({ error: 'Invalid username or password' });
  }
});






// Start Server
app.listen(8000, () => console.log(' Server running on http://localhost:8000'));

