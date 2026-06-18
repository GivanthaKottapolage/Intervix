const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
dotenv.config();

const createUser = (req, res) => {
    const data = req.body;

    const hashedPassword = bcrypt.hashSync(data.password, 10);

    const user = new User({
        email: data.email,
        fullName: data.fullName,
        password: hashedPassword,
        role: data.role
    });

    user.save().then(() => {
        res.json({ message: 'User Created Successfully' });
    });
};

const loginUser = (req, res) => {
    const email = req.body.email;
    const password = req.body.password;

    User.find({ email: email }).then((users) => {
        if (users[0] == null) {
            res.status(404).json({ message: 'user not found' });
        } else {
            const user = users[0];

            const isPasswordCorrect = bcrypt.compareSync(password, user.password);

            const payLoad = {
                email: user.email,
                fullName: user.fullName,
                role: user.role,
                isEmailVerified: user.isEmailVerified
            };

            const token = jwt.sign(payLoad, process.env.JWT_SECRET);

            if (isPasswordCorrect) {
                res.json({
                    message: 'Login Successfull',
                    token: token,
                    role: user.role
                });
            } else {
                res.status(401).json({ message: 'Invalid Password' });
            }
        }
    });
};

const isAdmin = (req) => {
    if (req.user == null) return false;
    if (req.user.role != 'admin') return false;
    return true;
};

module.exports = { createUser, loginUser, isAdmin };