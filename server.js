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
const exchangeRoute = require('./routes/exchangeRoute');

const app = express();

// ✅ CORS middleware (for development, allow all)
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(express.json());

// ✅ Handle preflight OPTIONS request globally (optional but good)
// app.options('*', cors());

// ✅ MongoDB Connection
// mongoose.connect(process.env.MONGO_URI, {
//   useNewUrlParser: true,
//   useUnifiedTopology: true,
// }).then(() => console.log("MongoDB connected"))
//   .catch((err) => console.error("MongoDB connection error:", err));
mongoose.connect('mongodb+srv://pujamourya575:5UTC6LUWJ9IZZ2ty@cluster0.ut6yris.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB connection error:", err));

// ✅ Routes
app.get("/", (req, res) => {
  res.send("Backend running with MongoDB Atlas");
});

app.use('/api/users', userRoutes);
app.use('/api/product', productRoutes);
app.use('/api', categoryRoute);
app.use('/api/mobile-covers', mobileCoverRoute);
app.use('/api/tools', toolsRoute);
app.use('/api/exchange', exchangeRoute);
app.use('/api/notifications', notificationRoute);

// ✅ Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// ✅ Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
