require('dotenv').config();
const cors = require('cors');
const express = require('express');
const mongoose = require('mongoose');

const userRoutes = require('./routes/userRoutes');
const productRoutes = require('./routes/productRoutes');
const categoryRoute = require('./routes/categoryRoute');
const mobileCoverRoute = require('./routes/mobileCoversRoute');
const toolsRoute = require('./routes/toolsRoute');
const notificationRoute = require('./routes/notificationRoute');
const dashboardRoute = require('./routes/dashboardRoute');
const exchangeRoute = require('./routes/exchangeRoute');
const cartRoute = require('./routes/cartRoute')
const upload = require('./middleware/upload');

const app = express();
app.use(express.json()); // For JSON data
app.use(express.urlencoded({ extended: true })); // For form data

// ✅ CORS middleware (for development, allow all)
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));




// ✅ Handle preflight OPTIONS request globally (optional but good)
// app.options('*', cors());

// ✅ MongoDB Connection
mongoose.connect(process.env.MONGO_URI).then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB connection error:", err));

// ✅ Routes
app.get("/", (req, res) => {
  res.send("Backend running with MongoDB Atlas");
});
app.post('/api/upload', upload.single('file'), (req, res) => {
  if (!req.file) return res.status(400).json({ message: 'No file uploaded' });

  const fileUrl = `${req.protocol}://${req.get('host')}/${req.file.filename}`;
  res.status(200).json({ message: 'File uploaded successfully', fileUrl });
});
app.use('/api/users', userRoutes);
app.use('/api/product', productRoutes);
app.use('/api', categoryRoute);
app.use('/api/mobile-covers', mobileCoverRoute);
app.use('/api/tools', toolsRoute);
app.use('/api/exchange', exchangeRoute);
app.use('/api/notifications', notificationRoute);
app.use('/api/dashboard', dashboardRoute);
app.use('/api/cart', cartRoute);
// ✅ Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// ✅ Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
