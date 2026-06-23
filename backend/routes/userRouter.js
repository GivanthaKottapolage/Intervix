const express = require('express');
const { createUser, loginUser, getAdminMetrics } = require('../controllers/userController');

const userRouter = express.Router();

const isAdminMiddleware = (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({ message: 'Unauthorized: Please login' });
    }
    if (req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Access denied: Admins only' });
    }
    next();
};

userRouter.post('/', createUser);
userRouter.post('/login', loginUser);
userRouter.get('/admin/metrics', isAdminMiddleware, getAdminMetrics);

module.exports = userRouter;