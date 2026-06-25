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

const Session = require('../models/Session');

const getAdminMetrics = async (req, res) => {
    try {
        // 1. Total Registered Students (users with role === 'user')
        const totalStudentsResult = await User.aggregate([
            { $match: { role: 'user' } },
            { $count: 'count' }
        ]);
        const totalStudents = totalStudentsResult[0]?.count || 0;

        // 2. Daily Active Users (DAU)
        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date();
        endOfDay.setHours(23, 59, 59, 999);

        // Fetch users who:
        // - created a session today, OR
        // - answered a question today, OR
        // - exchanged messages today
        const activeUsersResult = await Session.aggregate([
            {
                $match: {
                    $or: [
                        { createdAt: { $gte: startOfDay, $lte: endOfDay } },
                        { "answers.answeredAt": { $gte: startOfDay, $lte: endOfDay } },
                        { "messages.timestamp": { $gte: startOfDay, $lte: endOfDay } }
                    ]
                }
            },
            {
                $group: {
                    _id: "$userEmail"
                }
            },
            {
                $count: "dau"
            }
        ]);
        const dau = activeUsersResult[0]?.dau || 0;

        // 3. Number of Mock Interview Sessions Completed (status === 'completed')
        const completedSessionsResult = await Session.aggregate([
            { $match: { status: 'completed' } },
            { $count: 'count' }
        ]);
        const completedSessions = completedSessionsResult[0]?.count || 0;

        res.json({
            totalStudents,
            dau,
            completedSessions
        });
    } catch (error) {
        res.status(500).json({ message: 'Error calculating metrics', error: error.message });
    }
};

const getAllUsers = async (req, res) => {
    try {
        const users = await User.find().sort({ _id: -1 }).select('-password');
        res.json(users.map((u) => ({
            name: u.fullName,
            email: u.email,
            role: u.role || 'user',
            joinedDate: (u.createdAt || u._id.getTimestamp()).toISOString()
        })));
    } catch (error) {
        res.status(500).json({ message: 'Error fetching users', error: error.message });
    }
};

module.exports = { createUser, loginUser, isAdmin, getAdminMetrics, getAllUsers };