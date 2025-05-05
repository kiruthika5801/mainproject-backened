const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors'); 

const app = express();
app.use(cors());


app.use(bodyParser.json());

mongoose.connect('mongodb://localhost:27017/myapp', { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.log('MongoDB connection error:', err));


const userSchema = new mongoose.Schema({
    name: String,
    email: String,
    age: Number,
});



const User = mongoose.model('User', userSchema);


app.post('/users', async (req, res) => {
    const { name, email, age } = req.body;
    try {
        const user = new User({ name, email, age });
        await user.save();
        res.status(201).json(user);
    } catch (err) {
        res.status(400).json({ error: 'Failed to create user' });
    }
});


app.get('/users', async (req, res) => {
    try {
        const users = await User.find();
        res.status(200).json(users);
    } catch (err) {
        res.status(400).json({ error: 'Failed to fetch users' });
    }
});


app.post('/update-user', async (req, res) => {
    const { id, name, email, age } = req.body;
    try {
        const user = await User.findByIdAndUpdate(id, { name, email, age }, { new: true });
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        res.status(200).json({ message: 'User updated successfully', user });
    } catch (err) {
        res.status(400).json({ error: 'Failed to update user' });
    }
});


app.post('/delete-user', async (req, res) => {
    const { id } = req.body;
    try {
        const user = await User.findByIdAndDelete(id);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        res.status(200).json({ message: 'User deleted successfully' });
    } catch (err) {
        res.status(400).json({ error: 'Failed to delete user' });
    }
});

// Start the server
const PORT = 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
