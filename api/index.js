const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const db = require('./models');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

const authRoutes = require('./routes/authRoutes');
const transactionRoutes = require('./routes/transactionRoutes');
const rateRoutes = require('./routes/rateRoutes');
const vendorRoutes = require('./routes/vendorRoutes');
const systemRoutes = require('./routes/systemRoutes');

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/rates', rateRoutes);
app.use('/api/vendor', vendorRoutes);
app.use('/api/system', systemRoutes);
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.get('/', (req, res) => {
  res.send('Qwiktransfers API is running');
});

// Error handling middleware
app.use((err, req, res, next) => {
  if (err instanceof require('multer').MulterError) {
    // A Multer error occurred when uploading.
    return res.status(400).json({ error: `Upload error: ${err.message}` });
  } else if (err) {
    // An unknown error occurred when uploading or elsewhere.
    return res.status(500).json({ error: err.message });
  }
  next();
});

const startServer = async () => {
  try {
    await db.sequelize.authenticate();
    console.log('Database connected successfully.');
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Unable to connect to the database:', error);
  }
};

startServer();
