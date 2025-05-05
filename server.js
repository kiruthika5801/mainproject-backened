const express = require('express');
const multer = require('multer');
const url = require('url');
const path = require('path');
const fs = require('fs');
const cors = require('cors');
const mongoose = require('mongoose');

const app = express();
app.use(cors());
app.use(express.json()); // Enable JSON parsing for API requests

//  Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/uploadDB', { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.log('MongoDB connection error:', err));

//  Define Schema
const fileSchema = new mongoose.Schema({
  fileUrl: String,
  uploadedAt: { type: Date, default: Date.now }
});

const File = mongoose.model('File', fileSchema);

//  SET STORAGE for Multer
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads'); // Save files in 'uploads' folder
  },
  filename: function (req, file, cb) {
    const uniqueFileName = file.fieldname + '-' + Date.now() + path.extname(file.originalname);
    cb(null, uniqueFileName); // Generate unique filename
  }
});

const upload = multer({ storage: storage });

//  Home Route
app.get('/', function (req, res) {
  res.sendFile(__dirname + '/index.html');
});

//  File Upload Route (Now Saves URL in Database)
app.post('/uploadfile', upload.single('myFile'), async (req, res, next) => {
  if (!req.file) {
    return res.status(400).json({ error: 'Please upload a file' });
  }

  // Generate file URL
  const fileUrl = url.format({
    protocol: 'http',
    hostname: 'localhost',
    port: 4000,
    pathname: `/${req.file.filename}`
  });

  try {
    //  Save file URL in MongoDB
    const newFile = new File({ fileUrl });
    await newFile.save();

    res.json({ message: 'File uploaded successfully', fileUrl });
  } catch (error) {
    res.status(500).json({ error: 'Error saving file URL to database' });
  }
});

//  Route to Get All Uploaded Files
app.get('/files', async (req, res) => {
  try {
    const files = await File.find();
    res.json(files);
  } catch (error) {
    res.status(500).json({ error: 'Error retrieving files' });
  }
});

//  Serve Image Using Pathname
app.get('/:filename', (req, res) => {
  const filePath = path.join(__dirname, 'uploads', req.params.filename);

  if (fs.existsSync(filePath)) {
    res.sendFile(filePath);
  } else {
    res.status(404).json({ error: 'Image not found' });
  }
});

//  Start the Server
app.listen(4000, () => console.log('Server started on port 4000'));

