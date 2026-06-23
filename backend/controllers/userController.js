const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
dotenv.config();

const createUser = async (req, res) => {
    try {
        const { email, fullName, password, role } = req.body;

        if (!email || !fullName || !password) {
            return res.status(400).json({ message: 'Missing required fields' });
        }

        const existing = await User.findOne({ email });
        if (existing) return res.status(409).json({ message: 'Email already registered' });

        const hashedPassword = bcrypt.hashSync(password, 10);

        const user = new User({
            email,
            fullName,
            password: hashedPassword,
            role: role || 'user'
        });

        await user.save();
        res.status(201).json({ message: 'User Created Successfully' });
    } catch (err) {
        console.error('createUser error', err);
        res.status(500).json({ message: 'Error creating user', error: err.message });
    }
};

const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) return res.status(400).json({ message: 'Missing email or password' });

        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({ message: 'User not found' });

        const isPasswordCorrect = bcrypt.compareSync(password, user.password);
        if (!isPasswordCorrect) return res.status(401).json({ message: 'Invalid Password' });

        const payLoad = {
            email: user.email,
            fullName: user.fullName,
            role: user.role,
            isEmailVerified: user.isEmailVerified
        };

        const token = jwt.sign(payLoad, process.env.JWT_SECRET);

        res.json({
            message: 'Login Successful',
            token,
            role: user.role
        });
    } catch (err) {
        console.error('loginUser error', err);
        res.status(500).json({ message: 'Error logging in', error: err.message });
    }
};

const isAdmin = (req) => {
    if (req.user == null) return false;
    if (req.user.role != 'admin') return false;
    return true;
};

module.exports = { createUser, loginUser, isAdmin };