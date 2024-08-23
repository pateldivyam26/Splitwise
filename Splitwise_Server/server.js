const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const cors = require('cors');
const User = require('./models/user');
const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(cors());

const uri = process.env.MONGODB_URI;
mongoose.connect(uri);

// User registration
app.post('/register', async (req, res) => {
    try {
        const { username, email, password } = req.body;

        if (!username || !email || !password) {
            return res.status(400).json({ message: 'All fields are required' });
        }

        const existingUser = await User.findOne({ email });

        if (existingUser) {
            return res.status(400).json({ message: 'Email address is already in use. Please login to continue.' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = new User({ username, email, password: hashedPassword });
        await user.save();

        const currentUser = await User.findOne({ email });

        const token = jwt.sign({ userId: currentUser._id }, process.env.ACCESS_TOKEN_SECRET, {
            expiresIn: '24h',
        });

        return res.status(200).json({ token: token, message: 'User registered successfully' });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Internal server error' });
    }
});

// User login
app.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({
                message: 'User not found. Please verify the email address.'
            });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
            return res.status(401).json({
                type: 'incorrect_password',
                message: 'Incorrect password. Please try again.',
            });
        }

        const token = jwt.sign({ userId: user._id }, process.env.ACCESS_TOKEN_SECRET, {
            expiresIn: '24h',
        });

        return res.status(200).json({ token: token, message: 'Successfully Logged In.' });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Internal server error' });
    }
});


const usersRouter = require('./routes/users');
app.use('/users', usersRouter);

const groupsRouter = require('./routes/groups');
app.use('/groups', groupsRouter);

const invitationsRouter = require('./routes/invitations');
app.use('/invitations', invitationsRouter);

const expensesRouter = require('./routes/expenses');
app.use('/expenses', expensesRouter);

// Listening on port 3000
const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Server listening on port ${port}!`);
});