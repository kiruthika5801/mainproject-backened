const express = require('express');
const fs = require('fs');
const cors = require('cors');

const app = express();

app.use(express.json());
app.use(cors());
app.use(express.urlencoded({ extended: true }));

const FILE_PATH = './file.json'; // Stores the file name (file.json) in a constant.

app.post('/registration', (req, res) => {
  console.log('Received Data:', req.body);
  const { firstName, lastName, email, password } = req.body;

  if (!firstName || !lastName || !email || !password) {
    return res.status(400).json({ message: 'All fields are required.' });
  }

  const newUser = { firstName, lastName, email, password };

  // Check if file exists, otherwise initialize it
  if (!fs.existsSync(FILE_PATH)) {
    fs.writeFileSync(FILE_PATH, '[]'); // Initialize with empty array
  }

  fs.readFile(FILE_PATH, 'utf8', (err, data) => {
    let users = [];

    if (!err && data) {
      try {
        users = JSON.parse(data); // Parse existing JSON data
      } catch (parseError) {
        return res.status(500).json({ message: 'File data is corrupted.' });
      }
    }

    users.push(newUser); // Add new user

    fs.writeFile(FILE_PATH, JSON.stringify(users, null, 2), (err) => {
      if (err) {
        return res.status(500).json({ message: 'Error saving data.' });
      }
      res.status(201).json({ message: 'User registered successfully.', user: newUser });
    });
  });
});

app.use((req, res) => {
  res.status(404).json({ message: 'Route not found.' });
});

app.listen(5672, () => {
  console.log('Server is running on http://localhost:5672');
});
